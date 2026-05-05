"""
校园食堂助手 — Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreate(BaseModel):
    """创建点评请求"""
    dish_id: int = Field(alias="dishId")
    user: str = "匿名用户"
    rating: float
    content: str
    image: Optional[str] = None
    model_config = {"populate_by_name": True}


class MealLogCreate(BaseModel):
    """添加饮食记录请求"""
    name: str
    calories: int
    protein: float
    fat: float
    carbs: float
    type: str


class AIRecommendRequest(BaseModel):
    """AI 推荐请求"""
    preference: str = "均衡"
    nutrition_goal: str = "均衡"
