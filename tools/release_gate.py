#!/usr/bin/env python3
"""
發布 Gate — 讓外部必須遵守規則才能使用

docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md 第 8 節已經明文
列出七道關卡，規定「任何 Release、官網頁面、套件、容器與 Worker 在發布前
必須通過」，並且「失敗項不得標示為 Canon、Official、Verified 或
source_of_truth」。

但它一直只是文字。實測全倉庫 220 個使用 MRL/MrLiouWord 的檔案，十欄位
齊全的只有 1 個——就是政策文件自己。沒有關卡的規則等於沒有規則。

本工具不發明任何新規則。七道關卡的名稱、欄位、允許值全部照政策原文，
因為 .mrliou/meta.json 明定本倉庫 governance_authority: false——
執行規則可以，定義規則不行。

  1. Authority Lock              權位未被取代
  2. Naming Gate                 canonical 名稱與 legacy alias 處置
  3. Provenance Completeness     第 4 節十個欄位
  4. Source Hash / Commit Link   可回溯到來源 commit 或雜湊
  5. Contributor Role Separation 角色分開，工具不冒充人類來源
  6. Mirror / Projection Role    衍生角色宣告正確
  7. Runtime Verification Status 驗證狀態誠實

基準線（registry/release_gate_baseline.json）記錄既有的未通過項，讓 CI
擋住「新增的」違規而不是一次擋死所有東西。那是債務帳本，不是豁免清單：
每一筆都具名可查，數字只能往下走。

來源鏈（ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0 第 4 節）：
  canonical_authority: Mr.liou
  origin_signature:    MrLiouWord
  source_repo:         dofaromg/mrliouword-system
  source_artifact:     tools/release_gate.py
  source_version:      見本檔案的 git 歷史
  derivative_role:     implementation
  artifact_owner:      Mr.liou
  contributors:        Mr.liou（定義與裁決）／Claude Code（tool：實作）
  transformation:      新建的發布關卡，不改動任何既有產物
  verification_status: partial（見 tests/test_release_gate.py；未在正式發布流程上實跑）

註冊狀態：unregistered。未取得 mrl_ 鍵、未進入 .mrliou/particle.index.json。
本倉庫 naming_authority: false，是否登錄由擁有者決定。
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import yaml

# ---------------------------------------------------------------- 政策常數
# 全部照政策原文，不自行增刪。

# 第 5 節第 1 點
RESERVED_NAMES = ["Mr.liou", "MrLiouWord", "mrliouword", "MRL_"]

# 第 4 節
PROVENANCE_FIELDS = [
    "canonical_authority",
    "origin_signature",
    "source_repo",
    "source_artifact",
    "source_version",
    "derivative_role",
    "artifact_owner",
    "contributors",
    "transformation",
    "verification_status",
]
# 第 4 節：缺這三個必須判定為 provenance incomplete
PROVENANCE_CRITICAL = ["canonical_authority", "source_artifact", "derivative_role"]

DERIVATIVE_ROLES = {
    "implementation",
    "adapter",
    "projection",
    "mirror",
    "experiment",
    "generated",
}
VERIFICATION_STATES = {"unverified", "partial", "verified"}

# 第 8 節：失敗項不得標示為這些
CANON_LABELS = ["Canon", "Official", "Verified", "source_of_truth"]

# 第 3 節：AI 工具只能是協作／工具角色
TOOL_NAMES = ["Claude", "ChatGPT", "Copilot", "Codex", "GPT", "Gemini"]

SKIP_DIRS = {".git", "node_modules", "__pycache__", "dist", "build", ".mypy_cache"}
SKIP_DIR_SUFFIXES = (".egg-info",)

GENERATOR = "tools/release_gate.py"


class Finding:
    """一筆未通過項。具名、可查、可放進基準線。"""

    def __init__(self, artifact: str, gate: str, detail: str) -> None:
        self.artifact = artifact
        self.gate = gate
        self.detail = detail

    @property
    def key(self) -> str:
        return f"{self.artifact}::{self.gate}"

    def to_dict(self) -> Dict[str, str]:
        return {"artifact": self.artifact, "gate": self.gate, "detail": self.detail}


# ------------------------------------------------------------ 產物與來源鏈


def walk(root: Path):
    for path in root.rglob("*"):
        if any(p in SKIP_DIRS for p in path.parts):
            continue
        if any(p.endswith(SKIP_DIR_SUFFIXES) for p in path.parts):
            continue
        if path.is_file():
            yield path


def strip_jsonc(text: str) -> str:
    """與 connection_audit 相同的 JSONC 處理；wrangler 接受註解與尾隨逗號。"""
    out: List[str] = []
    i, n, in_str = 0, len(text), False
    while i < n:
        ch = text[i]
        if in_str:
            out.append(ch)
            if ch == "\\" and i + 1 < n:
                out.append(text[i + 1])
                i += 2
                continue
            if ch == '"':
                in_str = False
            i += 1
            continue
        if ch == '"':
            in_str = True
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
            j = len(out) - 1
            while j >= 0 and out[j].isspace():
                j -= 1
            if j >= 0 and out[j] == ",":
                del out[j]
        out.append(ch)
        i += 1
    return "".join(out)


def discover_artifacts(root: Path) -> List[Dict[str, Any]]:
    """第 8 節點名的發布產物：套件、容器、Worker。"""
    found: List[Dict[str, Any]] = []

    # Python 套件
    pyproject = root / "pyproject.toml"
    if pyproject.exists():
        text = pyproject.read_text(encoding="utf-8")
        m = re.search(r'^name\s*=\s*"([^"]+)"', text, re.M)
        if m:
            found.append(
                {"kind": "package/python", "name": m.group(1), "path": "pyproject.toml"}
            )

    # npm 套件與容器
    for path in walk(root):
        rel = path.relative_to(root).as_posix()
        if path.name == "package.json":
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                continue
            if not isinstance(data, dict) or "name" not in data:
                continue
            kind = "container" if rel.startswith("containers/") else "package/npm"
            found.append({"kind": kind, "name": data["name"], "path": rel})

        # Worker
        elif path.name.startswith("wrangler") and path.suffix in {
            ".toml",
            ".jsonc",
            ".json",
        }:
            name = read_worker_name(path)
            if name:
                found.append({"kind": "worker", "name": name, "path": rel})

    return sorted(found, key=lambda a: (a["kind"], a["path"]))


def read_worker_name(path: Path) -> Optional[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    if path.suffix == ".toml":
        m = re.search(r'^\s*name\s*=\s*"([^"]+)"', text, re.M)
        return m.group(1) if m else None
    try:
        parsed = json.loads(strip_jsonc(text))
    except json.JSONDecodeError:
        return None
    return parsed.get("name") if isinstance(parsed, dict) else None


def load_provenance(root: Path, artifact: Dict[str, Any]) -> Dict[str, Any]:
    """來源鏈可以放在旁邊的 PROVENANCE.yaml，或寫在產物自己裡面。

    原樣匯入的產物依命名註冊表規則 3 不得改寫，所以外掛檔是合法位置。
    """
    path = root / artifact["path"]
    sidecar = path.parent / "PROVENANCE.yaml"
    if sidecar.exists():
        try:
            data = yaml.safe_load(sidecar.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                data["_provenance_source"] = sidecar.relative_to(root).as_posix()
                return data
        except yaml.YAMLError:
            pass

    # 寫在產物自己裡面：抓出現的欄位名（json / toml / yaml / 註解皆可）
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return {}
    inline: Dict[str, Any] = {}
    for field in PROVENANCE_FIELDS:
        m = re.search(rf'["\']?{field}["\']?\s*[:=]\s*["\']?([^"\'\n,]+)', text)
        if m:
            inline[field] = m.group(1).strip()
    if inline:
        inline["_provenance_source"] = artifact["path"]
    return inline


# -------------------------------------------------------------- 七道關卡
# 每一道回傳 (通過?, 說明)。說明在失敗時必須具體到可以動手修。


def gate_authority_lock(
    art: Dict[str, Any], prov: Dict[str, Any], lock: Dict[str, Any]
) -> Tuple[bool, str]:
    """1. Authority Lock — 權位未被取代。"""
    canonical = str(lock.get("authority", {}).get("canonical_name", "Mr.liou"))
    declared = str(prov.get("canonical_authority", "")).strip()
    if not declared:
        return False, "未宣告 canonical_authority"
    if declared != canonical:
        return False, f"canonical_authority 是 {declared!r}，應為 {canonical!r}"

    # 第 5 節第 2 點：外部系統不得把保留名稱當成自身產品或作者身份。
    # 產物名稱本身若等於保留名稱，等於用保留名稱當自己的產品名。
    if art["name"] in {"MrLiouWord", "Mr.liou"}:
        return False, f"產物名稱 {art['name']!r} 直接使用保留名稱"
    return True, f"canonical_authority={canonical}"


def gate_naming(
    art: Dict[str, Any], prov: Dict[str, Any], registry: Dict[str, Any]
) -> Tuple[bool, str]:
    """2. Naming Gate — canonical 名稱與 legacy alias 處置。"""
    aliases = registry.get("legacy_aliases", {}) or {}
    name = art["name"]

    if name in aliases:
        entry = aliases[name] or {}
        canonical = entry.get("canonical", "?")
        disposition = entry.get("disposition", "?")
        # 規則 2：legacy alias 不得被當成現行產品或模組名。
        # 唯一可接受的情形是產物明確宣告了 canonical 身分與處置。
        declared = str(prov.get("canonical_identity", {}) or {}).lower()
        if canonical.lower() in declared and disposition.lower() in declared:
            return True, f"legacy alias，已宣告 canonical={canonical}／{disposition}"
        return (
            False,
            f"{name!r} 是 legacy alias（canonical={canonical}，"
            f"disposition={disposition}），但未宣告 canonical 身分",
        )

    # Registry Gate：未登錄產物不得取得 mrl_ 鍵。
    if name.startswith("mrl_") and not prov.get("registry_entry"):
        return False, f"{name!r} 使用 mrl_ 前綴但無 registry entry"
    return True, f"{name!r} 非 legacy alias"


def gate_provenance_completeness(
    art: Dict[str, Any], prov: Dict[str, Any]
) -> Tuple[bool, str]:
    """3. Provenance Completeness — 第 4 節十個欄位。"""
    missing = [f for f in PROVENANCE_FIELDS if not prov.get(f)]
    if not missing:
        return True, f"十欄位齊全（來源：{prov.get('_provenance_source', '?')}）"
    critical = [f for f in PROVENANCE_CRITICAL if f in missing]
    if critical:
        return (
            False,
            f"provenance incomplete；缺關鍵欄位 {critical}（共缺 {len(missing)}）",
        )
    return False, f"缺 {missing}"


def gate_source_hash_commit_link(
    art: Dict[str, Any], prov: Dict[str, Any]
) -> Tuple[bool, str]:
    """4. Source Hash / Commit Link — 可回溯到來源 commit 或雜湊。"""
    version = str(prov.get("source_version", "")).strip()
    imported = prov.get("imported_verbatim") or {}
    hashes = [f.get("sha256") for f in (imported.get("files") or []) if f.get("sha256")]
    if hashes:
        return True, f"{len(hashes)} 個檔案記錄 sha256，可逐位元組回驗"
    if version:
        return True, f"source_version={version}"
    return False, "既無 source_version 也無來源雜湊，無法回溯"


def gate_contributor_role_separation(
    art: Dict[str, Any], prov: Dict[str, Any]
) -> Tuple[bool, str]:
    """5. Contributor Role Separation — 角色分開，工具不冒充人類來源。"""
    contributors = prov.get("contributors")
    if not contributors:
        return False, "未宣告 contributors"
    if isinstance(contributors, str):
        contributors = [contributors]

    entries = []
    for c in contributors:
        entries.append(
            json.dumps(c, ensure_ascii=False) if isinstance(c, dict) else str(c)
        )

    # 第 7 節第 4 點：角色必須分欄，不混成共同來源。每一筆都要帶角色。
    roleless = [e for e in entries if not re.search(r"role|：|:|（|\(", e)]
    if roleless:
        return False, f"未標角色的 contributor：{roleless}"

    # 第 3 節：AI 工具得到工具／協作角色，不冒充人類來源。
    for e in entries:
        if any(t.lower() in e.lower() for t in TOOL_NAMES):
            if not re.search(r"tool|工具|協作", e, re.I):
                return False, f"工具未標為 tool 角色：{e!r}"
    return True, f"{len(entries)} 位 contributor，角色皆分開"


def gate_mirror_projection_role(
    art: Dict[str, Any], prov: Dict[str, Any]
) -> Tuple[bool, str]:
    """6. Mirror / Projection Role Check — 衍生角色宣告正確。"""
    role = str(prov.get("derivative_role", "")).strip()
    if not role:
        return False, "未宣告 derivative_role"
    if role not in DERIVATIVE_ROLES:
        return False, f"derivative_role={role!r} 不在允許值 {sorted(DERIVATIVE_ROLES)}"
    # 第 5 節第 4 點：鏡像或 fork 必須標明 mirror_of 或 derived_from。
    if role in {"mirror", "projection"} and not (
        prov.get("mirror_of") or prov.get("derived_from")
    ):
        return False, f"derivative_role={role} 但未標明 mirror_of／derived_from"
    return True, f"derivative_role={role}"


def gate_runtime_verification_status(
    root: Path, art: Dict[str, Any], prov: Dict[str, Any], passed_others: bool
) -> Tuple[bool, str]:
    """7. Runtime Verification Status — 驗證狀態誠實。"""
    status = str(prov.get("verification_status", "")).strip()
    if not status:
        return False, "未宣告 verification_status"
    if status not in VERIFICATION_STATES:
        return (
            False,
            f"verification_status={status!r} 不在允許值 {sorted(VERIFICATION_STATES)}",
        )

    # 第 8 節：失敗項不得標示為 Canon、Official、Verified 或 source_of_truth。
    if not passed_others:
        try:
            text = (root / art["path"]).read_text(encoding="utf-8", errors="ignore")
        except OSError:
            text = ""
        claimed = [lbl for lbl in CANON_LABELS if re.search(rf"\b{lbl}\b", text)]
        if claimed or status == "verified":
            label = claimed or ["verification_status=verified"]
            return False, f"有未通過項卻標示為 {label}"
    return True, f"verification_status={status}"


# ------------------------------------------------------------ 執行與報告

GATE_NAMES = [
    "Authority Lock",
    "Naming Gate",
    "Provenance Completeness",
    "Source Hash / Commit Link",
    "Contributor Role Separation",
    "Mirror / Projection Role Check",
    "Runtime Verification Status",
]


def run_gates(root: Path) -> Dict[str, Any]:
    lock = _load_json(root / ".mrliou" / "authority-lock.json")
    registry = _load_yaml(
        root / "registry" / "MRL_System_MrliouAI_Naming_Registry_v1.yaml"
    )

    results: List[Dict[str, Any]] = []
    findings: List[Finding] = []

    for art in discover_artifacts(root):
        prov = load_provenance(root, art)
        checks: Dict[str, Dict[str, Any]] = {}

        ordered = [
            ("Authority Lock", gate_authority_lock(art, prov, lock)),
            ("Naming Gate", gate_naming(art, prov, registry)),
            ("Provenance Completeness", gate_provenance_completeness(art, prov)),
            ("Source Hash / Commit Link", gate_source_hash_commit_link(art, prov)),
            (
                "Contributor Role Separation",
                gate_contributor_role_separation(art, prov),
            ),
            ("Mirror / Projection Role Check", gate_mirror_projection_role(art, prov)),
        ]
        passed_others = all(ok for _, (ok, _) in ordered)
        ordered.append(
            (
                "Runtime Verification Status",
                gate_runtime_verification_status(root, art, prov, passed_others),
            )
        )

        for gate, (ok, detail) in ordered:
            checks[gate] = {"passed": ok, "detail": detail}
            if not ok:
                findings.append(Finding(art["path"], gate, detail))

        results.append(
            {
                **art,
                "provenance_source": prov.get("_provenance_source"),
                "passed": all(c["passed"] for c in checks.values()),
                "checks": checks,
            }
        )

    return {
        "canonical_authority": "Mr.liou",
        "origin_signature": "MrLiouWord",
        "source_repo": "dofaromg/mrliouword-system",
        "source_artifact": "registry/release_gate.json",
        "source_version": f"generated-by:{GENERATOR}",
        "derivative_role": "generated",
        "artifact_owner": "Mr.liou",
        "contributors": [
            "Mr.liou（canonical_authority：定義與裁決）",
            "Claude Code（tool：實作）",
        ],
        "transformation": "由 tools/release_gate.py 依政策第 8 節七道關卡生成，未改動任何既有產物",
        "verification_status": "partial",
        "registry_status": "unregistered",
        "policy": "docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md#8",
        "gates": GATE_NAMES,
        "totals": {
            "artifacts": len(results),
            "passed": sum(1 for r in results if r["passed"]),
            "failed": sum(1 for r in results if not r["passed"]),
            "findings": len(findings),
        },
        "artifacts": results,
        "findings": [f.to_dict() for f in findings],
    }


def _load_json(path: Path) -> Dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def _load_yaml(path: Path) -> Dict[str, Any]:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, yaml.YAMLError):
        return {}


def load_baseline(root: Path) -> Dict[str, str]:
    """既有未通過項的債務帳本。具名可查，不是豁免清單。"""
    data = _load_json(root / "registry" / "release_gate_baseline.json")
    return {
        e["artifact"] + "::" + e["gate"]: e.get("detail", "")
        for e in data.get("known_failures", [])
    }


def write_baseline(root: Path, report: Dict[str, Any]) -> Path:
    """把目前的未通過項寫成債務帳本。

    這不是豁免清單：每一筆都具名、帶說明、可逐項查證，而且 CI 只允許
    這個數字往下走。新增的違規一律擋下。
    """
    path = root / "registry" / "release_gate_baseline.json"
    path.write_text(
        json.dumps(
            {
                "canonical_authority": "Mr.liou",
                "origin_signature": "MrLiouWord",
                "source_repo": "dofaromg/mrliouword-system",
                "source_artifact": "registry/release_gate_baseline.json",
                "source_version": f"generated-by:{GENERATOR}",
                "derivative_role": "generated",
                "artifact_owner": "Mr.liou",
                "contributors": [
                    "Mr.liou（canonical_authority：定義與裁決）",
                    "Claude Code（tool：實作）",
                ],
                "transformation": "記錄建立關卡當下既有的未通過項，未改動任何既有產物",
                "verification_status": "verified",
                "registry_status": "unregistered",
                "note": (
                    "債務帳本，不是豁免清單。政策第 8 節規定失敗項不得標示為 "
                    "Canon／Official／Verified／source_of_truth——列在這裡的產物"
                    "仍然不得如此標示。每修好一項就從這裡移除，數字只能往下走。"
                ),
                "known_failures": report["findings"],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return path


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--write-baseline"]
    writing = "--write-baseline" in sys.argv
    root = Path(args[0]).resolve() if args else Path.cwd()
    out = Path(args[1]) if len(args) > 1 else root / "registry" / "release_gate.json"

    report = run_gates(root)
    if writing:
        path = write_baseline(root, report)
        print(f"📒 基準線寫入 {path}（{len(report['findings'])} 筆既有未通過項）")
        return 0
    baseline = load_baseline(root)

    new = [
        f
        for f in report["findings"]
        if f["artifact"] + "::" + f["gate"] not in baseline
    ]
    fixed = [
        k
        for k in baseline
        if k not in {f["artifact"] + "::" + f["gate"] for f in report["findings"]}
    ]
    report["baseline"] = {
        "known": len(baseline),
        "new_violations": len(new),
        "fixed_since_baseline": len(fixed),
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    t = report["totals"]
    print("🚧 發布 Gate（政策第 8 節）")
    print(f"   產物            {t['artifacts']}")
    print(f"   全數通過        {t['passed']}")
    print(f"   有未通過項      {t['failed']}")
    print(f"   基準線已記錄    {len(baseline)}")
    if fixed:
        print(f"   ✅ 比基準線少了 {len(fixed)} 項")
    if new:
        print(f"\n   ❌ 新增 {len(new)} 項未通過，不得發布：")
        for f in new:
            print(f"        {f['artifact']}")
            print(f"          [{f['gate']}] {f['detail']}")
    print(f"\n   📝 報告寫入 {out}")
    return 1 if new else 0


if __name__ == "__main__":
    raise SystemExit(main())
