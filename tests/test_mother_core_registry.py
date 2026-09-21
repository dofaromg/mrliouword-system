"""``tools/mother_core_registry.py`` 的測試。

依復盤第 4 則：破壞性案例以倉庫裡**真正的登錄表**為素材，不用捏的。
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from tools.mother_core_registry import (  # noqa: E402
    DELTA_CORE,
    DELTA_MEMBERS,
    MOTHER_CORE_COUNT,
    MOTHER_SHA256,
    REGISTRY_REL,
    check,
    find,
    main,
    parse_mother,
)


@pytest.fixture
def sandbox(tmp_path: Path) -> Path:
    (tmp_path / REGISTRY_REL.parent).mkdir(parents=True, exist_ok=True)
    shutil.copy(REPO_ROOT / REGISTRY_REL, tmp_path / REGISTRY_REL)
    return tmp_path


def _edit(root: Path, fn) -> Path:
    p = root / REGISTRY_REL
    d = json.loads(p.read_text(encoding="utf-8"))
    fn(d)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    return root


# --- 正向 ---------------------------------------------------------------


def test_real_registry_passes() -> None:
    assert check(REPO_ROOT) == []


def test_delta_core_is_present_with_all_nine() -> None:
    """本工具存在的理由：母體已有 Δ 核，倉庫側不得重造。"""
    hits = find(REPO_ROOT, "delta")
    assert f"{DELTA_CORE}（CORE，9 個成員）" in hits
    for m in DELTA_MEMBERS:
        assert f"{DELTA_CORE} → {m}" in hits


def test_delta_also_appears_outside_its_own_core() -> None:
    """Δ 橫跨多層——TIME_CORE 與 PHYSICS_MATH_CORE 也有。

    這條釘住「Δ 不是孤立的一塊」，免得有人只看 DELTA_CORE 就以為其他層缺。
    """
    hits = find(REPO_ROOT, "delta")
    assert any(h.startswith("MRL_TIME_CORE →") for h in hits)
    assert any(h.startswith("MRL_PHYSICS_MATH_CORE →") for h in hits)


def test_parse_mother_reads_tree_structure() -> None:
    text = "\n".join(
        [
            "├─ MRL_DEMO_CORE  ",
            "│  │  ",
            "│  ├─ MRL_AlphaThing  ",
            "│  └─ MRL_BetaThing  ",
            "│  ",
            "├─ MRL_OTHER_CORE  ",
            "│  ├─ MRL_Gamma  ",
        ]
    )
    cores = parse_mother(text)
    assert cores["MRL_DEMO_CORE"] == ["MRL_AlphaThing", "MRL_BetaThing"]
    assert cores["MRL_OTHER_CORE"] == ["MRL_Gamma"]


# --- 破壞性：素材是真實登錄表 ----------------------------------------------


def test_removing_delta_core_is_caught(sandbox: Path) -> None:
    """有人把 Δ 核從登錄表刪掉——正是要擋的那個動作。"""
    failures = check(_edit(sandbox, lambda d: d["cores"].pop(DELTA_CORE)))
    assert any(DELTA_CORE in f for f in failures)


@pytest.mark.parametrize("member", DELTA_MEMBERS)
def test_removing_a_delta_member_is_caught(sandbox: Path, member: str) -> None:
    failures = check(
        _edit(sandbox, lambda d: d["cores"][DELTA_CORE].remove(member))
    )
    assert any(member in f for f in failures)


def test_wrong_mother_anchor_is_caught(sandbox: Path) -> None:
    """換了來源卻沒重抽——錨點必須擋下。"""
    failures = check(
        _edit(sandbox, lambda d: d["_provenance"].update(source_sha256="0" * 64))
    )
    assert any("錨點" in f for f in failures)


def test_core_count_drift_is_caught(sandbox: Path) -> None:
    failures = check(
        _edit(sandbox, lambda d: d["cores"].pop("MRL_TIME_CORE"))
    )
    assert any(str(MOTHER_CORE_COUNT) in f for f in failures)


def test_canonical_authority_must_be_mr_liou(sandbox: Path) -> None:
    """政策 §4：canonical_authority 一律 Mr.liou，MrLiouWord 只放 origin_signature。"""
    failures = check(
        _edit(sandbox, lambda d: d["_provenance"].update(canonical_authority="MrLiouWord"))
    )
    assert any("canonical_authority" in f for f in failures)


def test_derivative_role_must_stay_projection(sandbox: Path) -> None:
    """mother_mutation: forbidden——這是投影，標成 mirror 等於宣稱是副本。"""
    failures = check(
        _edit(sandbox, lambda d: d["_provenance"].update(derivative_role="mirror"))
    )
    assert any("projection" in f for f in failures)


def test_missing_registry_is_caught(tmp_path: Path) -> None:
    assert any(str(REGISTRY_REL) in f for f in check(tmp_path))


# --- 查詢 ---------------------------------------------------------------


def test_find_returns_nothing_for_absent_concept() -> None:
    assert find(REPO_ROOT, "kubernetes") == []


def test_main_exit_codes(sandbox: Path) -> None:
    assert main(["prog", "--root", str(sandbox), "--check"]) == 0
    assert main(["prog", "--root", str(sandbox), "--find", "delta"]) == 0
    assert main(["prog", "--root", str(sandbox), "--find", "kubernetes"]) == 1


def test_anchor_constant_matches_the_mother_we_measured() -> None:
    """錨點是常數，不得被悄悄改成「目前這一份」。"""
    assert MOTHER_SHA256 == (
        "0671870d795b0cd3a4c445bb1583dbcca319d86773693b7e1ded2ee6648619a7"
    )
    assert MOTHER_CORE_COUNT == 199
