#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CBCK Monastery Detail Pages → JSON batch parser (남자 수도원/수도회 전용)

Usage:
  python cbck_monastery_batch_parser.py --input monasteries.json --mode test --output-dir out_m --cache
  python cbck_monastery_batch_parser.py --input monasteries.json --mode full --output-dir out_m --workers 8 --cache

Input JSON format:
[
  {"name": "...", "detail_url": "https://..."},
  ...
]

Outputs:
- success.jsonl / success.json  : parsed results
- failed.jsonl                  : fetch/parse failures
- logs/run.log                  : detailed logs
- cache/*.html                  : (optional) cached HTML by md5(url)
"""
from __future__ import annotations
import argparse
import concurrent.futures as cf
import hashlib
import json
import logging
import os
import random
import sys
import time
import traceback
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

# ---------------------- Logging ----------------------

def setup_logging(out_dir: str) -> logging.Logger:
    os.makedirs(os.path.join(out_dir, "logs"), exist_ok=True)
    logger = logging.getLogger("cbck_monastery")
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    ch.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
    logger.addHandler(ch)

    fh = logging.FileHandler(os.path.join(out_dir, "logs", "run.log"), encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(fh)

    return logger

# ---------------------- Utils ----------------------

def md5(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()

def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def extract_ids_from_url(url: str) -> Dict[str, str]:
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

# ---------------------- Networking (with cache/retries) ----------------------

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
    max_retries: int,
    base_delay: float,
    timeout: float,
    cache_dir: Optional[str],
    logger: logging.Logger,
) -> FetchResult:
    cache_key = md5(url)
    if cache_dir:
        ensure_dir(cache_dir)
        cache_path = os.path.join(cache_dir, f"{cache_key}.html")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    html = f.read()
                logger.debug(f"[CACHE HIT] {url}")
                return FetchResult(url=url, ok=True, status=200, text=html, error=None, cached=True)
            except Exception as e:
                logger.warning(f"[CACHE READ ERROR] {url} : {e}")

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; CBCKMonasteryBatch/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko,en;q=0.8",
        "Connection": "close",
    }
    sess = session or requests.Session()
    last_err = None

    for attempt in range(0, max_retries + 1):
        try:
            time.sleep(random.uniform(0.25, 0.6))
            resp = sess.get(url, headers=headers, timeout=timeout)
            status = resp.status_code
            if 200 <= status < 300:
                resp.encoding = resp.apparent_encoding or "utf-8"
                html = resp.text
                if cache_dir:
                    try:
                        with open(os.path.join(cache_dir, f"{cache_key}.html"), "w", encoding="utf-8") as f:
                            f.write(html)
                    except Exception as e:
                        logger.warning(f"[CACHE WRITE ERROR] {url} : {e}")
                return FetchResult(url=url, ok=True, status=status, text=html, error=None, cached=False)
            elif status in (429, 500, 502, 503, 504):
                last_err = f"HTTP {status}"
                logger.warning(f"[RETRYABLE {status}] {url} (attempt {attempt}/{max_retries})")
            else:
                return FetchResult(url=url, ok=False, status=status, text=None, error=f"HTTP {status}")
        except requests.RequestException as e:
            last_err = f"RequestException: {e}"
            logger.warning(f"[NETWORK ERROR] {url} : {e} (attempt {attempt}/{max_retries})")

        if attempt < max_retries:
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
            logger.debug(f"[BACKOFF] {url} sleeping {delay:.2f}s")
            time.sleep(delay)

    return FetchResult(url=url, ok=False, status=-1, text=None, error=last_err or "Unknown error")

# ---------------------- Parsing ----------------------

# === 새/개선된 매핑 ===
FIELD_MAP = {
    "소속": "diocese",
    "한글명칭": "name_ko",
    "부속명칭": "subunit",
    "영문명칭": "name_en",
    "대표주소": "address",
    "대표 전화 번호": "phone",
    "팩스번호": "fax",
    "홈페이지 주소": "website",
    "전자우편 주소": "email",
}

SINGLE_ROLE_MAP = {
    "원장": "head",
    "부원장": "vice_head",
    "학생장": "student_director",
    "청원장": "postulant_director",
    "수련장": "novice_master",
    "피정담당": "retreat_minister",  # 신규
}
REPEAT_ROLE_LABELS = {"거주"}
REPEAT_ROLE_KEY = "residents"

def clean_text(s: str) -> str:
    return " ".join(s.split()) if s else ""

def parse_structured_fields_and_roles(soup: BeautifulSoup):
    """table.small_table에서 필드 + 역할을 직접 파싱"""
    import re
    data, roles, residents = {}, {}, []
    for tr in soup.select("table.small_table tr"):
        tds = tr.find_all("td")
        if len(tds) < 2:
            continue
        label = clean_text(tds[0].get_text())
        val_cell = tds[1]
        strings = [clean_text(x) for x in val_cell.stripped_strings if clean_text(x)]
        a = val_cell.find("a")
        href = a.get("href") if a else None

        # 일반 필드
        if label in FIELD_MAP:
            key = FIELD_MAP[label]
            if label == "홈페이지 주소":
                if a and a.get("href"):
                    data[key] = {"text": clean_text(a.get_text()), "href": a["href"]}
                else:
                    data[key] = clean_text(val_cell.get_text(" ", strip=True))
            else:
                data[key] = clean_text(val_cell.get_text(" ", strip=True))
            continue

        # 단일 역할
        if label in SINGLE_ROLE_MAP:
            key = SINGLE_ROLE_MAP[label]
            name_ko = clean_text(a.get_text()) if a else None
            if not name_ko:
                for s in strings:
                    if not s.startswith("Rev.") and re.search(r"[가-힣]", s):
                        name_ko = s; break
            name_en = None
            for s in reversed(strings):
                if s.startswith("Rev.") or re.search(r"[A-Za-z]", s):
                    name_en = s; break
            entry = {"role": label, "name_ko": name_ko or ""}
            if name_en: entry["name_en"] = name_en
            if href: entry["profile_path"] = href
            roles[key] = entry
            continue

        # 반복 역할 (거주 등)
        if label in REPEAT_ROLE_LABELS:
            name_ko = clean_text(a.get_text()) if a else None
            if not name_ko:
                for s in strings:
                    if not s.startswith("Rev.") and re.search(r"[가-힣]", s):
                        name_ko = s; break
            name_en = None
            for s in reversed(strings):
                if s.startswith("Rev.") or re.search(r"[A-Za-z]", s):
                    name_en = s; break
            entry = {"role": label, "name_ko": name_ko or ""}
            if name_en: entry["name_en"] = name_en
            if href: entry["profile_path"] = href
            residents.append(entry)
            continue

    if residents:
        roles[REPEAT_ROLE_KEY] = residents
    return data, roles

def parse_plaintext_roles_with_lookahead(text: str):
    """라벨과 값이 줄바꿈으로 분리된 경우를 보완"""
    import re
    lines = [ln for ln in (text or "").splitlines() if ln.strip()]
    roles, residents = {}, []
    i = 0
    while i < len(lines):
        line = clean_text(lines[i])

        # 단일 역할
        matched = False
        for label, key in SINGLE_ROLE_MAP.items():
            if line == label or line.startswith(label):
                tail = clean_text(line[len(label):].strip())
                ko = None; en = None
                if tail and re.search(r"[가-힣]", tail):
                    ko = tail
                # 한글 이름 lookahead
                if ko is None and i + 1 < len(lines):
                    nxt = clean_text(lines[i+1])
                    if nxt and not any(nxt.startswith(lb) for lb in list(SINGLE_ROLE_MAP)+list(REPEAT_ROLE_LABELS)):
                        if re.search(r"[가-힣]", nxt):
                            ko = nxt; i += 1
                # 영문 이름 lookahead
                if i + 1 < len(lines):
                    maybe_en = clean_text(lines[i+1])
                    if maybe_en.startswith("Rev.") or re.search(r"[A-Za-z]", maybe_en):
                        en = maybe_en; i += 1
                roles[key] = {"role": label, "name_ko": ko or ""}
                if en: roles[key]["name_en"] = en
                matched = True
                break
        if matched:
            i += 1; continue

        # 반복 역할
        for rep in REPEAT_ROLE_LABELS:
            if line == rep or line.startswith(rep):
                tail = clean_text(line[len(rep):].strip())
                ko = None; en = None
                if tail and re.search(r"[가-힣]", tail):
                    ko = tail
                if ko is None and i + 1 < len(lines):
                    nxt = clean_text(lines[i+1])
                    if nxt and not any(nxt.startswith(lb) for lb in list(SINGLE_ROLE_MAP)+list(REPEAT_ROLE_LABELS)):
                        if re.search(r"[가-힣]", nxt):
                            ko = nxt; i += 1
                if i + 1 < len(lines):
                    maybe_en = clean_text(lines[i+1])
                    if maybe_en.startswith("Rev.") or re.search(r"[A-Za-z]", maybe_en):
                        en = maybe_en; i += 1
                entry = {"role": rep, "name_ko": ko or ""}
                if en: entry["name_en"] = en
                residents.append(entry)
                matched = True
                break
        if matched:
            i += 1; continue

        i += 1

    if residents:
        roles[REPEAT_ROLE_KEY] = residents
    return roles

def strip_artifacts(s: str) -> str:
    # remove in-text citation artifacts like 【70†...】
    import re
    s = re.sub(r"【\d+[^】]*】", "", s)
    return clean_text(s)

def try_get_title(soup: BeautifulSoup) -> Optional[str]:
    t = soup.select_one(".today1")
    if t:
        return clean_text(t.get_text()).strip('"“”')
    # fallback: look for a bold title near the top
    strongs = soup.find_all("strong")
    for st in strongs[:5]:
        txt = clean_text(st.get_text())
        if txt and "세부정보" not in txt and len(txt) <= 80:
            return txt.strip('"“”')
    # last resort: document title
    if soup.title and soup.title.string:
        return clean_text(soup.title.string).split("-")[0].strip('"“”')
    return None

def parse_structured_tables(soup: BeautifulSoup) -> Dict[str, Any]:
    data: Dict[str, Any] = {}
    for tbl in soup.select("table.small_table"):
        for tr in tbl.select("tr"):
            tds = tr.find_all("td")
            if len(tds) < 2:
                continue
            label = clean_text(tds[0].get_text())
            val_cell = tds[1]
            key = FIELD_MAP.get(label, None)
            if not key:
                continue
            if label == "홈페이지 주소":
                a = val_cell.find("a")
                if a and a.get("href"):
                    data[key] = {"text": clean_text(a.get_text()), "href": a["href"]}
                else:
                    data[key] = clean_text(val_cell.get_text(" ", strip=True))
            else:
                val = clean_text(val_cell.get_text(" ", strip=True))
                data[key] = val
    return data

def parse_roles_from_text(text: str) -> Dict[str, Any]:
    """
    Plaintext role parser: finds lines like '원장 XXX' then optional next line 'Rev. ...'
    Also collects repeated '거주' entries.
    """
    import re
    lines = [ln for ln in (text or "").splitlines() if ln.strip()]
    roles: Dict[str, Any] = {}
    residents: List[Dict[str, Any]] = []
    i = 0
    while i < len(lines):
        line = strip_artifacts(lines[i])
        matched = False

        # Singleton roles
        for label, key in SINGLE_ROLE_MAP.items():
            if line.startswith(label):
                ko = line[len(label):].strip()
                ko = re.sub(r"^[\s:：\-\u2013\u2014\(\)\[\]]*", "", ko)
                entry = {"role": label, "name_ko": ko}
                if i + 1 < len(lines):
                    nxt = strip_artifacts(lines[i + 1]).strip()
                    if nxt.startswith("Rev.") or re.search(r"[A-Za-z]", nxt):
                        entry["name_en"] = nxt
                        i += 1
                roles[key] = entry
                matched = True
                break
        if matched:
            i += 1
            continue

        # Repeated roles
        for rep_label in REPEAT_ROLE_LABELS:
            if line.startswith(rep_label):
                ko = line[len(rep_label):].strip()
                ko = re.sub(r"^[\s:：\-\u2013\u2014\(\)\[\]]*", "", ko)
                entry = {"role": rep_label, "name_ko": ko}
                if i + 1 < len(lines):
                    nxt = strip_artifacts(lines[i + 1]).strip()
                    if nxt.startswith("Rev.") or re.search(r"[A-Za-z]", nxt):
                        entry["name_en"] = nxt
                        i += 1
                residents.append(entry)
                matched = True
                break

        i += 1

    if residents:
        roles[REPEAT_ROLE_KEY] = residents
    return roles

def parse_fields_from_text(text: str) -> Dict[str, Any]:
    """
    Fallback field parser from plaintext, for when structured tables are absent.
    Format assumed: '라벨 값' per line, and phone/fax on same line without space before '('.
    """
    import re
    data: Dict[str, Any] = {}
    lines = [ln for ln in (text or "").splitlines() if ln.strip()]
    for line in lines:
        for label, key in FIELD_MAP.items():
            if line.startswith(label):
                raw = line[len(label):].strip()
                # keep parentheses for phone/fax
                if label in ("대표 전화 번호", "팩스번호"):
                    val = re.sub(r"^[\s:：\-\u2013\u2014\[\]]*", "", raw)
                else:
                    val = re.sub(r"^[\s:：\-\u2013\u2014\(\)\[\]]*", "", raw)
                data[key] = val
                break
    return data

def parse_cbck_monastery(html: str, url: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")
    item: Dict[str, Any] = {"source_url": url}
    item.update(extract_ids_from_url(url))

    # 1) Title
    title = try_get_title(soup)
    if title:
        item["title"] = title

    # 2) Structured parsing (fields + roles) from <table.small_table>
    #    - fields_struct: 일반 필드(소속/주소/전화 등)
    #    - roles_struct : 단일 역할(head/novice_master/retreat_minister 등) + residents
    fields_struct, roles_struct = parse_structured_fields_and_roles(soup)

    # 3) Plaintext fallback (for pages where label/name split across lines)
    text = soup.get_text("\n", strip=True)

    # Fields: structured 우선, 없으면 텍스트로 폴백
    if fields_struct:
        item.update(fields_struct)
    else:
        item.update(parse_fields_from_text(text))

    # Roles: 1) 텍스트 폴백으로 채우고  2) 구조화 결과로 최종 덮어쓰기(우선순위 ↑)
    fallback_roles = parse_plaintext_roles_with_lookahead(text)
    item.update(fallback_roles)   # 약한 신뢰
    item.update(roles_struct)     # 강한 신뢰(최종 승리)

    # 4) Normalize phone/fax
    for k in ("phone", "fax"):
        if isinstance(item.get(k), str):
            item[k] = item[k].strip()

    return item

# ---------------------- Worker ----------------------

@dataclass
class Task:
    idx: int
    name: str
    url: str

def worker(task: Task, session: requests.Session, args, logger: logging.Logger) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    logger.debug(f"[START] #{task.idx} {task.name} | {task.url}")
    res = fetch_with_retries(
        task.url,
        session=session,
        max_retries=args.max_retries,
        base_delay=args.base_delay,
        timeout=args.timeout,
        cache_dir=(os.path.join(args.output_dir, "cache") if args.cache else None),
        logger=logger,
    )
    if not res.ok or not res.text:
        fail = {
            "index": task.idx, "name": task.name, "url": task.url,
            "status": res.status, "error": res.error or "fetch_failed"
        }
        logger.error(f"[FAIL FETCH] #{task.idx} {task.url} : {fail['error']} (status={res.status})")
        return None, fail

    try:
        parsed = parse_cbck_monastery(res.text, task.url)
        parsed["input_name"] = task.name
        parsed["cached"] = res.cached
        logger.info(f"[OK] #{task.idx} {task.name}")
        logger.debug(f"[PARSED] #{task.idx} keys={list(parsed.keys())}")
        return parsed, None
    except Exception as e:
        fail = {
            "index": task.idx, "name": task.name, "url": task.url,
            "status": res.status, "error": f"parse_error: {e}",
            "traceback": traceback.format_exc(limit=2),
        }
        logger.error(f"[FAIL PARSE] #{task.idx} {task.url} : {e}")
        return None, fail

# ---------------------- Main ----------------------

def main() -> int:
    ap = argparse.ArgumentParser(description="CBCK Monastery detail pages batch parser")
    ap.add_argument("--input", required=True, help="Path to input JSON file (array of {name, detail_url})")
    ap.add_argument("--output-dir", default="out_m", help="Directory to write outputs")
    ap.add_argument("--mode", choices=["full", "test"], default="test", help="Processing mode")
    ap.add_argument("--workers", type=int, default=6, help="Number of worker threads")
    ap.add_argument("--max-retries", type=int, default=3, help="Max HTTP retries per URL")
    ap.add_argument("--base-delay", type=float, default=1.0, help="Base delay for exponential backoff")
    ap.add_argument("--timeout", type=float, default=20.0, help="Per-request timeout (seconds)")
    ap.add_argument("--cache", action="store_true", help="Enable HTML caching to disk")
    args = ap.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    logger = setup_logging(args.output_dir)

    try:
        with open(args.input, "r", encoding="utf-8") as f:
            entries = json.load(f)
        if not isinstance(entries, list):
            logger.error("Input file must be a JSON array.")
            return 2
    except Exception as e:
        print(f"Failed to read input: {e}", file=sys.stderr)
        return 2

    total = len(entries)
    logger.info(f"Loaded {total} entries from {args.input}")
    if args.mode == "test" and total > 5:
        entries = entries[:5]
        logger.info("TEST mode: processing only the first 5 entries")

    success_path = os.path.join(args.output_dir, "success.jsonl")
    failed_path  = os.path.join(args.output_dir, "failed.jsonl")
    ok_cnt = 0
    fail_cnt = 0
    success_items: List[Dict[str, Any]] = []

    sf = open(success_path, "a", encoding="utf-8")
    ff = open(failed_path, "a", encoding="utf-8")

    try:
        session = requests.Session()
        tasks = [Task(idx=i, name=e.get("name", f"item_{i}"), url=e.get("detail_url", "")) for i, e in enumerate(entries, start=1)]
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
                    sf.write(json.dumps(succ, ensure_ascii=False) + "\n")
                    sf.flush()
                    ok_cnt += 1
                if fail:
                    ff.write(json.dumps(fail, ensure_ascii=False) + "\n")
                    ff.flush()
                    fail_cnt += 1
    finally:
        sf.close()
        ff.close()

    with open(os.path.join(args.output_dir, "success.json"), "w", encoding="utf-8") as f:
        json.dump(success_items, f, ensure_ascii=False, indent=2)

    logger.info(f"Done. OK={ok_cnt} FAIL={fail_cnt} (total attempted={ok_cnt+fail_cnt})")
    logger.info(f"Outputs:\n  {success_path}\n  {failed_path}\n  {os.path.join(args.output_dir, 'success.json')}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
