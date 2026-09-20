#!/usr/bin/env python3
"""
Tests for the release gate
==========================

政策第 8 節規定七道關卡，並規定「失敗項不得標示為 Canon、Official、
Verified 或 source_of_truth」。這些測試守住的是：**外部要進來就得守規則**。

規則本身不在這裡定義——關卡只執行 docs/governance/ 已經寫好的東西。

Author: MR.liou
"""

import json
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../"))

from tools.release_gate import (  # noqa: E402
    DERIVATIVE_ROLES,
    GATE_NAMES,
    PROVENANCE_CRITICAL,
    PROVENANCE_FIELDS,
    gate_authority_lock,
    gate_contributor_role_separation,
    gate_mirror_projection_role,
    gate_naming,
    gate_provenance_completeness,
    gate_runtime_verification_status,
    gate_source_hash_commit_link,
)

LOCK = {"authority": {"canonical_name": "Mr.liou"}}
REGISTRY = {
    "legacy_aliases": {
        "particle-api": {
            "canonical": "MRL_API_Gateway",
            "disposition": "quarantine_as_source_name",
        }
    }
}
GOOD = {
    "canonical_authority": "Mr.liou",
    "origin_signature": "MrLiouWord",
    "source_repo": "dofaromg/mrliouword-system",
    "source_artifact": "a/b.toml",
    "source_version": "abc1234",
    "derivative_role": "implementation",
    "artifact_owner": "Mr.liou",
    "contributors": ["Mr.liou（canonical_authority）", "Claude Code（tool：實作）"],
    "transformation": "新建",
    "verification_status": "partial",
}
ART = {"kind": "worker", "name": "some-worker", "path": "a/b.toml"}


def test_policy_names_seven_gates():
    """關卡數量與名稱直接對應政策第 8 節，不多不少。"""
    assert len(GATE_NAMES) == 7
    assert "Provenance Completeness" in GATE_NAMES
    assert "Contributor Role Separation" in GATE_NAMES


def test_ten_provenance_fields():
    assert len(PROVENANCE_FIELDS) == 10
    assert set(PROVENANCE_CRITICAL) <= set(PROVENANCE_FIELDS)


class TestAuthorityLock:
    def test_passes_with_canonical_authority(self):
        assert gate_authority_lock(ART, GOOD, LOCK)[0]

    def test_fails_without_declaration(self):
        assert not gate_authority_lock(ART, {}, LOCK)[0]

    def test_fails_when_authority_replaced(self):
        prov = {**GOOD, "canonical_authority": "SomeCompany"}
        assert not gate_authority_lock(ART, prov, LOCK)[0]

    def test_fails_when_artifact_claims_reserved_name(self):
        art = {**ART, "name": "MrLiouWord"}
        assert not gate_authority_lock(art, GOOD, LOCK)[0]


class TestNamingGate:
    def test_fails_when_legacy_alias_used_as_product_name(self):
        """外部拿 legacy alias 當自己的產品名——註冊表規則 2。"""
        art = {**ART, "name": "particle-api"}
        ok, detail = gate_naming(art, GOOD, REGISTRY)
        assert not ok
        assert "legacy alias" in detail

    def test_passes_when_canonical_identity_declared(self):
        art = {**ART, "name": "particle-api"}
        prov = {
            **GOOD,
            "canonical_identity": {
                "module": "MRL_API_Gateway",
                "disposition": "quarantine_as_source_name",
            },
        }
        assert gate_naming(art, prov, REGISTRY)[0]

    def test_fails_when_unregistered_takes_mrl_prefix(self):
        """Registry Gate：未登錄產物不得取得 mrl_ 鍵。"""
        art = {**ART, "name": "mrl_something"}
        assert not gate_naming(art, GOOD, REGISTRY)[0]


class TestProvenanceCompleteness:
    def test_passes_with_ten_fields(self):
        assert gate_provenance_completeness(ART, GOOD)[0]

    def test_origin_signature_alone_is_incomplete(self):
        """政策明文：origin_signature 單獨存在不代表來源鏈完整。"""
        ok, detail = gate_provenance_completeness(
            ART, {"origin_signature": "MrLiouWord"}
        )
        assert not ok
        assert "provenance incomplete" in detail


class TestSourceHashCommitLink:
    def test_passes_with_commit(self):
        assert gate_source_hash_commit_link(ART, GOOD)[0]

    def test_passes_with_import_hashes(self):
        prov = {"imported_verbatim": {"files": [{"path": "x", "sha256": "ab" * 32}]}}
        assert gate_source_hash_commit_link(ART, prov)[0]

    def test_fails_with_neither(self):
        assert not gate_source_hash_commit_link(ART, {})[0]


class TestContributorRoleSeparation:
    def test_passes_when_roles_separated(self):
        assert gate_contributor_role_separation(ART, GOOD)[0]

    def test_fails_without_contributors(self):
        assert not gate_contributor_role_separation(ART, {})[0]

    def test_fails_when_contributor_has_no_role(self):
        prov = {**GOOD, "contributors": ["Claude Code"]}
        assert not gate_contributor_role_separation(ART, prov)[0]

    def test_fails_when_ai_tool_not_marked_as_tool(self):
        """政策第 3 節：AI 工具得到工具／協作角色，不冒充人類來源。"""
        prov = {**GOOD, "contributors": ["Claude Code（作者）"]}
        ok, detail = gate_contributor_role_separation(ART, prov)
        assert not ok
        assert "tool" in detail


class TestMirrorProjectionRole:
    def test_passes_with_valid_role(self):
        assert gate_mirror_projection_role(ART, GOOD)[0]

    def test_fails_with_unknown_role(self):
        prov = {**GOOD, "derivative_role": "whatever"}
        assert not gate_mirror_projection_role(ART, prov)[0]

    def test_mirror_must_declare_source(self):
        """政策第 5 節第 4 點：鏡像或 fork 必須標明 mirror_of 或 derived_from。"""
        prov = {**GOOD, "derivative_role": "mirror"}
        assert not gate_mirror_projection_role(ART, prov)[0]
        assert gate_mirror_projection_role(ART, {**prov, "mirror_of": "x"})[0]

    def test_allowed_roles_match_policy(self):
        assert DERIVATIVE_ROLES == {
            "implementation",
            "adapter",
            "projection",
            "mirror",
            "experiment",
            "generated",
        }


class TestRuntimeVerificationStatus:
    def test_passes_with_valid_status(self, tmp_path):
        assert gate_runtime_verification_status(tmp_path, ART, GOOD, True)[0]

    def test_fails_without_status(self, tmp_path):
        assert not gate_runtime_verification_status(tmp_path, ART, {}, True)[0]

    def test_failing_artifact_may_not_claim_verified(self, tmp_path):
        """政策第 8 節：失敗項不得標示為 Canon／Official／Verified／source_of_truth。"""
        (tmp_path / "a").mkdir()
        (tmp_path / "a" / "b.toml").write_text("name = 'x'\n")
        prov = {**GOOD, "verification_status": "verified"}
        ok, detail = gate_runtime_verification_status(tmp_path, ART, prov, False)
        assert not ok
        assert "verified" in detail.lower()
