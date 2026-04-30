# 后端开发任务文档

## 任务概述
开发"浙大食堂助手"后端系统，基于产品需求文档（PRD.md）实现核心 API 接口和数据管理功能。

## 技术栈
- **语言**: Python 3.9+
- **框架**: FastAPI
- **数据库**: PostgreSQL
- **缓存**: Redis
- **AI 服务**: 腾讯混元大模型、腾讯云图像识别、腾讯云 OCR
- **对象存储**: 腾讯云 COS
- **部署**: 腾讯云轻量应用服务器

## 任务要求

### 第一步：阅读需求文档
1. 仔细阅读 `D:\Contests51\tencent_pcg_canteen\docs\PRD.md`
2. 理解核心功能需求：
   - 今日菜单查询
   - AI 智能推荐
   - 营养追踪打卡
   - UGC 点评与举报
3. 理解数据结构和 API 接口需求

### 第二步：设计系统架构
1. 设计数据库表结构（基于 PRD 中的数据架构）
2. 设计 API 接口（RESTful 风格）
3. 设计 AI 推荐算法流程
4. 设计图片上传和存储方案
5. 输出技术设计文档到 `docs/TECH_DESIGN.md`

### 第三步：搭建项目框架
1. 创建项目目录结构：
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置文件
│   ├── database.py          # 数据库连接
│   ├── models/              # 数据模型
│   │   ├── __init__.py
│   │   ├── canteen.py
│   │   ├── dish.py
│   │   ├── user.py
│   │   ├── review.py
│   │   └── meal_log.py
│   ├── schemas/             # Pydantic 模型
│   │   ├── __init__.py
│   │   ├── canteen.py
│   │   ├── dish.py
│   │   ├── user.py
│   │   ├── review.py
│   │   └── meal_log.py
│   ├── api/                 # API 路由
│   │   ├── __init__.py
│   │   ├── canteens.py
│   │   ├── dishes.py
│   │   ├── recommendations.py
│   │   ├── meal_logs.py
│   │   ├── reviews.py
│   │   └── users.py
│   ├── services/            # 业务逻辑
│   │   ├── __init__.py
│   │   ├── recommendation.py  # AI 推荐算法
│   │   ├── nutrition.py       # 营养计算
│   │   ├── image_recognition.py  # 图像识别
│   │   └── tencent_ai.py      # 腾讯 AI 服务封装
│   └── utils/               # 工具函数
│       ├── __init__.py
│       ├── security.py      # 安全相关
│       └── helpers.py       # 通用工具
├── migrations/              # 数据库迁移
├── tests/                   # 测试
├── requirements.txt         # 依赖
├── .env.example             # 环境变量示例
└── README.md
```

2. 初始化 FastAPI 项目
3. 配置数据库连接（PostgreSQL）
4. 配置 Redis 缓存
5. 配置环境变量管理

### 第四步：实现核心功能

#### 4.1 数据库模型（优先级 P0）
实现以下数据表：
- `canteens` - 食堂表
- `dishes` - 菜品表
- `users` - 用户表
- `reviews` - 点评表
- `meal_logs` - 饮食记录表

使用 SQLAlchemy ORM，编写数据库迁移脚本。

#### 4.2 食堂和菜品 API（优先级 P0）
实现以下接口：
- `GET /api/canteens` - 获取食堂列表
- `GET /api/canteens/{id}` - 获取食堂详情
- `GET /api/dishes?canteen_id={id}` - 获取食堂菜单
- `GET /api/dishes/{id}` - 获取菜品详情
- `GET /api/dishes/search?keyword={keyword}` - 搜索菜品

**验收标准**：
- 返回数据格式符合前端需求
- 支持分页（limit/offset）
- 支持筛选和排序
- 响应时间 < 500ms

#### 4.3 AI 推荐系统（优先级 P0）
实现以下接口：
- `POST /api/recommendations` - 请求 AI 推荐
- `GET /api/recommendations/today` - 获取今日推荐

**核心算法**：
```python
def recommend_dishes(user_preference, nutrition_goal, available_dishes):
    """
    输入：
    - user_preference: {"taste": ["spicy"], "avoid": ["seafood"]}
    - nutrition_goal: "lose_weight" | "gain_muscle" | "balanced"
    - available_dishes: 今日所有菜品

    输出：
    - top_3_dishes: 推荐的 3 道菜 + 推荐理由
    """
    # 1. 过滤：排除用户不喜欢的食材
    # 2. 打分：口味匹配度（40%）+ 营养目标匹配度（60%）
    # 3. 多样性：确保推荐的 3 道菜不重复类型
    # 4. 生成理由：调用腾讯混元生成自然语言解释
```

**腾讯混元集成**：
- 使用腾讯混元 API 生成推荐理由
- Prompt 设计：
```
你是一个营养师，根据以下信息推荐菜品：
- 菜品：{dish_name}
- 营养成分：卡路里 {calories}kcal，蛋白质 {protein}g，脂肪 {fat}g
- 用户偏好：{user_preference}
- 营养目标：{nutrition_goal}

请用一句话（20 字以内）说明推荐理由。
```

**验收标准**：
- 推荐结果符合用户偏好和营养目标
- 推荐理由可读性强
- 响应时间 < 3 秒

#### 4.4 营养追踪 API（优先级 P1）
实现以下接口：
- `GET /api/meal-logs?date={date}` - 获取指定日期饮食记录
- `POST /api/meal-logs` - 添加饮食记录
- `POST /api/meal-logs/recognize` - 拍照识别菜品
- `GET /api/meal-logs/weekly-report` - 获取周报

**图像识别流程**：
1. 接收前端上传的图片
2. 调用腾讯云图像识别 API
3. 返回候选菜品列表（Top 3）
4. 用户确认后，查询营养数据库
5. 计算营养并保存到饮食记录

**验收标准**：
- 图片上传成功率 ≥ 95%
- 识别准确率 ≥ 70%（Top 3 包含正确答案）
- 营养计算误差 ≤ 15%

#### 4.5 UGC 点评 API（优先级 P1）
实现以下接口：
- `GET /api/reviews?dish_id={id}` - 获取菜品评价
- `POST /api/reviews` - 提交点评
- `POST /api/reviews/{id}/report` - 举报评价

**内容审核**：
- 文字审核：腾讯云内容安全 API
- 图片审核：腾讯云图像审核 API
- 过滤敏感词和违规图片

**验收标准**：
- 审核响应时间 < 5 秒
- 审核准确率 ≥ 95%

#### 4.6 用户系统 API（优先级 P2）
实现以下接口：
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/preferences` - 更新偏好设置
- `GET /api/users/points` - 获取积分

**QQ 小程序登录**：
- 使用 QQ 小程序 openid 作为用户唯一标识
- 实现 JWT Token 鉴权

### 第五步：数据准备

#### 5.1 冷启动数据（优先级 P0）
手动录入以下数据：
- 3 个食堂（风味、大食堂、麦香园）
- 每个食堂 30 道菜品
- 菜品信息：菜名、价格、照片、营养成分

**数据来源**：
- 浙大食堂公众号/小程序
- 美团/大众点评
- 人工补充营养数据（查《中国食物成分表》）

#### 5.2 爬虫数据（优先级 P1）
开发爬虫脚本：
- 爬取浙大食堂公众号菜单图片
- OCR 识别菜名和价格（腾讯云 OCR）
- 人工校验后导入数据库

### 第六步：测试和优化

#### 6.1 单元测试
- 使用 pytest 编写单元测试
- 覆盖核心业务逻辑（推荐算法、营养计算）
- 测试覆盖率 ≥ 80%

#### 6.2 集成测试
- 测试前后端联调
- 测试 AI 服务集成
- 测试数据库读写性能

#### 6.3 性能优化
- 使用 Redis 缓存菜单数据（24 小时）
- 优化数据库查询（添加索引）
- 使用异步 I/O（FastAPI 原生支持）

### 第七步：部署上线

#### 7.1 环境配置
- 申请腾讯云轻量应用服务器
- 安装 Python、PostgreSQL、Redis
- 配置 Nginx 反向代理

#### 7.2 服务部署
- 使用 Gunicorn + Uvicorn 部署 FastAPI
- 配置 Supervisor 进程管理
- 配置 SSL 证书（HTTPS）

#### 7.3 监控和日志
- 配置日志记录（使用 Python logging）
- 配置性能监控（使用腾讯云监控）
- 配置错误告警

## 关键技术点

### 1. 腾讯混元 API 调用示例
```python
import requests

def call_hunyuan_api(prompt):
    url = "https://hunyuan.tencentcloudapi.com/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {HUNYUAN_API_KEY}"
    }
    data = {
        "model": "hunyuan-lite",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 100
    }
    response = requests.post(url, json=data, headers=headers)
    return response.json()["choices"][0]["message"]["content"]
```

### 2. 腾讯云图像识别 API 调用示例
```python
from tencentcloud.common import credential
from tencentcloud.tiia.v20190529 import tiia_client, models

def recognize_dish(image_url):
    cred = credential.Credential(SECRET_ID, SECRET_KEY)
    client = tiia_client.TiiaClient(cred, "ap-guangzhou")

    req = models.DetectProductRequest()
    req.ImageUrl = image_url

    resp = client.DetectProduct(req)
    return resp.Products  # 返回识别结果
```

### 3. 营养计算示例
```python
def calculate_nutrition(dish_id, portion=1.0):
    """
    计算菜品营养成分

    Args:
        dish_id: 菜品 ID
        portion: 份量（默认 1 份 = 200g）

    Returns:
        {
            "calories": 450,
            "protein": 25,
            "fat": 18,
            "carbs": 35
        }
    """
    dish = get_dish_by_id(dish_id)
    return {
        "calories": dish.calories * portion,
        "protein": dish.protein * portion,
        "fat": dish.fat * portion,
        "carbs": dish.carbs * portion
    }
```

## 开发时间估算

- Day 1: 阅读需求 + 设计架构（4 小时）
- Day 2: 搭建项目框架 + 数据库模型（6 小时）
- Day 3: 实现食堂和菜品 API（6 小时）
- Day 4: 实现 AI 推荐系统（8 小时）
- Day 5: 实现营养追踪 API（6 小时）
- Day 6: 实现 UGC 点评 API + 用户系统（6 小时）
- Day 7: 数据准备 + 测试优化 + 部署上线（8 小时）

**总计**：44 小时（约 5-6 天）

## 交付要求

1. **代码质量**：
   - 遵循 PEP 8 规范
   - 添加必要的注释和文档字符串
   - 使用类型提示（Type Hints）

2. **API 文档**：
   - FastAPI 自动生成 Swagger 文档
   - 访问 `/docs` 查看 API 文档

3. **环境变量配置**：
   - 提供 `.env.example` 文件
   - 说明所有环境变量的用途

4. **部署文档**：
   - 提供部署步骤说明
   - 提供数据库初始化脚本

5. **测试报告**：
   - 提供单元测试报告
   - 提供性能测试报告

## 注意事项

1. **安全性**：
   - 所有 API 接口需要鉴权（除了公开接口）
   - 用户密码使用 bcrypt 加密
   - 防止 SQL 注入（使用 ORM）
   - 防止 XSS 攻击（内容审核）

2. **性能**：
   - 使用 Redis 缓存热点数据
   - 数据库查询添加索引
   - 图片上传使用异步处理

3. **可扩展性**：
   - 使用依赖注入（FastAPI 原生支持）
   - 业务逻辑和数据访问分离
   - 配置和代码分离

4. **错误处理**：
   - 统一错误响应格式
   - 记录详细的错误日志
   - 友好的错误提示

## 参考资料

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 官方文档](https://docs.sqlalchemy.org/)
- [腾讯混元 API 文档](https://cloud.tencent.com/document/product/1729)
- [腾讯云图像识别文档](https://cloud.tencent.com/document/product/865)
- [腾讯云 OCR 文档](https://cloud.tencent.com/document/product/866)
- [腾讯云 COS 文档](https://cloud.tencent.com/document/product/436)

## 联系方式

如有问题，请通过以下方式联系：
- 查看 PRD.md 了解产品需求
- 查看 GEMINI_FRONTEND_PROMPT.md 了解前端接口需求
- 查看 QQ_MINIPROGRAM_SETUP.md 了解 QQ 小程序开发环境
