import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, ChevronLeft, Star, ArrowUpDown, ShieldCheck, Plus, Camera, CheckCircle2, UserCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { dishService } from "@/src/services/api";

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
  tags?: string[];
  is_sold_out?: boolean;
}

export default function Menu() {
  const { canteenId } = useParams();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: number, name: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [contribution, setContribution] = useState({ name: "", price: "", image: "" });
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim()) {
        try {
          const results = await dishService.getSuggestions(search);
          setSuggestions(results);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    const fetchData = async () => {
      try {
        const data = await dishService.getAll();
        // Filter by canteen if canteenId is provided (assuming getAll returns all or we can pass param)
        // For now, let's filter purely client side for the generic getAll or update getAll to accept params
        const filtered = canteenId ? data.filter((d: any) => d.canteen_id === Number(canteenId)) : data;
        setDishes(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canteenId]);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  const handleContribute = async () => {
    if (!contribution.name || !contribution.price) return;
    setSubmitting(true);
    try {
      const data = await dishService.contribute({
        ...contribution,
        price: Number(contribution.price)
      });
      setDishes(prev => [data, ...prev]);
      setIsContributionModalOpen(false);
      setContribution({ name: "", price: "", image: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updated = await dishService.confirmDish(id);
      setDishes(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDishes = dishes
    .filter(d => {
      const kw = search.toLowerCase();
      return d.name.toLowerCase().includes(kw) || 
             d.tags?.some(tag => tag.toLowerCase().includes(kw));
    })
    .sort((a, b) => {
      if (filter === "price_asc") return a.price - b.price;
      if (filter === "price_desc") return b.price - a.price;
      if (filter === "rating") return b.rating - a.rating;
      if (filter === "healthy") return a.calories - b.calories;
      return 0;
    });

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F7F8FA]">
      <div className="sticky top-0 bg-white z-30 px-6 pt-10 pb-4 border-b border-gray-100 flex flex-col gap-6">
        <div className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-24 bg-gray-50 rounded-2xl shrink-0 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-[4/5] bg-white rounded-[2.5rem] animate-pulse shadow-sm" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F7F8FA]">
      {/* Search Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-30 px-6 pt-10 pb-4 border-b border-gray-100 flex flex-col gap-6 shadow-premium">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#F7F8FA] rounded-2xl flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-zju-green transition-colors" />
            <input
              type="text"
              placeholder="搜索校内美味..."
              value={search}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveSearch(search)}
              className="w-full bg-[#F7F8FA] pl-12 pr-6 py-3.5 rounded-[1.5rem] text-sm focus:outline-none focus:ring-1 focus:ring-zju-green/20 transition-all font-bold placeholder:text-gray-300"
            />

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {isSearchFocused && suggestions.length > 0 && search.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-premium-dark border border-gray-100 overflow-hidden z-50 p-2"
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        setSearch(suggestion.name);
                        saveSearch(suggestion.name);
                        setIsSearchFocused(false);
                      }}
                      className="w-full px-6 py-4 flex items-center gap-3 text-sm font-bold text-[#1A1A1A] hover:bg-zju-green-light hover:text-zju-green transition-all rounded-2xl text-left"
                    >
                      <Search className="w-3.5 h-3.5 opacity-30" />
                      {suggestion.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent Searches */}
        <AnimatePresence>
          {isSearchFocused && recentSearches.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">最近搜索</span>
                <button onClick={clearRecent} className="text-[10px] font-black text-zju-accent tracking-widest uppercase">清空</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearch(term);
                      setIsSearchFocused(false);
                    }}
                    className="px-4 py-2 bg-[#F7F8FA] text-[11px] font-bold text-gray-600 rounded-xl border border-gray-100 active:scale-95 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar -mx-6 px-6">
          {[
            { id: "all", label: "综合", icon: null },
            { id: "price_asc", label: "格优选", icon: ArrowUpDown },
            { id: "rating", label: "高评分", icon: Star },
            { id: "healthy", label: "低热量", icon: ShieldCheck },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap",
                filter === item.id 
                  ? "bg-zju-green text-white shadow-lg shadow-zju-green/20" 
                  : "bg-white border border-gray-100 text-gray-400 hover:text-gray-600"
              )}
            >
              {item.icon && <item.icon className="w-3.5 h-3.5" />}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid with Bento / Masonry feel */}
      <div className="p-6 grid grid-cols-2 gap-5">
        {filteredDishes.map((dish, i) => (
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/dish/${dish.id}`}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-premium flex flex-col group relative"
            >
              <div className="relative aspect-square overflow-hidden">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
                {dish.is_sold_out && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-xl border border-white rotate-[-5deg]">
                       <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">已售罄</span>
                    </div>
                  </div>
                )}
                {!dish.is_official && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl text-[8px] font-black text-[#1A1A1A] flex items-center gap-1 shadow-sm border border-white/50">
                    <UserCheck className="w-2.5 h-2.5" />
                    <span className="uppercase tracking-widest">社区贡献</span>
                  </div>
                )}
                {dish.is_verified && (
                  <div className="absolute top-3 right-3 bg-zju-green px-2 py-1 rounded-xl text-[8px] font-black text-white flex items-center gap-1 shadow-lg shadow-zju-green/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span className="uppercase tracking-widest">官方认证</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col gap-2">
                <h3 className="font-black text-sm text-[#1A1A1A] tracking-tight truncate">{dish.name}</h3>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                  <div className="flex items-center gap-1 text-[#FFB800] bg-[#FFB800]/10 px-1.5 py-0.5 rounded-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="translate-y-[1px]">{dish.rating || 0}</span>
                  </div>
                  <span className="uppercase tracking-widest opacity-60">{dish.review_count} 条评价</span>
                </div>
                
                {!dish.is_official && !dish.is_verified && (
                  <button 
                    onClick={(e) => handleConfirm(e, dish.id)}
                    className="mt-2 flex items-center justify-center gap-2 py-2 bg-[#F7F8FA] text-zju-green text-[9px] font-black uppercase tracking-widest rounded-xl border border-zju-green/10 active:scale-95 transition-all w-full"
                  >
                    确认 ({dish.confirmations || 0})
                  </button>
                )}

                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                  <span className="text-zju-accent font-black text-base tracking-tighter">¥{dish.price}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{dish.calories} kcal</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsContributionModalOpen(true)}
        className="fixed bottom-32 right-8 w-16 h-16 bg-zju-green text-white rounded-3xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 group border-4 border-white"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Contribution Modal with Glass Morphism */}
      <AnimatePresence>
        {isContributionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContributionModalOpen(false)}
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
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">社区菜单共建计划</span>
                  <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">菜单共建计划</h2>
                </div>
                <button onClick={() => setIsContributionModalOpen(false)} className="w-10 h-10 bg-[#F7F8FA] rounded-2xl flex items-center justify-center text-gray-400">
                   <ChevronLeft className="w-5 h-5 rotate-270" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">菜品名称</span>
                  <input
                    type="text"
                    placeholder="输入菜名，如：酸菜鱼"
                    value={contribution.name}
                    onChange={(e) => setContribution({ ...contribution, name: e.target.value })}
                    className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-zju-green/20"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">价格</span>
                  <input
                    type="number"
                    placeholder="如：15"
                    value={contribution.price}
                    onChange={(e) => setContribution({ ...contribution, price: e.target.value })}
                    className="w-full bg-[#F7F8FA] rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-zju-green/20"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">上传图片证据</span>
                  <div className="w-full h-40 bg-[#F7F8FA] rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer hover:border-zju-green/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-zju-green" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">拍照并上传</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContribute}
                disabled={submitting || !contribution.name || !contribution.price}
                className={cn(
                  "w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl",
                  submitting || !contribution.name || !contribution.price
                    ? "bg-gray-100 text-gray-400 shadow-none pointer-events-none"
                    : "bg-zju-green text-white shadow-zju-green/30 active:scale-95"
                )}
              >
                {submitting ? "正在处理..." : "发布到社区"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


