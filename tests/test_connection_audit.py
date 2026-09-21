#!/usr/bin/env python3
"""
Tests for the connection audit tool
===================================

重點在 JSONC 解析。wrangler 接受行末註解、區塊註解與尾隨逗號，
而原本的實作只處理整行註解，其餘三種都會讓設定被靜默略過——
deployable_from_repo 正是這份報告的主結論，少算等於結論錯誤。

Author: MR.liou
"""

import json
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../"))

from tools.connection_audit import (
    find_placeholders,  # noqa: E402
    WranglerParseError,
    read_wrangler_name,
    strip_jsonc,
)


def parse(text):
    return json.loads(strip_jsonc(text))


class TestStripJsonc:
    """wrangler 接受、原本會解析失敗的三種寫法"""

    def test_line_end_comment(self):
        assert parse('{\n  "name": "w", // 註解\n  "main": "a.ts"\n}')["name"] == "w"

    def test_block_comment(self):
        assert parse('{\n  /* 多行\n     區塊 */\n  "name": "w"\n}')["name"] == "w"

    def test_trailing_comma_in_object(self):
        assert parse('{\n  "name": "w",\n}')["name"] == "w"

    def test_trailing_comma_in_array(self):
        assert parse('{"name": "w", "rules": [1, 2,]}')["rules"] == [1, 2]

    def test_whole_line_comment_still_works(self):
        assert parse('{\n  // 說明\n  "name": "w"\n}')["name"] == "w"


class TestStripJsoncPreservesStrings:
    """字串裡的 // 與 /* 不是註解，不可以被砍掉"""

    def test_url_with_double_slash(self):
        assert parse('{"name": "w", "u": "https://a.b/c"}')["u"] == "https://a.b/c"

    def test_glob_with_star(self):
        assert parse('{"name": "w", "g": "a/*"}')["g"] == "a/*"

    def test_escaped_quote_then_slashes(self):
        got = parse('{"name": "w", "n": "say \\"hi\\" // 不是註解"}')
        assert got["n"] == 'say "hi" // 不是註解'

    def test_comma_inside_string_is_not_trailing(self):
        assert parse('{"name": "w", "s": "a,}"}')["s"] == "a,}"


class TestReadWranglerName:
    def test_toml(self, tmp_path):
        p = tmp_path / "wrangler.toml"
        p.write_text('name = "particle-api"\nmain = "src/index.ts"\n')
        assert read_wrangler_name(p) == "particle-api"

    def test_jsonc_with_comments(self, tmp_path):
        p = tmp_path / "wrangler.jsonc"
        p.write_text('{\n  "name": "w", // 名稱\n  "main": "src/index.ts",\n}')
        assert read_wrangler_name(p) == "w"

    def test_missing_name_returns_none(self, tmp_path):
        p = tmp_path / "wrangler.jsonc"
        p.write_text('{"main": "src/index.ts"}')
        assert read_wrangler_name(p) is None

    def test_broken_json_raises_not_silently_skipped(self, tmp_path):
        """解析失敗必須丟出來，不能回 None 讓呼叫端當成『沒有名稱』"""
        p = tmp_path / "wrangler.jsonc"
        p.write_text('{"name": "w"')
        with pytest.raises(WranglerParseError):
            read_wrangler_name(p)


# --- 「讀得到」不等於「部署得了」 -------------------------------------------
#
# 原本 deployable_from_repo 只檢查 wrangler 能否讀到設定檔，於是
# cloudflare/particle-memory/wrangler.toml 這種必要欄位仍是
# FILL_ME_BEFORE_DEPLOY 的設定也被算進可部署數——主結論從 3 被灌水成 4。
# 那個佔位字串是刻意留的待辦，卻被這份稽核算成了成果。
# 這個缺陷是 Codex 在 PR #77 上指出來的。以下是它的回歸測試。


def test_placeholder_in_required_field_is_detected(tmp_path: Path) -> None:
    p = tmp_path / "wrangler.toml"
    p.write_text(
        'name = "x"\n\n[[d1_databases]]\n'
        'binding = "DB"\n'
        'database_name = "FILL_ME_BEFORE_DEPLOY"\n'
        'database_id = "FILL_ME_BEFORE_DEPLOY"\n',
        encoding="utf-8",
    )
    found = {f["key"] for f in find_placeholders(p)}
    assert found == {"database_name", "database_id"}


def test_real_values_are_not_flagged(tmp_path: Path) -> None:
    p = tmp_path / "wrangler.toml"
    p.write_text(
        'name = "x"\n\n[[d1_databases]]\n'
        'binding = "DB"\n'
        'database_name = "mrliouword-db"\n'
        'database_id = "01275832-aaaa-bbbb-cccc-000000000000"\n',
        encoding="utf-8",
    )
    assert find_placeholders(p) == []


def test_placeholder_in_a_comment_is_not_a_setting(tmp_path: Path) -> None:
    """註解裡提到 FILL_ME 是說明，不是設定——不得誤報。"""
    p = tmp_path / "wrangler.toml"
    p.write_text(
        "# database_id 尚未填入，請勿沿用 FILL_ME_BEFORE_DEPLOY\n"
        'name = "x"\n\n[[d1_databases]]\n'
        'database_id = "real-id-0001"  # 不是 FILL_ME\n',
        encoding="utf-8",
    )
    assert find_placeholders(p) == []


def test_non_required_field_with_placeholder_is_ignored(tmp_path: Path) -> None:
    """只有「填了就一定部署失敗」的欄位才算數，不擴大解釋。"""
    p = tmp_path / "wrangler.toml"
    p.write_text('name = "x"\ndescription = "TODO 之後補說明"\n', encoding="utf-8")
    assert find_placeholders(p) == []


def test_jsonc_placeholder_is_detected(tmp_path: Path) -> None:
    p = tmp_path / "wrangler.jsonc"
    p.write_text(
        '{\n  "name": "x",\n'
        '  "d1_databases": [{ "binding": "DB", "database_id": "<your-id-here>" }]\n}\n',
        encoding="utf-8",
    )
    assert [f["key"] for f in find_placeholders(p)] == ["database_id"]


def test_missing_file_returns_empty(tmp_path: Path) -> None:
    assert find_placeholders(tmp_path / "nope.toml") == []


def test_single_line_jsonc_placeholder_is_detected(tmp_path: Path) -> None:
    """整份寫在一行的 JSONC——第一版的逐行 partition 抓不到這種。"""
    p = tmp_path / "wrangler.jsonc"
    p.write_text(
        '{ "d1_databases": [{ "database_id": "<your-id-here>" }] }\n', encoding="utf-8"
    )
    assert [f["key"] for f in find_placeholders(p)] == ["database_id"]
