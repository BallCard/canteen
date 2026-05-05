import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Star, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { userService } from "@/src/services/api";

interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  review_count: number;
  calories: number;
}

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getFavorites()
      .then((data) => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const removeFavorite = async (dishId: number) => {
    try {
      await userService.removeFavorite(dishId);
      setFavorites((prev) => prev.filter((d) => d.id !== dishId));
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
      {/* Premium Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-30 px-6 pt-10 pb-6 border-b border-gray-100 flex items-center gap-6 shadow-premium">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#F7F8FA] rounded-2xl flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">收藏中心</span>
          <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight">我的收藏</h1>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {favorites.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-premium flex items-center justify-center text-gray-200">
                <Heart className="w-10 h-10" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider">暂无收藏</p>
                <p className="text-xs text-gray-400 font-bold">还没有收藏任何宝贝菜品哦</p>
              </div>
              <Link to="/" className="px-8 py-3 bg-zju-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-zju-green/20 active:scale-95 transition-all">
                去逛逛
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              <AnimatePresence mode="popLayout">
                {favorites.map((dish, i) => (
                  <motion.div
                    key={dish.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-premium flex flex-col relative group"
                  >
                    <Link to={`/dish/${dish.id}`} className="flex flex-col">
                      <div className="aspect-square relative overflow-hidden">
                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="p-5 flex flex-col gap-2">
                        <h3 className="font-black text-sm text-[#1A1A1A] tracking-tight truncate">{dish.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-zju-green">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{dish.rating}</span>
                          </div>
                          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{dish.calories} 千卡</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-50">
                          <span className="text-zju-accent font-black text-base tracking-tighter">¥{dish.price}</span>
                        </div>
                      </div>
                    </Link>
                    <button 
                      onClick={() => removeFavorite(dish.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm active:scale-90 transition-all flex items-center justify-center text-red-500 border border-white/50"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
