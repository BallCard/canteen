#!/usr/bin/env python3
"""
批量生成菜品实体图片
"""
import asyncio
import os
import requests
from coze_coding_dev_sdk import ImageGenerationClient

# 菜品配置：名称 -> 生成提示词
DISHES = [
    ("malaxiangguo", "A delicious Chinese malaxiangguo (spicy stir-fried pot) with assorted vegetables, tofu, lotus root, and meat in a dark red spicy sauce, top-down view, food photography, appetizing, warm lighting, high detail"),
    ("fanqieniuniu", "Stewed beef brisket with tomatoes, Chinese style, tender meat in rich tomato sauce, garnished with cilantro, food photography, top-down view, appetizing, bright colors"),
    ("qingchaoshishu", "Stir-fried seasonal vegetables, bright green bok choy and broccoli, light seasoning, food photography, top-down view, fresh and healthy"),
    ("hongshaorou", "Classic Chinese braised pork belly, glossy dark sauce coating, garnished with green onions, food photography, top-down view, appetizing, rich color"),
    ("niuroumian", "Beef noodle soup with thick hand-pulled noodles, large chunks of tender beef, scallions, and bok choy in rich beef broth, food photography, side view, appetizing"),
    ("suancaiyu", "Sliced fish in pickled cabbage and chili broth, white fish slices floating in spicy sour soup with vegetables, food photography, top-down view, appetizing"),
    ("tieban", "Sizzling iron plate steak rice, juicy beef steak on fried rice with sunny-side-up egg and vegetables, steam rising, food photography, top-down view"),
    ("malat", "Chinese malatong (spicy hot pot soup base) with various ingredients like tofu, vegetables, and meat skewers in red spicy broth, food photography, top-down view, appetizing"),
    ("danbaofan", "Japanese-style omurice (egg rice) with creamy golden egg covering savory fried rice, topped with ketchup, food photography, top-down view"),
    ("shiguo", "Korean bibimbap in a stone pot, colorful vegetables arranged on rice with gochujang sauce, steam rising, food photography, top-down view"),
    ("huangmenji", "Chinese braised chicken rice, tender braised chicken pieces with rice in dark sauce, food photography, top-down view, appetizing"),
    ("shuizhuiyu", "Spicy boiled fish (shuizhu yu) in red chili oil, tender white fish slices with vegetables, food photography, top-down view, appetizing"),
    ("huiguorou", "Twice-cooked pork (huiguorou) with leeks and peppers in dark sauce, food photography, top-down view, appetizing"),
    ("tangculiji", "Sweet and sour pork tenderloin, crispy coating with glossy sauce, food photography, top-down view"),
    ("gongbaojiding", "Kung pao chicken with peanuts, dried chilies, and scallions in savory sauce, food photography, top-down view"),
    ("mapodoufu", "Mapo tofu with ground pork in spicy Sichuan sauce, silken tofu in red chili oil, food photography, top-down view, appetizing"),
    ("youmendaxia", "Pan-fried large shrimp in oil, golden crispy exterior, food photography, top-down view, appetizing"),
    ("suanrongxilanhua", "Garlic stir-fried broccoli, bright green florets, food photography, top-down view, fresh and healthy"),
    ("dongporou", "Dongpo pork, braised pork belly in brown sauce, traditional Chinese style, food photography, top-down view"),
    ("fanqiechaodan", "Scrambled eggs with tomatoes, fluffy yellow eggs with red tomato sauce, food photography, top-down view"),
    ("hongshaopaigu", "Braised pork ribs in dark soy sauce, tender meat on bones, food photography, top-down view, appetizing"),
    ("qingzhengluyu", "Steamed sea bass, fresh fish with ginger and scallions, translucent white flesh, food photography, top-down view"),
    ("ganguohuacai", "Dry-fried cauliflower with peppers and meat, golden crispy exterior, food photography, top-down view"),
    ("congyoubanmian", "Scallion oil noodles, thick noodles tossed in fragrant scallion oil, garnished with scallions, food photography, side view"),
    ("xiaolongbao", "Shanghai xiaolongbao (soup dumplings), translucent dumplings in bamboo steamer, food photography, top-down view"),
    ("jianjiao", "Pan-fried dumplings with crispy bottom, golden brown, food photography, top-down view"),
    ("daoxiaomian", "Hand-cut knife noodles in clear broth with vegetables, food photography, side view, appetizing"),
    ("chaohefen", "Stir-fried rice noodles with vegetables, Chinese style, food photography, top-down view"),
    ("huntun", "Wonton soup with shrimp wonton, clear broth with greens, food photography, top-down view"),
    ("guotie", "Pan-fried potstickers with crispy bottom, golden brown, food photography, top-down view"),
    ("liangpi", "Cold skin noodles in spicy sauce, rice noodles with cucumber and bean sprouts, food photography, top-down view"),
    ("danchaofan", "Egg fried rice with green onions, fluffy grains, food photography, top-down view"),
]

OUTPUT_DIR = "/workspace/projects/frontend_react/public/images/dishes"


async def generate_dish_image(dish_id: str, prompt: str):
    """生成单个菜品图片"""
    client = ImageGenerationClient()
    output_path = os.path.join(OUTPUT_DIR, f"{dish_id}.png")

    # 跳过已存在的图片
    if os.path.exists(output_path):
        print(f"Skipping {dish_id} - already exists")
        return dish_id, None

    try:
        response = await client.generate_async(
            prompt=prompt,
            size="2K"
        )

        if response.success:
            # 下载图片
            img_data = requests.get(response.image_urls[0]).content
            with open(output_path, 'wb') as f:
                f.write(img_data)
            print(f"Generated: {dish_id}")
            return dish_id, response.image_urls[0]
        else:
            print(f"Failed: {dish_id} - {response.error_messages}")
            return dish_id, None
    except Exception as e:
        print(f"Error: {dish_id} - {e}")
        return dish_id, None


async def main():
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 并发生成（限制并发数）
    semaphore = asyncio.Semaphore(3)

    async def limited_generate(dish_id, prompt):
        async with semaphore:
            return await generate_dish_image(dish_id, prompt)

    tasks = [limited_generate(dish_id, prompt) for dish_id, prompt in DISHES]
    results = await asyncio.gather(*tasks)

    # 输出结果
    print("\n=== 生成结果 ===")
    success_count = sum(1 for _, url in results if url)
    print(f"成功: {success_count}/{len(results)}")

    # 更新 data.py 的映射
    print("\n=== 建议的图片路径更新 ===")
    for dish_id, url in results:
        if url:
            print(f'"{dish_id}": "/images/dishes/{dish_id}.png",')


if __name__ == "__main__":
    asyncio.run(main())
