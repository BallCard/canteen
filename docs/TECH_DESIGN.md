# 浙大食堂助手 — 技术设计文档

## 1. 项目概述

### 1.1 产品目标
面向浙江大学紫金港校区学生的食堂智能助手，解决"今天吃什么"的决策疲劳，提供营养追踪、AI推荐、UGC点评功能。

### 1.2 参赛赛道
腾讯 PCG AI 大赛 — **开放赛道**  
作品名：**浙大食堂助手**  
Demo 形态：**Web SPA（单页应用）**（比赛要求"浏览器中直接打开体验"）

### 1.3 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **前端** | HTML5 + CSS3 + Vanilla JS | Web Demo SPA，零构建工具，直接浏览器运行 |
| **后端** | Python 3.9+ / FastAPI | RESTful API 服务 |
| **数据层** | 内存数据结构（Demo 阶段） | 无需数据库，快速可演示 |
| **AI 能力** | 腾讯混元大模型 API | 智能推荐理由生成、营养分析 |
| **部署** | 腾讯云轻量应用服务器 / localhost | 开发期 localhost，提交前部署 |

---

## 2. 架构总览

```
┌─────────────────────────────────────────────────────┐
│                   浏览器 (Web SPA)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ 首页/菜单 │ │ AI推荐页 │ │ 营养追踪/个人中心     │ │
│  └────┬─────┘ └────┬─────┘ └──────────┬───────────┘ │
│       └────────────┴──────────────────┘              │
│                       │ HTTP Fetch                    │
│                  ┌────┴─────┐                         │
│                  │ api.js   │  API 客户端封装          │
│                  └────┬─────┘                         │
└───────────────────────┼─────────────────────────────┘
                        │ CORS
┌───────────────────────┼─────────────────────────────┐
│                  ┌────┴─────┐                        │
│                  │ FastAPI  │  RESTful API 服务       │
│                  └────┬─────┘                        │
│          ┌────────────┼────────────┐                  │
│          ▼            ▼            ▼                  │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│    │ 食堂/菜品 │ │ AI推荐   │ │ 营养/点评 │           │
│    │ API 模块  │ │ 服务模块  │ │ API 模块  │           │
│    └──────────┘ └──────────┘ └──────────┘           │
│          │            │            │                  │
│          └────────────┼────────────┘                  │
│                       ▼                               │
│              ┌──────────────┐                         │
│              │ 内存数据层    │   (Demo 阶段)           │
│              │ (In-Memory)  │                         │
│              └──────────────┘                         │
└─────────────────────────────────────────────────────┘
```

### 架构原则
- **分层清晰**：路由 → 服务 → 数据，单向依赖
- **Demo 优先**：零外部依赖（无 PostgreSQL/Redis），单命令启动
- **渐进增强**：后续可无缝接入腾讯云 COS/混元 API/PostgreSQL

---

## 3. 目录结构

```
tencent_pcg_canteen/
├── backend/                      # FastAPI 后端
│   ├── main.py                   # 应用入口、中间件、路由注册
│   ├── models.py                 # Pydantic 模型 (请求/响应)
│   ├── data.py                   # 内存数据层 (食堂/菜品/点评等)
│   ├── routers/                  # API 路由模块
│   │   ├── __init__.py
│   │   ├── canteens.py           # 食堂相关 API
│   │   ├── dishes.py             # 菜品相关 API
│   │   ├── recommendations.py    # AI 推荐 API
│   │   ├── meal_logs.py          # 饮食记录 API
│   │   ├── reviews.py            # 点评相关 API
│   │   └── users.py              # 用户相关 API
│   ├── services/                 # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── recommendation.py     # 推荐算法
│   │   ├── nutrition.py          # 营养计算
│   │   └── tencent_ai.py         # 腾讯混元 API 封装
│   └── requirements.txt          # Python 依赖
├── frontend/                     # Web 前端 SPA
│   ├── index.html                # 入口页面
│   ├── css/
│   │   └── style.css             # 全局样式
│   ├── js/
│   │   ├── app.js                # 应用初始化、路由切换
│   │   ├── api.js                # API 请求封装
│   │   ├── pages/                # 各页面逻辑
│   │   │   ├── home.js           # 首页
│   │   │   ├── menu.js           # 菜单页
│   │   │   ├── dish-detail.js    # 菜品详情
│   │   │   ├── recommend.js      # AI 推荐页
│   │   │   ├── nutrition.js      # 营养追踪
│   │   │   └── profile.js        # 个人中心
│   │   └── components/           # 可复用组件
│   │       ├── dish-card.js      # 菜品卡片
│   │       ├── tab-bar.js        # 底部导航栏
│   │       └── nutrition-bar.js  # 营养进度条
│   └── images/                   # 静态图片资源
│       ├── dishes/               # 菜品图片占位
│       ├── icons/                # Tab 图标
│       └── avatar/               # 用户头像占位
├── docs/                         # 文档
│   ├── PRD.md                    # 产品需求文档
│   ├── TECH_DESIGN.md            # 本文件 — 技术设计文档
│   ├── GA_BACKEND_TASK.md        # GA 后端任务（已废弃）
│   ├── GEMINI_FRONTEND_PROMPT.md # GA 前端任务（已废弃）
│   └── QQ_MINIPROGRAM_SETUP.md   # QQ 小程序配置指南
├── task_router.py                # GA 任务路由工具
├── _test_router.py               # 路由测试
└── 腾讯PCG_AI大赛_官方说明.md     # 比赛官方说明
```

---

## 4. 后端设计

### 4.1 API 接口清单

| 方法 | 路径 | 功能 | 优先级 |
|------|------|------|--------|
| GET | `/api/canteens` | 获取食堂列表 | P0 |
| GET | `/api/canteens/{id}` | 食堂详情 | P0 |
| GET | `/api/dishes` | 菜品列表（支持 canteen_id 筛选） | P0 |
| GET | `/api/dishes/search?keyword=` | 搜索菜品 | P0 |
| GET | `/api/dishes/{id}` | 菜品详情 | P0 |
| GET | `/api/dishes/recommendations` | 今日推荐（Top 3） | P0 |
| POST | `/api/recommendations/ai` | AI 智能推荐（带偏好） | P0 |
| GET | `/api/reviews?dish_id=` | 获取菜品点评 | P1 |
| POST | `/api/reviews` | 提交点评 | P1 |
| GET | `/api/meal-logs/today` | 今日饮食记录 | P1 |
| POST | `/api/meal-logs` | 添加饮食记录 | P1 |
| GET | `/api/meal-logs/weekly` | 周报统计 | P1 |
| GET | `/api/user/profile` | 用户信息 | P2 |
| PUT | `/api/user/preferences` | 更新偏好 | P2 |
| GET | `/api/health` | 健康检查 | — |

### 4.2 数据模型（内存）

**Canteen**
```python
{
    id, name, location, hours, image, rating
}
```

**Dish**
```python
{
    id, name, price, canteen_id, canteen_name, image,
    calories, protein, fat, carbs,
    rating, review_count, is_sold_out, is_new, tags
}
```

**Review**
```python
{
    id, dish_id, user, rating, content, image, likes, created_at
}
```

**MealLog**
```python
{
    id, name, calories, protein, fat, carbs, type, created_at
}
```

### 4.3 AI 推荐算法

```
输入: user_preference(口味/忌口) + nutrition_goal(减脂/增肌/均衡)
                 ↓
        1. 过滤：排除不喜欢的食材/品类
        2. 打分：口味匹配(40%) + 营养匹配(60%)
        3. Top 3 + 多样性约束
        4. 调用腾讯混元 API 生成推荐理由
                 ↓
输出: [{dish, reason, match_score}]
```

---

## 5. 前端设计

### 5.1 页面路由

| 路由 | 页面 | 底部 Tab |
|------|------|----------|
| `#/` | 首页（食堂列表 + 今日推荐轮播） | ✅ 首页 |
| `#/menu?canteen_id=` | 菜单页（菜品网格 + 搜索筛选） | ❌ |
| `#/dish/:id` | 菜品详情（营养 + 点评） | ❌ |
| `#/recommend` | AI 推荐（偏好输入 + 结果） | ✅ 推荐 |
| `#/nutrition` | 营养追踪（今日摄入 + 记录） | ✅ 追踪 |
| `#/profile` | 个人中心（偏好设置 + 积分） | ✅ 我的 |

### 5.2 组件树

```
App
├── TabBar (底部导航)
├── Page: Home
│   ├── RecommendCarousel (推荐轮播)
│   └── CanteenList (食堂列表)
├── Page: Menu
│   ├── SearchBar (搜索)
│   ├── FilterBar (筛选)
│   └── DishGrid (菜品网格)
├── Page: DishDetail
│   ├── ImageGallery (图片轮播)
│   ├── NutritionInfo (营养信息)
│   └── ReviewList (点评列表)
├── Page: Recommend
│   ├── PreferenceForm (偏好表单)
│   └── RecommendResult (推荐结果)
└── Page: Nutrition
    ├── DailySummary (今日摄入概览)
    ├── MealTimeline (饮食时间线)
    └── WeeklyReport (周报)
```

---

## 6. Demo 部署方案

### 6.1 开发期
```
# 启动后端（端口 3001）
cd backend && python main.py

# 前端直接打开 frontend/index.html（或 http-server）
# 前端开发服务器代理到 localhost:3001
```

### 6.2 提交期（腾讯云部署）
- **方案**：腾讯云轻量应用服务器（2C4G）
- **部署**：`uvicorn backend.main:app --host 0.0.0.0 --port 80`
- **前端**：FastAPI 挂载 static 目录，统一端口
- **域名**：配置公网 IP / 域名

### 6.3 比赛提交物
| 产出物 | 说明 |
|--------|------|
| **Demo 链接** | 浏览器可访问的完整 Web 应用 |
| **演示录屏** | ≤3 分钟 MP4（H.264, 1080p, ≤500MB） |
| **说明文档** | PDF，含用户洞察/产品方案/AI能力 |

---

## 7. 开发路线图

| 阶段 | 内容 | 预计 |
|------|------|------|
| **Phase 0** | 架构设计 + Git 初始化 | 当前 |
| **Phase 1** | 后端重构为模块化结构（routers/services/data 分离） | 1天 |
| **Phase 2** | 前端 SPA 核心页面（首页/菜单/菜品详情） | 1天 |
| **Phase 3** | AI 推荐页 + 营养追踪页 | 1天 |
| **Phase 4** | 腾讯混元 API 接入 + 真实 AI 推荐 | 1天 |
| **Phase 5** | 部署 + 录屏 + 说明文档 | 1天 |

---

## 8. Git 工作流

- **分支策略**：单主分支 `main` + 按阶段 commit
- **Commit 规范**：`<type>: <description>`  
  类型：`feat`(功能) / `refactor`(重构) / `docs`(文档) / `style`(样式) / `chore`(工具)
- **首次提交**：架构文档 + 项目骨架