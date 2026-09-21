"""``tools/operating_cognition_check.py`` 的測試。

依復盤第 4 則的教訓：**破壞性案例一律以倉庫裡真正的文件為素材**，
不用自己捏的最小檔案——捏的會繼承捏的人的盲點。
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from tools.operating_cognition_check import (  # noqa: E402
    ANCHORS,
    DELTA_POLICY,
    ENTRY_PATH,
    LAW_PATH,
    PREMISE,
    STEPS,
    check,
    main,
)


@pytest.fixture
def sandbox(tmp_path: Path) -> Path:
    """倉庫兩份真實文件的副本。"""
    (tmp_path / LAW_PATH.parent).mkdir(parents=True, exist_ok=True)
    shutil.copy(REPO_ROOT / LAW_PATH, tmp_path / LAW_PATH)
    shutil.copy(REPO_ROOT / ENTRY_PATH, tmp_path / ENTRY_PATH)
    return tmp_path


def _mutate(root: Path, rel: Path, old: str, new: str = "") -> Path:
    p = root / rel
    p.write_text(p.read_text(encoding="utf-8").replace(old, new), encoding="utf-8")
    return root


# --- 正向 ---------------------------------------------------------------


def test_real_repo_passes() -> None:
    assert check(REPO_ROOT) == []


def test_seven_steps_verbatim() -> None:
    """七步逐字取自擁有者原話。多一個少一個都代表有人動了定義。"""
    assert STEPS == ["看到", "接受", "比對", "修正", "建構", "測試", "紀錄"]
    assert len(STEPS) == len(set(STEPS)) == 7


def test_anchors_are_existing_mother_laws() -> None:
    """錨點是母體既有的，不是新增的法則編號。"""
    assert ANCHORS == {"底層": "MRL_LAW0_Verify", "頂層": "LAW∞_Emergence"}


# --- 破壞性：素材是真實文件 -------------------------------------------------


@pytest.mark.parametrize("step", STEPS)
@pytest.mark.parametrize("rel", [LAW_PATH, ENTRY_PATH])
def test_removing_a_step_is_caught(sandbox: Path, rel: Path, step: str) -> None:
    failures = check(_mutate(sandbox, rel, step))
    assert any(step in f for f in failures), f"{rel} 少了「{step}」卻被放行"


def test_reordered_steps_are_caught(sandbox: Path) -> None:
    p = sandbox / ENTRY_PATH
    t = p.read_text(encoding="utf-8")
    t = (
        t.replace("**看到**", "__A__")
        .replace("**接受**", "**看到**")
        .replace("__A__", "**接受**")
        .replace("**看到 → 接受 →", "**接受 → 看到 →")
    )
    p.write_text(t, encoding="utf-8")
    assert any("順序" in f for f in check(sandbox))


def test_missing_premise_is_caught(sandbox: Path) -> None:
    assert any(PREMISE in f for f in check(_mutate(sandbox, ENTRY_PATH, PREMISE)))


@pytest.mark.parametrize("layer,anchor", sorted(ANCHORS.items()))
def test_missing_anchor_is_caught(sandbox: Path, layer: str, anchor: str) -> None:
    failures = check(_mutate(sandbox, LAW_PATH, anchor))
    assert any(layer in f for f in failures)


def test_missing_delta_policy_is_caught(sandbox: Path) -> None:
    """測不了的時候的第三個位置不能消失——那是復盤第 9 則的解法。"""
    failures = check(_mutate(sandbox, LAW_PATH, DELTA_POLICY))
    assert any(DELTA_POLICY in f for f in failures)


def test_entry_must_point_at_the_full_text(sandbox: Path) -> None:
    failures = check(_mutate(sandbox, ENTRY_PATH, LAW_PATH.as_posix()))
    assert any("找得到全文" in f for f in failures)


def test_deleting_claude_md_is_caught(sandbox: Path) -> None:
    """CLAUDE.md 是「每次都必須有」的機制本身，不能不見。"""
    (sandbox / ENTRY_PATH).unlink()
    assert any("每次都必須" in f for f in check(sandbox))


def test_deleting_the_law_is_caught(sandbox: Path) -> None:
    (sandbox / LAW_PATH).unlink()
    assert any(str(LAW_PATH) in f for f in check(sandbox))


def test_main_exit_codes(sandbox: Path, tmp_path: Path) -> None:
    assert main(["prog", str(sandbox)]) == 0
    (sandbox / ENTRY_PATH).unlink()
    assert main(["prog", str(sandbox)]) == 1
