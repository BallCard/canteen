"""
浙大食堂助手 - FastAPI 后端服务
"""
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field
import json
import os

app = FastAPI(title="浙大食堂助手 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Pydantic Models ============
class ReviewCreate(BaseModel):
    dish_id: int = Field(alias="dishId")
    user: str = "匿名用户"
    rating: float
    content: str
    image: Optional[str] = None

    model_config = {"populate_by_name": True}

class MealLogCreate(BaseModel):
    name: str
    calories: int
    protein: float
    fat: float
    carbs: float
    type: str

# ============ In-Memory Data ============
canteens = [
    {"id": 1, "name": "风味餐厅", "location": "紫金港校区西区", "hours": "06:30-21:00", "image": "/images/canteens/fengwei.jpg", "rating": 4.2},
    {"id": 2, "name": "大食堂", "location": "紫金港校区东区", "hours": "06:30-20:30", "image": "/images/canteens/dashitang.jpg", "rating": 4.0},
    {"id": 3, "name": "麦香园", "location": "紫金港校区北区", "hours": "06:30-21:30", "image": "/images/canteens/maixiangyuan.jpg", "rating": 4.5},
]

dishes = [
    {"id": 1, "name": "麻辣香锅", "price": 18.0, "canteen_id": 1, "canteen_name": "风味餐厅", "image": "/images/dishes/malaxiangguo.jpg", "calories": 650, "protein": 25.0, "fat": 35.0, "carbs": 55.0, "rating": 4.5, "review_count": 28, "is_sold_out": False, "is_new": False, "tags": ["辣", "荤", "人气"]},
    {"id": 2, "name": "番茄牛腩", "price": 15.0, "canteen_id": 1, "canteen_name": "风味餐厅", "image": "/images/dishes/fanqieqiuniu.jpg", "calories": 480, "protein": 30.0, "fat": 18.0, "carbs": 45.0, "rating": 4.3, "review_count": 22, "is_sold_out": False, "is_new": False, "tags": ["清淡", "荤", "高蛋白"]},
    {"id": 3, "name": "清炒时蔬", "price": 6.0, "canteen_id": 2, "canteen_name": "大食堂", "image": "/images/dishes/qingchaoshishu.jpg", "calories": 120, "protein": 5.0, "fat": 3.0, "carbs": 20.0, "rating": 4.0, "review_count": 15, "is_sold_out": False, "is_new": False, "tags": ["清淡", "素", "低卡"]},
    {"id": 4, "name": "红烧肉", "price": 12.0, "canteen_id": 2, "canteen_name": "大食堂", "image": "/images/dishes/hongshaorou.jpg", "calories": 550, "protein": 22.0, "fat": 40.0, "carbs": 15.0, "rating": 4.1, "review_count": 18, "is_sold_out": False, "is_new": False, "tags": ["荤", "传统"]},
    {"id": 5, "name": "牛肉面", "price": 14.0, "canteen_id": 3, "canteen_name": "麦香园", "image": "/images/dishes/niuroumian.jpg", "calories": 520, "protein": 28.0, "fat": 15.0, "carbs": 65.0, "rating": 4.6, "review_count": 35, "is_sold_out": False, "is_new": False, "tags": ["荤", "面食", "人气"]},
    {"id": 6, "name": "酸菜鱼", "price": 16.0, "canteen_id": 3, "canteen_name": "麦香园", "image": "/images/dishes/suancaiyu.jpg", "calories": 380, "protein": 32.0, "fat": 12.0, "carbs": 25.0, "rating": 4.4, "review_count": 20, "is_sold_out": False, "is_new": True, "tags": ["辣", "荤", "高蛋白", "新菜"]},
]

reviews = [
    {"id": 1, "dish_id": 1, "user": "小李", "rating": 5.0, "content": "超级好吃，麻辣够味！", "image": None, "likes": 12, "created_at": "2026-04-28 12:30"},
    {"id": 2, "dish_id": 5, "user": "小王", "rating": 4.5, "content": "牛肉很大块，汤底浓郁", "image": None, "likes": 8, "created_at": "2026-04-28 11:45"},
    {"id": 3, "dish_id": 2, "user": "小张", "rating": 4.0, "content": "番茄味很浓，牛肉软烂", "image": None, "likes": 5, "created_at": "2026-04-27 18:20"},
]

meal_logs = [
    {"id": 1, "name": "麻辣香锅", "calories": 650, "protein": 25.0, "fat": 35.0, "carbs": 55.0, "type": "午餐", "created_at": "2026-04-29 12:00"},
    {"id": 2, "name": "清炒时蔬", "calories": 120, "protein": 5.0, "fat": 3.0, "carbs": 20.0, "type": "晚餐", "created_at": "2026-04-29 18:00"},
]

user_favorites = {1: {1, 5}}
user_profile = {
    "name": "浙大同学", "avatar": "/images/avatar/default.png", "preference": "辣",
    "goal": "增肌", "calorie_target": 2000, "logged_days": 15,
}
next_id = {"dish": 7, "review": 4, "meal_log": 3}

# ============ API Routes ============
@app.get("/api/canteens")
async def get_canteens():
    return canteens

@app.get("/api/canteens/{canteen_id}")
async def get_canteen(canteen_id: int):
    for c in canteens:
        if c["id"] == canteen_id:
            return c
    raise HTTPException(404, "Canteen not found")

@app.get("/api/dishes/recommendations")
async def get_recommendations():
    top = sorted(dishes, key=lambda d: (d["rating"], d["is_new"]), reverse=True)[:3]
    return top

@app.get("/api/dishes")
async def get_all_dishes():
    return dishes

@app.get("/api/dishes/search")
async def search_dishes(keyword: str = Query("")):
    kw = keyword.lower()
    return [d for d in dishes if kw in d["name"].lower() or kw in " ".join(d["tags"]).lower()]

@app.get("/api/dishes/suggestions")
async def suggest_dishes(keyword: str = Query("")):
    kw = keyword.lower()
    return [d for d in dishes if kw in d["name"].lower()][:5]

@app.get("/api/dishes/favorites")
async def get_favorites():
    fav_ids = user_favorites.get(1, set())
    return [d for d in dishes if d["id"] in fav_ids]

@app.get("/api/dishes/{dish_id}")
async def get_dish(dish_id: int):
    for d in dishes:
        if d["id"] == dish_id:
            return d
    raise HTTPException(404, "Dish not found")

@app.post("/api/dishes/{dish_id}/confirm")
async def confirm_dish(dish_id: int):
    for d in dishes:
        if d["id"] == dish_id:
            return {"success": True, "message": f"已确认 {d['name']}"}
    raise HTTPException(404, "Dish not found")

@app.post("/api/dishes/{dish_id}/toggle-sold-out")
async def toggle_sold_out(dish_id: int):
    for d in dishes:
        if d["id"] == dish_id:
            d["is_sold_out"] = not d["is_sold_out"]
            return {"success": True, "is_sold_out": d["is_sold_out"]}
    raise HTTPException(404, "Dish not found")

@app.post("/api/dishes")
async def contribute_dish(data: dict):
    global next_id
    new_id = next_id["dish"]
    next_id["dish"] += 1
    dish = {
        "id": new_id, "name": data.get("name", "新菜品"),
        "price": data.get("price", 0), "canteen_id": data.get("canteen_id", 1),
        "canteen_name": "风味餐厅", "image": data.get("image", ""),
        "calories": data.get("calories", 300), "protein": data.get("protein", 15),
        "fat": data.get("fat", 10), "carbs": data.get("carbs", 30),
        "rating": 0.0, "review_count": 0, "is_sold_out": False, "is_new": True,
        "tags": data.get("tags", ["新菜"]),
    }
    dishes.append(dish)
    return dish

@app.get("/api/reviews")
async def get_reviews(dish_id: int = Query(None)):
    if dish_id:
        return [r for r in reviews if r["dish_id"] == dish_id]
    return reviews

@app.post("/api/reviews")
async def create_review(data: ReviewCreate):
    global next_id
    new_id = next_id["review"]
    next_id["review"] += 1
    review = {
        "id": new_id, "dish_id": data.dish_id, "user": data.user,
        "rating": data.rating, "content": data.content,
        "image": data.image, "likes": 0,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    reviews.append(review)
    return review

@app.post("/api/reviews/{review_id}/like")
async def like_review(review_id: int):
    for r in reviews:
        if r["id"] == review_id:
            r["likes"] += 1
            return {"success": True, "likes": r["likes"]}
    raise HTTPException(404, "Review not found")

@app.get("/api/meal-logs/today")
async def get_today_logs():
    today = date.today().isoformat()
    return [l for l in meal_logs if l["created_at"].startswith(today)] or meal_logs

@app.post("/api/meal-logs")
async def add_meal_log(data: MealLogCreate):
    global next_id
    new_id = next_id["meal_log"]
    next_id["meal_log"] += 1
    log = {
        "id": new_id, "name": data.name,
        "calories": data.calories, "protein": data.protein,
        "fat": data.fat, "carbs": data.carbs,
        "type": data.type, "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    meal_logs.append(log)
    return log

@app.delete("/api/meal-logs/{log_id}")
async def delete_meal_log(log_id: int):
    for i, l in enumerate(meal_logs):
        if l["id"] == log_id:
            meal_logs.pop(i)
            return {"success": True}
    raise HTTPException(404, "Meal log not found")

@app.get("/api/user/profile")
async def get_profile():
    return user_profile

@app.post("/api/dishes/favorites")
async def add_favorite(data: dict):
    dish_id = data.get("dishId")
    user_favorites[1].add(dish_id)
    return {"success": True}

@app.delete("/api/dishes/favorites")
async def remove_favorite(data: dict):
    dish_id = data.get("dishId")
    user_favorites[1].discard(dish_id)
    return {"success": True}

@app.get("/api/health")
async def health():
    return {"status": "ok", "dishes": len(dishes), "reviews": len(reviews)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    print(f"Canteen API starting on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
