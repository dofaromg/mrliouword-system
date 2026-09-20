"""``tools/provenance_notice_check.py`` 的測試。

重點不是「通過」，而是「該擋的時候真的會擋」——
所以每個必要欄位都有一個對應的缺漏案例。
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.provenance_notice_check import (  # noqa: E402
    MACHINE_ID,
    NOTICE_PATH,
    REQUIRED_FIELDS,
    check,
    main,
)


def _full_notice() -> str:
    body = "\n".join(f"| {field} | 值 |" for field in REQUIRED_FIELDS)
    return f"# MRL_PROVENANCE\n\n{MACHINE_ID}\n\nhistory_policy: append_only\n\n{body}\n"


def _write(tmp_path: Path, text: str | None) -> Path:
    if text is not None:
        (tmp_path / NOTICE_PATH).write_text(text, encoding="utf-8")
    return tmp_path


def test_full_notice_passes(tmp_path: Path) -> None:
    assert check(_write(tmp_path, _full_notice())) == []


def test_missing_file_fails(tmp_path: Path) -> None:
    failures = check(_write(tmp_path, None))
    assert len(failures) == 1
    assert NOTICE_PATH in failures[0]


@pytest.mark.parametrize("field", REQUIRED_FIELDS)
def test_each_missing_field_is_caught(tmp_path: Path, field: str) -> None:
    text = _full_notice().replace(f"| {field} | 值 |", "")
    failures = check(_write(tmp_path, text))
    assert any(field in f for f in failures), f"{field} 缺漏時未被攔下"


def test_missing_machine_id_is_caught(tmp_path: Path) -> None:
    text = _full_notice().replace(MACHINE_ID, "")
    failures = check(_write(tmp_path, text))
    assert any(MACHINE_ID in f for f in failures)


def test_missing_history_policy_is_caught(tmp_path: Path) -> None:
    text = _full_notice().replace("append_only", "")
    failures = check(_write(tmp_path, text))
    assert any("append_only" in f for f in failures)


def test_machine_id_is_the_rights_holder_value() -> None:
    # 逐字取自權利人文件〈MRL 來源標註規格〉Machine ID 欄，不得被改寫。
    assert MACHINE_ID == "mrl-origin: MrLiouWord"


def test_nine_fields_exactly() -> None:
    # 權利人文件列出九個欄位。多一個少一個都代表有人動了規格。
    assert len(REQUIRED_FIELDS) == 9
    assert len(set(REQUIRED_FIELDS)) == 9


def test_main_exit_codes(tmp_path: Path) -> None:
    assert main(["prog", str(_write(tmp_path, _full_notice()))]) == 0
    assert main(["prog", str(tmp_path / "nope")]) == 1


def test_real_repo_notice_passes() -> None:
    assert check(Path(__file__).resolve().parent.parent) == []
