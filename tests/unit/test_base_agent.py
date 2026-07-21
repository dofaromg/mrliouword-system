"""
測試 BaseAgent
"""

import pytest

from mrliouword_agents.core.base_agent import BaseAgent
from mrliouword_agents.core.exceptions import AgentError


class DummyAgent(BaseAgent):
    """測試用 Agent"""

    async def execute(self, *args, **kwargs):
        yield "Test message"


class FailingDummyAgent(BaseAgent):
    """會失敗的測試用 Agent"""

    async def execute(self, *args, **kwargs):
        if False:
            yield "unreachable"
        raise ValueError("boom")


def test_base_agent_creation():
    """測試 Agent 建立"""
    agent = DummyAgent(name="TestAgent")
    assert agent.name == "TestAgent"
    assert agent.model is not None


def test_base_agent_config():
    """測試 Agent 配置"""
    agent = DummyAgent(name="TestAgent", model="test-model")
    config = agent.get_config()
    assert config["name"] == "TestAgent"
    assert config["model"] == "test-model"


@pytest.mark.asyncio
async def test_track_execution_yields_messages():
    """測試追蹤器會轉傳 async generator 訊息"""
    agent = DummyAgent(name="TestAgent")

    messages = []
    async for message in agent._track_execution(agent.execute):
        messages.append(message)

    assert messages == ["Test message"]


@pytest.mark.asyncio
async def test_track_execution_wraps_errors():
    """測試追蹤器會包裝執行錯誤"""
    agent = FailingDummyAgent(name="FailingAgent")

    with pytest.raises(AgentError, match="FailingAgent 執行失敗: boom"):
        async for _ in agent._track_execution(agent.execute):
            pass
