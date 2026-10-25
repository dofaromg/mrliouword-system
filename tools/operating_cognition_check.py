#!/usr/bin/env python3
"""MRL 根本運行認知的 CI 檢查。

擁有者 2026-09-21 的指示：

    沒有一個方法是完全正確的，只有看到、接受、比對、修正、建構、測試、
    紀錄，只要遵守這些流程、我相信系統就會維持穩定前進。
    妳也幫我建構進去 MRL 世界模型母體重要內部底層跟頂層，
    每次都必須有這個最根本運行認知。

「每次都必須有」是這支腳本存在的理由。一份放在 docs/ 深處的文件，
沒有人會每次去讀；所以七步同時寫進倉庫根目錄的入口檔，而這支腳本確保
**三個地方都還在、七步沒被增刪或重新排序**。

入口檔在 2026-09-21 正名（擁有者：「我建構的必須有我的前綴」）：
正本是 Mrliou_claude.md，CLAUDE.md 降為它產生的 adapter——供應商品牌名
依 NAMING.md 1.2 不得當 canonical，但 Claude Code 只自動載入那個檔名，
所以兩份都要查。lineage 見 docs/governance/MRL_NAMING_LINEAGE.md。

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

sys.path.insert(0, str(Path(__file__).resolve().parent))
# 從同步工具借本文分隔標記，不自己再抄一份常數——
# 兩份常數就是兩個真相，遲早分岔（復盤第 1 則、第 5 則同一個形狀）。
from mrliou_claude_sync import extract_body  # noqa: E402

LAW_PATH = Path("docs/law0/MRL_OPERATING_COGNITION_v1.md")

# 正名後的正本（擁有者前綴）與它產生的 adapter。
# 兩份都查，不是只查其一：canonical 是人改的那一份，adapter 是每個 session
# 自動載入的那一份。少了 canonical 等於正名失效，少了 adapter 等於七步
# 不會被載入。同步由 tools/mrliou_claude_sync.py --check 另外守。
CANON_PATH = Path("Mrliou_claude.md")
ADAPTER_PATH = Path("CLAUDE.md")
ENTRY_PATHS = (CANON_PATH, ADAPTER_PATH)

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

    for path in (LAW_PATH, *ENTRY_PATHS):
        full = root / path
        if not full.is_file():
            if path == CANON_PATH:
                why = (
                    "這是正名後的正本（擁有者前綴）。它不在，"
                    "adapter 就沒有來源，正名等於失效。"
                )
            elif path == ADAPTER_PATH:
                why = (
                    "擁有者要求「每次都必須有這個最根本運行認知」，"
                    "這是每個 session 會自動載入的那一份。"
                    f"修：python3 tools/mrliou_claude_sync.py --build"
                )
            else:
                why = "這是七步的全文與失敗案例。"
            failures.append(f"{path} 不存在。{why}")
            continue
        raw = full.read_text(encoding="utf-8")
        if path == CANON_PATH:
            # 正本的抬頭是正名說明與來源標註，裡面會逐字引用擁有者的原話
            # （含「建構」二字），照全文算「首次出現」會把步驟順序算歪。
            # 七步住在本文區，而本文區正是產生 adapter 的那一區——
            # 量同一區，canonical 與 adapter 的結果才有可比性。
            try:
                raw = extract_body(raw)
            except ValueError as exc:
                failures.append(f"{path} 的本文區塊有問題：{exc}")
                continue
        texts[path] = raw

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

    for path in ENTRY_PATHS:
        entry = texts.get(path, "")
        if entry and str(LAW_PATH.as_posix()) not in entry:
            failures.append(f"{path} 沒有指向 {LAW_PATH}——讀到摘要的人要找得到全文")

    # adapter 必須自己說清楚它不是正本，否則下一個人會直接改它，
    # 改完被 CI 擋下來還不知道為什麼。
    adapter = texts.get(ADAPTER_PATH, "")
    if adapter and str(CANON_PATH.as_posix()) not in adapter:
        failures.append(
            f"{ADAPTER_PATH} 沒有指回正本 {CANON_PATH}——"
            "供應商品牌名只能當 adapter（NAMING.md 1.2），"
            "它必須自己標明正本在哪。"
        )

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
        f"{'→'.join(STEPS)} 七步齊備且順序正確，兩個母體錨點都在，"
        f"正本 {CANON_PATH} 與 adapter {ADAPTER_PATH} 都在。"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
