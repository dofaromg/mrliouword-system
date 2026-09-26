"""Regressions use the real MRL provenance records, never synthetic success fixtures."""
import copy
import sys
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from tools.provenance_fields_check import check_file, main  # noqa: E402


def real_data():
    return yaml.safe_load((ROOT / "vendor/git/PROVENANCE.yaml").read_text())


def write_case(tmp_path, data):
    path = tmp_path / "PROVENANCE.yaml"
    path.write_text(yaml.safe_dump(data, allow_unicode=True))
    return path


@pytest.mark.parametrize("field", ["source_repo", "source_artifact", "source_version"])
@pytest.mark.parametrize("value", [None, False, 0, "", " \n", [], {}])
def test_empty_source_rejected(tmp_path, field, value):
    data = real_data()
    data[field] = value
    assert any(field in error for error in check_file(write_case(tmp_path, data), tmp_path))


@pytest.mark.parametrize("value", [None, False, True, 0, "", "  ", [], {}, [None], [""], {"change": False}])
def test_invalid_transformation_rejected(tmp_path, value):
    data = real_data()
    data["transformation"] = value
    assert any("transformation" in error for error in check_file(write_case(tmp_path, data), tmp_path))


def test_reported_bypass_fails_cli(tmp_path):
    data = real_data()
    data.update(source_repo=None, source_artifact=None, source_version=None, transformation=False)
    write_case(tmp_path, data)
    assert main(["check", str(tmp_path)]) == 1


@pytest.mark.parametrize("path", ["vendor/git/PROVENANCE.yaml", "cloudflare/particle-api/PROVENANCE.yaml", "cloudflare/particle-memory/PROVENANCE.yaml"])
def test_real_records_still_pass(path):
    assert check_file(ROOT / path, ROOT) == []


@pytest.mark.parametrize("field", ["derivative_role", "verification_status"])
def test_wrong_enum_type_returns_failure_not_exception(tmp_path, field):
    data = real_data()
    data[field] = []
    assert check_file(write_case(tmp_path, data), tmp_path)


def test_missing_file_fails_closed(tmp_path):
    assert check_file(tmp_path / "PROVENANCE.yaml", tmp_path)


def test_blank_mirror_reference_rejected(tmp_path):
    data = real_data()
    data["mirror_of"] = "  "
    assert check_file(write_case(tmp_path, data), tmp_path)


def test_source_and_owner_are_not_rewritten(tmp_path):
    data = real_data()
    before = copy.deepcopy(data)
    path = write_case(tmp_path, data)
    original = path.read_bytes()
    assert check_file(path, tmp_path) == []
    assert path.read_bytes() == original
    assert data == before
