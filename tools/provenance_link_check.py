"""Verify the recorded PR83 file links without moving or rewriting any source."""
import hashlib
import json
import sys
from pathlib import Path

RECORD = "registry/evidence/Mrliou_PR83_Source_Link_Audit_20260925_v1.json"


def check(root, record):
    root = Path(root).resolve()
    failures = []
    links = record.get("file_links", [])
    if not links or len(links) != record.get("expected_file_count"):
        failures.append("file_links count mismatch")
    seen = set()
    for link in links:
        name = link.get("destination_path", "")
        path = (root / name).resolve()
        if not name or name in seen or not path.is_relative_to(root):
            failures.append(f"invalid or duplicate destination: {name}")
            continue
        seen.add(name)
        try:
            data = path.read_bytes()
        except OSError:
            failures.append(f"missing: {name}")
            continue
        if len(data) != link.get("size_bytes") or hashlib.sha256(data).hexdigest() != link.get("sha256"):
            failures.append(f"content mismatch: {name}")
    for edge in record.get("observed_references", []):
        for key in ("from_path", "to_path"):
            name = edge.get(key, "")
            path = (root / name).resolve()
            if not name or not path.is_relative_to(root) or not path.is_file():
                failures.append(f"missing reference endpoint: {name}")
    return failures


def main():
    root = Path(__file__).resolve().parents[1]
    try:
        record = json.loads((root / RECORD).read_text())
        failures = check(root, record)
    except (OSError, ValueError, TypeError, AttributeError) as exc:
        print(f"link audit unavailable: {exc}")
        return 1
    if failures:
        print("\n".join(failures))
        return 1
    print(f"File links verified: {len(record['file_links'])}; runtime receipts remain separately recorded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
