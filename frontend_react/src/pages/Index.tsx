import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ChevronRight, Star, Sparkles, Dices, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { canteenService, dishService } from "@/src/services/api";

interface Canteen {
  id: number;
  name: string;
  distance: string;
  status: string;
  opening_hours: string;
  rating: number;
  busy_level?: string;
}

interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  reason: string;
  is_sold_out: boolean;
}

export default function Index() {
  const navigate = useNavigate();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [recommendations, setRecommendations] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLuckyDish, setShowLuckyDish] = useState(false);
  const [luckyDish, setLuckyDish] = useState<Dish | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [canteensData, recommendationsData] = await Promise.all([
          canteenService.getAll(),
          dishService.getRecommendations(),
        ]);
        setCanteens(canteensData);
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLuckyDraw = async () => {
    try {
      const allDishes = await dishService.getAll();
      const available = allDishes.filter((d: Dish) => !d.is_sold_out);
      if (available.length > 0) {
        const random = available[Math.floor(Math.random() * available.length)];
        setLuckyDish(random);
        setShowLuckyDish(true);
      }
    } catch (error) {
      console.error("Lucky draw failed:", error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-zju-green border-t-transparent rounded-full"
      />
      <p className="mt-4 text-xs font-medium text-gray-400 tracking-widest">加载中</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[#F7F8FA]">
      {/* Premium Header */}
      <header className="sticky top-0 z-20 px-6 pt-8 pb-4 bg-[#F7F8FA]/80 backdrop-blur-xl flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">智慧校园</span>
          <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">浙大食堂助手</h1>
        </div>
        <Link to="/map" className="w-10 h-10 bg-white rounded-2xl shadow-premium border border-white flex items-center justify-center active:scale-90 transition-all group">
          <MapPin className="w-5 h-5 text-zju-green group-hover:scale-110 transition-transform" />
        </Link>
      </header>

      <div className="px-6 flex flex-col gap-10">
        {/* Lucky Draw Section */}
        <section className="bg-zju-green rounded-[2.5rem] p-8 shadow-xl shadow-zju-green/20 relative overflow-hidden group mt-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex justify-between items-center relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">随机推荐</span>
              <h3 className="text-xl font-black text-white tracking-tight">选食困难症？</h3>
              <p className="text-[11px] text-white/80 font-medium max-w-[160px] leading-relaxed">让 AI 帮你选今天的中午饭吧！</p>
            </div>
            <button 
              onClick={handleLuckyDraw}
              className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-black/10 flex items-center justify-center text-zju-green active:scale-90 transition-all cursor-pointer"
            >
              <Dices className="w-8 h-8" />
            </button>
          </div>
        </section>

        {/* Modern Recommendations Section */}
        <section>
          <div className="flex justify-between items-end mb-5">
            <div className="flex flex-col">
              <h2 className="text-xl font-black tracking-tight">今日味觉</h2>
              <p className="text-[10px] text-gray-400 font-medium">精心挑选的最优选</p>
            </div>
            <Link to="/recommend" className="flex items-center gap-1.5 px-4 py-2 bg-zju-green text-white rounded-xl text-xs font-black shadow-lg shadow-zju-green/20 active:scale-95 transition-all">
              <Star className="w-3.5 h-3.5 fill-current" />
              AI 智能定制
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
            {recommendations.map((dish, i) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/dish/${dish.id}`} className="flex-shrink-0 w-72 bg-white rounded-3xl overflow-hidden border border-white shadow-premium block group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/50">
                      <span className="text-zju-accent font-black text-sm">¥{dish.price}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-2 bg-gradient-to-b from-white to-gray-50/30">
                    <h3 className="font-bold text-base text-[#1A1A1A] tracking-tight">{dish.name}</h3>
                    <p className="text-xs text-gray-400 font-medium line-clamp-1 leading-relaxed">{dish.reason}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Canteen List Section with Bento inspiration */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight">发现食堂</h2>
            <p className="text-[10px] text-gray-400 font-medium">按距离及评价排序</p>
          </div>
          <div className="flex flex-col gap-4">
            {canteens.map((canteen, i) => (
              <motion.div
                key={canteen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link
                  to={`/menu/${canteen.id}`}
                  className="flex items-center justify-between p-5 bg-white rounded-3xl border border-white shadow-premium hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-base text-[#1A1A1A] tracking-tight group-hover:text-zju-green transition-colors">{canteen.name}</h3>
                      <div className="flex gap-1.5">
                        <div className={cn(
                          "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider",
                          canteen.status === "营业中" ? "bg-zju-green-light text-zju-green" : "bg-gray-100 text-gray-400"
                        )}>
                          {canteen.status}
                        </div>
                        {canteen.status === "营业中" && (
                          <div className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider",
                            canteen.busy_level === "拥挤" ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-500"
                          )}>
                             {canteen.busy_level}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-[#F7F8FA] w-fit px-3 py-1.5 rounded-xl border border-gray-100/50">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-zju-green text-zju-green" />
                        <span className="text-[#1A1A1A]">{canteen.rating}</span>
                      </div>
                      <div className="w-[1px] h-2 bg-gray-200" />
                      <span>{canteen.distance}</span>
                      <div className="w-[1px] h-2 bg-gray-200" />
                      <span>{canteen.opening_hours}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-[#F7F8FA] rounded-2xl flex items-center justify-center group-hover:bg-zju-green-light transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-zju-green transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Lucky Draw Modal */}
      <AnimatePresence>
        {showLuckyDish && luckyDish && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#F7F8FA]/90 backdrop-blur-xl"
              onClick={() => setShowLuckyDish(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[3.5rem] p-10 shadow-premium flex flex-col gap-8 border border-white"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-[2rem] bg-zju-green-light flex items-center justify-center text-zju-green mb-2">
                   <Sparkles className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zju-green">AI 为你挑选</span>
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">缘分已到！</h2>
                <button 
                  onClick={() => setShowLuckyDish(false)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#F7F8FA] rounded-[2.5rem] p-3 flex flex-col gap-4 border border-gray-50">
                <div className="aspect-square relative rounded-[2rem] overflow-hidden">
                  <img src={luckyDish.image} alt={luckyDish.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex flex-col items-center gap-1 text-center">
                  <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">{luckyDish.name}</h3>
                  <div className="flex gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <span>¥{luckyDish.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/dish/${luckyDish.id}`)}
                  className="w-full py-5 bg-zju-green text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-zju-green/30 active:scale-95 transition-all"
                >
                  去吃这个！
                </button>
                <button
                  onClick={() => handleLuckyDraw()}
                  className="w-full py-5 bg-[#F7F8FA] text-gray-400 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all"
                >
                  再摇一个
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


