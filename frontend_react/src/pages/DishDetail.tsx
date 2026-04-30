import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Plus, Star, UserCheck, Heart, Info, Award, ThumbsUp, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { dishService, reviewService, userService, nutritionService } from "@/src/services/api";

interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  calories: number;
  rating: number;
  review_count: number;
  is_official?: boolean;
  is_verified?: boolean;
  confirmations?: number;
  nutrients: {
    protein: number;
    fat: number;
    carbs: number;
  };
}

interface Review {
  id: number;
  user: string;
  rating: number;
  content: string;
  avatar: string;
  likes?: number;
  date?: string;
}

export default function DishDetail() {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [sortByRating, setSortByRating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!dishId) return;
      try {
        const [dishData, reviewsData, favoritesData] = await Promise.all([
          dishService.getById(dishId),
          reviewService.getByDishId(dishId),
          userService.getFavorites(),
        ]);
        setDish(dishData);
        setReviews(reviewsData);
        setIsFavorited(favoritesData.some((f: any) => f.id === Number(dishId)));
      } catch (error) {
        console.error("Failed to fetch dish detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dishId]);

  const handleToggleFavorite = async () => {
    if (!dishId) return;
    try {
      if (isFavorited) {
        await userService.removeFavorite(Number(dishId));
        setIsFavorited(false);
      } else {
        await userService.addFavorite(Number(dishId));
        setIsFavorited(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSoldOut = async () => {
    if (!dishId) return;
    try {
      const updated = await dishService.toggleSoldOut(Number(dishId));
      setDish(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToMeal = async () => {
    if (!dish) return;
    try {
      await nutritionService.addLog({ 
        name: dish.name, 
        calories: dish.calories, 
        type: "正餐",
        protein: dish.nutrients.protein,
        fat: dish.nutrients.fat,
        carbs: dish.nutrients.carbs
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirm = async () => {
    if (!dish || confirming) return;
    setConfirming(true);
    try {
      const updated = await dishService.confirmDish(dish.id);
      setDish(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  const handleLikeReview = async (reviewId: number) => {
    try {
      const updatedReview = await reviewService.like(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
    } catch (e) {
      console.error(e);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortByRating) {
      return b.rating - a.rating;
    }
    return b.id - a.id;
  });

  const handleReviewSubmit = async () => {
    if (!dishId || !newReview.content.trim()) return;
    setSubmitting(true);
    try {
      const data = await reviewService.create({
        dish_id: Number(dishId),
        user: "浙大吃货", 
        rating: newReview.rating,
        content: newReview.content,
      });
      setReviews((prev) => [data, ...prev]);
      setIsReviewModalOpen(false);
      setNewReview({ rating: 5, content: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !dish) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-zju-green border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] pb-32">
      {/* Immersive Header Overlay */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-40">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 bg-black/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleToggleFavorite}
            className={cn(
              "w-12 h-12 backdrop-blur-xl rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-white/10",
              isFavorited ? "bg-zju-accent text-white" : "bg-black/10 text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
          </button>
          <button className="w-12 h-12 bg-black/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={dish.image} 
          alt={dish.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F8FA] via-transparent to-black/20" />
      </div>

      {/* Content Container */}
      <div className="relative -mt-20 px-6 flex flex-col gap-8 pb-10">
        {/* Main Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-8 shadow-premium border border-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-zju-green/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col gap-6">
            {!dish.is_official && (
              <div className={cn(
                "p-4 rounded-2xl flex items-center justify-between gap-4 border",
                dish.is_verified ? "bg-zju-green-light border-zju-green/10 text-zju-green" : "bg-[#F7F8FA] border-gray-100 text-gray-400"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", dish.is_verified ? "bg-white border-zju-green/20 shadow-sm" : "bg-white border-gray-100")}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                      {dish.is_verified ? "官方认证" : "校友贡献"}
                    </span>
                    <span className="text-xs font-bold mt-0.5">
                      {dish.is_verified ? "食堂官方菜单项" : `${dish.confirmations} 位同学确认存在`}
                    </span>
                  </div>
                </div>
                {!dish.is_verified && (
                  <button 
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="bg-zju-green text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-zju-green/20 active:scale-95 transition-all"
                  >
                    确认存在
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">{dish.name}</h1>
                  {dish.is_sold_out && (
                    <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-xl shadow-lg shadow-red-500/20 uppercase tracking-widest">
                       已售罄
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 text-zju-green bg-zju-green-light px-2.5 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="translate-y-[0.5px]">{dish.rating}</span>
                  </div>
                  <span>{dish.review_count} 条点评</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">价格</span>
                <span className="text-3xl font-black text-zju-accent tracking-tighter">¥{dish.price}</span>
              </div>
            </div>

            {dish.is_sold_out && (
              <div className="p-5 bg-red-50 border border-red-100 rounded-[2rem] flex flex-col gap-3">
                 <div className="flex items-center gap-2 text-red-500">
                    <Info className="w-5 h-5" />
                    <span className="text-sm font-black tracking-tight">手慢无！今日已售罄</span>
                 </div>
                 <p className="text-xs text-red-400 font-medium leading-relaxed">附近的同学刚刚反馈这道菜选完了，你可以看看其他推荐，或者等明天再来哦~</p>
              </div>
            )}

            {!dish.is_sold_out && (
              <button 
                onClick={handleToggleSoldOut}
                className="w-fit self-start px-4 py-2 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100 active:scale-95 transition-all"
              >
                标记为售罄
              </button>
            )}
            
            {dish.is_sold_out && (
              <button 
                onClick={handleToggleSoldOut}
                className="w-fit self-start px-4 py-2 bg-green-50 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-green-100 active:scale-95 transition-all"
              >
                还有货？撤销标记
              </button>
            )}

            {/* Nutrition Visualization */}
            <div className="bg-[#F7F8FA] rounded-[2rem] p-6 border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">营养结构</h3>
                  <div className="flex items-center gap-1 text-[10px] font-black text-zju-green bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                    <Award className="w-3 h-3" />
                    <span>营养均衡</span>
                  </div>
               </div>
               <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-2xl font-black text-zju-green tracking-tighter">{dish.calories}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">热量</span>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-[-8px] top-1/4 bottom-1/4 w-[1px] bg-gray-200" />
                    <span className="text-sm font-black text-[#1A1A1A]">{dish.nutrients.protein}g</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">蛋白质</span>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-[-8px] top-1/4 bottom-1/4 w-[1px] bg-gray-200" />
                    <span className="text-sm font-black text-[#1A1A1A]">{dish.nutrients.fat}g</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">脂肪</span>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-[-8px] top-1/4 bottom-1/4 w-[1px] bg-gray-200" />
                    <span className="text-sm font-black text-[#1A1A1A]">{dish.nutrients.carbs}g</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">碳水</span>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Community Reviews Card */}
        <section className="flex flex-col gap-6 px-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">校友评价</span>
              <h3 className="text-xl font-black text-[#1A1A1A]">用户点评</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortByRating(!sortByRating)}
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                  sortByRating ? "bg-white text-zju-green border-zju-green/20 shadow-premium" : "bg-[#F7F8FA] text-gray-300 border-gray-100"
                )}
              >
                <ArrowUpDown className="w-3 h-3" />
                {sortByRating ? "好评优先" : "时间排序"}
              </button>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="px-6 py-2.5 bg-zju-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-zju-green/20 active:scale-95 transition-all"
              >
                我要点评
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {sortedReviews.map((review, i) => (
              <motion.div 
                key={review.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-6 bg-white rounded-[2rem] border border-white shadow-premium group"
              >
                <div className="relative shrink-0">
                  <img src={review.avatar} alt="" className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 group-hover:scale-110 transition-transform" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 fill-zju-accent text-zju-accent" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#1A1A1A] tracking-tight">{review.user}</span>
                      <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest leading-none mt-1">{review.date || "刚刚"}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-2.5 h-2.5", i < review.rating ? "fill-zju-accent text-zju-accent" : "text-gray-100")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{review.content}</p>
                  
                  <div className="flex justify-start mt-2">
                    <button 
                      onClick={() => handleLikeReview(review.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-zju-green hover:bg-zju-green-light transition-all active:scale-95"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{review.likes || 0} 点赞</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Premium Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
        <div className="max-w-md mx-auto flex gap-4">
          <button 
            onClick={handleAddToMeal}
            className={cn(
              "flex-[2] h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border shadow-premium",
              added 
                ? "bg-white text-gray-300 border-gray-100" 
                : "bg-zju-green text-white border-zju-green shadow-zju-green/30 active:scale-95"
            )}
          >
            {added ? "已加入计划" : <><Plus className="w-4 h-4" /> 加入饮食计划</>}
          </button>
          <button className="flex-1 h-16 bg-white/80 backdrop-blur-xl text-[#333] rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-premium border border-white">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-[#F7F8FA]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-[3.5rem] p-10 shadow-premium flex flex-col gap-10 pb-16 border-t border-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">分享你的美味体验</span>
                  <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">为您最爱的菜品点评</h2>
                </div>
                <button onClick={() => setIsReviewModalOpen(false)} className="w-10 h-10 bg-[#F7F8FA] rounded-2xl flex items-center justify-center text-gray-400">
                   <ChevronLeft className="w-5 h-5 rotate-270" />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">星级评分</span>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="transition-transform active:scale-90"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                          star <= newReview.rating ? "bg-white border-zju-accent shadow-lg shadow-zju-accent/10" : "bg-[#F7F8FA] border-transparent"
                        )}>
                          <Star 
                            className={cn(
                              "w-6 h-6",
                              star <= newReview.rating ? "fill-zju-accent text-zju-accent" : "text-gray-200"
                            )} 
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">你的看法</span>
                  <textarea
                    placeholder="分享一下你的体验吧..."
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    className="w-full h-40 bg-[#F7F8FA] rounded-[2rem] p-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-zju-green/20 resize-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              <button
                onClick={handleReviewSubmit}
                disabled={submitting || !newReview.content.trim()}
                className={cn(
                  "w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl",
                  submitting || !newReview.content.trim() 
                    ? "bg-gray-100 text-gray-400 shadow-none pointer-events-none" 
                    : "bg-zju-green text-white shadow-zju-green/30 active:scale-95"
                )}
              >
                {submitting ? "正在发布..." : "提交点评"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
