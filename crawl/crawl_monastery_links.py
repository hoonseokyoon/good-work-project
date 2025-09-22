#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CBCK '축성생활회와 사도생활단(남자, gubn=6)' 전체 페이지 크롤러 (강화 로깅)
- 상세 링크(DetailInfo.aspx)를 name + absolute URL 로 수집
- 콘솔 + 파일 로그, HTML 덤프, JS openNewWindow() 처리
- 상대경로(./Catholic/DetailInfo.aspx) 및 대소문자 혼재 대응
- 여성 버전과 결과/로그/덤프 파일명이 겹치지 않도록 분리
"""

import re
import time
import json
import logging
import pathlib
from typing import Optional
from urllib.parse import urljoin, urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

BASE = "https://directory.cbck.or.kr"
LIST_TMPL = (
    "https://directory.cbck.or.kr/onlineAddress/SearchList.aspx"
    "?cgubn=g&gubn=6&gyogu=all&tbxSearch=&char=all&paged=10&start={start}"
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
              "image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://directory.cbck.or.kr/onlineAddress/SearchList.aspx?cgubn=g&gubn=6&gyogu=all",
    "Connection": "close",
}

# JS 핸들러에서 내부 URL 추출
JS_OPEN_RE = re.compile(r"(?:openNewWindow|window\.open)\s*\(\s*['\"]([^'\"]+)['\"]", re.I)


# -------- Logging setup (남자 전용 파일명) --------

def setup_logger():
    log_dir = pathlib.Path("logs_male")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "crawl_male.log"

    logger = logging.getLogger("cbck_male")
    logger.setLevel(logging.DEBUG)

    # 콘솔
    sh = logging.StreamHandler()
    sh.setLevel(logging.INFO)
    sh.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))

    # 파일 (DEBUG 상세)
    fh = logging.FileHandler(log_file, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter(
        "%(asctime)s %(levelname)s %(name)s %(funcName)s:%(lineno)d - %(message)s"
    ))

    logger.handlers.clear()
    logger.addHandler(sh)
    logger.addHandler(fh)
    return logger, log_file


logger, log_file = setup_logger()


# -------- HTTP fetch & dump --------

def fetch(session: requests.Session, url: str) -> str:
    logger.info(f"GET {url}")
    r = session.get(url, headers=HEADERS, timeout=20)
    logger.debug(f"status={r.status_code} final_url={r.url} encoding={r.encoding} len={len(r.content)}")
    r.raise_for_status()
    # 인코딩 보정
    if not r.encoding or r.encoding.lower() in ("iso-8859-1", "latin-1"):
        r.encoding = r.apparent_encoding or "utf-8"
    return r.text


def dump_html(start: int, html: str):
    dump_dir = pathlib.Path("debug_pages_male")
    dump_dir.mkdir(parents=True, exist_ok=True)
    path = dump_dir / f"list_start_{start}.html"
    path.write_text(html, encoding="utf-8")
    logger.info(f"Saved HTML dump: {path}")


# -------- Extractor --------

def is_male_detail(url: str) -> bool:
    qs = parse_qs(urlparse(url).query)
    cgubn = (qs.get("cgubn", [""])[0] or "").lower()
    gubn = qs.get("gubn", [""])[0]
    return (cgubn == "g" and gubn == "6")


def extract_links_from_list_page(html: str, list_url: str, logger: Optional[logging.Logger] = None):
    soup = BeautifulSoup(html, "html.parser")

    # 목록 영역으로 범위를 좁혀 불필요한 a 태그를 배제
    scope = soup.select_one("#Category_SearchList") or soup
    anchors = scope.find_all("a", href=True)

    if logger:
        logger.debug(f"scoped_anchors={len(anchors)} in #Category_SearchList")
        for i, a in enumerate(anchors[:20]):
            logger.debug(
                f"sample_scoped_anchor[{i}]: text='{a.get_text(strip=True)}' href='{a.get('href')}' onclick='{a.get('onclick')}'"
            )

    out, seen = [], set()

    def maybe_add(name: str, href_candidate: str):
        if not href_candidate:
            return
        raw = href_candidate.strip()

        # javascript 핸들러(openNewWindow('...'), window.open('...'))에서 내부 URL 벗겨내기
        m = JS_OPEN_RE.search(raw)
        if m:
            raw = m.group(1)

        # DetailInfo.aspx 포함 여부만 느슨하게 확인 (대소문자 무시)
        if "detailinfo.aspx" not in raw.lower():
            return

        # 상대경로 -> 절대경로 (목록 페이지 URL 기준으로 조합)
        abs_url = urljoin(list_url, raw)

        # 남자 축성생활회(cgubn=g & gubn=6)만 통과
        if not is_male_detail(abs_url):
            return

        if abs_url in seen:
            return
        seen.add(abs_url)
        out.append({"name": name or "", "detail_url": abs_url})

    # 앵커 순회: href / onclick 모두 maybe_add에 태워줌
    for a in anchors:
        name = a.get_text(" ", strip=True)
        href = a.get("href", "") or ""
        onclick = a.get("onclick", "") or ""

        # 페이지네이션 숫자(1,2,3...)는 스킵(단, 내부에 detailinfo가 숨어 있으면 살림)
        if name.isdigit() and not ("detailinfo.aspx" in href.lower() or "detailinfo.aspx" in onclick.lower()):
            continue

        maybe_add(name, href)      # 일반 링크/상대경로
        if onclick:
            maybe_add(name, onclick)  # JS 핸들러 내부 경로

    if logger:
        logger.info(f"extracted_links={len(out)} from {list_url}")
        for i, item in enumerate(out[:10]):
            logger.debug(f"extracted[{i}] {item}")

    return out


# -------- Crawl loop --------

def crawl_all(max_pages: int = 1000, delay: float = 0.8, hard_cap: int = 10000):
    session = requests.Session()
    all_items = []
    all_seen_urls = set()

    start = 1
    pages = 0
    while pages < max_pages:
        list_url = LIST_TMPL.format(start=start)
        try:
            html = fetch(session, list_url)
        except Exception as e:
            logger.exception(f"Fetch failed at start={start}: {e}")
            break

        # 덤프 저장(첫 페이지 + 수집 0개일 때 유용)
        dump_html(start, html)

        page_items = extract_links_from_list_page(html, list_url, logger=logger)

        # 수집 0개면 구조 변경/차단 가능성 → 덤프 확인 후 종료
        if not page_items:
            logger.warning(f"No items extracted at start={start}. Stopping.")
            break

        # 중복 제외 누적
        new_cnt = 0
        for it in page_items:
            url = it["detail_url"]
            if url not in all_seen_urls:
                all_seen_urls.add(url)
                all_items.append(it)
                new_cnt += 1
        logger.info(f"page_done start={start} page_items={len(page_items)} new_added={new_cnt} total={len(all_items)}")

        # 안전 종료 조건
        if len(all_items) >= hard_cap:
            logger.warning(f"Hard cap reached ({hard_cap}). Stopping.")
            break

        # 다음 페이지
        start += 10
        pages += 1
        time.sleep(delay)

    session.close()
    return all_items


# -------- Entrypoint (남자 전용 산출물 파일명) --------

def main():
    try:
        items = crawl_all()
        out_path = pathlib.Path("cbck_male_links_all.json")
        out_path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
        logger.info(f"Saved {len(items)} items -> {out_path.resolve()}")
        logger.info(f"Logs -> {pathlib.Path(log_file).resolve()}")
    except Exception as e:
        logger.exception(f"Fatal error: {e}")


if __name__ == "__main__":
    main()
