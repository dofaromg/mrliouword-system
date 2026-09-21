#!/usr/bin/env python3
"""MRL_PROVENANCE.md 的 CI 檢查。

依據：權利人文件 ``Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3``
〈補正程序〉第 4 項——

    技術門檻：MRL canonical 加入 provenance 文件與 CI 檢查；
    AI Apps 改為明確 repository allowlist。

本腳本檢查該文件〈MRL 來源標註規格〉所列的九個欄位是否完整存在於**規格表本身**，
以及機器標記 ``mrl-origin: MrLiouWord`` 與 ``history_policy`` 是否已聲明。

它**不判斷內容對錯**。本倉庫 ``.mrliou/meta.json`` 宣告
``governance_authority: false``，所以欄位清單一律逐字取自權利人文件，
不由本腳本自行定義、擴充或刪減。要改欄位清單，先改權利人文件。

為什麼是界標而不是全文搜尋
--------------------------
第一版對整份文件做子字串搜尋，結果是壞的：同樣的欄位名在第三、四、五節
也會出現，所以從規格表刪掉一整列仍然會通過。實測九個欄位裡有五個
（Source Root、Trace、AI Use Condition、Authorship Boundary、
Upstream Boundary）可以被刪掉而檢查毫無反應。

這個缺陷是 Codex 在 PR #76 上指出來的，屬實。當時我的測試之所以沒抓到，
是因為測試用的是自己捏的最小文件，只有一處出現該欄位——**測試重現的不是
真實文件的結構**。這正是本倉庫一再記錄的那類錯誤，這次是我自己犯的。

修法：規格表用 ``<!-- MRL-SPEC-TABLE:BEGIN/END -->`` 兩個界標框起來，
本腳本只解析界標之間的表格列，逐列比對欄位名與順序，並要求值非空。
不要改回全文搜尋。

退出碼：0 = 齊備；1 = 有缺漏。
"""

from __future__ import annotations

import sys
from pathlib import Path

NOTICE_PATH = "MRL_PROVENANCE.md"

SPEC_BEGIN = "<!-- MRL-SPEC-TABLE:BEGIN -->"
SPEC_END = "<!-- MRL-SPEC-TABLE:END -->"

# 逐字取自權利人文件〈MRL 來源標註規格〉的「欄位」欄，順序照原文。
REQUIRED_FIELDS = [
    "Source Root",
    "Required Attribution",
    "Machine ID",
    "Trace",
    "AI Use Condition",
    "Reciprocity Rule",
    "Authorship Boundary",
    "Remedy Window",
    "Upstream Boundary",
]

# 同一文件〈MRL 來源標註規格〉Machine ID 欄的值。
MACHINE_ID = "mrl-origin: MrLiouWord"

# 同一文件〈保存原則〉：不刪除 run、不 force-push、不重寫 commit 歷史。
HISTORY_POLICY = "append_only"

# 表格的標題列與分隔列，解析時要跳過。
_HEADER_CELLS = {"欄位", "要求"}


def _split_row(line: str) -> list[str]:
    """把一行 markdown 表格列切成儲存格。"""
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def _is_separator(cells: list[str]) -> bool:
    return all(set(cell) <= set("-: ") and cell for cell in cells)


def parse_spec_table(text: str) -> tuple[list[tuple[str, str]], list[str]]:
    """解析界標之間的規格表。

    回傳 (資料列, 錯誤訊息)。找不到界標時資料列為空。
    """
    errors: list[str] = []

    if SPEC_BEGIN not in text or SPEC_END not in text:
        errors.append(
            f"{NOTICE_PATH} 找不到規格表界標 {SPEC_BEGIN} / {SPEC_END}。"
            "規格表必須被界標框住，否則無法逐列驗證。"
        )
        return [], errors

    body = text.split(SPEC_BEGIN, 1)[1].split(SPEC_END, 1)[0]

    rows: list[tuple[str, str]] = []
    for line in body.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = _split_row(line)
        if len(cells) < 2:
            errors.append(f"規格表有一列不足兩欄：{line}")
            continue
        if _is_separator(cells):
            continue
        if set(cells[:2]) == _HEADER_CELLS:
            continue
        rows.append((cells[0], cells[1]))

    return rows, errors


def check(root: Path) -> list[str]:
    """回傳缺漏清單；空清單代表通過。"""
    failures: list[str] = []
    path = root / NOTICE_PATH

    if not path.is_file():
        return [
            f"{NOTICE_PATH} 不存在。"
            "權利人文件〈補正程序〉要求 MRL canonical 加入 provenance 文件。"
        ]

    text = path.read_text(encoding="utf-8")

    rows, parse_errors = parse_spec_table(text)
    failures.extend(parse_errors)

    if rows or not parse_errors:
        names = [name for name, _ in rows]

        for field in REQUIRED_FIELDS:
            if field not in names:
                failures.append(f"規格表缺少欄位：{field}")

        for name in names:
            if name not in REQUIRED_FIELDS:
                failures.append(
                    f"規格表出現權利人文件沒有的欄位：{name}"
                    "（本倉庫 governance_authority: false，不得自行擴充規格）"
                )

        if names and names != REQUIRED_FIELDS and not set(names) ^ set(REQUIRED_FIELDS):
            failures.append(
                f"規格表欄位順序與權利人文件不符：{names} != {REQUIRED_FIELDS}"
            )

        for name, value in rows:
            if not value:
                failures.append(f"規格表欄位「{name}」的要求欄是空的")

    if MACHINE_ID not in text:
        failures.append(f"{NOTICE_PATH} 缺少機器標記：{MACHINE_ID}")

    if HISTORY_POLICY not in text:
        failures.append(
            f"{NOTICE_PATH} 未聲明 history_policy: {HISTORY_POLICY}"
            "（權利人文件〈保存原則〉：不刪除 run、不 force-push、不重寫 commit 歷史）"
        )

    return failures


def main(argv: list[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path(__file__).resolve().parent.parent
    failures = check(root)

    if failures:
        print("MRL 來源標註檢查未通過：")
        for line in failures:
            print(f"  - {line}")
        print()
        print("規格來源：Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3")
        return 1

    print(
        f"MRL 來源標註檢查通過：{NOTICE_PATH} 規格表九列齊備且順序正確，機器標記存在。"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
