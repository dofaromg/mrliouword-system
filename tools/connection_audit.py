#!/usr/bin/env python3
"""
連接稽核 — 雲端資源與倉庫之間的銜接狀態

回答一個問題：帳號裡既有的東西，有多少在這個倉庫裡真的接上了？

交叉比對四個來源，全部來自倉庫內可查證的檔案，不需網路：
  1. registry/cloudflare_inventory_*.json  雲端資源盤點（帶日期的證據檔）
  2. **/wrangler*.{toml,jsonc,json}        倉庫內的部署設定（name 欄位）
  3. cloudflare/config.json                服務註冊表
  4. 全倉庫的 *.workers.dev 參照            客戶端實際呼叫的端點
  5. registry/MRL_*_Naming_Registry_*.yaml 命名治理（canonical / legacy alias）

來源鏈（ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0 第 4 節）：
  canonical_authority: Mr.liou
  origin_signature:    MrLiouWord
  source_repo:         dofaromg/mrliouword-system
  source_artifact:     tools/connection_audit.py
  source_version:      見本檔案的 git 歷史
  derivative_role:     implementation
  artifact_owner:      Mr.liou
  contributors:        Mr.liou（定義與裁決）／Claude Code（tool：實作）
  transformation:      新建的稽核工具，不改動任何既有產物
  verification_status: verified（tests/test_connection_audit.py，13 個回歸測試）

註冊狀態：**未註冊**。本工具與其產出未取得 mrl_ 鍵、也未進入
.mrliou/particle.index.json。依 registry/rules/naming_rules_v1.yaml 的
Registry Gate，未登錄產物不得取得 mrl_ 鍵或出現在索引中——所以不用
mrl_ 前綴是正確的，不是遺漏。是否登錄為正式 registry entry 屬命名治理
決定，而 .mrliou/meta.json 明定本倉庫 naming_authority: false，
因此不由本工具自行登錄。
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

SKIP_DIRS = {".git", "node_modules", "__pycache__", "dist", "build", ".mypy_cache"}
# 本機建置產物的目錄名帶版本或套件名，無法寫死，改以字尾判斷。
# 不排除的話，setup.py 產生的 PKG-INFO 會被當成「客戶端參照」，
# 讓稽核結果隨本機有沒有建置過而變動。
SKIP_DIR_SUFFIXES = (".egg-info",)

# wrangler 只會讀取這些檔名；帶空格或其他變形的檔案（例如 "wrangler 2.jsonc"）
# 不會被讀到，這本身就是一個值得回報的發現。
WRANGLER_CANONICAL = {"wrangler.toml", "wrangler.jsonc", "wrangler.json"}

# 產物的來源鏈需要指回產生它的工具版本。
GENERATOR = "tools/connection_audit.py"


def walk(root: Path):
    for path in root.rglob("*"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if any(part.endswith(SKIP_DIR_SUFFIXES) for part in path.parts):
            continue
        if path.is_file():
            yield path


def strip_jsonc(text: str) -> str:
    r"""把 wrangler 接受的 JSONC 轉成標準 JSON。

    原本只用 `^\s*//.*$` 移除整行註解，於是行末註解、區塊註解、尾隨逗號
    三種 wrangler 完全接受的寫法都會讓 json.loads 失敗，設定因此被靜默
    略過——而 deployable_from_repo 正是本報告的主結論。

    逐字元掃描而非正規表示式：必須分辨字串內的 // 與真正的註解。
    """
    out = []
    i, n = 0, len(text)
    in_string = False
    while i < n:
        ch = text[i]
        if in_string:
            out.append(ch)
            if ch == "\\" and i + 1 < n:  # 轉義字元整組保留
                out.append(text[i + 1])
                i += 2
                continue
            if ch == '"':
                in_string = False
            i += 1
            continue
        if ch == '"':
            in_string = True
            out.append(ch)
            i += 1
            continue
        if ch == "/" and i + 1 < n:
            if text[i + 1] == "/":
                while i < n and text[i] != "\n":
                    i += 1
                continue
            if text[i + 1] == "*":
                end = text.find("*/", i + 2)
                i = n if end == -1 else end + 2
                continue
        if ch in "}]":
            # 尾隨逗號：回頭把 } 或 ] 之前的逗號丟掉。必須在這個迴圈裡做，
            # 因為掃完之後字串字面值還在，事後用正規表示式會誤傷
            # 像 "a,}" 這種字串內容（已有回歸測試覆蓋）。
            j = len(out) - 1
            while j >= 0 and out[j].isspace():
                j -= 1
            if j >= 0 and out[j] == ",":
                del out[j]
        out.append(ch)
        i += 1
    return "".join(out)


class WranglerParseError(Exception):
    """設定檔存在但無法解析。不可靜默吞掉——會讓主結論少算。"""


def read_wrangler_name(path: Path) -> Optional[str]:
    """回傳宣告的 worker 名稱；解析失敗時丟 WranglerParseError。"""
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        raise WranglerParseError(str(exc)) from exc
    if path.suffix == ".toml":
        match = re.search(r'^\s*name\s*=\s*"([^"]+)"', text, re.M)
        return match.group(1) if match else None
    try:
        parsed = json.loads(strip_jsonc(text))
    except json.JSONDecodeError as exc:
        raise WranglerParseError(f"{exc.msg} (line {exc.lineno})") from exc
    return parsed.get("name") if isinstance(parsed, dict) else None


# 佔位字串：設定檔存在、wrangler 也讀得到，但填的不是真值。
# 這種設定「可解析」卻「不可部署」——把它算進可部署數，等於用一個
# 我自己刻意留下的待辦去美化本報告的主結論。
# 這個缺陷是 Codex 在 PR #77 上指出來的，屬實：cloudflare/particle-memory
# 的兩個 D1 識別碼都是 FILL_ME_BEFORE_DEPLOY，卻被算進「倉庫可部署 4」。
PLACEHOLDER_PATTERN = re.compile(
    r"FILL[_ ]?ME|CHANGE[_ ]?ME|REPLACE[_ ]?ME|TODO|TBD|XXXX+|"
    r"<[^>]*>|your[-_]|example\.com|PLACEHOLDER",
    re.IGNORECASE,
)

# 這些欄位一旦是佔位字串，wrangler deploy 一定失敗。
REQUIRED_BINDING_KEYS = (
    "database_id",
    "database_name",
    "id",
    "bucket_name",
    "account_id",
)


_PLACEHOLDER_KEY_RE = re.compile(
    r"[\"']?(" + "|".join(REQUIRED_BINDING_KEYS) + r")[\"']?\s*[:=]\s*[\"']([^\"']*)[\"']"
)


def find_placeholders(path: Path) -> List[Dict[str, str]]:
    """回傳設定檔中帶佔位字串的必要欄位。

    同時支援 TOML 的 ``key = "value"`` 與 JSON/JSONC 的 ``"key": "value"``，
    包含寫在同一行的內嵌物件（``[{ "binding": "DB", "database_id": "…" }]``）。
    第一版用逐行 partition，抓不到行內物件——測試抓到了，所以改成掃描。

    整行註解會先丟掉：註解裡提到 FILL_ME 是說明，不是設定。
    行末註解不需要特別處理，因為樣式要求值必須緊接在鍵後面且帶引號。
    """
    out: List[Dict[str, str]] = []
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return out
    body = "\n".join(
        line
        for line in text.splitlines()
        if not line.lstrip().startswith(("#", "//"))
    )
    for match in _PLACEHOLDER_KEY_RE.finditer(body):
        key, value = match.group(1), match.group(2)
        if value and PLACEHOLDER_PATTERN.search(value):
            out.append({"key": key, "value": value})
    return out


def collect_wrangler(
    root: Path,
) -> Tuple[Dict[str, List[Dict[str, Any]]], List[Dict[str, str]]]:
    """回傳 (worker 名稱 -> 宣告它的設定檔清單, 無法解析的設定檔清單)。"""
    found: Dict[str, List[Dict[str, Any]]] = {}
    failed: List[Dict[str, str]] = []
    for path in walk(root):
        if not path.name.startswith("wrangler"):
            continue
        if path.suffix not in {".toml", ".jsonc", ".json"}:
            continue
        rel = path.relative_to(root).as_posix()
        try:
            name = read_wrangler_name(path)
        except WranglerParseError as exc:
            # 解析不了就明說。靜默略過會讓 deployable_from_repo 少算。
            failed.append({"path": rel, "reason": str(exc)})
            continue
        if not name:
            failed.append({"path": rel, "reason": "沒有 name 欄位"})
            continue
        found.setdefault(name, []).append(
            {
                "path": rel,
                "readable_by_wrangler": path.name in WRANGLER_CANONICAL,
                "placeholders": find_placeholders(path),
            }
        )
    return found, failed


def collect_config_json(root: Path) -> List[str]:
    path = root / "cloudflare" / "config.json"
    if not path.exists():
        return []
    try:
        return sorted(json.loads(path.read_text(encoding="utf-8")).get("workers", {}))
    except (OSError, json.JSONDecodeError):
        return []


def collect_client_refs(root: Path) -> Dict[str, List[str]]:
    """worker 名稱 -> 參照它的檔案清單（依 *.workers.dev URL）。"""
    pattern = re.compile(r"https://([a-z0-9][a-z0-9-]*)\.[a-z0-9-]+\.workers\.dev")
    refs: Dict[str, List[str]] = {}
    for path in walk(root):
        if path.suffix in {".png", ".jpg", ".zip", ".gz", ".pdf", ".heic"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        rel = path.relative_to(root).as_posix()
        for name in set(pattern.findall(text)):
            entry = refs.setdefault(name, [])
            if rel not in entry:
                entry.append(rel)
    return refs


def collect_registry(root: Path) -> Dict[str, Dict[str, str]]:
    """legacy alias -> {canonical, disposition}。以行為單位解析，不引入 yaml 相依。"""
    aliases: Dict[str, Dict[str, str]] = {}
    for path in sorted((root / "registry").glob("*Naming_Registry*.yaml")):
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except OSError:
            continue
        inside, current = False, None
        for line in lines:
            if line.startswith("legacy_aliases:"):
                inside = True
                continue
            if inside and line and not line.startswith((" ", "\t")):
                break
            if not inside:
                continue
            key = re.match(r"^  ([A-Za-z0-9._-]+):\s*$", line)
            if key:
                current = key.group(1)
                aliases[current] = {"canonical": "", "disposition": ""}
                continue
            field = re.match(r"^    (canonical|disposition):\s*(\S+)", line)
            if field and current:
                aliases[current][field.group(1)] = field.group(2)
    return aliases


def audit(root: Path) -> Dict[str, Any]:
    inventories = sorted((root / "registry").glob("cloudflare_inventory_*.json"))
    if not inventories:
        raise SystemExit("找不到 registry/cloudflare_inventory_*.json，無法稽核")
    inventory = json.loads(inventories[-1].read_text(encoding="utf-8"))

    wrangler, unparsable = collect_wrangler(root)
    config_workers = collect_config_json(root)
    client_refs = collect_client_refs(root)
    aliases = collect_registry(root)

    workers: List[Dict[str, Any]] = []
    for name in inventory["workers"]:
        configs = wrangler.get(name, [])
        alias = aliases.get(name)
        workers.append(
            {
                "name": name,
                # 讀得到 ≠ 部署得了。兩個條件都要成立。
                "deployable_from_repo": any(
                    c["readable_by_wrangler"] and not c["placeholders"]
                    for c in configs
                ),
                "config_incomplete": [
                    {"path": c["path"], "placeholders": c["placeholders"]}
                    for c in configs
                    if c["readable_by_wrangler"] and c["placeholders"]
                ],
                "wrangler_configs": configs,
                "in_service_registry": name in config_workers,
                "client_references": client_refs.get(name, []),
                "naming": (
                    {"status": "legacy_alias", **alias}
                    if alias
                    else {"status": "unregistered"}
                ),
            }
        )

    known = set(inventory["workers"])
    orphan_configs = {n: c for n, c in wrangler.items() if n not in known}
    orphan_refs = {n: f for n, f in client_refs.items() if n not in known}
    unreadable = {
        n: [c for c in c_list if not c["readable_by_wrangler"]]
        for n, c_list in wrangler.items()
        if any(not c["readable_by_wrangler"] for c in c_list)
    }

    return {
        # 完整來源鏈。政策明定只有 origin_signature 會被判為
        # provenance incomplete，因此十個欄位一併輸出。
        "canonical_authority": "Mr.liou",
        "origin_signature": "MrLiouWord",
        "source_repo": "dofaromg/mrliouword-system",
        "source_artifact": "registry/connection_audit.json",
        "source_version": f"generated-by:{GENERATOR}",
        "derivative_role": "generated",
        "artifact_owner": "Mr.liou",
        "contributors": [
            "Mr.liou（canonical_authority：定義與裁決）",
            "Claude Code（tool：實作）",
        ],
        "transformation": "由 tools/connection_audit.py 從倉庫內可查證來源生成，未改動任何既有產物",
        "verification_status": "partial",
        "verification_note": (
            "僅驗證倉庫內宣告的一致性；不驗證雲端資源是否真的存在、可達或綁定一致"
        ),
        "registry_status": "unregistered",
        "inventory_source": inventories[-1].name,
        "inventory_note": inventory.get("source", ""),
        "totals": {
            "cloud_workers": len(inventory["workers"]),
            "deployable_from_repo": sum(w["deployable_from_repo"] for w in workers),
            "config_incomplete": sum(1 for w in workers if w["config_incomplete"]),
            "in_service_registry": sum(w["in_service_registry"] for w in workers),
            "referenced_by_clients": sum(bool(w["client_references"]) for w in workers),
            "legacy_alias": sum(
                w["naming"]["status"] == "legacy_alias" for w in workers
            ),
        },
        "workers": workers,
        "config_not_readable_by_wrangler": unreadable,
        "config_parse_failed": unparsable,
        "wrangler_configs_not_in_inventory": orphan_configs,
        "client_refs_not_in_inventory": orphan_refs,
    }


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
    report = audit(root)
    out = (
        Path(sys.argv[2])
        if len(sys.argv) > 2
        else root / "registry" / "connection_audit.json"
    )
    out.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    t = report["totals"]
    print("🔗 連接稽核")
    print(f"   來源盤點      {report['inventory_source']}")
    print(f"   雲端 Worker   {t['cloud_workers']}")
    print(f"   倉庫可部署    {t['deployable_from_repo']}")
    if t.get("config_incomplete"):
        print(
            f"   設定不完整    {t['config_incomplete']}"
            "（wrangler 讀得到，但必要欄位仍是佔位字串，部署會失敗）"
        )
    print(f"   服務註冊表    {t['in_service_registry']}")
    print(f"   客戶端有參照  {t['referenced_by_clients']}")
    print(f"   legacy alias  {t['legacy_alias']}")
    if report["config_parse_failed"]:
        print(f"   ⚠️  無法解析的 wrangler 設定檔 {len(report['config_parse_failed'])}")
        for item in report["config_parse_failed"]:
            print(f"        {item['path']} — {item['reason']}")
    if report["config_not_readable_by_wrangler"]:
        print(
            f"   ⚠️  wrangler 讀不到的設定檔 {len(report['config_not_readable_by_wrangler'])}"
        )
    if report["client_refs_not_in_inventory"]:
        print(
            f"   ⚠️  參照了盤點中沒有的 Worker {len(report['client_refs_not_in_inventory'])}"
        )
    print(f"   📝 報告寫入 {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
