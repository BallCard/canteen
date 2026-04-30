"""
浙大食堂助手 — FastAPI 后端入口
"""
import uvicorn
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import canteens, dishes, reviews, meal_logs, users, recommendations

app = FastAPI(
    title="浙大食堂助手 API",
    description="面向浙大学生的食堂智能助手",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(canteens.router)
app.include_router(dishes.router)
app.include_router(reviews.router)
app.include_router(meal_logs.router)
app.include_router(users.router)
app.include_router(recommendations.router)


@app.get("/api/health")
async def health():
    """健康检查"""
    from . import data
    return {"status": "ok", "dishes": len(data.dishes), "reviews": len(data.reviews)}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    print(f"🍽️  浙大食堂助手 API starting on port {port}")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
