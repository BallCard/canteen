# QQ 小程序开发环境配置指南

## 1. 注册与准备

### 1.1 注册 QQ 小程序账号
1. 访问 [QQ 小程序官网](https://q.qq.com/)
2. 使用 QQ 号登录
3. 进入"管理中心" → "开发设置"
4. 获取 **AppID**（后续开发需要）

### 1.2 下载开发者工具
1. 访问 [QQ 小程序开发者工具下载页](https://q.qq.com/wiki/tools/devtool/)
2. 下载 Windows 版本
3. 安装并启动

---

## 2. 创建项目

### 2.1 新建小程序项目
1. 打开 QQ 小程序开发者工具
2. 点击"新建项目"
3. 填写项目信息:
   - **项目名称**: 浙大食堂助手
   - **目录**: 选择空文件夹
   - **AppID**: 填写你的 AppID（如果没有，选择"测试号"）
   - **开发模式**: 小程序
4. 点击"新建"

### 2.2 项目目录结构
```
tencent_pcg_canteen/
├── frontend/                 # 前端代码
│   ├── pages/               # 页面
│   │   ├── index/          # 首页
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   ├── menu/           # 菜单页
│   │   ├── dish-detail/    # 菜品详情页
│   │   ├── recommend/      # AI 推荐页
│   │   ├── nutrition/      # 营养追踪页
│   │   └── profile/        # 我的页面
│   ├── components/          # 公共组件
│   │   ├── dish-card/      # 菜品卡片
│   │   └── tab-bar/        # 底部导航栏
│   ├── utils/               # 工具函数
│   │   ├── api.js          # API 请求封装
│   │   └── util.js         # 通用工具函数
│   ├── app.js               # 小程序入口
│   ├── app.json             # 全局配置
│   └── app.wxss             # 全局样式
├── backend/                 # 后端代码（GA 负责）
└── docs/                    # 文档
```

---

## 3. 配置文件

### 3.1 app.json（全局配置）
```json
{
  "pages": [
    "pages/index/index",
    "pages/menu/menu",
    "pages/dish-detail/dish-detail",
    "pages/recommend/recommend",
    "pages/nutrition/nutrition",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#07C160",
    "navigationBarTitleText": "浙大食堂助手",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#07C160",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/recommend/recommend",
        "text": "推荐",
        "iconPath": "images/recommend.png",
        "selectedIconPath": "images/recommend-active.png"
      },
      {
        "pagePath": "pages/nutrition/nutrition",
        "text": "追踪",
        "iconPath": "images/nutrition.png",
        "selectedIconPath": "images/nutrition-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/profile.png",
        "selectedIconPath": "images/profile-active.png"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": true
}
```

### 3.2 project.config.json（项目配置）
```json
{
  "description": "浙大食堂助手",
  "packOptions": {
    "ignore": []
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true
  },
  "compileType": "miniprogram",
  "appid": "你的AppID",
  "projectname": "浙大食堂助手",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
```

---

## 4. API 请求封装

### 4.1 utils/api.js
```javascript
// API 基础配置
const API_BASE_URL = 'http://localhost:8000/api'  // 开发环境
// const API_BASE_URL = 'https://your-domain.com/api'  // 生产环境

// 通用请求函数
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    qq.request({
      url: `${API_BASE_URL}${url}`,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json',
        'Authorization': qq.getStorageSync('token') || ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          qq.showToast({
            title: '请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        qq.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// API 接口
module.exports = {
  // 食堂相关
  getCanteens: () => request('/canteens'),
  getCanteenDetail: (id) => request(`/canteens/${id}`),

  // 菜品相关
  getDishes: (canteenId) => request(`/dishes?canteen_id=${canteenId}`),
  getDishDetail: (id) => request(`/dishes/${id}`),
  searchDishes: (keyword) => request(`/dishes/search?keyword=${keyword}`),

  // AI 推荐
  getRecommendations: (data) => request('/recommendations', 'POST', data),
  getTodayRecommendations: () => request('/recommendations/today'),

  // 营养追踪
  getMealLogs: (date) => request(`/meal-logs?date=${date}`),
  addMealLog: (data) => request('/meal-logs', 'POST', data),
  recognizeDish: (imagePath) => {
    return new Promise((resolve, reject) => {
      qq.uploadFile({
        url: `${API_BASE_URL}/meal-logs/recognize`,
        filePath: imagePath,
        name: 'image',
        header: {
          'Authorization': qq.getStorageSync('token') || ''
        },
        success: (res) => {
          resolve(JSON.parse(res.data))
        },
        fail: reject
      })
    })
  },
  getWeeklyReport: () => request('/meal-logs/weekly-report'),

  // 用户相关
  getUserProfile: () => request('/users/profile'),
  updatePreferences: (data) => request('/users/preferences', 'PUT', data),

  // 点评相关
  getReviews: (dishId) => request(`/reviews?dish_id=${dishId}`),
  submitReview: (data) => request('/reviews', 'POST', data)
}
```

### 4.2 utils/util.js
```javascript
// 格式化时间
function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化营养数据
function formatNutrition(calories, protein, fat, carbs) {
  return {
    calories: `${calories}kcal`,
    protein: `${protein}g`,
    fat: `${fat}g`,
    carbs: `${carbs}g`
  }
}

// 计算距离
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c

  if (distance < 1000) {
    return `${Math.round(distance)}m`
  } else {
    return `${(distance / 1000).toFixed(1)}km`
  }
}

module.exports = {
  formatTime,
  formatNutrition,
  calculateDistance
}
```

---

## 5. 开发调试

### 5.1 本地调试
1. 在开发者工具中点击"编译"
2. 在模拟器中查看效果
3. 使用"调试器"查看日志和网络请求

### 5.2 真机调试
1. 点击工具栏"预览"
2. 使用手机 QQ 扫描二维码
3. 在真机上测试功能

### 5.3 调试技巧
- 使用 `console.log()` 输出日志
- 使用"AppData"面板查看页面数据
- 使用"Network"面板查看网络请求
- 使用"Storage"面板查看本地存储

---

## 6. 常见问题

### 6.1 网络请求失败
**问题**: `request:fail url not in domain list`
**解决**:
1. 开发阶段：在 `project.config.json` 中设置 `"urlCheck": false`
2. 生产阶段：在 QQ 小程序管理后台配置服务器域名

### 6.2 图片不显示
**问题**: 图片路径错误或网络图片未配置域名
**解决**:
1. 本地图片使用相对路径（如 `/images/logo.png`）
2. 网络图片需要在管理后台配置 downloadFile 合法域名

### 6.3 分享功能无效
**问题**: 开发者工具不支持分享功能
**解决**: 必须在真机上测试分享功能

### 6.4 获取用户信息失败
**问题**: 用户未授权
**解决**: 使用 `<button open-type="getUserInfo">` 引导用户授权

---

## 7. 发布上线

### 7.1 上传代码
1. 点击工具栏"上传"
2. 填写版本号和项目备注
3. 上传成功后，在管理后台可以看到开发版本

### 7.2 提交审核
1. 登录 [QQ 小程序管理后台](https://q.qq.com/)
2. 进入"版本管理" → "开发版本"
3. 点击"提交审核"
4. 填写审核信息（功能描述、测试账号等）
5. 等待审核（通常 1-3 个工作日）

### 7.3 发布上线
1. 审核通过后，在"审核版本"中点击"发布"
2. 发布成功后，用户可以通过搜索或扫码使用小程序

---

## 8. 腾讯云服务配置

### 8.1 腾讯混元 AI
1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通"腾讯混元大模型"服务
3. 获取 API 密钥（SecretId 和 SecretKey）
4. 在后端配置密钥

### 8.2 腾讯云图像识别
1. 开通"图像识别"服务
2. 获取 API 密钥
3. 在后端配置密钥

### 8.3 腾讯云 OCR
1. 开通"文字识别"服务
2. 获取 API 密钥
3. 在后端配置密钥

### 8.4 腾讯云对象存储 COS
1. 开通"对象存储 COS"服务
2. 创建存储桶（Bucket）
3. 配置访问权限（公有读、私有写）
4. 获取存储桶地址和密钥

---

## 9. 开发时间线

### Day 1-2: 环境搭建 + 核心页面
- 注册账号、下载工具
- 创建项目、配置文件
- 开发首页、菜单页、菜品详情页

### Day 3-4: AI 推荐 + 营养追踪
- 开发 AI 推荐页
- 开发营养追踪页
- 对接后端 API

### Day 5: 联调测试
- 前后端联调
- 真机测试
- 修复 bug

### Day 6: 优化 + 准备演示
- 性能优化
- UI 优化
- 准备演示材料

### Day 7: 提交作品
- 最终测试
- 提交代码
- 提交演示视频和 PPT

---

## 10. 参考资料

- [QQ 小程序官方文档](https://q.qq.com/wiki/)
- [QQ 小程序 API 文档](https://q.qq.com/wiki/develop/miniprogram/API/)
- [QQ 小程序组件文档](https://q.qq.com/wiki/develop/miniprogram/component/)
- [腾讯混元 AI 文档](https://cloud.tencent.com/document/product/1729)
- [腾讯云图像识别文档](https://cloud.tencent.com/document/product/865)
