#!/usr/bin/env python3
"""Validate a bounded compatibility observation. No network or device execution.

canonical_authority: Mr.liou
origin_signature: MrLiouWord
Implementation assistance: ChatGPT / Codex, directed by Mr.liou.
This is a new evidence adapter; it does not copy or load external runtime code.
Consistency is not proof of who produced a receipt or of hardware execution.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from pathlib import Path


class EvidenceError(ValueError):
    pass


def require(ok, reason):
    if not ok:
        raise EvidenceError(reason)


def canonical_hash(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True,
                     separators=(",", ":"), allow_nan=False).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def exact_keys(obj, fields, label):
    require(isinstance(obj, dict) and set(obj) == set(fields), label + ": fields")


def finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def read_evidence(root, descriptor):
    exact_keys(descriptor, ("path", "sha256"), "evidence file")
    require(nonempty(descriptor["path"]), "evidence path missing")
    path = Path(descriptor["path"])
    require(not path.is_absolute(), "evidence path must be relative")
    resolved = (root / path).resolve()
    require(resolved.is_relative_to(root.resolve()), "evidence path escapes root")
    require(resolved.is_file(), "evidence file missing")
    require(isinstance(descriptor["sha256"], str) and
            re.fullmatch(r"[0-9a-f]{64}", descriptor["sha256"]), "invalid evidence digest")
    require(resolved.stat().st_size <= 16 * 1024 * 1024, "evidence exceeds 16 MiB")
    raw = resolved.read_bytes()
    require(hashlib.sha256(raw).hexdigest() == descriptor["sha256"], "evidence digest mismatch")
    return json.loads(raw)


def verify(receipt, evidence_root):
    exact_keys(receipt, ("schema", "observation_kind", "context", "context_sha256",
                        "numeric_tolerance", "trace", "result"), "receipt")
    require(receipt["schema"] == "Mrliou_MRL_Compatibility_Observation_v1", "schema mismatch")
    require(receipt["observation_kind"] in ("fixture", "local_report", "external_report"),
            "unknown observation kind")
    context = receipt["context"]
    exact_keys(context, ("source", "artifact_sha256", "hardware", "operation"), "context")
    source = context["source"]
    exact_keys(source, ("repository", "commit", "license_ref"), "source")
    require(nonempty(source["repository"]) and nonempty(source["license_ref"]), "source missing")
    require(isinstance(source["commit"], str) and re.fullmatch(r"[0-9a-f]{40}", source["commit"]),
            "exact source commit required")
    require(isinstance(context["artifact_sha256"], str) and
            re.fullmatch(r"[0-9a-f]{64}", context["artifact_sha256"]), "artifact digest required")
    hardware = context["hardware"]
    exact_keys(hardware, ("host_id", "gpu", "architecture", "driver", "runtime_sdk"), "hardware")
    require(all(nonempty(v) for v in hardware.values()), "hardware fields incomplete")
    op = context["operation"]
    exact_keys(op, ("name", "backend", "dtype", "shape", "parameters"), "operation")
    require(all(nonempty(op[k]) for k in ("name", "backend", "dtype")), "operation missing")
    require(isinstance(op["shape"], list) and op["shape"] and
            all(type(v) is int and v > 0 for v in op["shape"]), "shape invalid")
    require(isinstance(op["parameters"], dict), "parameters missing")
    digest = canonical_hash(context)
    require(receipt["context_sha256"] == digest, "context digest mismatch")
    tolerance = receipt["numeric_tolerance"]
    require(finite(tolerance) and tolerance >= 0, "tolerance invalid")
    root = Path(evidence_root)
    trace = read_evidence(root, receipt["trace"])
    result = read_evidence(root, receipt["result"])
    exact_keys(trace, ("context_sha256", "events"), "trace")
    exact_keys(result, ("context_sha256", "exit_code", "max_abs", "reference_sha256",
                        "output_sha256"), "result")
    require(trace["context_sha256"] == digest == result["context_sha256"], "scope binding mismatch")
    require(type(result["exit_code"]) is int and result["exit_code"] == 0, "process failed")
    require(finite(result["max_abs"]) and 0 <= result["max_abs"] <= tolerance, "numerical error")
    for key in ("reference_sha256", "output_sha256"):
        require(isinstance(result[key], str) and re.fullmatch(r"[0-9a-f]{64}", result[key]),
                "result digest missing")
    events = trace["events"]
    require(isinstance(events, list) and events, "trace missing")
    active, closed = {}, set()
    for event in events:
        exact_keys(event, ("id", "kind", "kernel"), "trace event")
        eid, kind, kernel = event["id"], event["kind"], event["kernel"]
        require(type(eid) is int and eid > 0 and nonempty(kernel), "trace identity invalid")
        if kind == "begin":
            require(eid not in active and eid not in closed, "duplicate begin")
            active[eid] = kernel
        elif kind == "done":
            require(eid in active, "terminal without matching begin")
            require(active[eid] == kernel, "kernel mismatch")
            del active[eid]
            closed.add(eid)
        else:
            raise EvidenceError("trace error or unknown event")
    require(not active and bool(closed), "unfinished trace")
    return {
        "schema": "Mrliou_MRL_Compatibility_Consistency_Result_v1",
        "origin_signature": "MrLiouWord",
        "context_sha256": digest,
        "consistency": "PASS",
        "completed_operations": len(closed),
        "observation_kind": receipt["observation_kind"],
        "authenticity": "NOT_VERIFIED_BY_THIS_ADAPTER",
        "hardware_acceptance": "OPEN",
        "source_claim": "OBSERVATION_ONLY",
        "note": "Digests bind declared context and evidence. Trusted host provenance and real execution require separate evidence.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("receipt", type=Path)
    parser.add_argument("--evidence-root", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = verify(json.loads(args.receipt.read_text(encoding="utf-8")), args.evidence_root)
    except (EvidenceError, OSError, ValueError, TypeError) as exc:
        print(json.dumps({"consistency": "FAIL", "error": str(exc), "hardware_acceptance": "OPEN"}))
        raise SystemExit(1)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
