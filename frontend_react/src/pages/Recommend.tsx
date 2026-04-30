import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Info, CheckCircle2, MessageSquare, Send, Bot, User, Trash2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { GoogleGenAI } from "@google/genai";

interface RecommendedDish {
  id: number;
  name: string;
  price: number;
  calories: number;
  reason: string;
  image: string;
}

interface Message {
  role: "user" | "model";
  content: string;
  dishes?: RecommendedDish[];
}

export default function Recommend() {
  const [mode, setMode] = useState<"survey" | "chat">("survey");
  
  // Questionnaire States
  const [surveyStep, setSurveyStep] = useState(1);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [goal, setGoal] = useState("balanced");
  const [surveyResults, setSurveyResults] = useState<RecommendedDish[]>([]);
  const [surveyLoading, setSurveyLoading] = useState(false);

  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "你好！我是你的浙大校园食堂助手。今天想吃点什么？你可以告诉我你的口味偏好、预算，或者想减肥/增肌的目标，我会为你精准推荐！" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  const tasteOptions = [
    { id: "spicy", label: "辣" },
    { id: "light", label: "清淡" },
    { id: "meat", label: "荤" },
    { id: "veg", label: "素" },
  ];

  const goalOptions = [
    { id: "lose_weight", label: "减脂" },
    { id: "bulk", label: "增肌" },
    { id: "balanced", label: "均衡" },
  ];

  const handleStartSurveyRecommendation = async () => {
    setSurveyLoading(true);
    setSurveyStep(2);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taste_preference: preferences, nutrition_goal: goal }),
      });
      const data = await res.json();
      setSurveyResults(data.recommendations.map((d: any) => ({
        id: d.id,
        name: d.name,
        price: d.price,
        calories: d.calories,
        reason: d.reason || "智能匹配",
        image: d.image
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setSurveyLoading(false);
    }
  };

  const handleChat = async () => {
    if (!inputValue.trim() || chatLoading) return;

    const term = inputValue;
    const userMessage: Message = { role: "user", content: term };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const menuRes = await fetch("/api/dishes");
      const allDishes = await menuRes.json();
      const menuPreview = allDishes.slice(0, 15).map((d: any) => `${d.name}(ID:${d.id}, ${d.price}元, ${d.calories}kcal, 标签:${d.tags.join(",")})`).join(", ");

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
            systemInstruction: `你是一个专业的浙大校园食堂导吃助手。
            已知菜品库部分信息: ${menuPreview}。
            请根据用户需求提供推荐。你的回复要亲切、地道（可以使用浙大校园梗）。

            重要指南：
            1. 如果用户描述模糊或信息不足（例如只说“我想吃东西”或“饿了”），不要急于推荐，请主动询问更详细的问题，引导用户提供更多信息，例如：
               - “您想吃点什么口味的？比如辣的、清淡的，还是酸甜开胃的？”
               - “您今天有什么特殊的营养目标吗？比如减脂、增肌，或者是想吃顿丰盛的犒劳一下？”
               - “大概的预算范围是多少呢？我可以为您推荐性价比之王或者是品质餐厅。”
            2. 如果你确定推荐了库中的具体菜品，请在回复末尾以 [JSON_START][{"id":...}, ...][JSON_END] 的格式包含这些菜品的ID列表。
            3. 如果菜单库中没有符合用户要求的，请根据常理推荐一般的校园菜品，但不要包含JSON格式。`,
        },
        contents: [
            ...messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
            { role: "user", parts: [{ text: term }] }
        ]
      });

      const aiText = response.text || "抱歉，我现在有点走神，能再说一遍吗？";
      
      let cleanText = aiText;
      let recommendedDishes: RecommendedDish[] = [];
      const jsonMatch = aiText.match(/\[JSON_START\](.*?)\[JSON_END\]/s);
      
      if (jsonMatch) {
          try {
              const items = JSON.parse(jsonMatch[1]);
              recommendedDishes = allDishes.filter((d: any) => items.some((item: any) => item.id === d.id));
              cleanText = aiText.replace(/\[JSON_START\].*?\[JSON_END\]/s, "").trim();
          } catch (e) {
              console.error("JSON parse error", e);
          }
      }

      setMessages(prev => [...prev, { role: "model", content: cleanText, dishes: recommendedDishes }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "model", content: "哎呀，信号不太好，请稍后再试吧。" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA]">
      <div className="bg-white/80 backdrop-blur-xl px-6 pt-10 pb-6 border-b border-gray-100 flex flex-col gap-6 z-20">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">智能体验</span>
            <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-2">
              智能寻味 <Sparkles className="w-4 h-4 text-zju-green" />
            </h1>
          </div>
          {mode === "chat" && (
            <button 
              onClick={() => setMessages([{ role: "model", content: "已重启对话。想吃点什么？" }])}
              className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-90 transition-all border border-gray-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex bg-[#F0F2F5] p-1.5 rounded-2xl ring-1 ring-gray-100/50">
          <button 
            onClick={() => setMode("survey")}
            className={cn(
              "flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
              mode === "survey" ? "bg-white text-zju-green shadow-premium" : "text-gray-400"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            精准问卷
          </button>
          <button 
            onClick={() => setMode("chat")}
            className={cn(
              "flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
              mode === "chat" ? "bg-white text-zju-green shadow-premium" : "text-gray-400"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI 聊天
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar" ref={scrollRef}>
        <AnimatePresence mode="wait">
          {mode === "survey" ? (
            <motion.div
              key="survey"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-8 pb-32"
            >
              {surveyStep === 1 ? (
                <div className="flex flex-col gap-10 bg-white p-8 rounded-[2.5rem] shadow-premium border border-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-zju-green/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <section>
                    <div className="flex flex-col mb-5">
                       <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                         口味偏好
                       </h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">口味偏好</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {tasteOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => togglePreference(opt.id)}
                          className={cn(
                            "py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3",
                            preferences.includes(opt.id)
                              ? "border-zju-green bg-zju-green-light text-zju-green shadow-lg shadow-zju-green/5"
                              : "border-transparent bg-[#F7F8FA] text-gray-400"
                          )}
                        >
                          <span className="font-black text-sm uppercase tracking-wider">{opt.label}</span>
                          {preferences.includes(opt.id) && <motion.div layoutId="survey-check" className="w-2 h-2 rounded-full bg-zju-green" />}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex flex-col mb-5">
                       <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                         我的目标
                       </h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">营养目标</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {goalOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setGoal(opt.id)}
                          className={cn(
                            "p-5 rounded-2xl border-2 transition-all flex items-center justify-between",
                            goal === opt.id
                              ? "border-zju-green bg-zju-green-light text-zju-green shadow-lg shadow-zju-green/5"
                              : "border-transparent bg-[#F7F8FA] text-gray-400"
                          )}
                        >
                          <span className="font-black text-sm uppercase tracking-wider">{opt.label}</span>
                          <div className={cn(
                            "w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-colors",
                            goal === opt.id ? "border-zju-green bg-white" : "border-gray-200"
                          )}>
                            {goal === opt.id && <motion.div layoutId="survey-radio" className="w-2.5 h-2.5 rounded-lg bg-zju-green" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <button
                    onClick={handleStartSurveyRecommendation}
                    className="w-full py-5 bg-zju-green text-white rounded-3xl font-black shadow-xl shadow-zju-green/30 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                  >
                    生成智能推荐
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col">
                      <h3 className="text-base font-black tracking-tight flex items-center gap-2 text-[#1A1A1A]">
                         为您精选
                         {surveyLoading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-zju-green border-t-transparent rounded-full" />}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">为您精选</p>
                    </div>
                    <button onClick={() => setSurveyStep(1)} className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 py-2 bg-white rounded-2xl border border-white shadow-sm active:scale-95 transition-all">返回</button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {surveyLoading ? (
                      <div className="py-20 flex flex-col items-center gap-5">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-12 h-12 rounded-3xl bg-zju-green-light flex items-center justify-center">
                           <Sparkles className="w-6 h-6 text-zju-green" />
                        </motion.div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest animate-pulse">正在拼命计算口味...</p>
                      </div>
                    ) : (
                      surveyResults.map((dish, i) => (
                        <motion.div
                          key={dish.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white rounded-3xl p-5 border border-white shadow-premium flex gap-5 group"
                        >
                          <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-[2rem]">
                            <img src={dish.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-start">
                                <h4 className="font-black text-sm text-[#1A1A1A] leading-tight flex-1 mr-2">{dish.name}</h4>
                                <span className="text-zju-accent font-black text-sm">¥{dish.price}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] text-zju-green bg-zju-green-light self-start px-2 py-1 rounded-xl font-black uppercase tracking-wider">
                                {dish.reason}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                               <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase">{dish.calories} 千卡</span>
                               <Link 
                                  to={`/dish/${dish.id}`} 
                                  className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-all hover:bg-zju-green-light hover:text-zju-green active:scale-90"
                               >
                                  <ChevronRight className="w-4 h-4" />
                               </Link>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-6 pb-32"
            >
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col gap-3", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "flex gap-3 max-w-[90%]",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {mode === "chat" && (
        <div className="fixed bottom-24 left-0 right-0 p-6 z-30 pointer-events-none">
          <div className="max-w-md mx-auto flex items-center gap-3 pointer-events-auto">
            <div className="flex-1 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-premium border border-white px-5 py-2 flex items-center gap-3">
              <input
                type="text"
                placeholder="和食堂小助手聊聊..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
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
      )}
    </div>
  );
}
