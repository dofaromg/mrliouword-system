from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parent.parent
PROVENANCE_FILE = REPO_ROOT / "mrl_world_model" / "PROVENANCE.yaml"


def test_world_model_source_version_is_a_string() -> None:
    provenance = yaml.safe_load(PROVENANCE_FILE.read_text(encoding="utf-8"))

    assert provenance["source_version"] == "2026-09-29"
    assert isinstance(provenance["source_version"], str)
