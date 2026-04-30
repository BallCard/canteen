"""
菜品推荐服务
"""
from .. import data


def get_top_recommendations(limit: int = 3) -> list:
    """获取综合评分最高的菜品（加权评分）"""
    scored = []
    for d in data.dishes:
        if d.get("is_sold_out"):
            continue
        score = d["rating"] * 0.7 + (1 if d["is_new"] else 0) * 0.3
        scored.append((score, d))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [sd for _, sd in scored[:limit]]


def ai_recommend(preference: str = "均衡", nutrition_goal: str = "均衡") -> list:
    """AI 智能推荐（规则引擎）"""
    candidates = [d for d in data.dishes if not d.get("is_sold_out")]

    # 口味过滤
    if preference == "辣":
        candidates = [d for d in candidates if "辣" in d.get("tags", [])]
    elif preference == "清淡":
        candidates = [d for d in candidates if "清淡" in d.get("tags", [])]

    # 营养目标打分
    def nutrition_score(d):
        if nutrition_goal == "增肌":
            return d.get("protein", 0) / (d.get("calories", 1) or 1) * 100
        elif nutrition_goal == "减脂":
            return max(0, 100 - d.get("calories", 0) / 6)
        return d.get("rating", 0)

    candidates.sort(key=nutrition_score, reverse=True)
    return candidates[:3]
