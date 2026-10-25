#!/usr/bin/env python3
"""正名與 lineage 的 CI 檢查。

擁有者 2026-09-21：「我們需要建構正名 Mrliou_claude.md ／
我建構的必須有我的前綴」。

這支腳本守三條規則，每一條都不是本倉庫自己定的：

  1. naming_rules_v1.yaml 的 Registry Gate
     「Artifact must have an explicit registry entry before entering
     naming/index rules」——正名必須先登錄。
  2. ----2/docs/NAMING.md 1.2
     外部品牌、供應商與框架名稱不得升格為內部 canonical 名稱，
     只能出現在 source/evidence/adapter/provenance/external 路徑。
     所以 CLAUDE.md 的處置必須是 adapter。
  3. 同文件 1.4
     「既有未加前綴的檔案與模組，先建立 lineage 與映射後再遷移；
     不得無證據批次改名造成來源斷裂」——lineage 文件必須在。

加上 naming_rules_v1.yaml 的 invariant「Original names are NEVER changed」
與擁有者「檔案不要亂刪，留存紀錄」：兩個檔名都必須存在。

**為什麼是一支腳本，不是寫在 workflow 裡**：
第一版寫成 workflow 的內嵌 heredoc，本機跑得過、CI 掛掉——
`ModuleNotFoundError: No module named 'yaml'`。原因是內嵌在 YAML 裡的
程式碼**測試碰不到**，本機有 PyYAML 而 runner 沒有，差異沒有任何東西擋。
這正是復盤裡反覆出現的形狀：驗收用的環境跟真實環境不同。
搬到 tools/ 之後它有測試、跑得到、擋得住。

依賴 PyYAML，跟 tools/release_gate.py 一樣；CI 由 job 明確安裝。
缺了就直接報錯，不做「裝不到就跳過」的降級——那是檢查者自己放寬標準。

退出碼：0 通過；1 有未通過項。
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import List

REGISTRY_PATH = Path("registry/MRL_System_MrliouAI_Naming_Registry_v1.yaml")
LINEAGE_PATH = Path("docs/governance/MRL_NAMING_LINEAGE.md")

CANON_NAME = "Mrliou_claude"
CANON_FILE = Path("Mrliou_claude.md")
ADAPTER_FILE = Path("CLAUDE.md")

# 格式取自 registry/rules/naming_rules_v1.yaml: registry_key_format: "mrl_<OriginalName>"
REGISTRY_KEY = f"mrl_{CANON_NAME}"

# 處置詞取自 NAMING.md 1.2 既有用語，不是本倉庫新造的治理詞彙
# （.mrliou/meta.json: naming_authority: false）。
ADAPTER_DISPOSITION = "adapter"

LINEAGE_ID = "L-001"


def check(root: Path) -> List[str]:
    import yaml  # 缺了就讓它拋——不降級

    failures: List[str] = []

    reg_file = root / REGISTRY_PATH
    if not reg_file.is_file():
        return [f"{REGISTRY_PATH} 不存在——沒有登錄簿就談不上 Registry Gate"]

    reg = yaml.safe_load(reg_file.read_text(encoding="utf-8")) or {}

    # 規則 1：Registry Gate
    entry = (reg.get("canonical") or {}).get("entrypoint") or {}
    if entry.get("id") != CANON_NAME:
        failures.append(
            f"{REGISTRY_PATH} 的 canonical.entrypoint 沒有登錄 {CANON_NAME}"
            "（Registry Gate：未登錄的產物不得進入命名/索引規則）"
        )
    if entry.get("registry_key") != REGISTRY_KEY:
        failures.append(
            f"registry_key 不是 {REGISTRY_KEY}"
            "（格式見 registry/rules/naming_rules_v1.yaml: mrl_<OriginalName>）"
        )

    # 規則 2：供應商品牌名只能當 adapter
    alias = (reg.get("legacy_aliases") or {}).get(ADAPTER_FILE.name) or {}
    if alias.get("canonical") != CANON_NAME:
        failures.append(
            f"legacy_aliases['{ADAPTER_FILE.name}'] 沒有指向 {CANON_NAME}"
        )
    if alias.get("disposition") != ADAPTER_DISPOSITION:
        failures.append(
            f"{ADAPTER_FILE.name} 的處置不是 {ADAPTER_DISPOSITION}"
            "——供應商品牌名不得升格為 canonical（NAMING.md 1.2）"
        )

    # 規則 3：lineage 與映射
    lineage = root / LINEAGE_PATH
    if not lineage.is_file():
        failures.append(
            f"{LINEAGE_PATH} 不存在——沒有 lineage 就是無證據改名（NAMING.md 1.4）"
        )
    elif LINEAGE_ID not in lineage.read_text(encoding="utf-8"):
        failures.append(
            f"{LINEAGE_PATH} 缺少 {LINEAGE_ID}"
            f"（{ADAPTER_FILE.name} → {CANON_FILE.name} 的映射紀錄）"
        )

    # invariant：原名永不變更、檔案不刪
    for must in (CANON_FILE, ADAPTER_FILE):
        if not (root / must).is_file():
            why = (
                "原名不得刪除或改名（naming_rules_v1.yaml invariant）"
                if must == ADAPTER_FILE
                else "正名的正本不得缺席"
            )
            failures.append(f"{must} 不存在——{why}")

    return failures


def main(argv: List[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path(__file__).resolve().parent.parent
    try:
        failures = check(root)
    except ImportError as exc:  # ModuleNotFoundError 是它的子類
        print(f"✗ 缺少依賴：{exc}")
        print("  這支檢查需要 PyYAML（同 tools/release_gate.py）。")
        print("  修：pip install PyYAML")
        return 1

    if failures:
        print("命名正名與 lineage 檢查未通過：")
        for line in failures:
            print(f"  - {line}")
        print()
        print("規則來源：registry/rules/naming_rules_v1.yaml 與 NAMING.md 1.1/1.2/1.4。")
        print("本倉庫 naming_authority: false——要改規則，先改擁有者的定義。")
        return 1

    print(
        "命名正名與 lineage 檢查通過："
        f"{CANON_FILE} 為 canonical（{REGISTRY_KEY}），"
        f"{ADAPTER_FILE} 登錄為 {ADAPTER_DISPOSITION} 且原名保留，"
        f"lineage {LINEAGE_ID} 在。"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
