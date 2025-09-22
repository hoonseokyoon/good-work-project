#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CBCK Sisters Detail Pages → JSON batch parser

Usage:
  python cbck_batch_parser.py --input input.json --mode test --output-dir out
  python cbck_batch_parser.py --input input.json --mode full --output-dir out --workers 8 --cache

Input JSON format:
[
  {"name": "가난한 이들의 작은 자매회 (수원 수녀원)", "detail_url": "https://..."},
  ...
]

Outputs (in --output-dir, default=out/):
- success.jsonl   : one JSON object per successfully parsed page
- failed.jsonl    : one JSON object per failed URL (with error/message)
- success.json    : aggregated list of all success objects (written at the end)
- logs/run.log    : detailed logs
- cache/*.html    : cached HTML of each fetched page (if --cache)
"""
from __future__ import annotations
import argparse
import concurrent.futures as cf
import hashlib
import json
import logging
import random
import sys
import time
import traceback
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

# ---------------------- Logging Setup ----------------------

def setup_logging(out_dir: str) -> logging.Logger:
    log_dir = f"{out_dir}/logs"
    os.makedirs(log_dir, exist_ok=True)
    logger = logging.getLogger("cbck")
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()

    # Console handler (INFO)
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    ch.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
    logger.addHandler(ch)

    # File handler (DEBUG)
    fh = logging.FileHandler(f"{log_dir}/run.log", encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(fh)

    return logger

# ---------------------- Utilities ----------------------

def md5(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()

def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def extract_ids_from_url(url: str) -> Dict[str, str]:
    """Extract interesting query params like 'code' and 'gyogu' (best-effort)."""
    try:
        q = parse_qs(urlparse(url).query)
        return {
            "code": (q.get("code", [None])[0] or ""),
            "gyogu": (q.get("gyogu", [None])[0] or ""),
            "gubn": (q.get("gubn", [None])[0] or ""),
            "cgubn": (q.get("cgubn", [None])[0] or ""),
        }
    except Exception:
        return {"code": "", "gyogu": "", "gubn": "", "cgubn": ""}

# ---------------------- Networking (with retries) ----------------------

@dataclass
class FetchResult:
    url: str
    ok: bool
    status: int
    text: Optional[str]
    error: Optional[str]
    cached: bool = False

def fetch_with_retries(
    url: str,
    session: Optional[requests.Session],
    max_retries: int = 3,
    base_delay: float = 1.0,
    timeout: float = 15.0,
    cache_dir: Optional[str] = None,
    logger: Optional[logging.Logger] = None,
) -> FetchResult:
    """
    Fetch URL with exponential backoff + jitter.
    Uses simple disk cache if cache_dir is provided.
    """
    cache_key = md5(url)
    if cache_dir:
        ensure_dir(cache_dir)
        cache_path = f"{cache_dir}/{cache_key}.html"
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    html = f.read()
                if logger:
                    logger.debug(f"[CACHE HIT] {url}")
                return FetchResult(url=url, ok=True, status=200, text=html, error=None, cached=True)
            except Exception as e:
                if logger:
                    logger.warning(f"[CACHE ERROR] {url} : {e}")

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; CBCKBatchParser/1.0; +https://example.com)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko,en;q=0.8",
        "Connection": "close",
    }
    sess = session or requests.Session()

    last_err = None
    for attempt in range(0, max_retries + 1):
        try:
            # Gentle pacing
            time.sleep(random.uniform(0.25, 0.6))
            resp = sess.get(url, headers=headers, timeout=timeout)
            status = resp.status_code
            if 200 <= status < 300:
                resp.encoding = resp.apparent_encoding or "utf-8"
                html = resp.text
                if cache_dir:
                    try:
                        with open(f"{cache_dir}/{cache_key}.html", "w", encoding="utf-8") as f:
                            f.write(html)
                    except Exception as e:
                        if logger:
                            logger.warning(f"[CACHE WRITE ERROR] {url} : {e}")
                return FetchResult(url=url, ok=True, status=status, text=html, error=None, cached=False)
            elif status in (429, 500, 502, 503, 504):
                # Retry on common transient statuses
                last_err = f"HTTP {status}"
                if logger:
                    logger.warning(f"[RETRYABLE {status}] {url} (attempt {attempt}/{max_retries})")
            else:
                # Non-retryable status
                return FetchResult(url=url, ok=False, status=status, text=None, error=f"HTTP {status}")
        except requests.RequestException as e:
            last_err = f"RequestException: {e}"
            if logger:
                logger.warning(f"[NETWORK ERROR] {url} : {e} (attempt {attempt}/{max_retries})")

        # Backoff
        if attempt < max_retries:
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
            if logger:
                logger.debug(f"[BACKOFF] {url} sleeping {delay:.2f}s")
            time.sleep(delay)

    return FetchResult(url=url, ok=False, status=-1, text=None, error=last_err or "Unknown error")

# ---------------------- HTML Parsing ----------------------

LABEL_MAP = {
    "소속": "affiliation",
    "한글명칭": "name_ko",
    "부속명칭": "subunit",
    "영문명칭": "name_en",
    "설립일": "founded",
    "한국진출일": "entered_korea",
    "대표주소": "address",
    "대표 전화 번호": "phone",
    "팩스번호": "fax",
    "홈페이지 주소": "website",
    "전자우편 주소": "email",
    "원장": "head",
    "성사담당": "sacrament_officer",
}

def clean_text(s: str) -> str:
    return " ".join(s.split()) if s else ""

def extract_title(soup: BeautifulSoup) -> Optional[str]:
    t = soup.select_one(".today1")
    if not t:
        # Fallback: try bold nodes near "세부정보"
        strongs = soup.find_all("strong")
        for st in strongs:
            txt = clean_text(st.get_text(strip=True))
            if txt and "세부정보" not in txt and len(txt) <= 64:
                return txt.strip().strip('"“”')
        return None
    raw = t.get_text(strip=True)
    cleaned = raw.strip().strip('"“”').strip()
    return cleaned

def parse_small_tables(soup: BeautifulSoup) -> Dict[str, Any]:
    data: Dict[str, Any] = {}
    for tbl in soup.select("table.small_table"):
        for tr in tbl.select("tr"):
            tds = tr.find_all("td")
            if len(tds) < 2:
                continue
            label = clean_text(tds[0].get_text())
            value_cell = tds[1]
            key = LABEL_MAP.get(label, label)

            if label == "홈페이지 주소":
                a = value_cell.find("a")
                if a and a.get("href"):
                    data[key] = {"text": clean_text(a.get_text()), "href": a["href"]}
                else:
                    data[key] = clean_text(value_cell.get_text(" ", strip=True))
            elif label == "성사담당":
                entry: Dict[str, Any] = {}
                a = value_cell.find("a")
                lines = [clean_text(x) for x in value_cell.stripped_strings if clean_text(x)]
                # lines: ["김선복 베드로 신부", "Rev. Petrus Sun Bok KIM"]
                if a:
                    entry["name_ko"] = clean_text(a.get_text())
                    if a.get("href"):
                        # The site sometimes uses relative paths
                        entry["profile_path"] = a.get("href")
                # English line: last different from Korean
                if lines:
                    last = lines[-1]
                    if not a or (a and last != entry.get("name_ko")):
                        entry["name_en"] = last
                data[key] = entry
            else:
                val = clean_text(value_cell.get_text(" ", strip=True))
                data[key] = val
    return data

def parse_cbck_detail(html: str, url: str) -> Dict[str, Any]:
    """
    Parse a CBCK detail page HTML into a structured dict.
    """
    soup = BeautifulSoup(html, "html.parser")
    item: Dict[str, Any] = {"source_url": url}
    ids = extract_ids_from_url(url)
    item.update(ids)

    title = extract_title(soup)
    if title:
        item["title"] = title

    payload = parse_small_tables(soup)
    item.update(payload)

    # Normalize phone/fax parentheses (keep if present)
    for k in ("phone", "fax"):
        if k in item and isinstance(item[k], str):
            item[k] = item[k].replace(" ", "") if item[k].startswith("(") else item[k]

    return item

# ---------------------- Worker ----------------------

@dataclass
class Task:
    idx: int
    name: str
    url: str

def worker(task: Task, session: requests.Session, args, logger: logging.Logger) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """Return (success_obj, failure_obj)."""
    logger.debug(f"[START] #{task.idx} {task.name} | {task.url}")
    res = fetch_with_retries(
        task.url,
        session=session,
        max_retries=args.max_retries,
        base_delay=args.base_delay,
        timeout=args.timeout,
        cache_dir=(f"{args.output_dir}/cache" if args.cache else None),
        logger=logger,
    )
    if not res.ok or not res.text:
        fail = {
            "index": task.idx,
            "name": task.name,
            "url": task.url,
            "status": res.status,
            "error": res.error or "fetch_failed",
        }
        logger.error(f"[FAIL FETCH] #{task.idx} {task.url} : {fail['error']} (status={res.status})")
        return None, fail

    try:
        parsed = parse_cbck_detail(res.text, task.url)
        parsed["input_name"] = task.name
        parsed["cached"] = res.cached
        logger.info(f"[OK] #{task.idx} {task.name}")
        logger.debug(f"[PARSED] #{task.idx} keys={list(parsed.keys())}")
        return parsed, None
    except Exception as e:
        tb = traceback.format_exc(limit=2)
        fail = {
            "index": task.idx,
            "name": task.name,
            "url": task.url,
            "status": res.status,
            "error": f"parse_error: {e}",
            "traceback": tb,
        }
        logger.error(f"[FAIL PARSE] #{task.idx} {task.url} : {e}")
        return None, fail

# ---------------------- Main ----------------------

def main() -> int:
    ap = argparse.ArgumentParser(description="CBCK Sisters detail pages batch parser")
    ap.add_argument("--input", required=True, help="Path to input JSON file (array of {name, detail_url})")
    ap.add_argument("--output-dir", default="out", help="Directory to write outputs")
    ap.add_argument("--mode", choices=["full", "test"], default="test", help="Processing mode")
    ap.add_argument("--workers", type=int, default=6, help="Number of worker threads")
    ap.add_argument("--max-retries", type=int, default=3, help="Max HTTP retries per URL")
    ap.add_argument("--base-delay", type=float, default=1.0, help="Base delay for exponential backoff")
    ap.add_argument("--timeout", type=float, default=20.0, help="Per-request timeout (seconds)")
    ap.add_argument("--cache", action="store_true", help="Enable HTML caching to disk")
    args = ap.parse_args()

    ensure_dir(args.output_dir)
    logger = setup_logging(args.output_dir)

    # Load inputs
    try:
        with open(args.input, "r", encoding="utf-8") as f:
            entries = json.load(f)
        if not isinstance(entries, list):
            logger.error("Input file must contain a JSON array.")
            return 2
    except Exception as e:
        print(f"Failed to read input: {e}", file=sys.stderr)
        return 2

    total = len(entries)
    logger.info(f"Loaded {total} entries from {args.input}")
    if args.mode == "test" and total > 5:
        entries = entries[:5]
        logger.info("TEST mode: processing only the first 5 entries")

    success_path = f"{args.output_dir}/success.jsonl"
    failed_path = f"{args.output_dir}/failed.jsonl"
    ensure_dir(args.output_dir)

    ok_cnt = 0
    fail_cnt = 0
    success_items: List[Dict[str, Any]] = []

    # Open output files in append-safe mode
    success_f = open(success_path, "a", encoding="utf-8")
    failed_f = open(failed_path, "a", encoding="utf-8")

    try:
        session = requests.Session()
        tasks = [Task(idx=i, name=e.get("name", f"item_{i}"), url=e.get("detail_url", "")) for i, e in enumerate(entries, start=1)]
        # Validate URLs
        tasks = [t for t in tasks if t.url.startswith("http")]
        if not tasks:
            logger.error("No valid URLs to process.")
            return 3

        with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
            futures = [ex.submit(worker, t, session, args, logger) for t in tasks]
            for fut in cf.as_completed(futures):
                succ, fail = fut.result()
                if succ:
                    success_items.append(succ)
                    success_f.write(json.dumps(succ, ensure_ascii=False) + "\n")
                    success_f.flush()
                    ok_cnt += 1
                if fail:
                    failed_f.write(json.dumps(fail, ensure_ascii=False) + "\n")
                    failed_f.flush()
                    fail_cnt += 1
    finally:
        success_f.close()
        failed_f.close()

    # Write aggregated success.json
    with open(f"{args.output_dir}/success.json", "w", encoding="utf-8") as f:
        json.dump(success_items, f, ensure_ascii=False, indent=2)

    logger.info(f"Done. OK={ok_cnt} FAIL={fail_cnt} (total attempted={ok_cnt+fail_cnt})")
    logger.info(f"Outputs:\n  {success_path}\n  {failed_path}\n  {args.output_dir}/success.json")
    return 0

# ---------------------- Entrypoint ----------------------

if __name__ == "__main__":
    import os
    main()
