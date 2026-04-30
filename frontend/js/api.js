// === API 连接层 ===
const API = window.API_BASE || 'http://localhost:3001';

async function request(method, path, body) {
  try {
    const opts = { method, headers: {} };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(API + path, opts);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return { data: await res.json(), error: null };
  } catch (e) {
    console.error('[API]', method, path, e.message);
    return { data: null, error: e.message };
  }
}

const api = {
  // 食堂
  getCanteens:        () => request('GET', '/api/canteens'),
  getCanteen:         (id) => request('GET', '/api/canteens/' + id),

  // 菜品
  getDish:            (id) => request('GET', '/api/dishes/' + id),
  searchDishes:       (kw) => request('GET', '/api/dishes/search?keyword=' + encodeURIComponent(kw)),
  getRecommendations: () => request('GET', '/api/dishes/recommendations'),
  getFavorites:       () => request('GET', '/api/dishes/favorites'),
  getSuggestions:     () => request('GET', '/api/dishes/suggestions'),
  toggleSoldOut:      (id) => request('PUT', '/api/dishes/' + id + '/toggle-sold-out'),
  confirmDish:        (id) => request('POST', '/api/dishes/' + id + '/confirm'),

  // 点评
  getReviews:         (dishId) => request('GET', '/api/reviews?dish_id=' + dishId),
  createReview:       (r) => request('POST', '/api/reviews', r),
  likeReview:         (id) => request('POST', '/api/reviews/' + id + '/like'),

  // 饮食记录
  getMealLogs:        () => request('GET', '/api/meal-logs'),
  getMealLogSummary:  () => request('GET', '/api/meal-logs/summary'),
  getWeeklyReport:    () => request('GET', '/api/meal-logs/weekly'),
  logMeal:            (m) => request('POST', '/api/meal-logs', m),
  deleteMealLog:      (id) => request('DELETE', '/api/meal-logs/' + id),

  // AI 推荐
  aiRecommend:        (pref, goal) => request('POST', '/api/recommendations/ai', { preference: pref, nutrition_goal: goal }),

  // 用户
  getProfile:         () => request('GET', '/api/user/profile'),
  updatePreferences:  (p) => request('PUT', '/api/user/preferences', p),
};
