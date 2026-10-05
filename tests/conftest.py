"""
pytest 配置和共用 fixtures
"""
import pytest
import asyncio
from pathlib import Path


@pytest.fixture(scope="session")
def event_loop():
    """建立 event loop"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def sample_csv_file(tmp_path):
    """建立測試用 CSV 檔案"""
    csv_content = """name,age,city
Alice,30,Taipei
Bob,25,Taichung
Charlie,35,Kaohsiung
"""
    file_path = tmp_path / "test_data.csv"
    file_path.write_text(csv_content)
    return str(file_path)


@pytest.fixture
def sample_python_file(tmp_path):
    """建立測試用 Python 檔案"""
    code_content = """
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b
"""
    file_path = tmp_path / "test_code.py"
    file_path.write_text(code_content)
    return str(file_path)


@pytest.fixture
def mock_config():
    """Mock 配置"""
    from mrliouword_agents.core.config import MrliouwordConfig

    return MrliouwordConfig(
        anthropic_api_key="test-key", environment="test", debug=True
    )


@pytest.fixture(autouse=True)
def isolated_runtime_memory(tmp_path, monkeypatch):
    """Keep real memory recording enabled without mutating repository state."""
    from mrliouword_agents.core.config import config

    registry = (
        Path(__file__).resolve().parents[1]
        / "data/runtime_memory/particle_warehouse/registry.json"
    )
    before = registry.read_bytes()
    monkeypatch.setattr(config, "runtime_memory_dir", str(tmp_path / "runtime_memory"))
    yield
    assert registry.read_bytes() == before, "A test changed the tracked runtime registry"
