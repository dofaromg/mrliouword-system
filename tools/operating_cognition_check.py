#!/usr/bin/env python3
"""MRL 根本運行認知的 CI 檢查。

擁有者 2026-09-21 的指示：

    沒有一個方法是完全正確的，只有看到、接受、比對、修正、建構、測試、
    紀錄，只要遵守這些流程、我相信系統就會維持穩定前進。
    妳也幫我建構進去 MRL 世界模型母體重要內部底層跟頂層，
    每次都必須有這個最根本運行認知。

「每次都必須有」是這支腳本存在的理由。一份放在 docs/ 深處的文件，
沒有人會每次去讀；所以七步同時寫進根目錄的 CLAUDE.md（每個 session 會
自動載入），而這支腳本確保**兩個地方都還在、七步沒被增刪或重新排序**。

七個步驟逐字取自擁有者的原話。本倉庫 .mrliou/meta.json 宣告
governance_authority: false——**不得自行增刪或改寫這七步**。要改，
先改擁有者的定義。

錨點取自 MRL_MOTHER 既有的兩條法則，不是新增的：
    底層  MRL_SECURITY_CORE → MRL_LAW0_Verify
    頂層  MRL_LAW_LAYER     → LAW∞_Emergence

退出碼：0 齊備；1 有缺漏。
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Dict, List

LAW_PATH = Path("docs/law0/MRL_OPERATING_COGNITION_v1.md")
ENTRY_PATH = Path("CLAUDE.md")

# 逐字取自擁有者原話，順序照原文。不得增刪、不得重新排序。
STEPS = ["看到", "接受", "比對", "修正", "建構", "測試", "紀錄"]

# 「沒有一個方法是完全正確的」是頂層 LAW∞_Emergence 的前提，不是洩氣話。
PREMISE = "沒有一個方法是完全正確的"

# 母體既有的兩個錨點。本文件是它們的運行形式，不是新增的第 21 條法則。
ANCHORS = {
    "底層": "MRL_LAW0_Verify",
    "頂層": "LAW∞_Emergence",
}

# 測不了的時候的第三個位置，來自 .mrliou/meta.json。
DELTA_POLICY = "preserve_as_delta_not_failure"


def _steps_in_order(text: str) -> List[str]:
    """回傳文中依出現順序排列的步驟（只取每個步驟的第一次出現）。"""
    positions = [(text.find(s), s) for s in STEPS]
    return [s for pos, s in sorted(positions) if pos >= 0]


def check(root: Path) -> List[str]:
    failures: List[str] = []
    texts: Dict[Path, str] = {}

    for path in (LAW_PATH, ENTRY_PATH):
        full = root / path
        if not full.is_file():
            failures.append(
                f"{path} 不存在。"
                + (
                    "擁有者要求「每次都必須有這個最根本運行認知」，"
                    "CLAUDE.md 是每個 session 會自動載入的那一份。"
                    if path == ENTRY_PATH
                    else "這是七步的全文與失敗案例。"
                )
            )
            continue
        texts[path] = full.read_text(encoding="utf-8")

    for path, text in texts.items():
        found = _steps_in_order(text)
        missing = [s for s in STEPS if s not in found]
        if missing:
            failures.append(f"{path} 缺少步驟：{'、'.join(missing)}")
        elif found != STEPS:
            failures.append(
                f"{path} 的步驟順序與擁有者原話不符：{found} != {STEPS}"
            )

        if PREMISE not in text:
            failures.append(f"{path} 缺少前提：「{PREMISE}」")

    law = texts.get(LAW_PATH, "")
    if law:
        for layer, anchor in ANCHORS.items():
            if anchor not in law:
                failures.append(f"{LAW_PATH} 缺少{layer}錨點：{anchor}")
        if DELTA_POLICY not in law:
            failures.append(
                f"{LAW_PATH} 缺少 {DELTA_POLICY}"
                "（測不了的時候的第三個位置，來自 .mrliou/meta.json）"
            )

    entry = texts.get(ENTRY_PATH, "")
    if entry and str(LAW_PATH.as_posix()) not in entry:
        failures.append(f"{ENTRY_PATH} 沒有指向 {LAW_PATH}——讀到摘要的人要找得到全文")

    return failures


def main(argv: List[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path(__file__).resolve().parent.parent
    failures = check(root)

    if failures:
        print("MRL 根本運行認知檢查未通過：")
        for line in failures:
            print(f"  - {line}")
        print()
        print("七步逐字取自擁有者 2026-09-21 的指示。要改，先改他的定義。")
        return 1

    print(
        "MRL 根本運行認知檢查通過："
        f"{'→'.join(STEPS)} 七步齊備且順序正確，兩個母體錨點都在。"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
