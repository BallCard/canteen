import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Brain, ChevronRight, Send, Sparkles, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { dishService, userService } from "@/src/services/api";
import { QuickReplyButtons } from "@/src/components/QuickReplyButtons";

interface RecommendedDish {
  id: number;
  name: string;
  price: number;
  calories: number;
  protein?: number;
  fat?: number;
  rating?: number;
  review_count?: number;
  tags?: string[];
  type?: string;
  is_sold_out?: boolean;
  reason?: string;
  image: string;
}

interface QuickReply {
  step: string;
  options: string[];
}

interface Message {
  role: "user" | "model";
  content: string;
  dishes?: RecommendedDish[];
  quickReply?: QuickReply;
}

interface PreferenceMemory {
  memoryEnabled: boolean;
  tastes: string[];
  goal: string;
  budget: string;
  lunchTime: string;
  avoid: string;
}

const defaultMemory: PreferenceMemory = {
  memoryEnabled: true,
  tastes: ["少油", "高蛋白"],
  goal: "均衡",
  budget: "15元以内",
  lunchTime: "12:10",
  avoid: "无",
};

const openingQuestions = [
  "今天想吃点什么？我会结合你的偏好和当前菜单来推荐。",
  "想吃清爽一点，还是需要一顿高蛋白正餐？",
  "告诉我预算、口味或运动情况，我来帮你缩小选择。",
  "如果你不知道吃什么，可以直接说“帮我选一份午饭”。",
];

// 权重配置
const WEIGHTS = {
  taste: 0.30,      // 口味偏好
  nutrition: 0.25,  // 营养匹配
  popularity: 0.20, // 热度评分
  price: 0.15,      // 价格匹配
  diversity: 0.05,  // 多样性
  time: 0.05,       // 时间匹配
};

// 用户历史推荐记录（用于多样性计算）
const recommendationHistory: Record<string, number[]> = {};

function calculateTasteScore(dish: RecommendedDish, tastePreference: string): number {
  if (!tastePreference || tastePreference === "随意") return 50;

  const tags = dish.tags || [];
  if (tags.includes(tastePreference)) return 100;
  if (tastePreference === "辣" && tags.some((t) => t === "辣" || t === "麻辣")) return 80;
  if (tastePreference === "清淡" && tags.some((t) => t === "清淡" || t === "低卡")) return 80;
  return 30;
}

function calculateNutritionScore(dish: RecommendedDish, goal: string): number {
  const calories = dish.calories || 0;
  const protein = dish.protein || 0;
  const fat = dish.fat || 0;

  if (goal === "减脂") {
    let score = 100;
    if (calories > 600) score -= 40;
    else if (calories > 400) score -= 20;
    if (fat > 30) score -= 20;
    return Math.max(0, score);
  } else if (goal === "增肌") {
    let score = Math.min(100, protein * 3);
    if (calories < 300) score -= 20;
    return Math.max(0, score);
  } else {
    let score = 70;
    if (calories >= 300 && calories <= 550) score += 15;
    if (protein >= 15 && protein <= 35) score += 15;
    return Math.min(100, score);
  }
}

function calculatePopularityScore(dish: RecommendedDish): number {
  const rating = dish.rating || 4.0;
  const reviewCount = dish.review_count || 0;

  const ratingScore = rating > 3.0 ? (rating - 3.0) * 20 : 0;
  const reviewBonus = Math.min(20, reviewCount * 0.5);

  return Math.min(100, ratingScore + reviewBonus);
}

function calculatePriceScore(dish: RecommendedDish, budget?: string): number {
  const price = dish.price || 15;

  if (!budget || budget === "不在意") return 70;

  if (budget === "10元内" || budget === "10元以内") {
    return price <= 10 ? 100 : Math.max(0, 100 - (price - 10) * 15);
  } else if (budget === "15元内" || budget === "15元以内") {
    return price <= 15 ? 100 : Math.max(0, 100 - (price - 15) * 10);
  } else if (budget === "20元内" || budget === "20元以内") {
    return price <= 20 ? 100 : Math.max(0, 100 - (price - 20) * 8);
  }
  return 70;
}

function calculateDiversityScore(dish: RecommendedDish, history: number[]): number {
  const dishId = dish.id;
  if (history.includes(dishId)) {
    const recency = history.indexOf(dishId);
    return Math.max(0, 50 - (history.length - recency) * 20);
  }
  return 100;
}

function calculateTimeScore(dish: RecommendedDish): number {
  const hour = new Date().getHours();
  const tags = dish.tags || [];

  if (hour >= 6 && hour < 10) {
    if (tags.includes("面食") || ["包子", "饺子", "面食"].includes(dish.type || "")) return 100;
    return 60;
  } else if (hour >= 11 && hour < 14) {
    return 80;
  } else if (hour >= 17 && hour < 20) {
    if (tags.includes("人气") || tags.includes("高蛋白")) return 90;
    return 75;
  }
  return 70;
}

function pickLocalRecommendations(term: string, dishes: RecommendedDish[], memory: PreferenceMemory) {
  // 从 memory 和 term 中提取偏好
  const tastePreference = memory.tastes[0] || "随意";
  const nutritionGoal = memory.goal || "均衡";
  const budget = memory.budget || "不在意";
  const userId = "default";

  // 获取历史推荐
  const history = recommendationHistory[userId] || [];

  // 过滤售罄菜品
  const candidates = dishes.filter((dish) => !dish.is_sold_out);

  // 计算综合得分
  const scored = candidates.map((dish) => {
    const tasteScore = calculateTasteScore(dish, tastePreference);
    const nutritionScore = calculateNutritionScore(dish, nutritionGoal);
    const popularityScore = calculatePopularityScore(dish);
    const priceScore = calculatePriceScore(dish, budget);
    const diversityScore = calculateDiversityScore(dish, history);
    const timeScore = calculateTimeScore(dish);

    const total =
      tasteScore * WEIGHTS.taste +
      nutritionScore * WEIGHTS.nutrition +
      popularityScore * WEIGHTS.popularity +
      priceScore * WEIGHTS.price +
      diversityScore * WEIGHTS.diversity +
      timeScore * WEIGHTS.time;

    return { dish, score: Math.round(total * 10) / 10 };
  });

  // 按总分排序
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  // 更新历史记录
  const newHistory = top.map((s) => s.dish.id);
  recommendationHistory[userId] = [...history, ...newHistory].slice(-10);

  return top.map((item) => item.dish);
}

function loadLocalMemory(): PreferenceMemory {
  try {
    const saved = localStorage.getItem("canteen_preference_memory");
    return saved ? { ...defaultMemory, ...JSON.parse(saved) } : defaultMemory;
  } catch {
    return defaultMemory;
  }
}

export default function Recommend() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: openingQuestions[Math.floor(Math.random() * openingQuestions.length)] },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [memory, setMemory] = useState<PreferenceMemory>(loadLocalMemory);
  const [chatContext, setChatContext] = useState<Record<string, string | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    userService.getProfile()
      .then((profile) => {
        const preferences = profile.preferences || {};
        setMemory((current) => ({
          ...current,
          tastes: Array.isArray(preferences.taste) ? preferences.taste : current.tastes,
          goal: preferences.goal || preferences.preference || current.goal,
        }));
      })
      .catch(() => {
        // Local memory is enough for the demo if the backend is unavailable.
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("canteen_preference_memory", JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatLoading]);

  const memorySummary = memory.memoryEnabled
    ? `已记住: ${memory.tastes.join("、")} / ${memory.goal} / ${memory.budget} / 常在 ${memory.lunchTime} 吃饭 / 忌口: ${memory.avoid}`
    : "未启用偏好记忆";

  const handleChat = async (directInput?: string) => {
    const inputText = directInput || inputValue.trim();
    if (!inputText || chatLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: inputText }]);
    setInputValue("");
    setChatLoading(true);

    try {
      const allDishes = await dishService.getAll();
      const menuPreview = allDishes.slice(0, 24).map((dish: any) =>
        `${dish.name}(ID:${dish.id}, ${dish.price}元, ${dish.calories}kcal, 标签:${(dish.tags || []).join(",")})`
      ).join(", ");

      const systemPrompt = `你是校园食堂小助手。已知菜品: ${menuPreview}。

用户偏好记忆: ${memory.memoryEnabled ? memorySummary : "用户关闭了偏好记忆，不要声称记住长期偏好。"}

规则:
1. 用户需求模糊时，主动询问口味、预算或营养目标。
2. 推荐菜品时，回复末尾加 [DISHES:1,5,10] 格式。
3. 回复 60 字以内，像真实校园助手，不要提浙大限定。`;

      const conversationHistory = messages.slice(-4).map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        content: message.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: inputText },
          ],
          context: chatContext,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const aiText = data.reply || "我暂时没想好，再给我一个口味或预算条件。";

      // Update chat context from backend response
      if (data.context) {
        setChatContext(data.context);
      }

      // Check for quick_reply (follow-up question)
      if (data.quick_reply) {
        setMessages((prev) => [...prev, {
          role: "model",
          content: aiText,
          quickReply: data.quick_reply,
        }]);
      } else {
        const dishMatch = aiText.match(/\[DISHES:([\d,]+)\]/);
        const dishIds = dishMatch ? dishMatch[1].split(",").map((id: string) => Number(id.trim())) : [];
        const recommendedDishes = allDishes.filter((dish: any) => dishIds.includes(dish.id));
        const cleanText = aiText.replace(/\[DISHES:[\d,]+\]/, "").trim();
        setMessages((prev) => [...prev, { role: "model", content: cleanText, dishes: recommendedDishes }]);
      }
    } catch (error) {
      console.error(error);
      const allDishes = await dishService.getAll();
      const localDishes = pickLocalRecommendations(inputText, allDishes, memory);
      setMessages((prev) => [...prev, {
        role: "model",
        content: "现在 AI 通道不太稳，我先按菜品标签和你的偏好给出本地推荐。",
        dishes: localDishes,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickReplySelect = (option: string) => {
    // Update context with selected option
    setChatContext((prev) => ({
      ...prev,
      [messages[messages.length - 1]?.quickReply?.step || ""]: option,
    }));
    // Trigger chat with the selected option
    handleChat(option);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA]">
      <div className="bg-white/80 backdrop-blur-xl px-6 pt-10 pb-5 border-b border-gray-100 z-20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">智能体验</span>
              <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-2">
                智能寻味 <Sparkles className="w-4 h-4 text-zju-green" />
              </h1>
              <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-[260px]">{memorySummary}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([{ role: "model", content: openingQuestions[Math.floor(Math.random() * openingQuestions.length)] }]);
              setChatContext({});
            }}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-90 transition-all border border-gray-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setMemory((current) => ({ ...current, memoryEnabled: !current.memoryEnabled }))}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all",
              memory.memoryEnabled ? "bg-zju-green-light border-zju-green/20 text-zju-green" : "bg-gray-50 border-gray-100 text-gray-400"
            )}
          >
            <Brain className="w-4 h-4 mb-2" />
            <span className="block text-[10px] font-black uppercase tracking-widest">
              {memory.memoryEnabled ? "已开启记忆" : "记忆已关闭"}
            </span>
          </button>
          <Link
            to="/profile"
            className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-between"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">管理偏好</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar" ref={scrollRef}>
        <div className="flex flex-col gap-6 pb-32">
          {messages.map((msg, index) => (
            <div key={`${msg.role}-${index}`} className={cn("flex flex-col gap-3", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn("flex gap-3 max-w-[90%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border",
                  msg.role === "user" ? "bg-zju-green text-white border-zju-green" : "bg-white text-gray-400 border-gray-100"
                )}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "px-5 py-4 rounded-[1.5rem] text-[13px] leading-relaxed break-words shadow-premium whitespace-pre-wrap font-medium tracking-tight",
                  msg.role === "user" ? "bg-zju-green text-white rounded-tr-none" : "bg-white text-[#1A1A1A] rounded-tl-none border border-white"
                )}>
                  {msg.content}
                </div>
              </div>

              {msg.dishes && msg.dishes.length > 0 && (
                <div className="w-full flex gap-4 overflow-x-auto py-2 no-scrollbar pl-12 -mr-6 pr-6">
                  {msg.dishes.map((dish) => (
                    <Link
                      key={dish.id}
                      to={`/dish/${dish.id}`}
                      className="bg-white rounded-[2rem] border border-white p-3 shadow-premium flex flex-col gap-3 min-w-[160px] max-w-[160px] flex-shrink-0 active:scale-95 transition-all group"
                    >
                      <div className="relative w-full h-28 overflow-hidden rounded-2xl">
                        <img src={dish.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col gap-1 px-1">
                        <span className="text-xs font-black text-[#1A1A1A] truncate tracking-tight">{dish.name}</span>
                        <span className="text-xs text-zju-accent font-black">¥{dish.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {msg.quickReply && (
                <QuickReplyButtons
                  options={msg.quickReply.options}
                  onSelect={handleQuickReplySelect}
                  disabled={chatLoading}
                />
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-5 h-5 text-gray-300" />
              </div>
              <div className="bg-white px-5 py-4 rounded-[1.5rem] rounded-tl-none border border-white shadow-premium flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-zju-green/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-zju-green/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-zju-green/40 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-24 left-0 right-0 p-6 z-30 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center gap-3 pointer-events-auto">
          <div className="flex-1 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-premium border border-white px-5 py-2 flex items-center gap-3">
            <input
              type="text"
              placeholder="说说你今天想怎么吃..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleChat()}
              className="flex-1 bg-transparent py-3 text-sm focus:outline-none font-bold placeholder:text-gray-300 text-[#1A1A1A]"
            />
            <button
              onClick={handleChat}
              disabled={!inputValue.trim() || chatLoading}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                !inputValue.trim() || chatLoading
                  ? "bg-gray-100 text-gray-300"
                  : "bg-zju-green text-white shadow-zju-green/20 active:scale-90"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
