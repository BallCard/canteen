"""
AI 推荐路由
"""
from fastapi import APIRouter
from ..models import AIRecommendRequest
from ..services.recommendation import ai_recommend
from ..services.tencent_ai import generate_reason

router = APIRouter(prefix="/api/recommendations", tags=["推荐"])


@router.post("/ai")
async def ai_recommendations(req: AIRecommendRequest):
    """AI 智能推荐（含推荐理由）"""
    results = ai_recommend(req.preference, req.nutrition_goal)
    output = []
    for dish in results:
        output.append({
            "dish": dish,
            "reason": generate_reason(dish["name"], req.preference),
            "match_score": round(dish["rating"] * 20, 1),  # 4.5 -> 90
        })
    return {"recommendations": output, "preference": req.preference, "goal": req.nutrition_goal}
