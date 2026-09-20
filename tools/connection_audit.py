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

origin_signature: MrLiouWord
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

SKIP_DIRS = {".git", "node_modules", "__pycache__", "dist", ".mypy_cache"}

# wrangler 只會讀取這些檔名；帶空格或其他變形的檔案（例如 "wrangler 2.jsonc"）
# 不會被讀到，這本身就是一個值得回報的發現。
WRANGLER_CANONICAL = {"wrangler.toml", "wrangler.jsonc", "wrangler.json"}


def walk(root: Path):
    for path in root.rglob("*"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.is_file():
            yield path


def strip_jsonc(text: str) -> str:
    """移除 // 行註解，讓 jsonc 能被 json 解析。"""
    return re.sub(r"^\s*//.*$", "", text, flags=re.M)


def read_wrangler_name(path: Path) -> Optional[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    if path.suffix == ".toml":
        match = re.search(r'^\s*name\s*=\s*"([^"]+)"', text, re.M)
        return match.group(1) if match else None
    try:
        return json.loads(strip_jsonc(text)).get("name")
    except json.JSONDecodeError:
        return None


def collect_wrangler(root: Path) -> Dict[str, List[Dict[str, Any]]]:
    """回傳 worker 名稱 -> 宣告它的設定檔清單。"""
    found: Dict[str, List[Dict[str, Any]]] = {}
    for path in walk(root):
        if not path.name.startswith("wrangler"):
            continue
        if path.suffix not in {".toml", ".jsonc", ".json"}:
            continue
        name = read_wrangler_name(path)
        if not name:
            continue
        rel = path.relative_to(root).as_posix()
        found.setdefault(name, []).append(
            {"path": rel, "readable_by_wrangler": path.name in WRANGLER_CANONICAL}
        )
    return found


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

    wrangler = collect_wrangler(root)
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
                "deployable_from_repo": any(c["readable_by_wrangler"] for c in configs),
                "wrangler_configs": configs,
                "in_service_registry": name in config_workers,
                "client_references": client_refs.get(name, []),
                "naming": (
                    {"status": "legacy_alias", **alias} if alias else {"status": "unregistered"}
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
        "origin_signature": "MrLiouWord",
        "inventory_source": inventories[-1].name,
        "inventory_note": inventory.get("source", ""),
        "totals": {
            "cloud_workers": len(inventory["workers"]),
            "deployable_from_repo": sum(w["deployable_from_repo"] for w in workers),
            "in_service_registry": sum(w["in_service_registry"] for w in workers),
            "referenced_by_clients": sum(bool(w["client_references"]) for w in workers),
            "legacy_alias": sum(w["naming"]["status"] == "legacy_alias" for w in workers),
        },
        "workers": workers,
        "config_not_readable_by_wrangler": unreadable,
        "wrangler_configs_not_in_inventory": orphan_configs,
        "client_refs_not_in_inventory": orphan_refs,
    }


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
    report = audit(root)
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "registry" / "connection_audit.json"
    out.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    t = report["totals"]
    print("🔗 連接稽核")
    print(f"   來源盤點      {report['inventory_source']}")
    print(f"   雲端 Worker   {t['cloud_workers']}")
    print(f"   倉庫可部署    {t['deployable_from_repo']}")
    print(f"   服務註冊表    {t['in_service_registry']}")
    print(f"   客戶端有參照  {t['referenced_by_clients']}")
    print(f"   legacy alias  {t['legacy_alias']}")
    if report["config_not_readable_by_wrangler"]:
        print(f"   ⚠️  wrangler 讀不到的設定檔 {len(report['config_not_readable_by_wrangler'])}")
    if report["client_refs_not_in_inventory"]:
        print(f"   ⚠️  參照了盤點中沒有的 Worker {len(report['client_refs_not_in_inventory'])}")
    print(f"   📝 報告寫入 {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
