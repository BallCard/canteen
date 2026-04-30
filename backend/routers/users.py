"""
用户路由
"""
from fastapi import APIRouter
from .. import data

router = APIRouter(prefix="/api/user", tags=["用户"])


@router.get("/profile")
async def get_profile():
    """获取用户信息"""
    profile = {**data.user_profile}
    profile["preferences"] = {
        "favorites": list(data.user_favorites.get(1, set())),
        "preference": data.user_profile.get("preference", ""),
        "goal": data.user_profile.get("goal", ""),
    }
    return profile


@router.put("/preferences")
async def update_preferences(prefs: dict):
    """更新用户偏好"""
    data.user_profile["preference"] = prefs.get("preference", data.user_profile["preference"])
    data.user_profile["goal"] = prefs.get("goal", data.user_profile["goal"])
    return {"success": True}
