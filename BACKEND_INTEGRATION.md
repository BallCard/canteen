# 浙大食堂助手 - 后端集成指南

本文档旨在为后端开发人员（Java/Go/Node.js）提供与当前前端代码集成的技术说明。

## 1. 技术栈说明
- **前端工具链**: React 18 + Vite + TypeScript + Tailwind CSS。
- **当前 API 层**: 采用 `fetch` API 封装在 `src/services/api.ts` 中。
- **Mock 服务**: 目前使用 `server.ts` (Express) 作为简单的 Mock 服务，处理所有的动态请求。

## 2. API 接口规范
所有接口建议遵循以下规范：
- 基地址: `/api`
- 数据格式: `Content-Type: application/json`
- 错误处理: 失败时返回非 2xx 状态码，并包含 JSON 结构如 `{ "error": "错误消息" }`。

### 核心接口概览
| 路径 | 方法 | 描述 | 备注 |
| :--- | :--- | :--- | :--- |
| `/api/canteens` | GET | 获取所有食堂列表 | 用于首页和地图页 |
| `/api/dishes` | GET | 获取全量/特定食堂菜品 | 支持分页或 canteen_id 过滤 |
| `/api/dishes/search` | GET | 模糊搜索菜品 | 需要支持名称和标签匹配 |
| `/api/reviews` | POST | 发表评价 | 包含星级评分和评论内容 |
| `/api/meal-logs` | POST | 记录饮食计划 | 包含热量、蛋白质等数值 |

## 3. 数据库模型建议 (NoSQL/RELATIONAL)
### Dish (菜品)
- `id`: Unique ID
- `canteen_id`: 外键/关联
- `tags`: 字符串数组 (e.g. ["meat", "veg", "spicy"])
- `is_verified`: 官方认证标识
- `confirmations`: 社区确认计数值 (用于共建功能)

### Review (评价)
- `likes`: 点赞数 (需要原子性操作)
- `date`: 建议存储 ISOString 或 Unix 时间戳

## 4. 后续优化方向
1. **身份验证**: 目前用户名为 Hardcoded。建议接入 ZJU 统一身份认证或 Firebase Auth。
2. **图片存储**: 菜品图片目前使用 Unsplash 链接。共建功能需要集成 OSS（阿里云/腾讯云）或 Firebase Storage。
3. **实时性**: 售罄状态 `is_sold_out` 具有强时效性，建议使用 WebHoks 或 Server-Sent Events (SSE) 实时更新。

## 5. 如何替换 Mock
只需将 `src/services/api.ts` 中的 `API_BASE` 修改为您的真实服务器地址，或在 Vite 配置中使用 `proxy` 进行代理即可。
