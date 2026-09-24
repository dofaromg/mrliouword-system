#!/usr/bin/env python3
"""每一份 PROVENANCE.yaml 對政策第 4 節的逐欄檢查。

依據：``docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md``
（2026-08-03，stable_locked）——

    §1  不可變權位：canonical_authority = Mr.liou、origin_signature = MrLiouWord
    §3  角色不得混淆：Claude / ChatGPT / Copilot 是「協作、生成、審查、實作工具」，
        不可以被寫成「原始架構權威或唯一作者」
    §4  每個衍生產物的必要欄位（十欄），derivative_role 只有六個列舉值
    §5.4 任何鏡像或 fork 必須標明 mirror_of 或 derived_from
    §6  AI 工具得到工具／協作角色，不冒充人類來源

以及 ``MRL_PROVENANCE.md`` 規格表「Authorship Boundary」：
外部人員或 AI 可標示為修改者／committer，但不得把來源作者改標成 bot；
commit author 不等於原始碼來源權利人。

為什麼有這支腳本
----------------
2026-09-22 至 09-24，PR #83 的 ``vendor/git/PROVENANCE.yaml`` 在同一個 PR 裡
兩次把本倉庫自己的程式碼署名給別人：第一版把本倉庫新增的 ``auth.c`` 寫成
「屬 Git 貢獻者、MRL 無著作權主張」（Codex 抓到）；修正版又自創
``derivative_role`` 值、把 ``artifact_owner`` 整欄寫成上游、在不可變欄位旁加
限定語、把 bot 寫成 ``author``、漏掉必要欄位 ``transformation``（擁有者抓到：
「把錯誤改回來，我等定義也講了一年」）。

既有的七支閘門沒有一支解析 PROVENANCE.yaml，所以那個檔在 YAML 壞掉的
狀態下 CI 仍全綠。復盤寫了三次認錯清單，下一輪照犯——七步的「建構」
要求把修正變成擋得住復發的東西。這支腳本就是那個東西：同類錯誤在進
main 之前由機器擋下，不靠人記得。

本倉庫 ``governance_authority: false``：這裡的每一條規則都逐字對應上面列出的
政策條文，不自行擴充。``artifact_owner`` 必須是 ``Mr.liou`` 這一條，依據是 §1
（本倉庫是 source_of_truth_repo）、§3（Mr.liou 不得被寫成次級）、§6（工具與
平台不取得內容權位），以及倉庫既有三份 PROVENANCE 的一致值；上游作者依
規格表「Upstream Boundary」放 ``upstream:`` 段，不放 ``artifact_owner``。
要放寬，由擁有者定義後改這裡。

退出碼：0 = 全部通過；1 = 有缺漏；2 = 檢查本身跑不了（缺 pyyaml）。
跑不了要算失敗，不能算通過——假的綠燈比沒跑更危險。
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    print("provenance_fields_check 無法執行：缺少 pyyaml（requirements.txt 已列）。")
    print("檢查跑不了 = 未通過，不是通過。")
    sys.exit(2)

POLICY = "docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md"

# §4，逐字。
REQUIRED_FIELDS = [
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

# §4：derivative_role: implementation|adapter|projection|mirror|experiment|generated
DERIVATIVE_ROLES = {"implementation", "adapter", "projection", "mirror", "experiment", "generated"}

# §4：verification_status: unverified|partial|verified
VERIFICATION_STATUSES = {"unverified", "partial", "verified"}

# §1 不可變值。
CANONICAL_AUTHORITY = "Mr.liou"
ORIGIN_SIGNATURE = "MrLiouWord"

# §3 第 5 列的三個名字，加上倉庫歷史裡實際出現過的 bot 身份。
AI_TOOL_PATTERN = re.compile(
    r"claude|chatgpt|codex|copilot|\[bot\]|swe-agent", re.IGNORECASE
)

# 規格表「Authorship Boundary」：這些鍵名代表「來源作者」，值不得是 bot／AI。
AUTHOR_KEYS = {"author", "author_in_repo", "authored_by", "original_author"}


def _find_files(root: Path) -> list[Path]:
    """用 git ls-files 找所有 PROVENANCE.yaml；不在 git 倉庫時退回 rglob。"""
    try:
        out = subprocess.run(
            ["git", "-C", str(root), "ls-files", "-z", "--", "*PROVENANCE.yaml", "**/PROVENANCE.yaml"],
            capture_output=True, check=True,
        ).stdout
        names = sorted({n for n in out.decode("utf-8").split("\0") if n})
        if names:
            return [root / n for n in names]
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    return sorted(p for p in root.rglob("PROVENANCE.yaml") if ".git" not in p.parts)


def _walk(node, path: str = ""):
    """遞迴走訪 YAML 樹，產出 (路徑, 鍵, 值)。"""
    if isinstance(node, dict):
        for k, v in node.items():
            yield path, k, v
            yield from _walk(v, f"{path}.{k}" if path else str(k))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from _walk(v, f"{path}[{i}]")


def _text(value) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _description(value) -> bool:
    """Keep existing string/list/mapping descriptions; reject empty or scalar impostors."""
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, list):
        return bool(value) and all(_description(item) for item in value)
    if isinstance(value, dict):
        return bool(value) and all(_text(key) and _description(item) for key, item in value.items())
    return False


def check_file(path: Path, root: Path) -> list[str]:
    rel = path.relative_to(root).as_posix()
    f: list[str] = []

    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (yaml.YAMLError, OSError, UnicodeError) as exc:
        return [f"{rel}: YAML 無法解析——{str(exc).splitlines()[0]}"]

    if not isinstance(data, dict):
        return [f"{rel}: 頂層不是 mapping"]

    for key in REQUIRED_FIELDS:
        if key not in data:
            f.append(f"{rel}: 缺少 §4 必要欄位 {key}")

    # §4 source references must contain a usable value, not just a YAML key.
    for key in ("source_repo", "source_artifact", "source_version"):
        if key in data and not _text(data[key]):
            f.append(f"{rel}: {key} 必須是非空字串（§4 來源引用）")

    if data.get("canonical_authority") != CANONICAL_AUTHORITY:
        f.append(f"{rel}: canonical_authority 必須是 {CANONICAL_AUTHORITY}（§1 不可變），實際：{data.get('canonical_authority')!r}")
    if data.get("origin_signature") != ORIGIN_SIGNATURE:
        f.append(f"{rel}: origin_signature 必須是 {ORIGIN_SIGNATURE}（§1 不可變），實際：{data.get('origin_signature')!r}")

    role = data.get("derivative_role")
    if "derivative_role" in data and (not isinstance(role, str) or role not in DERIVATIVE_ROLES):
        f.append(
            f"{rel}: derivative_role={role!r} 不在 §4 列舉 {sorted(DERIVATIVE_ROLES)} 內"
            "（naming_authority: false，不得自創）"
        )
    if role == "mirror" and not (_text(data.get("mirror_of")) or _text(data.get("derived_from"))):
        f.append(f"{rel}: derivative_role: mirror 必須標明 mirror_of 或 derived_from（§5 第 4 條）")

    owner = data.get("artifact_owner")
    if "artifact_owner" in data and owner != CANONICAL_AUTHORITY:
        f.append(
            f"{rel}: artifact_owner={owner!r}；本倉庫衍生產物的擁有者是 {CANONICAL_AUTHORITY}"
            "（§1/§3/§6；上游作者放 upstream: 段，見規格表 Upstream Boundary）"
        )

    status = data.get("verification_status")
    if "verification_status" in data and (not isinstance(status, str) or status not in VERIFICATION_STATUSES):
        f.append(f"{rel}: verification_status={status!r} 不在 §4 列舉 {sorted(VERIFICATION_STATUSES)} 內")

    contributors = data.get("contributors")
    if "contributors" in data:
        if not isinstance(contributors, list) or not contributors:
            f.append(f"{rel}: contributors 必須是非空清單（§4）")
        else:
            for i, c in enumerate(contributors):
                if not isinstance(c, dict) or "name" not in c or "role" not in c:
                    f.append(f"{rel}: contributors[{i}] 需要 name 與 role（§4 human-or-tool-with-role）")
                    continue
                name, crole = str(c["name"]), str(c["role"])
                if not _text(c["name"]) or not _text(c["role"]):
                    f.append(f"{rel}: contributors[{i}] 的 name 與 role 必須是非空字串")
                if AI_TOOL_PATTERN.search(name) and not re.search(r"\btool\b|工具", crole):
                    f.append(
                        f"{rel}: contributors[{i}] {name!r} 是 AI／bot，role 必須標明 tool（§3、§6），實際：{crole!r}"
                    )

    # §4 <what changed>: preserve existing description forms, reject false/null/empty.
    transformation = data.get("transformation")
    if "transformation" in data and not _description(transformation):
        f.append(f"{rel}: transformation 必須包含非空變換說明（§4 what changed）")

    for where, key, value in _walk(data):
        if key in AUTHOR_KEYS and isinstance(value, str) and AI_TOOL_PATTERN.search(value):
            f.append(
                f"{rel}: {where + '.' if where else ''}{key}={value!r}——bot／AI 只能標示為 committer 或修改者，"
                "不得寫成來源作者（MRL_PROVENANCE.md 規格表 Authorship Boundary）"
            )

    return f


def main(argv: list[str]) -> int:
    root = Path(argv[1]).resolve() if len(argv) > 1 else Path(__file__).resolve().parent.parent
    files = _find_files(root)
    if not files:
        print(f"provenance_fields_check：{root} 底下找不到任何 PROVENANCE.yaml。")
        return 1

    failures: list[str] = []
    for path in files:
        failures.extend(check_file(path, root))

    if failures:
        print(f"MRL 來源鏈欄位檢查未通過（{len(files)} 份檔案，{len(failures)} 項）：")
        for line in failures:
            print(f"  - {line}")
        print()
        print(f"依據：{POLICY} §1 / §3 / §4 / §5.4 / §6；MRL_PROVENANCE.md 規格表 Authorship Boundary")
        return 1

    print(f"MRL 來源鏈欄位檢查通過：{len(files)} 份 PROVENANCE.yaml，§4 十欄齊備，欄位值均在列舉內。")
    for path in files:
        print(f"  ✓ {path.relative_to(root).as_posix()}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
