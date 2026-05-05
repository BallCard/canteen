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
        "taste": data.user_profile.get("tastes", []),
        "goal": data.user_profile.get("goal", ""),
        "budget": data.user_profile.get("budget", ""),
        "lunchTime": data.user_profile.get("lunch_time", ""),
        "avoid": data.user_profile.get("avoid", ""),
        "memoryEnabled": data.user_profile.get("memory_enabled", True),
        "connectedApps": data.user_profile.get("connected_apps", []),
    }
    # Add stats
    profile["stats"] = {
        "logged_days": data.user_profile.get("logged_days", 15),
        "total_reviews": len([r for r in data.reviews if r.get("user") == data.user_profile.get("name")]),
        "favorite_count": len(data.user_favorites.get(1, set())),
        "calories_today": sum([log.get("calories", 0) for log in data.meal_logs])
    }
    return profile


@router.put("/preferences")
async def update_preferences(prefs: dict):
    """更新用户偏好"""
    data.user_profile["tastes"] = prefs.get("tastes", data.user_profile.get("tastes", []))
    data.user_profile["preference"] = "、".join(data.user_profile["tastes"])
    data.user_profile["goal"] = prefs.get("goal", data.user_profile["goal"])
    data.user_profile["budget"] = prefs.get("budget", data.user_profile.get("budget", ""))
    data.user_profile["lunch_time"] = prefs.get("lunchTime", data.user_profile.get("lunch_time", ""))
    data.user_profile["avoid"] = prefs.get("avoid", data.user_profile.get("avoid", ""))
    data.user_profile["memory_enabled"] = prefs.get("memoryEnabled", data.user_profile.get("memory_enabled", True))
    data.user_profile["connected_apps"] = prefs.get("connectedApps", data.user_profile.get("connected_apps", []))
    return {"success": True, "preferences": data.user_profile}
