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

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../"))

from tools.connection_audit import (  # noqa: E402
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
