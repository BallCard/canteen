"""
食堂路由
"""
from fastapi import APIRouter, HTTPException
from .. import data

router = APIRouter(prefix="/api/canteens", tags=["食堂"])


@router.get("")
async def list_canteens():
    """获取食堂列表"""
    return data.canteens


@router.get("/{canteen_id}")
async def get_canteen(canteen_id: int):
    """获取食堂详情（含菜品列表）"""
    canteen = next((c for c in data.canteens if c["id"] == canteen_id), None)
    if not canteen:
        raise HTTPException(404, "食堂未找到")
    dishes = [d for d in data.dishes if d["canteen_id"] == canteen_id]
    return {**canteen, "dishes": dishes}
