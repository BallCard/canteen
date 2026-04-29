import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Data ---
  const canteens = [
    { id: 1, name: "风味食堂", distance: "500m", status: "营业中", opening_hours: "07:00-20:00", rating: 4.2, busy_level: "平淡", lat: 30.302, lng: 120.085 },
    { id: 2, name: "大食堂", distance: "800m", status: "营业中", opening_hours: "07:00-20:00", rating: 4.5, busy_level: "拥挤", lat: 30.305, lng: 120.088 },
    { id: 3, name: "临湖餐厅", distance: "1.2km", status: "已打烊", opening_hours: "10:00-21:00", rating: 4.8, busy_level: "未知", lat: 30.300, lng: 120.092 },
  ];

  const dishes = [
    { id: 1, canteen_id: 1, name: "麻辣香锅", price: 12, image: "https://images.unsplash.com/photo-1563379091339-03b1cbb69b85?w=500", calories: 450, rating: 4.5, review_count: 128, tags: ["spicy", "meat"], nutrients: { protein: 25, fat: 18, carbs: 35 }, reason: "人气爆款，香气铺鼻", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 2, canteen_id: 2, name: "红烧肉", price: 15, image: "https://images.unsplash.com/photo-1541696447-02482834b68e?w=500", calories: 650, rating: 4.8, review_count: 256, tags: ["meat"], nutrients: { protein: 30, fat: 40, carbs: 10 }, reason: "软糯入味，肥而不腻", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 3, canteen_id: 1, name: "清蒸鱼片", price: 18, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500", calories: 320, rating: 4.6, review_count: 89, tags: ["light", "meat"], nutrients: { protein: 45, fat: 5, carbs: 2 }, reason: "高蛋白低脂肪，健身首选", is_official: true, confirmations: 0, is_verified: true, is_sold_out: true },
    { id: 4, canteen_id: 2, name: "素炒西蓝花", price: 6, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500", calories: 120, rating: 4.3, review_count: 45, tags: ["light", "veg"], nutrients: { protein: 4, fat: 2, carbs: 12 }, reason: "爽口解腻，营养均衡", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 5, canteen_id: 3, name: "临湖酸菜鱼", price: 22, image: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?w=500", calories: 480, rating: 4.9, review_count: 312, tags: ["spicy", "meat"], nutrients: { protein: 40, fat: 12, carbs: 5 }, reason: "湖畔美景配酸爽鲜鱼", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 6, canteen_id: 1, name: "浙大生煎馒头", price: 8, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500", calories: 380, rating: 4.7, review_count: 520, tags: ["meat"], nutrients: { protein: 12, fat: 20, carbs: 45 }, reason: "皮薄汁多，底脆焦香", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 7, canteen_id: 2, name: "江西瓦罐汤", price: 10, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500", calories: 150, rating: 4.5, review_count: 167, tags: ["light", "meat"], nutrients: { protein: 15, fat: 5, carbs: 2 }, reason: "文火慢炖，滋补养生", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 8, canteen_id: 1, name: "自选凉拌菜", price: 8, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500", calories: 180, rating: 4.2, review_count: 56, tags: ["veg"], nutrients: { protein: 5, fat: 8, carbs: 15 }, reason: "夏日清凉，低卡解腻", is_official: false, confirmations: 12, is_verified: false, is_sold_out: false },
    { id: 9, canteen_id: 3, name: "烤鸭拌饭", price: 16, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500", calories: 720, rating: 4.6, review_count: 143, tags: ["meat"], nutrients: { protein: 28, fat: 35, carbs: 60 }, reason: "分量十足，肉香浓郁", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 10, canteen_id: 2, name: "番茄炒蛋", price: 5, image: "https://images.unsplash.com/photo-1594759842811-9f9a4c88497d?w=500", calories: 240, rating: 4.4, review_count: 88, tags: ["veg"], nutrients: { protein: 10, fat: 12, carbs: 8 }, reason: "家乡的味道，永远的经典", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 11, canteen_id: 1, name: "皮蛋瘦肉粥", price: 6, image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b4?w=500", calories: 210, rating: 4.5, review_count: 92, tags: ["light", "meat"], nutrients: { protein: 8, fat: 5, carbs: 32 }, reason: "暖心暖胃，咸鲜适口", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 12, canteen_id: 2, name: "照烧鸡排饭", price: 14, image: "https://images.unsplash.com/photo-1533777324545-e0162727fc90?w=500", calories: 580, rating: 4.7, review_count: 156, tags: ["meat"], nutrients: { protein: 22, fat: 18, carbs: 75 }, reason: "甜润可口，分量扎实", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 13, canteen_id: 3, name: "西湖牛肉羹", price: 12, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500", calories: 150, rating: 4.8, review_count: 74, tags: ["light", "meat"], nutrients: { protein: 12, fat: 6, carbs: 10 }, reason: "杭帮经典，鲜甜爽滑", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
    { id: 14, canteen_id: 1, name: "蒜蓉粉丝蒸扇贝", price: 18, image: "https://images.unsplash.com/photo-1623961990059-28356e332a77?w=500", calories: 280, rating: 4.6, review_count: 43, tags: ["meat"], nutrients: { protein: 18, fat: 12, carbs: 25 }, reason: "蒜香浓郁，粉丝吸满汤汁", is_official: false, confirmations: 8, is_verified: true, is_sold_out: false },
    { id: 15, canteen_id: 2, name: "干炒牛河", price: 15, image: "https://images.unsplash.com/photo-1563245391-496660fb15e5?w=500", calories: 620, rating: 4.5, review_count: 210, tags: ["meat"], nutrients: { protein: 20, fat: 28, carbs: 70 }, reason: "镬气十足，肉嫩粉滑", is_official: true, confirmations: 0, is_verified: true, is_sold_out: false },
  ];

  const reviews = [
    { id: 1, dish_id: 1, user: "用户A", rating: 5, content: "很好吃，辣度适中", avatar: "https://i.pravatar.cc/100?u=a", likes: 12, date: "2小时前" },
    { id: 2, dish_id: 1, user: "学霸小明", rating: 4, content: "加了午餐肉和藕片，绝绝子！", avatar: "https://i.pravatar.cc/100?u=b", likes: 3, date: "5小时前" },
  ];

  let mealLogs = [
    { id: 1, name: "豆浆", type: "早餐", time: "08:10", calories: 120, protein: 4, fat: 2, carbs: 12 },
    { id: 2, name: "油条", type: "早餐", time: "08:12", calories: 230, protein: 3, fat: 15, carbs: 22 },
  ];

  const userProfile = {
    nickname: "浙大学子",
    points: 120,
    rank: 25,
    preferences: { taste: ["spicy"], goal: "balanced" },
    goals: {
      calories: 2400,
      protein: 150,
      fat: 70,
      carbs: 300
    }
  };

  let favorites: number[] = [1]; // List of dish IDs

  // --- API Routes ---
  app.get("/api/favorites", (req, res) => {
    const favoriteDishes = dishes.filter(d => favorites.includes(d.id));
    res.json(favoriteDishes);
  });

  app.post("/api/favorites/toggle", (req, res) => {
    const { dish_id } = req.body;
    const id = Number(dish_id);
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
      res.json({ favorited: false });
    } else {
      favorites.push(id);
      res.json({ favorited: true });
    }
  });

  app.get("/api/favorites/check/:id", (req, res) => {
    res.json({ favorited: favorites.includes(Number(req.params.id)) });
  });
  app.get("/api/recommendations/today", (req, res) => {
    res.json(dishes.filter(d => d.is_official).slice(0, 3));
  });

  app.post("/api/dishes/community", (req, res) => {
    const { canteen_id, name, price, image } = req.body;
    const newDish = {
      id: dishes.length + 1,
      canteen_id: Number(canteen_id),
      name,
      price: Number(price),
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
      calories: 0,
      rating: 0,
      review_count: 0,
      tags: [],
      nutrients: { protein: 0, fat: 0, carbs: 0 },
      reason: "学生自主上传",
      is_official: false,
      is_verified: false,
      confirmations: 1,
      is_sold_out: false
    };
    dishes.push(newDish);
    res.json(newDish);
  });

  app.post("/api/dishes/:id/confirm", (req, res) => {
    const dish = dishes.find(d => d.id === Number(req.params.id));
    if (dish) {
      dish.confirmations = (dish.confirmations || 0) + 1;
      if (dish.confirmations >= 5) {
        dish.is_verified = true;
      }
      res.json(dish);
    } else {
      res.status(404).send("Dish not found");
    }
  });

  app.get("/api/canteens", (req, res) => {
    res.json(canteens);
  });

  app.get("/api/dishes", (req, res) => {
    const { canteen_id } = req.query;
    if (canteen_id) {
      return res.json(dishes.filter(d => d.canteen_id === Number(canteen_id)));
    }
    res.json(dishes);
  });

  app.get("/api/dishes/search", (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.json([]);
    const kw = String(keyword).toLowerCase();
    
    // Fuzzy matching: name contains keyword, or keyword contains name, or tags match
    const results = dishes.filter(d => 
      d.name.toLowerCase().includes(kw) || 
      kw.includes(d.name.toLowerCase()) ||
      d.tags.some(tag => tag.toLowerCase().includes(kw))
    );
    res.json(results);
  });

  app.get("/api/dishes/suggestions", (req, res) => {
    const { keyword } = req.query;
    if (!keyword || String(keyword).length < 1) return res.json([]);
    const kw = String(keyword).toLowerCase();
    
    const results = dishes
      .filter(d => d.name.toLowerCase().includes(kw))
      .slice(0, 5)
      .map(d => ({ id: d.id, name: d.name }));
    res.json(results);
  });

  app.get("/api/dishes/:id", (req, res) => {
    const dish = dishes.find(d => d.id === Number(req.params.id));
    if (dish) res.json(dish);
    else res.status(404).send("Dish not found");
  });

  app.get("/api/reviews", (req, res) => {
    const { dish_id } = req.query;
    res.json(reviews.filter(r => r.dish_id === Number(dish_id)));
  });

  app.post("/api/reviews", (req, res) => {
    const { dish_id, user, rating, content } = req.body;
    if (!dish_id || !user || !rating || !content) {
      return res.status(400).send("Missing required fields");
    }
    const newReview = {
      id: reviews.length + 1,
      dish_id: Number(dish_id),
      user,
      rating: Number(rating),
      content,
      avatar: `https://i.pravatar.cc/100?u=${user}`,
      likes: 0,
      date: "刚刚"
    };
    reviews.unshift(newReview); // Add to the beginning
    res.json(newReview);
  });

  app.post("/api/reviews/:id/like", (req, res) => {
    const id = Number(req.params.id);
    const review = reviews.find(r => r.id === id);
    if (review) {
      review.likes = (review.likes || 0) + 1;
      res.json(review);
    } else {
      res.status(404).send("Review not found");
    }
  });

  app.get("/api/meal-logs/today", (req, res) => {
    res.json(mealLogs);
  });

  app.post("/api/meal-logs", (req, res) => {
    const { name, calories, type, protein, fat, carbs } = req.body;
    const newMeal = { 
      id: Date.now(), 
      name, 
      calories: Number(calories) || 0,
      type, 
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    mealLogs.push(newMeal);
    res.json(newMeal);
  });

  app.delete("/api/meal-logs/:id", (req, res) => {
    const id = Number(req.params.id);
    mealLogs = mealLogs.filter(log => log.id !== id);
    res.json({ success: true });
  });

  app.post("/api/recommendations", (req, res) => {
    // Basic recommendation logic based on tags
    const { taste_preference, nutrition_goal } = req.body;
    let filtered = dishes;
    if (taste_preference && taste_preference.length > 0) {
      filtered = filtered.filter(d => d.tags.some(t => taste_preference.includes(t)));
    }
    res.json({ recommendations: filtered.slice(0, 3) });
  });

  app.get("/api/users/profile", (req, res) => {
    res.json(userProfile);
  });

  app.post("/api/dishes/:id/toggle-sold-out", (req, res) => {
    const id = Number(req.params.id);
    const dish = dishes.find(d => d.id === id);
    if (dish) {
      dish.is_sold_out = !dish.is_sold_out;
      res.json(dish);
    } else {
      res.status(404).json({ error: "Dish not found" });
    }
  });

  // --- Vite / Static Handling ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
