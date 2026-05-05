"""
校园食堂助手 — 内存数据层
所有数据集中管理，各路由通过 from . import data 访问
"""

# ============ 食堂 ============
canteens = [
    {"id": 1, "name": "一食堂", "location": "校区西区", "distance": "300m", "status": "营业中", "hours": "06:30-21:00", "opening_hours": "06:30-21:00", "busy_level": "平稳", "image": "/images/canteens/fengwei.svg", "rating": 4.2},
    {"id": 2, "name": "二食堂", "location": "校区东区", "distance": "650m", "status": "营业中", "hours": "06:30-20:30", "opening_hours": "06:30-20:30", "busy_level": "拥挤", "image": "/images/canteens/dashitang.svg", "rating": 4.0},
    {"id": 3, "name": "三食堂", "location": "校区北区", "distance": "900m", "status": "营业中", "hours": "06:30-21:30", "opening_hours": "06:30-21:30", "busy_level": "平稳", "image": "/images/canteens/maixiangyuan.svg", "rating": 4.5},
]

# ============ 菜品 ============
dishes = [
    {"id": 1, "name": "麻辣香锅", "price": 18.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/malaxiangguo-ai.png", "calories": 650, "protein": 25.0, "fat": 35.0, "carbs": 55.0, "rating": 4.5, "review_count": 28, "is_sold_out": False, "is_new": False, "tags": ["辣", "荤", "人气"], "description": "精选新鲜食材,麻辣鲜香,是一食堂的招牌菜品。采用秘制底料,辣而不燥,香而不腻,深受同学们喜爱。", "is_official": True},
    {"id": 2, "name": "番茄牛腩", "price": 15.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/fanqieniuniu-ai.png", "calories": 480, "protein": 30.0, "fat": 18.0, "carbs": 45.0, "rating": 4.3, "review_count": 22, "is_sold_out": False, "is_new": False, "tags": ["清淡", "荤", "高蛋白"], "description": "选用优质牛腩,搭配新鲜番茄慢炖而成。汤汁浓郁,牛肉软烂入味,酸甜开胃,营养丰富。", "is_official": True},
    {"id": 3, "name": "清炒时蔬", "price": 6.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/qingchaoshishu-ai.png", "calories": 120, "protein": 5.0, "fat": 3.0, "carbs": 20.0, "rating": 4.0, "review_count": 15, "is_sold_out": False, "is_new": False, "tags": ["清淡", "素", "低卡"], "description": "当季新鲜蔬菜,清炒保留原味。低卡高纤,是减脂期的理想选择。", "is_official": True},
    {"id": 4, "name": "红烧肉", "price": 12.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/hongshaorou-ai.png", "calories": 550, "protein": 22.0, "fat": 40.0, "carbs": 15.0, "rating": 4.1, "review_count": 18, "is_sold_out": False, "is_new": False, "tags": ["荤", "传统"], "description": "传统浙江做法,肥而不腻,入口即化。色泽红亮,香气扑鼻,是经典的家常味道。", "is_official": True},
    {"id": 5, "name": "牛肉面", "price": 14.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/niuroumian-ai.png", "calories": 520, "protein": 28.0, "fat": 15.0, "carbs": 65.0, "rating": 4.6, "review_count": 35, "is_sold_out": False, "is_new": False, "tags": ["荤", "面食", "人气"], "description": "大块牛肉配劲道面条,汤底浓郁鲜香。分量十足,是三食堂的人气王。", "is_official": True},
    {"id": 6, "name": "酸菜鱼", "price": 16.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/suancaiyu-ai.png", "calories": 380, "protein": 32.0, "fat": 12.0, "carbs": 25.0, "rating": 4.4, "review_count": 20, "is_sold_out": False, "is_new": True, "tags": ["辣", "荤", "高蛋白", "新菜"]},
    {"id": 7, "name": "铁板牛排饭", "price": 20.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/tieban.svg", "calories": 680, "protein": 35.0, "fat": 28.0, "carbs": 65.0, "rating": 4.6, "review_count": 42, "is_sold_out": False, "is_new": False, "tags": ["荤", "人气", "高蛋白"]},
    {"id": 8, "name": "麻辣烫", "price": 15.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/malat.svg", "calories": 420, "protein": 18.0, "fat": 22.0, "carbs": 35.0, "rating": 4.4, "review_count": 36, "is_sold_out": False, "is_new": False, "tags": ["辣", "人气"]},
    {"id": 9, "name": "蛋包饭", "price": 12.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/danbaofan.svg", "calories": 480, "protein": 20.0, "fat": 18.0, "carbs": 55.0, "rating": 4.2, "review_count": 25, "is_sold_out": False, "is_new": False, "tags": ["传统"]},
    {"id": 10, "name": "石锅拌饭", "price": 14.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/shiguo.svg", "calories": 520, "protein": 22.0, "fat": 20.0, "carbs": 58.0, "rating": 4.3, "review_count": 30, "is_sold_out": False, "is_new": True, "tags": ["人气", "新菜"]},
    {"id": 11, "name": "黄焖鸡米饭", "price": 13.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/huangmenji.svg", "calories": 550, "protein": 28.0, "fat": 20.0, "carbs": 58.0, "rating": 4.5, "review_count": 38, "is_sold_out": False, "is_new": False, "tags": ["荤", "高蛋白", "人气"]},
    {"id": 12, "name": "水煮鱼", "price": 16.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/shuizhuiyu.svg", "calories": 380, "protein": 30.0, "fat": 18.0, "carbs": 15.0, "rating": 4.4, "review_count": 28, "is_sold_out": False, "is_new": False, "tags": ["辣", "荤", "高蛋白"]},
    {"id": 13, "name": "回锅肉", "price": 11.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/huiguorou.svg", "calories": 520, "protein": 22.0, "fat": 35.0, "carbs": 20.0, "rating": 4.1, "review_count": 20, "is_sold_out": False, "is_new": False, "tags": ["辣", "荤", "传统"]},
    {"id": 14, "name": "糖醋里脊", "price": 12.0, "canteen_id": 1, "canteen_name": "一食堂", "image": "/images/dishes/tangculiji.svg", "calories": 460, "protein": 24.0, "fat": 22.0, "carbs": 40.0, "rating": 4.5, "review_count": 33, "is_sold_out": False, "is_new": False, "tags": ["荤", "人气"]},
    {"id": 15, "name": "宫保鸡丁", "price": 10.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/gongbaojiding.svg", "calories": 400, "protein": 24.0, "fat": 18.0, "carbs": 30.0, "rating": 4.3, "review_count": 26, "is_sold_out": False, "is_new": False, "tags": ["辣", "荤", "传统"]},
    {"id": 16, "name": "麻婆豆腐", "price": 6.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/mapodoufu.svg", "calories": 220, "protein": 12.0, "fat": 10.0, "carbs": 18.0, "rating": 4.2, "review_count": 22, "is_sold_out": False, "is_new": False, "tags": ["辣", "素", "低卡"]},
    {"id": 17, "name": "油焖大虾", "price": 15.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/youmendaxia.svg", "calories": 350, "protein": 28.0, "fat": 15.0, "carbs": 10.0, "rating": 4.4, "review_count": 30, "is_sold_out": False, "is_new": False, "tags": ["荤", "高蛋白", "人气"]},
    {"id": 18, "name": "蒜蓉西兰花", "price": 7.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/suanrongxilanhua.svg", "calories": 120, "protein": 6.0, "fat": 4.0, "carbs": 14.0, "rating": 4.0, "review_count": 16, "is_sold_out": False, "is_new": False, "tags": ["清淡", "素", "低卡"]},
    {"id": 19, "name": "东坡肉", "price": 13.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/dongporou.svg", "calories": 580, "protein": 20.0, "fat": 45.0, "carbs": 12.0, "rating": 4.5, "review_count": 35, "is_sold_out": False, "is_new": False, "tags": ["荤", "传统", "人气"]},
    {"id": 20, "name": "番茄炒蛋", "price": 7.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/fanqiechaodan.svg", "calories": 250, "protein": 14.0, "fat": 12.0, "carbs": 20.0, "rating": 4.1, "review_count": 20, "is_sold_out": False, "is_new": False, "tags": ["清淡", "素", "传统"]},
    {"id": 21, "name": "红烧排骨", "price": 14.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/hongshaopaigu.svg", "calories": 500, "protein": 26.0, "fat": 30.0, "carbs": 25.0, "rating": 4.3, "review_count": 28, "is_sold_out": False, "is_new": False, "tags": ["荤", "高蛋白", "传统"]},
    {"id": 22, "name": "清蒸鲈鱼", "price": 16.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/qingzhengluyu.svg", "calories": 280, "protein": 32.0, "fat": 8.0, "carbs": 5.0, "rating": 4.6, "review_count": 32, "is_sold_out": False, "is_new": False, "tags": ["清淡", "荤", "高蛋白", "人气"]},
    {"id": 23, "name": "干锅花菜", "price": 9.0, "canteen_id": 2, "canteen_name": "二食堂", "image": "/images/dishes/ganguohuacai.svg", "calories": 280, "protein": 10.0, "fat": 16.0, "carbs": 22.0, "rating": 4.2, "review_count": 24, "is_sold_out": False, "is_new": False, "tags": ["辣", "素"]},
    {"id": 24, "name": "葱油拌面", "price": 8.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/congyoubanmian.svg", "calories": 420, "protein": 12.0, "fat": 15.0, "carbs": 60.0, "rating": 4.4, "review_count": 30, "is_sold_out": False, "is_new": False, "tags": ["清淡", "面食", "人气"]},
    {"id": 25, "name": "小笼包(8只)", "price": 10.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/xiaolongbao.svg", "calories": 320, "protein": 18.0, "fat": 14.0, "carbs": 30.0, "rating": 4.5, "review_count": 38, "is_sold_out": False, "is_new": False, "tags": ["传统", "人气"]},
    {"id": 26, "name": "煎饺(10只)", "price": 9.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/jianjiao.svg", "calories": 380, "protein": 16.0, "fat": 20.0, "carbs": 35.0, "rating": 4.3, "review_count": 28, "is_sold_out": False, "is_new": False, "tags": ["传统"]},
    {"id": 27, "name": "刀削面", "price": 11.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/daoxiaomian.svg", "calories": 460, "protein": 16.0, "fat": 12.0, "carbs": 68.0, "rating": 4.2, "review_count": 22, "is_sold_out": False, "is_new": False, "tags": ["面食", "传统"]},
    {"id": 28, "name": "炒河粉", "price": 10.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/chaohefen.svg", "calories": 480, "protein": 14.0, "fat": 18.0, "carbs": 62.0, "rating": 4.1, "review_count": 20, "is_sold_out": False, "is_new": False, "tags": ["面食"]},
    {"id": 29, "name": "馄饨", "price": 8.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/huntun.svg", "calories": 280, "protein": 14.0, "fat": 10.0, "carbs": 32.0, "rating": 4.3, "review_count": 26, "is_sold_out": False, "is_new": False, "tags": ["清淡", "面食", "传统"]},
    {"id": 30, "name": "锅贴(6只)", "price": 8.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/guotie.svg", "calories": 340, "protein": 14.0, "fat": 18.0, "carbs": 30.0, "rating": 4.4, "review_count": 32, "is_sold_out": False, "is_new": False, "tags": ["人气", "传统"]},
    {"id": 31, "name": "凉皮", "price": 7.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/liangpi.svg", "calories": 200, "protein": 6.0, "fat": 5.0, "carbs": 35.0, "rating": 4.0, "review_count": 18, "is_sold_out": False, "is_new": True, "tags": ["清淡", "素", "低卡", "新菜"]},
    {"id": 32, "name": "蛋炒饭", "price": 9.0, "canteen_id": 3, "canteen_name": "三食堂", "image": "/images/dishes/danchaofan.svg", "calories": 450, "protein": 16.0, "fat": 15.0, "carbs": 58.0, "rating": 4.1, "review_count": 20, "is_sold_out": False, "is_new": False, "tags": ["传统"]},
]

# ============ 点评 ============
reviews = [
    {"id": 1, "dish_id": 1, "user": "小李", "rating": 5.0, "content": "超级好吃，麻辣够味！", "image": None, "likes": 12, "created_at": "2026-04-28 12:30"},
    {"id": 2, "dish_id": 5, "user": "小王", "rating": 4.5, "content": "牛肉很大块，汤底浓郁", "image": None, "likes": 8, "created_at": "2026-04-28 11:45"},
    {"id": 3, "dish_id": 2, "user": "小张", "rating": 4.0, "content": "番茄味很浓，牛肉软烂", "image": None, "likes": 5, "created_at": "2026-04-27 18:20"},
    {"id": 4, "dish_id": 1, "user": "校园吃货", "rating": 5.0, "content": "一食堂的招牌菜，每次必点！辣度刚好，食材新鲜，性价比超高。", "image": None, "likes": 15, "created_at": "2026-04-29 13:15"},
    {"id": 5, "dish_id": 1, "user": "减脂小能手", "rating": 4.0, "content": "虽然在减脂但还是忍不住吃了，味道确实不错，就是有点油。", "image": None, "likes": 6, "created_at": "2026-04-29 12:50"},
    {"id": 6, "dish_id": 5, "user": "面食爱好者", "rating": 5.0, "content": "麦香园的牛肉面是我吃过最好吃的！面条劲道，牛肉给的很足，汤底也很香。", "image": None, "likes": 20, "created_at": "2026-04-29 11:30"},
    {"id": 7, "dish_id": 5, "user": "北方同学", "rating": 4.5, "content": "作为北方人，这个牛肉面做得很地道，分量也够大，推荐！", "image": None, "likes": 10, "created_at": "2026-04-28 19:20"},
    {"id": 8, "dish_id": 2, "user": "健身达人", "rating": 4.5, "content": "高蛋白低脂，增肌期的好选择。番茄酸甜开胃，牛肉炖得很烂。", "image": None, "likes": 12, "created_at": "2026-04-29 12:00"},
]

# ============ 饮食记录 ============
meal_logs = [
    {"id": 1, "name": "麻辣香锅", "calories": 650, "protein": 25.0, "fat": 35.0, "carbs": 55.0, "type": "午餐", "created_at": "2026-04-29 12:00"},
    {"id": 2, "name": "清炒时蔬", "calories": 120, "protein": 5.0, "fat": 3.0, "carbs": 20.0, "type": "晚餐", "created_at": "2026-04-29 18:00"},
]

# ============ 用户 ============
user_favorites = {1: {1, 5}}
user_profile = {
    "name": "校园用户",
    "nickname": "校园用户",
    "avatar": "/images/avatar/default.png",
    "points": 120,
    "rank": 25,
    "preference": "少油、高蛋白",
    "goal": "均衡",
    "calorie_target": 2000,
    "logged_days": 15,
    "memory_enabled": True,
    "tastes": ["少油", "高蛋白"],
    "budget": "15元以内",
    "lunch_time": "12:10",
    "avoid": "无",
    "connected_apps": ["QQ 群", "日历", "运动 App"],
    "goals": {"calories": 2000, "protein": 80, "fat": 65, "carbs": 280},
}

# ============ ID 生成器 ============
next_id = {"dish": 33, "review": 9, "meal_log": 3}


def get_next_id(key: str) -> int:
    """获取自增 ID"""
    global next_id
    nid = next_id[key]
    next_id[key] += 1
    return nid
