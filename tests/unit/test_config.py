"""
測試 Config
"""
import pytest
from mrliouword_agents.core.config import MrliouwordConfig


def test_config_creation():
    """測試配置建立"""
    config = MrliouwordConfig(mrliou_ai_key="test-key")
    assert config.mrliou_ai_key == "test-key"
    assert config.app_name == "Mrliouword Agent SDK"


def test_config_defaults():
    """測試預設配置"""
    config = MrliouwordConfig(mrliou_ai_key="test-key")
    assert config.model == "mrliou-model-b1"
    assert config.max_tokens == 4096
    assert config.environment == "development"
