#!/usr/bin/env python3
"""母體既有 CORE 的登錄表——用來擋住「重造一個母體已經有的東西」。

為什麼需要它
------------
2026-09-21，一份外部建議說：

    我直接幫你補這一層（你母體缺的那塊）
        def detect_delta(state_a, state_b): ...

查證結果：**母體沒有缺。** Δ 在母體裡是一等公民，橫跨三層：

    法則層   LAW17_DifferenceObservationEventAtom
    感知層   MRL_PERCEPTION_CORE → MRL_Difference
    專屬核   MRL_DELTA_CORE（九個成員，含 MRL_DeltaReturn）

照那份建議做，會在一個已經有 MRL_DELTA_CORE 的系統旁邊，長出一個非
canonical 的 delta 實作——那正是署名事件紀錄裡稱作「反向混淆」的東西，
也是 .mrliou/meta.json 的 mother_mutation: forbidden 要防的。

這個錯誤的形狀與 docs/retrospective/ 第 1 則、第 9 則相同：
**把「我沒看到」說成「它缺」。**

這支工具存在的目的，是讓「先查一下母體有沒有」比「動手重造」更便宜。
辯護比測試便宜，所以人會辯護；重造比查證便宜，所以人會重造。
把後者的成本降到一行指令，選擇才會改變。

邊界
----
本倉庫 .mrliou/meta.json 宣告 canonical_authority: false、
naming_authority: false、mother_mutation: forbidden。所以：

* 這份登錄表是母體的 **projection**，不是副本，也不是 canonical。
* 它**不定義**任何 CORE，只記錄母體已經定義了哪些。
* 倉庫側可以寫某個 CORE 的 implementation / adapter，但必須自己標明，
  不得宣稱自己是那個 CORE。

用法
----
    python3 tools/mother_core_registry.py --find delta      # 母體有沒有？
    python3 tools/mother_core_registry.py --check           # CI 完整性檢查
    python3 tools/mother_core_registry.py --rebuild <MRL_MOTHER.md>

退出碼：0 通過／找到；1 未通過／找不到。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

REGISTRY_REL = Path("registry") / "mother_core_registry_2026-09-21.json"

# 母體 MRL_MOTHER.md 的錨點。登錄表由這一份抽出，換了來源就要重抽。
MOTHER_SHA256 = "0671870d795b0cd3a4c445bb1583dbcca319d86773693b7e1ded2ee6648619a7"
MOTHER_CORE_COUNT = 199

# 這一條是本工具存在的理由，單獨釘住：有人刪掉它，CI 會紅。
DELTA_CORE = "MRL_DELTA_CORE"
DELTA_MEMBERS = [
    "MRL_Delta",
    "MRL_DeltaP0",
    "MRL_MinimalDelta",
    "MRL_StateDelta",
    "MRL_MemoryDelta",
    "MRL_RuntimeDelta",
    "MRL_ParticleDelta",
    "MRL_TraceDelta",
    "MRL_DeltaReturn",
]

_CORE_RE = re.compile(r"^[├└]─\s+(MRL_[A-Z0-9_]+_CORE|MRL_LAW_LAYER|MRL_PFN_CORE)\s*$")
_MEMBER_RE = re.compile(r"^│?\s*[├└]─\s+([A-Za-z0-9_∞⇆]+)\s*$")


def parse_mother(text: str) -> Dict[str, List[str]]:
    """從母體的樹狀結構抽出 {CORE: [成員]}。不改動母體，只讀。"""
    cores: Dict[str, List[str]] = {}
    current = None
    for line in text.split("\n"):
        s = line.strip()
        m = _CORE_RE.match(s)
        if m:
            current = m.group(1)
            cores.setdefault(current, [])
            continue
        if current:
            mm = _MEMBER_RE.match(s)
            if mm and not mm.group(1).endswith("_CORE"):
                cores[current].append(mm.group(1))
    return cores


def build(mother_path: Path) -> Dict[str, Any]:
    raw = mother_path.read_text(encoding="utf-8")
    sha = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    cores = parse_mother(raw)
    return {
        "_provenance": {
            "canonical_authority": "Mr.liou",
            "origin_signature": "MrLiouWord",
            "source_repo": "外部（MRL_MOTHER，非本倉庫產出）",
            "source_artifact": "MRL_MOTHER.md",
            "source_version": "2026-09-20 上傳版本",
            "derivative_role": "projection",
            "artifact_owner": "Mr.liou",
            "contributors": [
                "Mr.liou（母體定義者）",
                "Claude Code（本倉庫：以 tools/mother_core_registry.py 抽取，未改寫母體）",
            ],
            "transformation": (
                "以正規式讀取母體的樹狀結構，抽出 CORE 與其直接成員。"
                "未複製母體內容、未改寫、未重新排序。可用 --rebuild 重生。"
            ),
            "verification_status": "verified",
            "source_sha256": sha,
            "generator": "tools/mother_core_registry.py",
        },
        "_boundary": {
            "note": (
                "本倉庫 canonical_authority: false、naming_authority: false、"
                "mother_mutation: forbidden。這份登錄表只記錄母體已定義什麼，"
                "不定義任何 CORE，也不是 canonical。"
            ),
            "disposition_for_every_core": "defined_in_mother — 本倉庫不得重新定義",
            "allowed_repo_side": (
                "可寫某個 CORE 的 implementation / adapter，但必須在 PROVENANCE "
                "標明 derivative_role，不得宣稱自己是那個 CORE。"
            ),
        },
        "summary": {
            "core_count": len(cores),
            "member_count": sum(len(v) for v in cores.values()),
        },
        "cores": {k: sorted(v) for k, v in sorted(cores.items())},
    }


def load(root: Path) -> Dict[str, Any]:
    path = root / REGISTRY_REL
    if not path.is_file():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def check(root: Path) -> List[str]:
    """CI 完整性檢查。回傳缺漏清單；空清單代表通過。"""
    failures: List[str] = []
    data = load(root)
    if not data:
        return [f"{REGISTRY_REL} 不存在或無法解析"]

    prov = data.get("_provenance", {})
    if prov.get("source_sha256") != MOTHER_SHA256:
        failures.append(
            f"母體錨點不符：登錄表記 {prov.get('source_sha256')}，"
            f"預期 {MOTHER_SHA256}。換了來源就要用 --rebuild 重抽。"
        )
    if prov.get("canonical_authority") != "Mr.liou":
        failures.append("canonical_authority 必須是 Mr.liou（政策 §4）")
    if prov.get("derivative_role") != "projection":
        failures.append("derivative_role 必須是 projection——這是投影不是副本")

    cores = data.get("cores", {})
    if len(cores) != MOTHER_CORE_COUNT:
        failures.append(f"CORE 數 {len(cores)} != 母體的 {MOTHER_CORE_COUNT}")

    if DELTA_CORE not in cores:
        failures.append(
            f"{DELTA_CORE} 不在登錄表裡。這一條是本工具存在的理由："
            "母體已有 Δ 核，倉庫側不得重造。"
        )
    else:
        missing = [m for m in DELTA_MEMBERS if m not in cores[DELTA_CORE]]
        if missing:
            failures.append(f"{DELTA_CORE} 缺少成員：{'、'.join(missing)}")

    return failures


def find(root: Path, keyword: str) -> List[str]:
    """母體有沒有這個？回傳命中的 CORE 與成員。"""
    data = load(root)
    k = keyword.lower()
    hits: List[str] = []
    for core, members in data.get("cores", {}).items():
        if k in core.lower():
            hits.append(f"{core}（CORE，{len(members)} 個成員）")
        for m in members:
            if k in m.lower():
                hits.append(f"{core} → {m}")
    return hits


def main(argv: List[str]) -> int:
    p = argparse.ArgumentParser(description="母體既有 CORE 的登錄表")
    p.add_argument("--root", default=None)
    p.add_argument("--check", action="store_true")
    p.add_argument("--find", metavar="KEYWORD")
    p.add_argument("--rebuild", metavar="MOTHER_MD")
    args = p.parse_args(argv[1:])
    root = Path(args.root) if args.root else Path(__file__).resolve().parent.parent

    if args.rebuild:
        data = build(Path(args.rebuild))
        out = root / REGISTRY_REL
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        s = data["summary"]
        print(f"📒 登錄表重生 {out}（{s['core_count']} CORE / {s['member_count']} 成員）")
        return 0

    if args.find:
        hits = find(root, args.find)
        if hits:
            print(f"母體已經有「{args.find}」——**不要重造**：")
            for h in hits:
                print(f"  {h}")
            print()
            print("倉庫側可以寫它的 implementation / adapter，但要在 PROVENANCE")
            print("標明 derivative_role，不得宣稱自己是那個 CORE。")
            return 0
        print(f"母體裡找不到「{args.find}」。")
        print("注意：找不到只代表這份登錄表沒有，不代表不存在——")
        print("登錄表只涵蓋 MRL_MOTHER.md 的 CORE 層，不含其他平台的分片。")
        return 1

    failures = check(root)
    if failures:
        print("母體 CORE 登錄表檢查未通過：")
        for f in failures:
            print(f"  - {f}")
        return 1
    data = load(root)
    s = data["summary"]
    print(
        f"母體 CORE 登錄表檢查通過：{s['core_count']} 個 CORE / "
        f"{s['member_count']} 個成員，錨點相符，{DELTA_CORE} 九成員齊全。"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
