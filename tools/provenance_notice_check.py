#!/usr/bin/env python3
"""MRL_PROVENANCE.md 的 CI 檢查。

依據：權利人文件 ``Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3``
〈補正程序〉第 4 項——

    技術門檻：MRL canonical 加入 provenance 文件與 CI 檢查；
    AI Apps 改為明確 repository allowlist。

本腳本只檢查該文件〈MRL 來源標註規格〉所列的九個欄位是否齊備，
以及機器標記 ``mrl-origin: MrLiouWord`` 是否存在。

它**不判斷內容對錯**。本倉庫 ``.mrliou/meta.json`` 宣告
``governance_authority: false``，所以欄位清單一律逐字取自權利人文件，
不由本腳本自行定義、擴充或刪減。要改欄位清單，先改權利人文件。

退出碼：0 = 齊備；1 = 有缺漏。
"""

from __future__ import annotations

import sys
from pathlib import Path

NOTICE_PATH = "MRL_PROVENANCE.md"

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

    for field in REQUIRED_FIELDS:
        if field not in text:
            failures.append(f"{NOTICE_PATH} 缺少規格欄位：{field}")

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

    print(f"MRL 來源標註檢查通過：{NOTICE_PATH} 九個規格欄位齊備，機器標記存在。")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
