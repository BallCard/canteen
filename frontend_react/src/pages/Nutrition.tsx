import { useState, useEffect } from "react";
import { Camera, Plus, BarChart3, Clock, Utensils, Award, ChefHat, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { nutritionService, userService } from "@/src/services/api";

interface MealLog {
  id: number;
  name: string;
  type: string;
  time: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Goals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export default function Nutrition() {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [scanHint, setScanHint] = useState("");
  const [newMeal, setNewMeal] = useState({ name: "", calories: "", protein: "", fat: "", carbs: "", type: "正餐" });
  const [goals, setGoals] = useState<Goals>({ calories: 2400, protein: 150, fat: 70, carbs: 300 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, profileData] = await Promise.all([
          nutritionService.getTodayLogs(),
          userService.getProfile()
        ]);
        setLogs(logsData);
        if (profileData.goals) {
          setGoals(profileData.goals);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const current = logs.reduce((acc, log) => acc + log.calories, 0);
  const currentProtein = logs.reduce((acc, log) => acc + (log.protein || 0), 0);
  const currentFat = logs.reduce((acc, log) => acc + (log.fat || 0), 0);
  const currentCarbs = logs.reduce((acc, log) => acc + (log.carbs || 0), 0);

  const progress = Math.min((current / goals.calories) * 100, 100);

  const handleDelete = async (id: number) => {
    try {
      await nutritionService.deleteLog(id);
      setLogs(prev => prev.filter(log => log.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMeal = async () => {
    if (!newMeal.name || !newMeal.calories) return;
    try {
      const data = await nutritionService.addLog({
        ...newMeal,
        calories: Number(newMeal.calories),
        protein: Number(newMeal.protein) || 0,
        fat: Number(newMeal.fat) || 0,
        carbs: Number(newMeal.carbs) || 0
      });
      setLogs(prev => [...prev, data]);
      setIsAddModalOpen(false);
      setNewMeal({ name: "", calories: "", protein: "", fat: "", carbs: "", type: "正餐" });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-zju-green border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] pb-32">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-30 px-6 pt-10 pb-6 border-b border-gray-100 flex flex-col gap-1 shadow-premium">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">营养追踪</span>
        <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight">营养追踪</h1>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {/* Progress Card Overlaying Background */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-8 shadow-premium border border-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-zju-green/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">能量摄入</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-[#1A1A1A] tracking-tighter">{current}</span>
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">/ {goals.calories} 千卡</span>
              </div>
            </div>
            <div className={cn(
               "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest",
               current > goals.calories ? "bg-zju-accent/10 text-zju-accent" : "bg-zju-green-light text-zju-green"
            )}>
              {current > goals.calories ? "已超标" : "在范围内"}
            </div>
          </div>

          <div className="w-full h-4 bg-[#F7F8FA] rounded-full overflow-hidden mb-8 p-1 ring-1 ring-gray-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full shadow-lg",
                progress > 90 ? "bg-zju-accent" : "bg-zju-green"
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "蛋白质", color: "bg-blue-400", current: currentProtein, goal: goals.protein },
              { label: "脂肪", color: "bg-amber-400", current: currentFat, goal: goals.fat },
              { label: "碳水", color: "bg-indigo-400", current: currentCarbs, goal: goals.carbs }
            ].map((nut) => {
              const nutProgress = Math.min((nut.current / nut.goal) * 100, 100);
              return (
                <div key={nut.label} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{nut.label}</span>
                    <span className="text-[8px] font-bold text-gray-300">{nut.current}g</span>
                  </div>
                  <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${nutProgress}%` }}
                      className={cn("h-full rounded-full shadow-sm", nut.color)}
                     />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Timeline Section */}
        <section className="flex flex-col gap-6 px-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">Dietary Log</span>
              <h3 className="text-xl font-black text-[#1A1A1A]">今日饮食记录</h3>
            </div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{logs.length} 条今日记录</span>
          </div>

          <div className="flex flex-col gap-8 relative">
            {logs.length > 0 && <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-gray-200 dashed-path" />}
            
            <AnimatePresence mode="popLayout">
              {logs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 gap-6 opacity-30"
                >
                  <ChefHat className="w-16 h-16 text-zju-green" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">开始记录你的第一餐吧</p>
                </motion.div>
              ) : (
                logs.map((log, index) => (
                  <motion.div 
                    key={log.id} 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6 items-start relative z-10"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-white shadow-premium flex items-center justify-center text-zju-green group transition-transform hover:scale-110">
                       <Utensils className="w-5 h-5" />
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-[2rem] border border-white shadow-premium flex justify-between items-center group active:scale-[0.98] transition-all relative">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-black text-white bg-zju-green px-2 py-0.5 rounded-lg uppercase tracking-widest">{log.type}</span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase tracking-widest"><Clock className="w-3 h-3" /> {log.time}</span>
                        </div>
                        <span className="font-black text-[13px] text-[#1A1A1A] tracking-tight">{log.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-base font-black text-[#1A1A1A] tracking-tighter">{log.calories}</span>
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">千卡</span>
                        </div>
                        <button 
                          onClick={() => handleDelete(log.id)}
                          className="p-3 rounded-2xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-[#F7F8FA]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-[3.5rem] p-10 shadow-premium flex flex-col gap-8 pb-12 border-t border-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">手动记录</span>
                  <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">添加饮食记录</h2>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-[#F7F8FA] rounded-2xl flex items-center justify-center text-gray-400">
                   <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">菜品名称</span>
                    <input
                      type="text"
                      placeholder="例如：生煎馒头"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                      className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-zju-green/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">餐次类别</span>
                    <select
                      value={newMeal.type}
                      onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
                      className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold focus:outline-none appearance-none"
                    >
                      <option>早餐</option>
                      <option>正餐</option>
                      <option>加餐</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">热量 (千卡)</span>
                  <input
                    type="number"
                    placeholder="450"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                    className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-zju-green/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">蛋白质</span>
                    <input
                      type="number"
                      placeholder="克"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                      className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold text-center focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">脂肪</span>
                    <input
                      type="number"
                      placeholder="克"
                      value={newMeal.fat}
                      onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
                      className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold text-center focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">碳水</span>
                    <input
                      type="number"
                      placeholder="克"
                      value={newMeal.carbs}
                      onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                      className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddMeal}
                className="w-full py-5 bg-zju-green text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-zju-green/30 active:scale-95 transition-all"
              >
                Log Meal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Floating Actions Toolbar */}
      <div className="fixed bottom-28 left-0 right-0 px-8 z-40">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => {
              setScanHint("AI 拍照识别为演示态，请先用手动记录添加餐食");
              setTimeout(() => setScanHint(""), 2600);
            }}
            className="flex-1 bg-zju-green text-white h-16 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-zju-green/30 active:scale-95 transition-all border-4 border-white"
          >
            <Camera className="w-5 h-5" /> AI 拍照识别
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-16 h-16 bg-white text-[#1A1A1A] rounded-2xl border border-white shadow-premium flex items-center justify-center active:scale-90 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button className="w-16 h-16 bg-white text-[#1A1A1A] rounded-2xl border border-white shadow-premium flex items-center justify-center active:scale-90 transition-all">
            <BarChart3 className="w-6 h-6" />
          </button>
        </div>
        {scanHint && (
          <div className="mt-3 mx-auto max-w-md rounded-2xl bg-white px-4 py-3 text-center text-[11px] font-black text-zju-green shadow-premium border border-white">
            {scanHint}
          </div>
        )}
      </div>
    </div>
  );
}
