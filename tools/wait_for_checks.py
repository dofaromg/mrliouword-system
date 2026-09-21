#!/usr/bin/env python3
"""等待某個 commit 的所有 CI 檢查完成。

為什麼需要這支工具
------------------
本 session 用過一行臨時的 shell 迴圈：

    until [ "$(…pending 數…)" = "0" ]; do sleep 15; done

它有缺陷，而且真的騙過了我一次。實測 PR #77 的 commit deee273：

        +0s   GitGuardian                      註冊並完成
        +7s   Workers Builds: particle-api     註冊並完成
       +28s   Workers Builds: mrliouword-system 註冊並完成
    +28~100s  只有這三個，而且全部已完成  ← 迴圈在這裡判定「全部完成」退出
      +100s   GitHub Actions 的九個檢查才註冊

我因此向擁有者報了「2/3 綠」，實際是 11/12。

根因有三個，缺一不可地一起造成這個結果：

1. ``pending == 0`` 對**還沒長完的集合**恆真。集合為空或只有先到的幾個時，
   「沒有待處理」這句話是真的，但它不代表「全部完成」。
2. **沒有沉澱窗口**——不容許晚註冊的檢查。不同的 app 註冊時間差距可以到
   一分半以上。
3. **沒有逾時**——後來改成 ``>= 10`` 是硬編碼的魔術數字，檢查數一變就壞。

第 1 點與 docs/retrospective/2026-09-20_claude_session_error_log.md 第 1 則
同形：把當下看得到的，當成了全部。

判定規則
--------
只有在**三個條件同時成立**時才算完成：

    a. 至少有一個檢查
    b. 已註冊的檢查全部 completed
    c. 距離「最後一次看到新檢查出現」已經過了 settle 秒

``--expect`` 可以再加一層：指定的檢查名稱全部出現過才算數。**有明確期待時
一律用它**——沉澱只是「暫時沒有新的」，期待是「該來的都來了」。沉澱窗口
無法被證明足夠：它的值來自一次觀測（72 秒空窗），下一次可能更久。

退出碼：0 全綠；1 有失敗；2 逾時。

用法：
    python3 tools/wait_for_checks.py --sha <sha> [--repo owner/name]
        [--expect "Code Quality" --expect "Release Gate"]
        [--settle 60] [--timeout 1800] [--interval 15]

需要環境變數 GITHUB_TOKEN 或 GH_TOKEN。
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Sequence, Tuple

API = "https://api.github.com"

# 晚註冊的檢查要等多久才敢說「不會再有了」。
#
# deee273 的實測：最後一個早到的檢查註冊於 +28s，GitHub Actions 的九個
# 註冊於 +100s——空窗 72 秒。
#
# 我第一版把這個值設成 60，還在註解裡寫「取 60 秒涵蓋那段空窗」。
# 60 < 72，那句話本身算錯了，而且會在 t=88 誤判完成，比 GH Actions 註冊
# 早 12 秒。是 tests/test_wait_for_checks.py 用真實時間線抓到的。
#
# 現在取 120：涵蓋觀測到的 72 秒，並留約 1.7 倍餘裕。
#
# ⚠️ 但這仍然只是一個從「一次觀測」推出來的啟發式，不是保證。真正可靠的
#    做法是 --expect 明確列出該來的檢查；沉澱窗口只是沒有明確期待時的退路。
DEFAULT_SETTLE = 120
DEFAULT_TIMEOUT = 1800
DEFAULT_INTERVAL = 15

DONE = "done"
WAITING_EMPTY = "waiting_empty"
WAITING_RUNNING = "waiting_running"
WAITING_SETTLE = "waiting_settle"
WAITING_EXPECTED = "waiting_expected"


def decide(
    checks: Sequence[Dict[str, Any]],
    last_change_at: float,
    now: float,
    settle: float,
    expect: Sequence[str] = (),
) -> Tuple[str, str]:
    """純判定，不碰網路——這樣才測得動。

    回傳 (狀態, 人看得懂的理由)。
    """
    if not checks:
        return WAITING_EMPTY, "還沒有任何檢查註冊"

    running = [c["name"] for c in checks if c.get("status") != "completed"]
    if running:
        return WAITING_RUNNING, f"{len(running)} 個仍在執行：{', '.join(running[:3])}"

    if expect:
        seen = {c["name"] for c in checks}
        missing = [e for e in expect if e not in seen]
        if missing:
            return (
                WAITING_EXPECTED,
                f"期待的檢查尚未出現：{', '.join(missing)}",
            )
        return DONE, f"期待的 {len(expect)} 個檢查全部出現且完成"

    waited = now - last_change_at
    if waited < settle:
        return (
            WAITING_SETTLE,
            f"已註冊的 {len(checks)} 個都完成了，但最後一次有新檢查是 "
            f"{waited:.0f} 秒前，還沒滿 {settle:.0f} 秒的沉澱窗口",
        )
    return DONE, f"{len(checks)} 個檢查全部完成，且 {waited:.0f} 秒內沒有新的"


def newest_activity(checks: Sequence[Dict[str, Any]]) -> Optional[float]:
    """檢查本身最後一次有動靜是什麼時候（epoch 秒）。

    對一個早就跑完的 commit，這個時間可能是幾小時前——那就不必再等沉澱。
    第一版把 last_change 初始化成「現在」，導致對 deee273 這種已完成的
    commit 也要空等滿 120 秒。實跑才發現，單元測試抓不到。
    """
    stamps = []
    for c in checks:
        for key in ("completed_at", "started_at"):
            v = c.get(key)
            if v:
                try:
                    stamps.append(
                        datetime.datetime.fromisoformat(
                            v.replace("Z", "+00:00")
                        ).timestamp()
                    )
                except ValueError:
                    pass
    return max(stamps) if stamps else None


def fetch(repo: str, sha: str, token: str) -> List[Dict[str, Any]]:
    req = urllib.request.Request(
        f"{API}/repos/{repo}/commits/{sha}/check-runs?per_page=100",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "mrliouword-wait-for-checks",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8")).get("check_runs", [])


def summarise(checks: Sequence[Dict[str, Any]]) -> Tuple[int, List[str]]:
    ok = sum(1 for c in checks if c.get("conclusion") == "success")
    bad = [
        f"{c['name']}: {c.get('conclusion')}"
        for c in checks
        if c.get("conclusion") not in ("success", "neutral", "skipped")
    ]
    return ok, bad


def main(argv: Optional[Sequence[str]] = None) -> int:
    p = argparse.ArgumentParser(description="等待某個 commit 的 CI 檢查完成")
    p.add_argument("--sha", required=True)
    p.add_argument("--repo", default="dofaromg/mrliouword-system")
    p.add_argument("--expect", action="append", default=[])
    p.add_argument("--settle", type=float, default=DEFAULT_SETTLE)
    p.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT)
    p.add_argument("--interval", type=float, default=DEFAULT_INTERVAL)
    args = p.parse_args(argv)

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        print("需要環境變數 GITHUB_TOKEN 或 GH_TOKEN", file=sys.stderr)
        return 2

    start = time.monotonic()
    last_change = start
    seen: set = set()
    last_reason = ""

    while True:
        # 逾時一律在迴圈開頭檢查。第一版放在最後，於是只要 fetch 一直失敗、
        # 走 continue，逾時就永遠不可達——對一個不存在的 sha 會無限重試。
        # 這個缺陷是實跑逾時路徑時發現的，單元測試沒有涵蓋網路例外。
        if time.monotonic() - start > args.timeout:
            print(f"\n逾時（{args.timeout:.0f} 秒）：{last_reason}", file=sys.stderr)
            return 2

        try:
            checks = fetch(args.repo, args.sha, token)
        except (urllib.error.URLError, TimeoutError) as exc:
            # 網路抖動不該當成「沒有檢查」——那正是原本那個迴圈的錯誤形狀。
            last_reason = f"查詢失敗：{exc}"
            print(f"   {last_reason}，{args.interval:.0f} 秒後重試")
            time.sleep(args.interval)
            continue

        names = {c["name"] for c in checks}
        if names != seen:
            seen = names
            # 若檢查本身的最後動靜已經是過去式，就用它來回推，
            # 不要讓早就跑完的 commit 空等滿一個沉澱窗口。
            newest = newest_activity(checks)
            age = (time.time() - newest) if newest else 0.0
            last_change = time.monotonic() - max(age, 0.0)

        state, reason = decide(
            checks, last_change, time.monotonic(), args.settle, args.expect
        )
        if state == DONE:
            ok, bad = summarise(checks)
            print(f"\n{reason}")
            for c in sorted(checks, key=lambda x: x["name"]):
                mark = "✅" if c.get("conclusion") == "success" else "❌"
                print(f"  {mark} {c['name']}: {c.get('conclusion')}")
            print(f"  → {ok}/{len(checks)} 綠")
            return 1 if bad else 0

        if reason != last_reason:
            print(f"   {reason}")
            last_reason = reason

        time.sleep(args.interval)


if __name__ == "__main__":
    raise SystemExit(main())
