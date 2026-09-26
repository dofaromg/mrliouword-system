import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from tools.provenance_link_check import RECORD, check  # noqa: E402


def real_record():
    return json.loads((ROOT / RECORD).read_text())


def test_all_recorded_links():
    assert check(ROOT, real_record()) == []


def test_incorrect_hash_rejected():
    record = copy.deepcopy(real_record())
    record["file_links"][0]["sha256"] = "0" * 64
    assert any("content mismatch" in error for error in check(ROOT, record))


def test_missing_link_not_counted_as_success():
    record = real_record()
    record["file_links"].pop()
    assert "file_links count mismatch" in check(ROOT, record)


def test_duplicate_destination_rejected():
    record = real_record()
    record["file_links"][1] = record["file_links"][0]
    assert any("duplicate destination" in error for error in check(ROOT, record))
