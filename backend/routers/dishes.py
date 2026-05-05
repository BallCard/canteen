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


@router.post("")
async def create_dish(payload: dict):
    """社区共建菜品"""
    canteen_id = int(payload.get("canteen_id") or 1)
    canteen = next((c for c in data.canteens if c["id"] == canteen_id), data.canteens[0])
    new_dish = {
        "id": data.get_next_id("dish"),
        "name": payload.get("name", "未命名菜品"),
        "price": float(payload.get("price") or 0),
        "canteen_id": canteen["id"],
        "canteen_name": canteen["name"],
        "image": payload.get("image") or "/images/dishes/qingchaoshishu.svg",
        "calories": int(payload.get("calories") or 0),
        "protein": float(payload.get("protein") or 0),
        "fat": float(payload.get("fat") or 0),
        "carbs": float(payload.get("carbs") or 0),
        "rating": 0,
        "review_count": 0,
        "is_sold_out": False,
        "is_new": True,
        "is_official": False,
        "is_verified": False,
        "confirmations": 1,
        "tags": ["社区贡献"],
        "description": "由同学补充的社区菜单项。",
    }
    data.dishes.insert(0, new_dish)
    return new_dish


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


@router.post("/favorites")
async def add_favorite(payload: dict, user_id: int = Query(1)):
    """加入收藏"""
    dish_id = int(payload.get("dishId") or payload.get("dish_id") or 0)
    dish = next((d for d in data.dishes if d["id"] == dish_id), None)
    if not dish:
        raise HTTPException(404, "菜品未找到")
    data.user_favorites.setdefault(user_id, set()).add(dish_id)
    return {"success": True, "favorited": True}


@router.delete("/favorites")
async def remove_favorite(payload: dict, user_id: int = Query(1)):
    """取消收藏"""
    dish_id = int(payload.get("dishId") or payload.get("dish_id") or 0)
    data.user_favorites.setdefault(user_id, set()).discard(dish_id)
    return {"success": True, "favorited": False}


@router.get("/suggestions")
async def suggestions(keyword: Optional[str] = Query(None)):
    """智能建议"""
    candidates = data.dishes
    if keyword:
        normalized = keyword.lower()
        candidates = [
            d for d in candidates
            if normalized in d["name"].lower()
            or any(normalized in tag.lower() for tag in d.get("tags", []))
        ]

    scored = []
    for d in candidates:
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
    return dish


@router.post("/{dish_id}/confirm")
async def confirm_dish(dish_id: int, user_id: int = Query(1)):
    """确认菜品选择（加入收藏）"""
    dish = next((d for d in data.dishes if d["id"] == dish_id), None)
    if not dish:
        raise HTTPException(404, "菜品未找到")
    dish["confirmations"] = int(dish.get("confirmations") or 0) + 1
    data.user_favorites.setdefault(user_id, set()).add(dish_id)
    return dish
