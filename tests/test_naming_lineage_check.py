"""``tools/naming_lineage_check.py`` 的測試。

這支工具存在的理由本身就是一個錯誤的修正：第一版寫成 workflow 的內嵌
heredoc，本機過、CI 紅（`ModuleNotFoundError: No module named 'yaml'`）。
內嵌在 YAML 裡的程式碼測試碰不到，本機有 PyYAML 而 runner 沒有。

所以這個檔案除了測規則，還測**那個 bug 本身不會復發**：
workflow 必須安裝 PyYAML、必須呼叫這支工具而不是內嵌 python。

素材一律用倉庫裡真正的登錄簿與 lineage 文件，不用自己捏的。
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest
import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from tools.naming_lineage_check import (  # noqa: E402
    ADAPTER_DISPOSITION,
    ADAPTER_FILE,
    CANON_FILE,
    CANON_NAME,
    LINEAGE_ID,
    LINEAGE_PATH,
    REGISTRY_KEY,
    REGISTRY_PATH,
    check,
    main,
)

WORKFLOW = REPO_ROOT / ".github/workflows/mrliouword-sdk-ci.yml"


@pytest.fixture
def sandbox(tmp_path: Path) -> Path:
    """倉庫真實檔案的副本。"""
    for rel in (REGISTRY_PATH, LINEAGE_PATH):
        (tmp_path / rel.parent).mkdir(parents=True, exist_ok=True)
        shutil.copy(REPO_ROOT / rel, tmp_path / rel)
    for rel in (CANON_FILE, ADAPTER_FILE):
        shutil.copy(REPO_ROOT / rel, tmp_path / rel)
    return tmp_path


def _edit_registry(root: Path, fn) -> Path:
    p = root / REGISTRY_PATH
    data = yaml.safe_load(p.read_text(encoding="utf-8"))
    fn(data)
    p.write_text(yaml.safe_dump(data, allow_unicode=True), encoding="utf-8")
    return root


def test_real_repo_passes() -> None:
    assert check(REPO_ROOT) == []


def test_sandbox_passes(sandbox: Path) -> None:
    assert check(sandbox) == []


# --- 規則 1：Registry Gate ---------------------------------------------------


def test_unregistered_canonical_is_caught(sandbox: Path) -> None:
    """未登錄的產物不得進入命名規則（naming_rules_v1.yaml 的 Registry Gate）。"""
    _edit_registry(sandbox, lambda d: d["canonical"].pop("entrypoint"))
    assert any("Registry Gate" in f for f in check(sandbox))


def test_wrong_registry_key_is_caught(sandbox: Path) -> None:
    """key 格式是 mrl_<OriginalName>，不是隨便取的。"""
    _edit_registry(
        sandbox,
        lambda d: d["canonical"]["entrypoint"].update({"registry_key": "claude_md"}),
    )
    assert any(REGISTRY_KEY in f for f in check(sandbox))


# --- 規則 2：供應商品牌名只能當 adapter --------------------------------------


def test_promoting_the_vendor_name_is_caught(sandbox: Path) -> None:
    """把 CLAUDE.md 的處置改掉＝讓供應商品牌名升格，NAMING.md 1.2 禁止。"""
    _edit_registry(
        sandbox,
        lambda d: d["legacy_aliases"][ADAPTER_FILE.name].update(
            {"disposition": "replace"}
        ),
    )
    failures = check(sandbox)
    assert any(ADAPTER_DISPOSITION in f for f in failures)
    assert any("1.2" in f for f in failures)


def test_alias_not_pointing_at_canonical_is_caught(sandbox: Path) -> None:
    _edit_registry(
        sandbox,
        lambda d: d["legacy_aliases"][ADAPTER_FILE.name].update(
            {"canonical": "SomethingElse"}
        ),
    )
    assert any(CANON_NAME in f for f in check(sandbox))


# --- 規則 3：lineage 與映射 --------------------------------------------------


def test_missing_lineage_document_is_caught(sandbox: Path) -> None:
    """沒有 lineage 就是無證據改名（NAMING.md 1.4）。"""
    (sandbox / LINEAGE_PATH).unlink()
    assert any("無證據改名" in f for f in check(sandbox))


def test_lineage_without_the_entry_is_caught(sandbox: Path) -> None:
    p = sandbox / LINEAGE_PATH
    t = p.read_text(encoding="utf-8")
    assert LINEAGE_ID in t, "素材裡本來就沒有 L-001，這個測試就沒測到東西"
    p.write_text(t.replace(LINEAGE_ID, "L-XXX"), encoding="utf-8")
    assert any(LINEAGE_ID in f for f in check(sandbox))


# --- invariant：原名永不變更、檔案不刪 ---------------------------------------


def test_deleting_the_original_name_is_caught(sandbox: Path) -> None:
    """naming_rules_v1.yaml: Original names are NEVER changed。"""
    (sandbox / ADAPTER_FILE).unlink()
    assert any("原名不得刪除" in f for f in check(sandbox))


def test_deleting_the_canonical_is_caught(sandbox: Path) -> None:
    (sandbox / CANON_FILE).unlink()
    assert any("正本不得缺席" in f for f in check(sandbox))


def test_missing_registry_is_caught(sandbox: Path) -> None:
    (sandbox / REGISTRY_PATH).unlink()
    assert any("Registry Gate" in f for f in check(sandbox))


def test_main_exit_codes(sandbox: Path) -> None:
    assert main(["prog", str(sandbox)]) == 0
    (sandbox / CANON_FILE).unlink()
    assert main(["prog", str(sandbox)]) == 1


# --- 回歸：那個 bug 本身 -----------------------------------------------------


def test_ci_job_installs_pyyaml() -> None:
    """a0a059e 的真實失敗：runner 沒有 PyYAML。

    這支工具 import yaml，job 就必須裝它。註解說「不裝任何套件」而實際
    用了非標準函式庫，就是這次 CI 紅的原因。
    """
    job = yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))["jobs"]["naming-lineage"]
    runs = " ".join(s.get("run", "") for s in job["steps"])
    assert "pip install PyYAML" in runs, "naming-lineage job 沒有安裝 PyYAML"


def test_ci_job_calls_the_tool_not_inline_python() -> None:
    """根因不是忘了 pip install，是把邏輯放在測試碰不到的地方。

    檢查邏輯必須留在 tools/（有測試），workflow 只負責呼叫。
    """
    job = yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))["jobs"]["naming-lineage"]
    runs = [s.get("run", "") for s in job["steps"]]
    joined = " ".join(runs)
    assert "tools/naming_lineage_check.py" in joined, "job 沒有呼叫這支工具"
    assert "tools/mrliou_claude_sync.py --check" in joined, "job 沒有跑同步檢查"
    for r in runs:
        assert "python - <<" not in r, (
            "naming-lineage job 又出現內嵌 heredoc——"
            "內嵌的程式碼測試碰不到，這就是 a0a059e 紅掉的原因"
        )
