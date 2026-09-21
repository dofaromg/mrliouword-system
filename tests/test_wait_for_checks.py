"""``tools/wait_for_checks.py`` 的測試。

核心案例是重播 PR #77 commit `deee273` 的真實時間線——就是騙過我那一次。
時間點取自 GitHub API 的 started_at／completed_at，不是編的。
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from tools.wait_for_checks import (  # noqa: E402
    DEFAULT_SETTLE,
    DONE,
    WAITING_EMPTY,
    WAITING_EXPECTED,
    WAITING_RUNNING,
    WAITING_SETTLE,
    decide,
    summarise,
)

# deee273 的實測：(名稱, 註冊於 t+?, 完成於 t+?)
REAL_TIMELINE = [
    ("GitGuardian Security Checks", 0, 1),
    ("Workers Builds: particle-api", 7, 7),
    ("Workers Builds: mrliouword-system", 28, 28),
    ("MRL 來源標註檢查", 100, 105),
    ("Security Scan", 100, 116),
    ("test", 100, 140),
    ("Connection Audit", 101, 108),
    ("Release Gate", 101, 111),
    ("Run Tests (3.10)", 101, 124),
    ("Code Quality", 101, 126),
    ("Run Tests (3.11)", 101, 131),
    ("Build Package", 101, 133),
]

FAILING = {"Workers Builds: particle-api"}


def registered_at(t: int) -> List[Dict[str, Any]]:
    """t 秒當下，GitHub 會回傳哪些檢查。"""
    out = []
    for name, start, end in REAL_TIMELINE:
        if start > t:
            continue
        done = end <= t
        out.append(
            {
                "name": name,
                "status": "completed" if done else "in_progress",
                "conclusion": (
                    ("failure" if name in FAILING else "success") if done else None
                ),
            }
        )
    return out


def last_change_before(t: int) -> int:
    """t 秒之前，最後一次有新檢查出現是什麼時候。"""
    return max((s for _, s, _ in REAL_TIMELINE if s <= t), default=0)


# --- 舊判定的缺陷，用真實時間線重現 ----------------------------------------


def old_predicate(t: int) -> bool:
    """本 session 用過的臨時迴圈：pending == 0 就算完成。"""
    checks = registered_at(t)
    return sum(1 for c in checks if c["status"] != "completed") == 0


@pytest.mark.parametrize("t", [30, 45, 60, 75, 90, 99])
def test_old_predicate_is_fooled_in_the_gap(t: int) -> None:
    """+28s～+100s 的空窗：三個檢查都完成了，GitHub Actions 還沒註冊。

    舊判定在這裡說「完成」——我因此報了 2/3 綠，實際是 11/12。
    """
    assert old_predicate(t) is True
    assert len(registered_at(t)) == 3  # 只看得到三個


@pytest.mark.parametrize("t", [30, 45, 60, 75, 90, 99])
def test_new_decide_waits_through_the_gap(t: int) -> None:
    """新判定在同樣的時間點必須說「還沒」。

    刻意用 DEFAULT_SETTLE 而不是寫死的數字——測試要守住的是「預設設定下
    不會誤判」，寫死數字的話改了預設值這裡也不會紅。
    """
    state, _ = decide(
        registered_at(t),
        last_change_at=last_change_before(t),
        now=t,
        settle=DEFAULT_SETTLE,
    )
    assert state == WAITING_SETTLE


def test_new_decide_completes_after_everything_finishes() -> None:
    t = 140 + DEFAULT_SETTLE  # 最後一個完成於 +140，再等滿沉澱窗口
    state, _ = decide(
        registered_at(t),
        last_change_at=last_change_before(t),
        now=t,
        settle=DEFAULT_SETTLE,
    )
    assert state == DONE
    ok, bad = summarise(registered_at(t))
    assert ok == 11
    assert bad == ["Workers Builds: particle-api: failure"]


def test_still_waiting_while_a_check_runs() -> None:
    """+110s：GitHub Actions 已註冊但還有在跑的。"""
    t = 110
    state, _ = decide(
        registered_at(t),
        last_change_at=last_change_before(t),
        now=t,
        settle=DEFAULT_SETTLE,
    )
    assert state == WAITING_RUNNING


# --- 三個根因各自的回歸 ----------------------------------------------------


def test_empty_set_is_not_done() -> None:
    """根因 1：pending == 0 對空集合恆真。"""
    assert old_predicate(-1) is True  # 舊的：空集合也說完成
    state, _ = decide([], last_change_at=0, now=0, settle=60)
    assert state == WAITING_EMPTY


def test_settle_window_is_measured_from_last_new_check() -> None:
    """根因 2：沉澱窗口要從『最後一次有新檢查』起算，不是從開始起算。"""
    checks = registered_at(28)
    state, _ = decide(checks, last_change_at=28, now=28 + 59, settle=60)
    assert state == WAITING_SETTLE
    state, _ = decide(checks, last_change_at=28, now=28 + 61, settle=60)
    assert state == DONE


def test_expect_is_stronger_than_settle() -> None:
    """根因 3：有明確期待時不靠魔術數字，也不靠沉澱。"""
    expect = [name for name, _, _ in REAL_TIMELINE]
    # 空窗期：沉澱窗口就算滿了，期待沒到齊仍然要等
    state, reason = decide(
        registered_at(60), last_change_at=0, now=10_000, settle=60, expect=expect
    )
    assert state == WAITING_EXPECTED
    assert "Code Quality" in reason
    # 全部到齊
    state, _ = decide(
        registered_at(200), last_change_at=0, now=10_000, settle=60, expect=expect
    )
    assert state == DONE


def test_expect_ignores_unlisted_extra_checks() -> None:
    """多出來的檢查不影響判定——只要求期待的那些都在。"""
    state, _ = decide(
        registered_at(200), last_change_at=0, now=10_000, settle=60,
        expect=["Code Quality", "Release Gate"],
    )
    assert state == DONE


def test_summarise_counts_only_real_failures() -> None:
    checks = [
        {"name": "a", "status": "completed", "conclusion": "success"},
        {"name": "b", "status": "completed", "conclusion": "skipped"},
        {"name": "c", "status": "completed", "conclusion": "neutral"},
        {"name": "d", "status": "completed", "conclusion": "failure"},
    ]
    ok, bad = summarise(checks)
    assert ok == 1
    assert bad == ["d: failure"]


def test_sixty_second_settle_is_not_enough_for_this_timeline() -> None:
    """釘住一個事實：我第一版的 settle=60 會誤判。

    +28s 之後空窗 72 秒，settle=60 會在 t=88 說完成，比 GitHub Actions
    註冊（+100s）早 12 秒。預設值因此改為 120。
    這條測試存在的目的是：如果有人把預設值調回 60，這裡會紅。
    """
    t = 88
    state, _ = decide(
        registered_at(t), last_change_at=last_change_before(t), now=t, settle=60
    )
    assert state == DONE, "settle=60 在此時間線會誤判——這正是要避免的"

    state, _ = decide(
        registered_at(t), last_change_at=last_change_before(t), now=t, settle=120
    )
    assert state == WAITING_SETTLE, "settle=120 必須仍在等"


def test_default_settle_covers_the_observed_gap() -> None:
    from tools.wait_for_checks import DEFAULT_SETTLE

    observed_gap = 100 - 28  # deee273 實測
    assert DEFAULT_SETTLE >= observed_gap, (
        f"預設沉澱窗口 {DEFAULT_SETTLE} 秒小於觀測到的 {observed_gap} 秒空窗"
    )
