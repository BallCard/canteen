"""
浙大食堂助手 — 内存数据层
所有数据集中管理，各路由通过 from . import data 访问
"""

# ============ 食堂 ============
canteens = [
    {"id": 1, "name": "风味餐厅", "location": "紫金港校区西区", "hours": "06:30-21:00", "image": "/images/canteens/fengwei.jpg", "rating": 4.2},
    {"id": 2, "name": "大食堂", "location": "紫金港校区东区", "hours": "06:30-20:30", "image": "/images/canteens/dashitang.jpg", "rating": 4.0},
    {"id": 3, "name": "麦香园", "location": "紫金港校区北区", "hours": "06:30-21:30", "image": "/images/canteens/maixiangyuan.jpg", "rating": 4.5},
]

# ============ 菜品 ============
dishes = [
    {"id": 1, "name": "麻辣香锅", "price": 18.0, "canteen_id": 1, "canteen_name": "风味餐厅", "image": "/images/dishes/malaxiangguo.jpg", "calories": 650, "protein": 25.0, "fat": 35.0, "carbs": 55.0, "rating": 4.5, "review_count": 28, "is_sold_out": False, "is_new": False, "tags": ["辣", "荤", "人气"]},
    {"id": 2, "name": "番茄牛腩", "price": 15.0, "canteen_id": 1, "canteen_name": "风味餐厅", "image": "/images/dishes/fanqieqiuniu.jpg", "calories": 480, "protein": 30.0, "fat": 18.0, "carbs": 45.0, "rating": 4.3, "review_count": 22, "is_sold_out": False, "is_new": False, "tags": ["清淡", "荤", "高蛋白"]},
    {"id": 3, "name": "清炒时蔬", "price": 6.0, "canteen_id": 2, "canteen_name": "大食堂", "image": "/images/dishes/qingchaoshishu.jpg", "calories": 120, "protein": 5.0, "fat": 3.0, "carbs": 20.0, "rating": 4.0, "review_count": 15, "is_sold_out": False, "is_new": False, "tags": ["清淡", "素", "低卡"]},
    {"id": 4, "name": "红烧肉", "price": 12.0, "canteen_id": 2, "canteen_name": "大食堂", "image": "/images/dishes/hongshaorou.jpg", "calories": 550, "protein": 22.0, "fat": 40.0, "carbs": 15.0, "rating": 4.1, "review_count": 18, "is_sold_out": False, "is_new": False, "tags": ["荤", "传统"]},
    {"id": 5, "name": "牛肉面", "price": 14.0, "canteen_id": 3, "canteen_name": "麦香园", "image": "/images/dishes/niuroumian.jpg", "calories": 520, "protein": 28.0, "fat": 15.0, "carbs": 65.0, "rating": 4.6, "review_count": 35, "is_sold_out": False, "is_new": False, "tags": ["荤", "面食", "人气"]},
    {"id": 6, "name": "酸菜鱼", "price": 16.0, "canteen_id": 3, "canteen_name": "麦香园", "image": "/images/dishes/suancaiyu.jpg", "calories": 380, "protein": 32.0, "fat": 12.0, "carbs": 25.0, "rating": 4.4, "review_count": 20, "is_sold_out": False, "is_new": True, "tags": ["辣", "荤", "高蛋白", "新菜"]},
]

# ============ 点评 ============
reviews = [
    {"id": 1, "dish_id": 1, "user": "小李", "rating": 5.0, "content": "超级好吃，麻辣够味！", "image": None, "likes": 12, "created_at": "2026-04-28 12:30"},
    {"id": 2, "dish_id": 5, "user": "小王", "rating": 4.5, "content": "牛肉很大块，汤底浓郁", "image": None, "likes": 8, "created_at": "2026-04-28 11:45"},
    {"id": 3, "dish_id": 2, "user": "小张", "rating": 4.0, "content": "番茄味很浓，牛肉软烂", "image": None, "likes": 5, "created_at": "2026-04-27 18:20"},
]

# ============ 饮食记录 ============
meal_logs = [
    {"id": 1, "name": "麻辣香锅", "calories": 650, "protein": 25.0, "fat": 35.0, "carbs": 55.0, "type": "午餐", "created_at": "2026-04-29 12:00"},
    {"id": 2, "name": "清炒时蔬", "calories": 120, "protein": 5.0, "fat": 3.0, "carbs": 20.0, "type": "晚餐", "created_at": "2026-04-29 18:00"},
]

# ============ 用户 ============
user_favorites = {1: {1, 5}}
user_profile = {
    "name": "浙大同学", "avatar": "/images/avatar/default.png", "preference": "辣",
    "goal": "增肌", "calorie_target": 2000, "logged_days": 15,
}

# ============ ID 生成器 ============
next_id = {"dish": 7, "review": 4, "meal_log": 3}


def get_next_id(key: str) -> int:
    """获取自增 ID"""
    global next_id
    nid = next_id[key]
    next_id[key] += 1
    return nid
