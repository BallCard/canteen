"""
菜品推荐服务 - 多因素加权算法
"""
from .. import data
from typing import List, Dict, Optional
from datetime import datetime
import math

# 权重配置
WEIGHTS = {
    "taste": 0.30,      # 口味偏好
    "nutrition": 0.25,  # 营养匹配
    "popularity": 0.20, # 热度评分
    "price": 0.15,      # 价格匹配
    "diversity": 0.05,  # 多样性
    "time": 0.05,       # 时间匹配
}

# 用户历史推荐记录（用于多样性计算）
_recommendation_history: Dict[str, List[int]] = {}


def calculate_taste_score(dish: dict, taste_preference: str) -> float:
    """计算口味匹配分 (0-100)"""
    if not taste_preference or taste_preference == "随意":
        return 50  # 中性分数

    tags = dish.get("tags", [])
    if taste_preference in tags:
        return 100
    elif taste_preference == "辣" and any(t in tags for t in ["辣", "麻辣"]):
        return 80
    elif taste_preference == "清淡" and any(t in tags for t in ["清淡", "低卡"]):
        return 80
    return 30


def calculate_nutrition_score(dish: dict, goal: str) -> float:
    """计算营养匹配分 (0-100)"""
    calories = dish.get("calories", 0)
    protein = dish.get("protein", 0)
    fat = dish.get("fat", 0)

    if goal == "减脂":
        # 低卡、低脂高分
        score = 100
        if calories > 600:
            score -= 40
        elif calories > 400:
            score -= 20
        if fat > 30:
            score -= 20
        return max(0, score)

    elif goal == "增肌":
        # 高蛋白高分
        score = min(100, protein * 3)  # protein > 30 得满分
        if calories < 300:
            score -= 20  # 太少热量不利于增肌
        return max(0, score)

    else:  # 均衡
        # 各项适中高分
        score = 70
        if 300 <= calories <= 550:
            score += 15
        if 15 <= protein <= 35:
            score += 15
        return min(100, score)


def calculate_popularity_score(dish: dict) -> float:
    """计算热度评分 (0-100)"""
    rating = dish.get("rating", 4.0)
    review_count = dish.get("review_count", 0)

    # rating 4.0-5.0 映射到 60-100
    rating_score = (rating - 3.0) * 20 if rating > 3.0 else 0

    # review_count 加成
    review_bonus = min(20, review_count * 0.5)

    return min(100, rating_score + review_bonus)


def calculate_price_score(dish: dict, budget: Optional[str] = None) -> float:
    """计算价格匹配分 (0-100)"""
    price = dish.get("price", 15)

    if not budget or budget == "不在意":
        return 70  # 中性分数

    if budget == "10元内":
        return 100 if price <= 10 else max(0, 100 - (price - 10) * 15)
    elif budget == "15元内":
        return 100 if price <= 15 else max(0, 100 - (price - 15) * 10)
    elif budget == "20元内":
        return 100 if price <= 20 else max(0, 100 - (price - 20) * 8)

    return 70


def calculate_diversity_score(dish: dict, history: List[int]) -> float:
    """计算多样性分 (0-100)"""
    dish_id = dish.get("id")
    if dish_id in history:
        # 最近推荐过扣分
        recency = history.index(dish_id) if dish_id in history else len(history)
        return max(0, 50 - (len(history) - recency) * 20)
    return 100


def calculate_time_score(dish: dict) -> float:
    """计算时间匹配分 (0-100)"""
    hour = datetime.now().hour
    tags = dish.get("tags", [])

    # 早餐时段 (6-10)
    if 6 <= hour < 10:
        if "面食" in tags or dish.get("type") in ["包子", "饺子", "面食"]:
            return 100
        return 60

    # 午餐时段 (11-14)
    elif 11 <= hour < 14:
        return 80  # 正餐时段，所有菜品都合适

    # 晚餐时段 (17-20)
    elif 17 <= hour < 20:
        if "人气" in tags or "高蛋白" in tags:
            return 90
        return 75

    # 其他时段
    return 70


def ai_recommend(
    taste_preference: str = "随意",
    nutrition_goal: str = "均衡",
    budget: Optional[str] = None,
    user_id: str = "default",
    limit: int = 3
) -> List[dict]:
    """
    AI 智能推荐 - 多因素加权算法

    Args:
        taste_preference: 口味偏好 (辣/清淡/随意)
        nutrition_goal: 营养目标 (减脂/增肌/均衡)
        budget: 预算限制 (10元内/15元内/20元内/不在意)
        user_id: 用户标识（用于多样性）
        limit: 返回数量

    Returns:
        推荐菜品列表
    """
    candidates = [d for d in data.dishes if not d.get("is_sold_out")]

    # 获取用户历史推荐
    history = _recommendation_history.get(user_id, [])

    scored = []
    for dish in candidates:
        taste_score = calculate_taste_score(dish, taste_preference)
        nutrition_score = calculate_nutrition_score(dish, nutrition_goal)
        popularity_score = calculate_popularity_score(dish)
        price_score = calculate_price_score(dish, budget)
        diversity_score = calculate_diversity_score(dish, history)
        time_score = calculate_time_score(dish)

        total = (
            taste_score * WEIGHTS["taste"] +
            nutrition_score * WEIGHTS["nutrition"] +
            popularity_score * WEIGHTS["popularity"] +
            price_score * WEIGHTS["price"] +
            diversity_score * WEIGHTS["diversity"] +
            time_score * WEIGHTS["time"]
        )

        scored.append({
            "dish": dish,
            "score": round(total, 1),
            "breakdown": {
                "taste": taste_score,
                "nutrition": nutrition_score,
                "popularity": popularity_score,
                "price": price_score,
                "diversity": diversity_score,
                "time": time_score,
            }
        })

    # 按总分排序
    scored.sort(key=lambda x: x["score"], reverse=True)
    top = scored[:limit]

    # 更新历史记录
    new_history = [s["dish"]["id"] for s in top]
    _recommendation_history[user_id] = (history + new_history)[-10:]

    return [s["dish"] for s in top]


def get_top_recommendations(limit: int = 3) -> list:
    """获取综合评分最高的菜品（兼容旧接口）"""
    return ai_recommend(limit=limit)
