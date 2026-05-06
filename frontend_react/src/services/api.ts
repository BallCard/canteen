/**
 * Campus Canteen Assistant - Frontend Service Layer
 * 为未来可能的后端优化（如真实数据库或平台账号系统）留出统一接口。
 */

// 基础配置
const API_BASE = '/api';

const fallbackCanteens = [
  { id: 1, name: "一食堂", distance: "300m", status: "营业中", opening_hours: "06:30-21:00", busy_level: "平稳", rating: 4.2 },
  { id: 2, name: "二食堂", distance: "650m", status: "营业中", opening_hours: "06:30-20:30", busy_level: "拥挤", rating: 4.0 },
  { id: 3, name: "三食堂", distance: "900m", status: "营业中", opening_hours: "06:30-21:30", busy_level: "平稳", rating: 4.5 },
];

const fallbackDishes = [
  { id: 1, name: "麻辣香锅", price: 18, canteen_id: 1, canteen_name: "一食堂", image: "/images/dishes/malaxiangguo.png", calories: 650, protein: 25, fat: 35, carbs: 55, rating: 4.5, review_count: 28, is_sold_out: false, is_new: false, tags: ["辣", "荤", "人气"], reason: "麻辣鲜香，适合想吃重口的一餐" },
  { id: 2, name: "番茄牛腩", price: 15, canteen_id: 1, canteen_name: "一食堂", image: "/images/dishes/fanqieniuniu.png", calories: 480, protein: 30, fat: 18, carbs: 45, rating: 4.3, review_count: 22, is_sold_out: false, is_new: false, tags: ["清淡", "荤", "高蛋白"], reason: "酸甜开胃，高蛋白又不厚重" },
  { id: 3, name: "清炒时蔬", price: 6, canteen_id: 2, canteen_name: "二食堂", image: "/images/dishes/qingchaoshishu.png", calories: 120, protein: 5, fat: 3, carbs: 20, rating: 4.0, review_count: 15, is_sold_out: false, is_new: false, tags: ["清淡", "素", "低卡"], reason: "清爽低卡，适合搭配主食" },
  { id: 4, name: "红烧肉", price: 12, canteen_id: 2, canteen_name: "二食堂", image: "/images/dishes/hongshaorou.png", calories: 550, protein: 22, fat: 40, carbs: 15, rating: 4.1, review_count: 18, is_sold_out: false, is_new: false, tags: ["荤", "传统"], reason: "经典家常味，补充能量很直接" },
  { id: 5, name: "牛肉面", price: 14, canteen_id: 3, canteen_name: "三食堂", image: "/images/dishes/niuroumian.png", calories: 520, protein: 28, fat: 15, carbs: 65, rating: 4.6, review_count: 35, is_sold_out: false, is_new: false, tags: ["荤", "面食", "人气"], reason: "汤面稳妥，高蛋白也有饱腹感" },
  { id: 6, name: "酸菜鱼", price: 16, canteen_id: 3, canteen_name: "三食堂", image: "/images/dishes/suancaiyu.png", calories: 380, protein: 32, fat: 12, carbs: 25, rating: 4.4, review_count: 20, is_sold_out: false, is_new: true, tags: ["辣", "荤", "高蛋白", "新菜"], reason: "酸爽开胃，鱼肉高蛋白" },
];

function fallbackResponse<T>(path: string): T | undefined {
  if (path === "/canteens") return fallbackCanteens as T;
  if (path.startsWith("/canteens/")) {
    const id = Number(path.split("/").pop());
    const canteen = fallbackCanteens.find((item) => item.id === id);
    if (canteen) return { ...canteen, dishes: fallbackDishes.filter((dish) => dish.canteen_id === id) } as T;
  }
  if (path === "/dishes" || path.startsWith("/dishes?")) return fallbackDishes as T;
  if (path === "/dishes/recommendations") return fallbackDishes.slice(0, 3) as T;
  if (path.startsWith("/dishes/search")) return fallbackDishes as T;
  if (path.startsWith("/dishes/suggestions")) {
    return fallbackDishes.map((dish) => ({ id: dish.id, name: dish.name })).slice(0, 5) as T;
  }
  if (path === "/dishes/favorites") return fallbackDishes.filter((dish) => [1, 5].includes(dish.id)) as T;
  if (path.startsWith("/dishes/")) {
    const id = Number(path.split("/")[2]);
    const dish = fallbackDishes.find((item) => item.id === id);
    if (dish) return dish as T;
  }
  if (path.startsWith("/reviews")) return [] as T;
  if (path === "/meal-logs/today") return [] as T;
  if (path === "/user/profile") {
    return {
      nickname: "校园用户",
      points: 120,
      rank: 25,
      preferences: { taste: ["少油", "高蛋白"], goal: "均衡", budget: "15元以内", lunchTime: "12:10", avoid: "无", memoryEnabled: true, connectedApps: ["QQ 群", "日历", "运动 App"] },
      goals: { calories: 2000, protein: 80, fat: 65, carbs: 280 },
      stats: { logged_days: 15, total_reviews: 0, favorite_count: 2, calories_today: 0 },
    } as T;
  }
  return undefined;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || "GET").toUpperCase();
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (method === "GET") {
      const fallback = fallbackResponse<T>(path);
      if (fallback !== undefined) return fallback;
    }
    throw error;
  }
}

// --- 食堂服务 ---
export const canteenService = {
  getAll: () => request<any[]>('/canteens'),
  getById: (id: string | number) => request<any>(`/canteens/${id}`),
};

// --- 菜品服务 ---
export const dishService = {
  getRecommendations: () => request<any[]>('/dishes/recommendations'),
  getAll: () => request<any[]>('/dishes'),
  getById: (id: string | number) => request<any>(`/dishes/${id}`),
  search: (keyword: string) => request<any[]>(`/dishes/search?keyword=${encodeURIComponent(keyword)}`),
  getSuggestions: (keyword: string) => request<any[]>(`/dishes/suggestions?keyword=${encodeURIComponent(keyword)}`),
  confirmDish: (id: number) => request<any>(`/dishes/${id}/confirm`, { method: 'POST' }),
  toggleSoldOut: (id: number) => request<any>(`/dishes/${id}/toggle-sold-out`, { method: 'PUT' }),
  contribute: (data: { name: string, price: number, image: string, canteen_id?: number }) =>
    request<any>('/dishes', { method: 'POST', body: JSON.stringify(data) }),
};

// --- 评价服务 ---
export const reviewService = {
  getByDishId: (dishId: string | number) => request<any[]>(`/reviews?dish_id=${dishId}`),
  create: (data: { dish_id: number, user: string, rating: number, content: string }) =>
    request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  like: (id: number) => request<any>(`/reviews/${id}/like`, { method: 'POST' }),
};

// --- 饮食计划服务 ---
export const nutritionService = {
  getTodayLogs: () => request<any[]>('/meal-logs/today'),
  addLog: (data: any) => request<any>('/meal-logs', { method: 'POST', body: JSON.stringify(data) }),
  deleteLog: (id: number) => request<any>(`/meal-logs/${id}`, { method: 'DELETE' }),
};

// --- 用户 & 收藏服务 ---
export const userService = {
  getProfile: () => request<any>('/user/profile'),
  updatePreferences: (data: any) => request<any>('/user/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  getFavorites: () => request<any[]>('/dishes/favorites'),
  addFavorite: (dishId: number) => request<any>('/dishes/favorites', { method: 'POST', body: JSON.stringify({ dishId }) }),
  removeFavorite: (dishId: number) => request<any>('/dishes/favorites', { method: 'DELETE', body: JSON.stringify({ dishId }) }),
};
