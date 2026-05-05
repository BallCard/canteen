"""
AI Chat router for DeepSeek integration with follow-up questions
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import requests
import re

router = APIRouter(prefix="/api/chat", tags=["聊天"])

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# 追问步骤配置
FOLLOW_UP_STEPS = [
    {
        "step": "taste",
        "question": "你偏好什么口味?",
        "options": ["辣", "清淡", "随意"],
    },
    {
        "step": "budget",
        "question": "预算范围是多少?",
        "options": ["10元内", "15元内", "不在意"],
    },
    {
        "step": "goal",
        "question": "今天的营养目标是?",
        "options": ["减脂", "增肌", "均衡", "随意"],
    },
]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[Dict] = None  # 追问上下文


def extract_preference_from_history(messages: List[ChatMessage]) -> Dict:
    """从对话历史中提取用户偏好"""
    context = {
        "taste": None,
        "budget": None,
        "goal": None,
    }

    # 合并所有用户消息
    user_text = " ".join([m.content for m in messages if m.role == "user"])

    # 提取口味
    if "辣" in user_text:
        context["taste"] = "辣"
    elif "清淡" in user_text:
        context["taste"] = "清淡"

    # 提取预算
    if "10元" in user_text or "便宜" in user_text:
        context["budget"] = "10元内"
    elif "15元" in user_text:
        context["budget"] = "15元内"

    # 提取目标
    if "减脂" in user_text or "减肥" in user_text:
        context["goal"] = "减脂"
    elif "增肌" in user_text or "健身" in user_text:
        context["goal"] = "增肌"

    return context


def determine_next_step(context: Dict) -> Optional[Dict]:
    """确定下一个追问步骤"""
    for step_config in FOLLOW_UP_STEPS:
        if context.get(step_config["step"]) is None:
            return step_config
    return None


@router.post("")
async def chat(req: ChatRequest):
    """AI chat endpoint with follow-up questions"""
    if not DEEPSEEK_API_KEY:
        raise HTTPException(500, "DeepSeek API key not configured")

    # 提取用户偏好
    context = req.context or {}
    extracted = extract_preference_from_history(req.messages)
    context = {**context, **extracted}

    # 检查是否需要追问
    next_step = determine_next_step(context)

    # 如果用户消息很短且信息不足,触发追问
    last_user_msg = req.messages[-1].content if req.messages else ""
    is_vague_request = len(last_user_msg) < 10 and any(
        kw in last_user_msg for kw in ["推荐", "吃什么", "随便", "帮我选"]
    )

    if is_vague_request and next_step:
        return {
            "reply": next_step["question"],
            "quick_reply": {
                "step": next_step["step"],
                "options": next_step["options"],
            },
            "context": context,
        }

    # 调用 DeepSeek API
    try:
        messages_payload = [{"role": msg.role, "content": msg.content} for msg in req.messages]

        # 添加偏好上下文
        if context.get("taste") or context.get("goal"):
            pref_text = f"用户偏好:口味={context.get('taste', '随意')},目标={context.get('goal', '均衡')},预算={context.get('budget', '不在意')}。请根据这些偏好推荐菜品,回复末尾加 [DISHES:1,5,10] 格式。"
            messages_payload.insert(0, {"role": "system", "content": pref_text})

        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek-chat",
                "messages": messages_payload,
                "temperature": 0.8,
                "max_tokens": 200
            },
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(response.status_code, f"DeepSeek API error: {response.text}")

        result = response.json()
        reply = result["choices"][0]["message"]["content"].strip()

        return {
            "reply": reply,
            "context": context,
        }

    except requests.exceptions.Timeout:
        raise HTTPException(504, "DeepSeek API timeout")
    except Exception as e:
        raise HTTPException(500, f"Chat error: {str(e)}")
