"""
DeepSeek API integration for AI recommendations
"""
import os
import requests
from typing import Optional

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Fallback reasons for when API fails
_FALLBACK_REASONS = {
    "麻辣香锅": "麻辣鲜香，开胃下饭，适合今日好胃口",
    "番茄牛腩": "番茄酸甜搭配牛腩软烂，高蛋白低脂之选",
    "清炒时蔬": "清爽低卡，补充维生素，减脂首选",
    "红烧肉": "经典校园味道，补充能量，学习必备",
    "牛肉面": "大块牛肉配劲道面条，碳水蛋白双满足",
    "酸菜鱼": "酸爽开胃，鱼片嫩滑，高蛋白低脂肪",
}


def generate_reason(dish_name: str, preference: str = "") -> str:
    """Generate AI recommendation reason using DeepSeek API"""
    if not DEEPSEEK_API_KEY:
        return _FALLBACK_REASONS.get(dish_name, f"{dish_name} - 今日推荐之选")

    try:
        prompt = f"你是校园食堂小助手。请用一句话(20字内)推荐菜品'{dish_name}'"
        if preference:
            prompt += f"，用户偏好：{preference}"
        prompt += "。要求：简洁、有吸引力、突出特点。"

        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 50
            },
            timeout=5
        )

        if response.status_code == 200:
            result = response.json()
            reason = result["choices"][0]["message"]["content"].strip()
            return reason
        else:
            print(f"DeepSeek API error: {response.status_code}")
            return _FALLBACK_REASONS.get(dish_name, f"{dish_name} - 今日推荐之选")

    except Exception as e:
        print(f"DeepSeek API exception: {e}")
        return _FALLBACK_REASONS.get(dish_name, f"{dish_name} - 今日推荐之选")
