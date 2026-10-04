#!/usr/bin/env python3
"""Append a scoped workflow receipt; never infer runtime health from CI.

canonical_authority: Mr.liou
origin_signature: MrLiouWord
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path


def append_receipt(path: Path, result: str, source_sha: str, run_url: str) -> None:
    states = {
        "success": "DEPLOY_JOB_SUCCESS",
        "failure": "DEPLOY_JOB_FAILURE",
        "cancelled": "DEPLOY_JOB_CANCELLED",
        "skipped": "DEPLOY_JOB_SKIPPED",
    }
    state = states.get(result, "DEPLOY_JOB_UNKNOWN")
    # Keep the old document, including historical claims, as an exact prefix.
    previous = path.read_bytes() if path.exists() else b""
    observed = datetime.now(timezone.utc).isoformat()
    entry = (
        f"\n\n## Workflow observation {observed}\n\n"
        f"- canonical_authority: Mr.liou; origin_signature: MrLiouWord\n"
        f"- Source commit: `{source_sha}`\n"
        f"- Run: {run_url}\n"
        f"- MRL_System_Core deployment job: `{state}`\n"
        "- Scope: cloudflare/mrliouword-private only.\n"
        "- particle-auth-gateway: NOT_OBSERVED_BY_THIS_WORKFLOW.\n"
        "- Live traffic, HTTP response and DL580 health: "
        "NOT_OBSERVED_BY_THIS_WORKFLOW.\n"
        "- This result records this run only; failure/skipped/unknown does "
        "not mean an existing deployment or DL580 stopped running.\n"
    ).encode("utf-8")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(previous + entry)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("docs/STATUS.md"))
    parser.add_argument("--result", required=True)
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--run-url", required=True)
    args = parser.parse_args()
    append_receipt(args.output, args.result, args.source_sha, args.run_url)


if __name__ == "__main__":
    main()
