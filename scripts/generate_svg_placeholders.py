"""
SVG 占位图生成脚本
根据菜品数据生成带 emoji、标签、渐变背景的 SVG 图片
"""
import os
import json

# 颜色映射（按主标签）
COLOR_MAP = {
    "辣": {"start": "#FF6B6B", "end": "#EE5A5A"},
    "清淡": {"start": "#51CF66", "end": "#40C057"},
    "传统": {"start": "#FF922B", "end": "#FD7E14"},
    "人气": {"start": "#FF922B", "end": "#FD7E14"},
    "面食": {"start": "#FCC419", "end": "#F59F00"},
    "高蛋白": {"start": "#9775FA", "end": "#845EF7"},
    "低卡": {"start": "#22D3EE", "end": "#06B6D4"},
}

# 食物 emoji 映射
EMOJI_MAP = {
    "面食": "🍜",
    "米饭": "🍚",
    "包子": "🥟",
    "饺子": "🥟",
    "肉类": "🥩",
    "鱼": "🐟",
    "蔬菜": "🥬",
    "汤": "🍲",
    "炒菜": "🍳",
    "默认": "🍽️",
}

# 菜品数据
DISHES = [
    {"id": 1, "name": "麻辣香锅", "price": 18.0, "calories": 650, "tags": ["辣", "荤", "人气"], "type": "炒菜"},
    {"id": 2, "name": "番茄牛腩", "price": 15.0, "calories": 480, "tags": ["清淡", "荤", "高蛋白"], "type": "肉类"},
    {"id": 3, "name": "清炒时蔬", "price": 6.0, "calories": 120, "tags": ["清淡", "素", "低卡"], "type": "蔬菜"},
    {"id": 4, "name": "红烧肉", "price": 12.0, "calories": 550, "tags": ["荤", "传统"], "type": "肉类"},
    {"id": 5, "name": "牛肉面", "price": 14.0, "calories": 520, "tags": ["荤", "面食", "人气"], "type": "面食"},
    {"id": 6, "name": "酸菜鱼", "price": 16.0, "calories": 380, "tags": ["辣", "荤", "高蛋白"], "type": "鱼"},
    {"id": 7, "name": "铁板牛排饭", "price": 20.0, "calories": 680, "tags": ["荤", "人气", "高蛋白"], "type": "米饭"},
    {"id": 8, "name": "麻辣烫", "price": 15.0, "calories": 420, "tags": ["辣", "人气"], "type": "汤"},
    {"id": 9, "name": "蛋包饭", "price": 12.0, "calories": 480, "tags": ["传统"], "type": "米饭"},
    {"id": 10, "name": "石锅拌饭", "price": 14.0, "calories": 520, "tags": ["人气"], "type": "米饭"},
    {"id": 11, "name": "黄焖鸡米饭", "price": 13.0, "calories": 550, "tags": ["荤", "高蛋白", "人气"], "type": "米饭"},
    {"id": 12, "name": "水煮鱼", "price": 16.0, "calories": 380, "tags": ["辣", "荤", "高蛋白"], "type": "鱼"},
    {"id": 13, "name": "回锅肉", "price": 11.0, "calories": 520, "tags": ["辣", "荤", "传统"], "type": "肉类"},
    {"id": 14, "name": "糖醋里脊", "price": 12.0, "calories": 460, "tags": ["荤", "人气"], "type": "肉类"},
    {"id": 15, "name": "宫保鸡丁", "price": 10.0, "calories": 400, "tags": ["辣", "荤", "传统"], "type": "肉类"},
    {"id": 16, "name": "麻婆豆腐", "price": 6.0, "calories": 220, "tags": ["辣", "素", "低卡"], "type": "蔬菜"},
    {"id": 17, "name": "油焖大虾", "price": 15.0, "calories": 350, "tags": ["荤", "高蛋白", "人气"], "type": "肉类"},
    {"id": 18, "name": "蒜蓉西兰花", "price": 7.0, "calories": 120, "tags": ["清淡", "素", "低卡"], "type": "蔬菜"},
    {"id": 19, "name": "东坡肉", "price": 13.0, "calories": 580, "tags": ["荤", "传统", "人气"], "type": "肉类"},
    {"id": 20, "name": "番茄炒蛋", "price": 7.0, "calories": 250, "tags": ["清淡", "素", "传统"], "type": "蔬菜"},
    {"id": 21, "name": "红烧排骨", "price": 14.0, "calories": 500, "tags": ["荤", "高蛋白", "传统"], "type": "肉类"},
    {"id": 22, "name": "清蒸鲈鱼", "price": 16.0, "calories": 280, "tags": ["清淡", "荤", "高蛋白", "人气"], "type": "鱼"},
    {"id": 23, "name": "干锅花菜", "price": 9.0, "calories": 280, "tags": ["辣", "素"], "type": "蔬菜"},
    {"id": 24, "name": "葱油拌面", "price": 8.0, "calories": 420, "tags": ["清淡", "面食", "人气"], "type": "面食"},
    {"id": 25, "name": "小笼包", "price": 10.0, "calories": 320, "tags": ["传统", "人气"], "type": "包子"},
    {"id": 26, "name": "煎饺", "price": 9.0, "calories": 380, "tags": ["传统"], "type": "饺子"},
    {"id": 27, "name": "刀削面", "price": 11.0, "calories": 460, "tags": ["面食", "传统"], "type": "面食"},
    {"id": 28, "name": "炒河粉", "price": 10.0, "calories": 480, "tags": ["面食"], "type": "面食"},
    {"id": 29, "name": "馄饨", "price": 8.0, "calories": 280, "tags": ["清淡", "面食", "传统"], "type": "面食"},
    {"id": 30, "name": "锅贴", "price": 8.0, "calories": 340, "tags": ["人气", "传统"], "type": "饺子"},
    {"id": 31, "name": "凉皮", "price": 7.0, "calories": 200, "tags": ["清淡", "素", "低卡"], "type": "面食"},
    {"id": 32, "name": "蛋炒饭", "price": 9.0, "calories": 450, "tags": ["传统"], "type": "米饭"},
]

def get_color(tags):
    """根据标签获取渐变颜色"""
    for tag in tags:
        if tag in COLOR_MAP:
            return COLOR_MAP[tag]
    return {"start": "#868E96", "end": "#495057"}  # 默认灰色

def get_emoji(dish_type):
    """根据类型获取 emoji"""
    for key, emoji in EMOJI_MAP.items():
        if key in dish_type:
            return emoji
    return EMOJI_MAP["默认"]

def generate_svg(dish):
    """生成单个 SVG"""
    color = get_color(dish["tags"])
    emoji = get_emoji(dish["type"])
    tags_str = " · ".join(dish["tags"][:3])

    # 营养标签
    nutrition_tags = []
    if dish["calories"] < 300:
        nutrition_tags.append("低卡")
    nutrition_str = " · ".join(nutrition_tags) if nutrition_tags else ""

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color["start"]}"/>
      <stop offset="100%" style="stop-color:{color["end"]}"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="400" height="300" fill="url(#bg)" rx="16"/>

  <!-- 装饰圆 -->
  <circle cx="320" cy="60" r="80" fill="rgba(255,255,255,0.1)"/>
  <circle cx="80" cy="240" r="60" fill="rgba(255,255,255,0.08)"/>

  <!-- 食物 emoji -->
  <text x="200" y="100" text-anchor="middle" font-size="64">{emoji}</text>

  <!-- 菜品名称 -->
  <text x="200" y="165" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="white">{dish["name"]}</text>

  <!-- 价格和卡路里 -->
  <text x="200" y="195" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)">¥{dish["price"]} · {dish["calories"]}kcal</text>

  <!-- 标签背景 -->
  <rect x="100" y="215" width="200" height="28" rx="14" fill="rgba(255,255,255,0.2)"/>

  <!-- 标签文字 -->
  <text x="200" y="234" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="white">{tags_str}</text>

  <!-- 营养标签 -->
  {f'<text x="200" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="rgba(255,255,255,0.7)">{nutrition_str}</text>' if nutrition_str else ''}
</svg>'''

def main():
    output_dir = "frontend_react/public/images/dishes"
    os.makedirs(output_dir, exist_ok=True)

    # 文件名映射
    name_to_file = {
        "麻辣香锅": "malaxiangguo.svg",
        "番茄牛腩": "fanqieniuniu.svg",
        "清炒时蔬": "qingchaoshishu.svg",
        "红烧肉": "hongshaorou.svg",
        "牛肉面": "niuroumian.svg",
        "酸菜鱼": "suancaiyu.svg",
        "铁板牛排饭": "tieban.svg",
        "麻辣烫": "malat.svg",
        "蛋包饭": "danbaofan.svg",
        "石锅拌饭": "shiguo.svg",
        "黄焖鸡米饭": "huangmenji.svg",
        "水煮鱼": "shuizhuiyu.svg",
        "回锅肉": "huiguorou.svg",
        "糖醋里脊": "tangculiji.svg",
        "宫保鸡丁": "gongbaojiding.svg",
        "麻婆豆腐": "mapodoufu.svg",
        "油焖大虾": "youmendaxia.svg",
        "蒜蓉西兰花": "suanrongxilanhua.svg",
        "东坡肉": "dongporou.svg",
        "番茄炒蛋": "fanqiechaodan.svg",
        "红烧排骨": "hongshaopaigu.svg",
        "清蒸鲈鱼": "qingzhengluyu.svg",
        "干锅花菜": "ganguohuacai.svg",
        "葱油拌面": "congyoubanmian.svg",
        "小笼包": "xiaolongbao.svg",
        "煎饺": "jianjiao.svg",
        "刀削面": "daoxiaomian.svg",
        "炒河粉": "chaohefen.svg",
        "馄饨": "huntun.svg",
        "锅贴": "guotie.svg",
        "凉皮": "liangpi.svg",
        "蛋炒饭": "danchaofan.svg",
    }

    for dish in DISHES:
        filename = name_to_file.get(dish["name"], f"dish_{dish['id']}.svg")
        svg_content = generate_svg(dish)
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"Generated: {filename}")

    print(f"\nGenerated {len(DISHES)} SVG files in {output_dir}")

if __name__ == "__main__":
    main()
