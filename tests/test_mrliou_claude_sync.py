"""``tools/mrliou_claude_sync.py`` 的測試。

素材一律用倉庫裡**真正的** Mrliou_claude.md 與 CLAUDE.md，不用自己捏的
最小檔案——復盤第 1 則就是敗在測了自己捏的 fixture，真文件被刪 5 欄照樣綠。
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from tools.mrliou_claude_sync import (  # noqa: E402
    ADAPTER_PATH,
    BODY_BEGIN,
    BODY_END,
    CANON_PATH,
    extract_body,
    render_adapter,
)

CANON_TEXT = (REPO_ROOT / CANON_PATH).read_text(encoding="utf-8")
ADAPTER_TEXT = (REPO_ROOT / ADAPTER_PATH).read_text(encoding="utf-8")


def test_repo_is_actually_in_sync() -> None:
    """倉庫當下就該是同步的——這條失敗代表有人手改了 adapter。"""
    assert render_adapter(CANON_TEXT) == ADAPTER_TEXT


def test_body_is_preserved_verbatim() -> None:
    """adapter 的本文與正本逐字相同，一個字都不能差。"""
    body = extract_body(CANON_TEXT)
    assert body in ADAPTER_TEXT
    assert body.strip(), "本文不能是空的"


def test_seven_steps_survive_the_projection() -> None:
    """投影不能把七步弄丟——那是這整套東西存在的理由。"""
    for step in ["看到", "接受", "比對", "修正", "建構", "測試", "紀錄"]:
        assert step in extract_body(CANON_TEXT)
        assert step in ADAPTER_TEXT


def test_adapter_declares_it_is_not_the_original() -> None:
    """供應商品牌名只能當 adapter（NAMING.md 1.2），它必須自己說清楚。"""
    assert "MRL-ADAPTER:GENERATED" in ADAPTER_TEXT
    assert CANON_PATH.as_posix() in ADAPTER_TEXT
    assert "origin_signature: MrLiouWord" in ADAPTER_TEXT


def test_missing_begin_marker_is_an_error() -> None:
    assert BODY_BEGIN in CANON_TEXT
    with pytest.raises(ValueError, match=BODY_BEGIN):
        extract_body(CANON_TEXT.replace(BODY_BEGIN, ""))


def test_missing_end_marker_is_an_error() -> None:
    assert BODY_END in CANON_TEXT
    with pytest.raises(ValueError, match=BODY_END):
        extract_body(CANON_TEXT.replace(BODY_END, ""))


def test_reversed_markers_are_an_error() -> None:
    """BEGIN/END 顛倒要直接報錯，不能默默回空字串。"""
    broken = CANON_TEXT.replace(BODY_BEGIN, "\x00").replace(BODY_END, BODY_BEGIN)
    broken = broken.replace("\x00", BODY_END)
    with pytest.raises(ValueError):
        extract_body(broken)


def test_empty_body_is_an_error() -> None:
    head, _, rest = CANON_TEXT.partition(BODY_BEGIN)
    _, _, tail = rest.partition(BODY_END)
    with pytest.raises(ValueError, match="空的"):
        extract_body(head + BODY_BEGIN + "\n\n" + BODY_END + tail)


def test_drift_is_detected(tmp_path: Path) -> None:
    """真正要擋的事：有人直接改 adapter，兩份分岔。"""
    from tools import mrliou_claude_sync as sync

    shutil.copy(REPO_ROOT / CANON_PATH, tmp_path / CANON_PATH)
    shutil.copy(REPO_ROOT / ADAPTER_PATH, tmp_path / ADAPTER_PATH)

    drifted = ADAPTER_TEXT.replace("完成即停止", "完成後繼續服務", 1)
    assert drifted != ADAPTER_TEXT, "替換沒命中，這個測試就沒測到東西"
    (tmp_path / ADAPTER_PATH).write_text(drifted, encoding="utf-8")

    cwd = Path.cwd()
    try:
        import os

        os.chdir(tmp_path)
        assert sync.main(["prog", "--check"]) == 1
        assert sync.main(["prog", "--build"]) == 0
        assert sync.main(["prog", "--check"]) == 0
        assert (tmp_path / ADAPTER_PATH).read_text(encoding="utf-8") == ADAPTER_TEXT
    finally:
        os.chdir(cwd)


def test_missing_canonical_fails(tmp_path: Path) -> None:
    from tools import mrliou_claude_sync as sync
    import os

    shutil.copy(REPO_ROOT / ADAPTER_PATH, tmp_path / ADAPTER_PATH)
    cwd = Path.cwd()
    try:
        os.chdir(tmp_path)
        assert sync.main(["prog", "--check"]) == 1
    finally:
        os.chdir(cwd)


def test_missing_adapter_fails(tmp_path: Path) -> None:
    from tools import mrliou_claude_sync as sync
    import os

    shutil.copy(REPO_ROOT / CANON_PATH, tmp_path / CANON_PATH)
    cwd = Path.cwd()
    try:
        os.chdir(tmp_path)
        assert sync.main(["prog", "--check"]) == 1
        assert sync.main(["prog", "--build"]) == 0
        assert sync.main(["prog", "--check"]) == 0
    finally:
        os.chdir(cwd)


def test_bad_mode_is_rejected() -> None:
    from tools import mrliou_claude_sync as sync

    assert sync.main(["prog", "--rebuild-everything"]) == 1
