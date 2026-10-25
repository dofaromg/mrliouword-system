#!/usr/bin/env python3
"""把 canonical 的 Mrliou_claude.md 投影成 adapter 的 CLAUDE.md，並擋住漂移。

擁有者 2026-09-21 的指示：

    我們需要建構正名 Mrliou_claude.md ／ 我建構的必須有我的前綴。

命名規則要求正式名帶 MRL / Mrliou 前綴，且供應商品牌名（CLAUDE）不得升格為
canonical，只能出現在 adapter 路徑（----2/docs/NAMING.md §1.1、§1.2）。
但 naming_rules_v1.yaml 的 invariant 又寫死「Original names are NEVER changed」，
而且 Claude Code 每個 session **只自動載入 CLAUDE.md 這個檔名**——改名等於
拆掉「每次都必須有這個最根本運行認知」的機制本身。

所以做的是正名＋降階：

    Mrliou_claude.md   canonical   人改這一份
           │  --build
           ▼
    CLAUDE.md          adapter     機器產生，別手改

兩份同內容而沒有檢查，一定會分岔——這一輪已經有兩個 finding 是同一個形狀
（復盤第 1 則、第 5 則：檢查的是自己捏的素材、標準自己放寬）。所以 --check
比對的是**真實的兩份檔案**，不是 fixture。

退出碼：0 同步；1 不同步或缺檔。
"""

from __future__ import annotations

import sys
from pathlib import Path

CANON_PATH = Path("Mrliou_claude.md")
ADAPTER_PATH = Path("CLAUDE.md")

BODY_BEGIN = "<!-- MRL-CANON-BODY:BEGIN -->"
BODY_END = "<!-- MRL-CANON-BODY:END -->"

# adapter 的抬頭。標明它是投影、指回 canonical、保留 origin_signature。
ADAPTER_HEADER = f"""<!-- origin_signature: MrLiouWord -->
<!-- mrl-origin: MrLiouWord -->
<!-- MRL-ADAPTER:GENERATED —— 這份由 {CANON_PATH} 產生，不要手改。 -->
<!-- canonical: {CANON_PATH}  registry_key: mrl_Mrliou_claude -->
<!-- 要改內容改 canonical，然後跑 python3 tools/mrliou_claude_sync.py --build -->
<!-- 供應商品牌名在 MRL 命名規則下只能當 adapter（NAMING.md §1.2），
     正名與 lineage 見 docs/governance/MRL_NAMING_LINEAGE.md -->

> **這份是投影，不是正本。** 正本是 `{CANON_PATH}`（擁有者前綴、canonical）。
> 本檔存在的唯一理由是 Claude Code 只自動載入 `CLAUDE.md` 這個檔名。
> 以下內容與正本逐字相同，由 `tools/mrliou_claude_sync.py --check` 在 CI 守住。

"""


def extract_body(canon_text: str) -> str:
    """取出 canonical 裡兩個分隔標記之間的本文。

    用分隔標記而不是「從第一個 H1 開始」，理由跟 provenance_notice_check.py
    同一個：靠位置或靠標題去猜，文件一改結構就悄悄失效；分隔標記改不動就是
    改不動，會直接報錯而不是默默通過。
    """
    if BODY_BEGIN not in canon_text:
        raise ValueError(f"{CANON_PATH} 找不到 {BODY_BEGIN}")
    if BODY_END not in canon_text:
        raise ValueError(f"{CANON_PATH} 找不到 {BODY_END}")

    start = canon_text.index(BODY_BEGIN) + len(BODY_BEGIN)
    end = canon_text.index(BODY_END)
    if end < start:
        raise ValueError(f"{CANON_PATH} 的 BEGIN/END 標記順序顛倒")

    body = canon_text[start:end].strip("\n")
    if not body.strip():
        raise ValueError(f"{CANON_PATH} 的本文區塊是空的")
    return body + "\n"


def render_adapter(canon_text: str) -> str:
    return ADAPTER_HEADER + extract_body(canon_text)


def main(argv: list[str]) -> int:
    mode = argv[1] if len(argv) > 1 else "--check"
    if mode not in ("--check", "--build"):
        print(f"用法：{argv[0]} [--check|--build]", file=sys.stderr)
        return 1

    if not CANON_PATH.exists():
        print(f"✗ canonical 不存在：{CANON_PATH}")
        print("  正名的正本不見了，adapter 就沒有來源——這是斷裂，不是漂移。")
        return 1

    canon_text = CANON_PATH.read_text(encoding="utf-8")
    try:
        expected = render_adapter(canon_text)
    except ValueError as exc:
        print(f"✗ {exc}")
        return 1

    if mode == "--build":
        ADAPTER_PATH.write_text(expected, encoding="utf-8")
        print(f"✓ 已由 {CANON_PATH} 產生 {ADAPTER_PATH}（{len(expected.splitlines())} 行）")
        return 0

    if not ADAPTER_PATH.exists():
        print(f"✗ adapter 不存在：{ADAPTER_PATH}")
        print("  每個 session 自動載入的就是這一份，它不在等於七步不會被載入。")
        print(f"  修：python3 {argv[0]} --build")
        return 1

    actual = ADAPTER_PATH.read_text(encoding="utf-8")
    if actual == expected:
        print(f"✓ {ADAPTER_PATH} 與 {CANON_PATH} 同步")
        return 0

    print(f"✗ {ADAPTER_PATH} 與 {CANON_PATH} 不同步")
    # 指出第一處差異，比丟一句「不同步」有用
    a_lines, e_lines = actual.splitlines(), expected.splitlines()
    for idx in range(max(len(a_lines), len(e_lines))):
        a = a_lines[idx] if idx < len(a_lines) else "<無此行>"
        e = e_lines[idx] if idx < len(e_lines) else "<無此行>"
        if a != e:
            print(f"  第 {idx + 1} 行起分歧")
            print(f"    adapter  : {a!r}")
            print(f"    canonical: {e!r}")
            break
    print(f"  若 canonical 才是對的：python3 {argv[0]} --build")
    print(f"  若是有人直接改了 adapter：把那個修改搬進 {CANON_PATH} 再 --build")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
