"""
菜品路由
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from .. import data
from ..services.recommendation import get_top_recommendations

router = APIRouter(prefix="/api/dishes", tags=["菜品"])


@router.get("")
async def list_dishes(canteen_id: Optional[int] = Query(None)):
    """菜品列表（支持 canteen_id 筛选）"""
    if canteen_id:
        return [d for d in data.dishes if d["canteen_id"] == canteen_id]
    return data.dishes


@router.get("/search")
async def search_dishes(keyword: str = Query(...)):
    """搜索菜品"""
    return [d for d in data.dishes if keyword.lower() in d["name"].lower()]


@router.get("/recommendations")
async def recommendations():
    """今日推荐（Top 3）"""
    return get_top_recommendations()


@router.get("/favorites")
async def get_favorites(user_id: int = Query(1)):
    """获取用户收藏"""
    fav_ids = data.user_favorites.get(user_id, set())
    return [d for d in data.dishes if d["id"] in fav_ids]


@router.get("/suggestions")
async def suggestions():
    """智能建议"""
    scored = []
    for d in data.dishes:
        if d.get("is_sold_out"):
            continue
        score = d["rating"] + (2 if d["is_new"] else 0)
        scored.append((score, d))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [sd for _, sd in scored[:5]]


@router.get("/{dish_id}")
async def get_dish(dish_id: int):
    """菜品详情"""
    dish = next((d for d in data.dishes if d["id"] == dish_id), None)
    if not dish:
        raise HTTPException(404, "菜品未找到")
    return dish


@router.put("/{dish_id}/toggle-sold-out")
async def toggle_sold_out(dish_id: int):
    """切换售罄状态"""
    dish = next((d for d in data.dishes if d["id"] == dish_id), None)
    if not dish:
        raise HTTPException(404, "菜品未找到")
    dish["is_sold_out"] = not dish["is_sold_out"]
    return {"success": True, "is_sold_out": dish["is_sold_out"]}


@router.post("/{dish_id}/confirm")
async def confirm_dish(dish_id: int, user_id: int = Query(1)):
    """确认菜品选择（加入收藏）"""
    dish = next((d for d in data.dishes if d["id"] == dish_id), None)
    if not dish:
        raise HTTPException(404, "菜品未找到")
    data.user_favorites.setdefault(user_id, set()).add(dish_id)
    return {"success": True, "dish_name": dish["name"]}
