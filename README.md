# 浙大食堂助手

面向浙江大学紫金港校区学生的食堂智能助手，解决"今天吃什么"的决策疲劳，提供营养追踪、AI推荐、UGC点评功能。

为腾讯 PCG AI 大赛开放赛道作品。

## 快速启动

### 前端
```bash
cd frontend_react
npm install
npm run dev
```
访问 http://localhost:5173

### 后端
```bash
python -m backend.main
```
后端运行在 http://localhost:3001

### 环境变量
- `DEEPSEEK_API_KEY` - AI 推荐理由生成
- `PORT` - 后端端口（默认 3001）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite 6 + Tailwind CSS 4 + Motion |
| 路由 | react-router-dom 7 |
| 地图 | Leaflet + react-leaflet |
| 图标 | lucide-react |
| 后端 | FastAPI (Python) |
| AI | DeepSeek API |
| 数据 | 内存数据（Demo 阶段） |

## 项目结构

```
├── backend/                 # FastAPI 后端
│   ├── main.py              # 入口、CORS、路由注册
│   ├── models.py            # Pydantic 模型
│   ├── data.py              # 内存数据层
│   ├── routers/             # API 路由（7个模块）
│   └── services/            # 业务逻辑
│       └── tencent_ai.py    # DeepSeek API 封装
│
├── frontend_react/          # React 前端（活跃）
│   ├── src/
│   │   ├── App.tsx          # 路由 + 底部导航
│   │   ├── pages/           # 8 个页面
│   │   └── services/api.ts  # API 客户端
│   └── vite.config.ts       # 代理配置
│
├── frontend/                # 原生 JS 版本（已废弃）
└── docs/                    # 文档
    ├── PRD.md               # 产品需求
    └── TECH_DESIGN.md       # 技术设计
```

## 页面路由

| 路由 | 页面 | Tab |
|------|------|-----|
| `/` | 首页（食堂列表 + 今日推荐） | 首页 |
| `/menu/:canteenId` | 菜单页 | - |
| `/dish/:dishId` | 菜品详情 | - |
| `/recommend` | AI 推荐 | 推荐 |
| `/track` | 营养追踪 | 追踪 |
| `/profile` | 个人中心 | 我的 |
| `/map` | 食堂地图 | - |
| `/favorites` | 收藏夹 | - |

## API 端点

后端提供 24 个 RESTful API：

- `GET /api/canteens` - 食堂列表
- `GET /api/dishes` - 菜品列表
- `GET /api/dishes/search` - 搜索菜品
- `POST /api/recommendations` - AI 推荐
- `GET /api/meal-logs/today` - 今日饮食记录
- `POST /api/reviews` - 提交点评
- ...

完整 API 文档：启动后端后访问 http://localhost:3001/docs

## 文档

- [产品需求文档](docs/PRD.md)
- [技术设计文档](docs/TECH_DESIGN.md)
- [前后端对接文档](docs/FRONTEND_BACKEND_INTEGRATION.md)

## 开发进度

- [x] Phase 1: 后端模块化重构
- [x] Phase 2: 前端 React 对接后端 API
- [x] Phase 3: 菜品数据扩充至 32 道
- [ ] Phase 4: AI 推荐优化
- [ ] Phase 5: 部署上线
