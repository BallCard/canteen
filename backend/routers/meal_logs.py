"""
饮食记录路由
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from .. import data
from ..models import MealLogCreate
from ..services.nutrition import get_today_summary, get_weekly_report

router = APIRouter(prefix="/api/meal-logs", tags=["饮食记录"])


def format_meal_log(log: dict) -> dict:
    """Return the stable frontend meal-log shape."""
    created_at = log.get("created_at", "")
    time = log.get("time") or (created_at.split(" ")[1] if " " in created_at else created_at)
    return {**log, "time": time}


@router.get("/today")
async def today_logs():
    """今日饮食记录"""
    return [format_meal_log(log) for log in data.meal_logs]


@router.get("/weekly")
async def weekly_report():
    """周报统计"""
    return get_weekly_report()


@router.get("/summary")
async def nutrition_summary():
    """今日营养汇总"""
    return get_today_summary()


@router.post("")
async def add_meal_log(log: MealLogCreate):
    """添加饮食记录"""
    new_log = {
        "id": data.get_next_id("meal_log"),
        "name": log.name,
        "calories": log.calories,
        "protein": log.protein,
        "fat": log.fat,
        "carbs": log.carbs,
        "type": log.type,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    data.meal_logs.append(new_log)
    return format_meal_log(new_log)


@router.delete("/{log_id}")
async def delete_meal_log(log_id: int):
    """删除饮食记录"""
    for i, l in enumerate(data.meal_logs):
        if l["id"] == log_id:
            data.meal_logs.pop(i)
            return {"success": True}
    raise HTTPException(404, "记录未找到")
