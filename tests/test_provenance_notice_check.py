"""``tools/provenance_notice_check.py`` 的測試。

重點不是「通過」，而是「該擋的時候真的會擋」。

這個檔案的第一版有一個根本缺陷，值得寫在這裡免得有人改回去：
它用自己捏的最小文件當測試素材，每個欄位名只出現一次。真實的
``MRL_PROVENANCE.md`` 裡，同樣的欄位名在第三、四、五節也會出現，
所以「從規格表刪掉一整列」在真實文件上根本不會被當時的檢查攔下，
而測試卻全綠。九個欄位裡有五個是這種情況。

**所以破壞性案例一律以倉庫裡真正的 MRL_PROVENANCE.md 為素材。**
測試素材必須重現真實結構，否則測的是測試自己。
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from tools.provenance_notice_check import (  # noqa: E402
    HISTORY_POLICY,
    MACHINE_ID,
    NOTICE_PATH,
    REQUIRED_FIELDS,
    SPEC_BEGIN,
    SPEC_END,
    check,
    main,
    parse_spec_table,
)


@pytest.fixture(scope="module")
def real_notice() -> str:
    """倉庫裡真正的 MRL_PROVENANCE.md，不是捏造的。"""
    return (REPO_ROOT / NOTICE_PATH).read_text(encoding="utf-8")


def _write(tmp_path: Path, text: str | None) -> Path:
    if text is not None:
        (tmp_path / NOTICE_PATH).write_text(text, encoding="utf-8")
    return tmp_path


def _spec_row(notice: str, field: str) -> str:
    """規格表中該欄位那一整列。"""
    spec = notice.split(SPEC_BEGIN, 1)[1].split(SPEC_END, 1)[0]
    match = re.search(rf"^\| {re.escape(field)} \|.*$", spec, re.M)
    assert match, f"規格表中找不到 {field} 這一列"
    return match.group(0)


# --- 正向 ---------------------------------------------------------------


def test_real_repo_notice_passes() -> None:
    assert check(REPO_ROOT) == []


def test_spec_table_has_exactly_the_nine_fields(real_notice: str) -> None:
    rows, errors = parse_spec_table(real_notice)
    assert errors == []
    assert [name for name, _ in rows] == REQUIRED_FIELDS


def test_every_spec_value_is_non_empty(real_notice: str) -> None:
    rows, _ = parse_spec_table(real_notice)
    assert all(value for _, value in rows)


# --- 破壞性：素材一律是真實文件 -------------------------------------------


@pytest.mark.parametrize("field", REQUIRED_FIELDS)
def test_deleting_a_spec_row_is_caught(
    tmp_path: Path, real_notice: str, field: str
) -> None:
    """從規格表刪掉一整列必須被擋下。

    這是第一版漏掉的案例：欄位名在別的章節還在，全文搜尋因此照樣通過。
    """
    broken = real_notice.replace(_spec_row(real_notice, field) + "\n", "")
    failures = check(_write(tmp_path, broken))
    assert any(field in f for f in failures), f"刪掉規格表的 {field} 卻被放行"


def test_missing_delimiters_is_caught(tmp_path: Path, real_notice: str) -> None:
    broken = real_notice.replace(SPEC_BEGIN, "").replace(SPEC_END, "")
    failures = check(_write(tmp_path, broken))
    assert any("界標" in f for f in failures)


def test_reordered_fields_is_caught(tmp_path: Path, real_notice: str) -> None:
    first, second = REQUIRED_FIELDS[0], REQUIRED_FIELDS[1]
    broken = (
        real_notice.replace(f"| {first} |", "| __TMP__ |")
        .replace(f"| {second} |", f"| {first} |")
        .replace("| __TMP__ |", f"| {second} |")
    )
    failures = check(_write(tmp_path, broken))
    assert any("順序" in f for f in failures)


def test_extra_self_invented_field_is_caught(
    tmp_path: Path, real_notice: str
) -> None:
    """本倉庫 governance_authority: false，不得自行擴充規格。"""
    broken = real_notice.replace(SPEC_END, "| Extra Rule | 自創 |\n" + SPEC_END)
    failures = check(_write(tmp_path, broken))
    assert any("Extra Rule" in f for f in failures)


def test_emptied_spec_value_is_caught(tmp_path: Path, real_notice: str) -> None:
    field = "Remedy Window"
    broken = real_notice.replace(_spec_row(real_notice, field), f"| {field} |  |")
    failures = check(_write(tmp_path, broken))
    assert any("空" in f for f in failures)


def test_missing_machine_id_is_caught(tmp_path: Path, real_notice: str) -> None:
    failures = check(_write(tmp_path, real_notice.replace(MACHINE_ID, "")))
    assert any(MACHINE_ID in f for f in failures)


def test_missing_history_policy_is_caught(tmp_path: Path, real_notice: str) -> None:
    failures = check(_write(tmp_path, real_notice.replace(HISTORY_POLICY, "")))
    assert any(HISTORY_POLICY in f for f in failures)


def test_missing_file_is_caught(tmp_path: Path) -> None:
    failures = check(_write(tmp_path, None))
    assert len(failures) == 1
    assert NOTICE_PATH in failures[0]


# --- 規格本身不得被改寫 ---------------------------------------------------


def test_machine_id_is_the_rights_holder_value() -> None:
    # 逐字取自權利人文件〈MRL 來源標註規格〉Machine ID 欄，不得被改寫。
    assert MACHINE_ID == "mrl-origin: MrLiouWord"


def test_nine_fields_exactly() -> None:
    # 權利人文件列出九個欄位。多一個少一個都代表有人動了規格。
    assert len(REQUIRED_FIELDS) == 9
    assert len(set(REQUIRED_FIELDS)) == 9


def test_main_exit_codes(tmp_path: Path, real_notice: str) -> None:
    assert main(["prog", str(_write(tmp_path, real_notice))]) == 0
    assert main(["prog", str(tmp_path / "nope")]) == 1
