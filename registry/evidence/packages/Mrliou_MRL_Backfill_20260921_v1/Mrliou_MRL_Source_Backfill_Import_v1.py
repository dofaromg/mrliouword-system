#!/usr/bin/env python3
"""Import this observation package into a NEW isolated MRL evidence directory.

Uses the user's existing, hash-pinned MRL runtime. Does not fetch dependencies,
contact a service, merge an existing ledger, or modify canonical runtime code.
canonical_authority: Mr.liou; origin_signature: MrLiouWord.
Implementation assistance: ChatGPT / Codex, directed by Mr.liou.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

PINNED_BLOBS = {
    "__init__.py": "7c9503556bb53e4f32c6269d230e48c647dd4762",
    "MRL_hash_chain_v1.py": "91366b5e7e43654b021d1869c396cabbd8c66069",
    "MRL_memory_vault_v1.py": "778bbc3824356386ffbd2dc376efa5998ae8650f",
    "MRL_evidence_ledger_v1.py": "8f66841752cb4150e7b5d92471b4bb449129b59d",
    "MRL_passport_registry_v1.py": "850440adce7468455c4f83c3be50544d79ad984d",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dataset", type=Path, required=True)
    ap.add_argument("--runtime-dir", type=Path, required=True)
    ap.add_argument("--output-dir", type=Path, required=True)
    args = ap.parse_args()
    data = json.loads(args.dataset.read_text(encoding="utf-8"))
    if data.get("schema") != "Mrliou_MRL_Content_Comparison_Backfill_v1":
        raise SystemExit("unsupported comparison schema")
    if data.get("origin_signature") != "MrLiouWord" or data.get("canonical_authority") != "Mr.liou":
        raise SystemExit("MRL record authority mismatch")
    for name, expected in PINNED_BLOBS.items():
        raw = (args.runtime_dir / name).read_bytes()
        blob = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
        if blob != expected:
            raise SystemExit("runtime source mismatch: " + name)
    records = [("observation", x["observation_id"], x) for x in data["observations"]]
    records += [("correction", x["correction_id"], x) for x in data["corrections"]]
    records += [("gap", x["gap_id"], x) for x in data["gaps"]]
    if len({x[1] for x in records}) != len(records):
        raise SystemExit("duplicate record identity")
    if args.output_dir.exists():
        raise SystemExit("output already exists; select a NEW directory to preserve all history")
    spec = importlib.util.spec_from_file_location(
        "mrl_existing_runtime", args.runtime_dir / "__init__.py",
        submodule_search_locations=[str(args.runtime_dir)])
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    from mrl_existing_runtime.MRL_memory_vault_v1 import MRLMemoryVault
    from mrl_existing_runtime.MRL_evidence_ledger_v1 import MRLEvidenceLedger
    from mrl_existing_runtime.MRL_passport_registry_v1 import MRLPassportRegistry
    args.output_dir.mkdir(parents=True)
    memory = MRLMemoryVault(args.output_dir)
    evidence = MRLEvidenceLedger(args.output_dir)
    passports = MRLPassportRegistry(args.output_dir)
    index = []
    for kind, record_id, payload in records:
        mem = memory.remember(
            world_id="MRL_Content_Comparison_20260921", session_id="MRL_session_backfill_20260921_v1",
            role="assistant", content=json.dumps(payload, ensure_ascii=False, sort_keys=True),
            metadata={"record_id": record_id, "record_kind": kind,
                      "source_classification": "ANALYST_OBSERVATION_NOT_HARDWARE_ACCEPTANCE"})
        ev = evidence.record(
            event_type="MRL_CONTENT_COMPARISON_" + kind.upper(), state="OBSERVED", subject_id=record_id,
            details={"memory_hash": mem["record_hash"], "record": payload})
        index.append({"record_id": record_id, "memory_hash": mem["record_hash"], "evidence_hash": ev["record_hash"]})
    passport = passports.issue(
        canonical_id="MRL_Content_Comparison_Backfill_20260921_v1",
        source_identity="Mrliou_MRL_Content_Comparison_Backfill_v1",
        world_state="candidate", capabilities=["MRL_CONTENT_COMPARISON", "MRL_SOURCE_BACKFILL"],
        evidence_refs=[x["evidence_hash"] for x in index], return_anchor=index[0]["memory_hash"],
        environment={"runtime_commit": "d43e53dee1012571915754afdfeff66c96c19615",
                     "execution_environment": "CALLER_LOCAL_ISOLATED_DIRECTORY",
                     "host_receipt_verified": False, "hardware_acceptance": "OPEN"},
        rights={"state": "MRL_INTERNAL_EVIDENCE_ONLY", "canonical_authority": "Mr.liou",
                "external_source_rights": "RETAINED_WITH_ORIGINAL_SOURCES",
                "rights_transfer": "NOT_GRANTED"})
    result = {"memory": memory.verify(), "evidence": evidence.verify(),
              "passport": passports.verify(passport["canonical_id"]),
              "passport_hash": passport["passport_hash"], "records": index,
              "host_receipt_verified": False, "hardware_acceptance": "OPEN"}
    (args.output_dir / "MRL_backfill_receipt.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "records"}, ensure_ascii=False, indent=2))
    if not all(result[k]["ok"] for k in ("memory", "evidence", "passport")):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
