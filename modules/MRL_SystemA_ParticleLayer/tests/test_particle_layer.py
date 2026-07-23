import sys
from pathlib import Path

MODULE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(MODULE_DIR))

import pytest

from MRL_SystemA_ParticleLayer import (
    FileIndexAdapter,
    MemoryAdapter,
    OriginSignatureError,
    PersonaAdapter,
    verify_law2,
)


@pytest.mark.parametrize(
    "adapter,row",
    [
        (
            PersonaAdapter(),
            {
                "id": "p-1",
                "name": "MrLiou",
                "origin_signature": "MrLiouWord",
            },
        ),
        (
            MemoryAdapter(),
            {
                "id": "m-1",
                "state": {"text": "hello"},
                "tags": ["memory"],
            },
        ),
        (
            FileIndexAdapter(),
            {"id": "f-1", "path": "/tmp/a.txt", "sha256": "abc"},
        ),
    ],
)
def test_roundtrip(adapter, row):
    assert adapter.roundtrip_check(row)
    report = verify_law2(adapter, [row])
    assert report["status"] == "PASS"
    assert report["checked"] == 1


def test_law0_rejects_foreign_origin():
    with pytest.raises(OriginSignatureError):
        PersonaAdapter().to_unified(
            {"id": "p-2", "origin_signature": "foreign"}
        )


def test_from_dict_preserves_extra_fields():
    """from_dict must not raise on unknown keys; extras land in state."""
    from unified_particle import UnifiedParticle

    extra_data = {
        "source": "mrl_persona",
        "seed_id": "p-99",
        "unknown_field": "should_be_preserved",
        "another_extra": 42,
    }
    particle = UnifiedParticle.from_dict(extra_data)
    assert particle.source == "mrl_persona"
    assert particle.seed_id == "p-99"
    assert particle.state.get("unknown_field") == "should_be_preserved"
    assert particle.state.get("another_extra") == 42


def test_from_unified_rejects_foreign_state_origin():
    """from_unified must raise if state carries a foreign origin_signature."""
    adapter = PersonaAdapter()
    row = {"id": "p-3", "name": "test", "origin_signature": "MrLiouWord"}
    particle = adapter.to_unified(row)
    # tamper with state origin after construction
    particle.state["origin_signature"] = "foreign"
    with pytest.raises(OriginSignatureError):
        adapter.from_unified(particle)
