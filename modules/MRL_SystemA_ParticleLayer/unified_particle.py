"""UnifiedParticle canonical transport model.

origin_signature: MrLiouWord

This module is intentionally dependency-light. It provides the target shape
required by MRL_SystemA_ParticleLayer while preserving unknown source fields in
``state`` for reversible round trips.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field, fields
from typing import Any, Dict, List, Mapping, Optional
from uuid import uuid4

ORIGIN_SIGNATURE = "MrLiouWord"


@dataclass
class UnifiedParticle:
    source: str
    seed_id: str
    persona_id: Optional[str] = None
    mrl_id: str = field(default_factory=lambda: str(uuid4()))
    particle_scale: float = 1.0
    fltnz_path: Optional[str] = None
    domain: str = "unknown"
    state: Dict[str, Any] = field(default_factory=dict)
    amplify: Dict[str, Any] = field(
        default_factory=lambda: {"N": 100, "eta": 0.9}
    )
    proof: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)
    origin_signature: str = ORIGIN_SIGNATURE

    def __post_init__(self) -> None:
        if self.origin_signature != ORIGIN_SIGNATURE:
            raise ValueError(
                f"LAW-0 violation: origin_signature must be {ORIGIN_SIGNATURE!r}"
            )
        if not self.source:
            raise ValueError("source must not be empty")
        if not self.seed_id:
            raise ValueError("seed_id must not be empty")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, value: Mapping[str, Any]) -> "UnifiedParticle":
        known = {f.name for f in fields(cls)}
        kwargs: Dict[str, Any] = {k: v for k, v in value.items() if k in known}
        extra = {k: v for k, v in value.items() if k not in known}
        if extra:
            state: Dict[str, Any] = dict(kwargs.get("state") or {})
            state.update(extra)
            kwargs["state"] = state
        return cls(**kwargs)

    def to_mrl(self) -> Dict[str, Any]:
        """Return an MRL-compatible mapping without introducing a new schema."""
        return self.to_dict()

    @classmethod
    def from_mrl(cls, value: Mapping[str, Any]) -> "UnifiedParticle":
        return cls.from_dict(value)
