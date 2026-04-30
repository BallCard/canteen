/**
 * ZJU Canteen Assistant - Frontend Service Layer
 * 为未来可能的后端优化（如 Firebase 集成或真实数据库）留出统一接口。
 */

// 基础配置
const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
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
  toggleSoldOut: (id: number) => request<any>(`/dishes/${id}/toggle-sold-out`, { method: 'POST' }),
  contribute: (data: { name: string, price: number, image: string }) => 
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
  getFavorites: () => request<any[]>('/dishes/favorites'),
  addFavorite: (dishId: number) => request<any>('/dishes/favorites', { method: 'POST', body: JSON.stringify({ dishId }) }),
  removeFavorite: (dishId: number) => request<any>('/dishes/favorites', { method: 'DELETE', body: JSON.stringify({ dishId }) }),
};
