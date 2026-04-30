"""
点评路由
"""
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from .. import data
from ..models import ReviewCreate

router = APIRouter(prefix="/api/reviews", tags=["点评"])


@router.get("")
async def list_reviews(dish_id: int = Query(...)):
    """获取菜品点评"""
    return [r for r in data.reviews if r["dish_id"] == dish_id]


@router.post("")
async def create_review(review: ReviewCreate):
    """提交点评"""
    # 验证菜品存在
    dish = next((d for d in data.dishes if d["id"] == review.dish_id), None)
    if not dish:
        raise HTTPException(404, "菜品未找到")

    new_review = {
        "id": data.get_next_id("review"),
        "dish_id": review.dish_id,
        "user": review.user,
        "rating": review.rating,
        "content": review.content,
        "image": review.image,
        "likes": 0,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    data.reviews.append(new_review)

    # 更新菜品评分
    dish_reviews = [r for r in data.reviews if r["dish_id"] == review.dish_id]
    dish["rating"] = round(sum(r["rating"] for r in dish_reviews) / len(dish_reviews), 1)
    dish["review_count"] = len(dish_reviews)

    return new_review


@router.post("/{review_id}/like")
async def like_review(review_id: int):
    """点赞点评"""
    review = next((r for r in data.reviews if r["id"] == review_id), None)
    if not review:
        raise HTTPException(404, "点评未找到")
    review["likes"] += 1
    return {"success": True, "likes": review["likes"]}
