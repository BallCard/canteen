import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Heart, Settings, UtensilsCrossed, Info, ChevronRight, Award, TrendingUp, Calendar, Flame } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { userService } from "@/src/services/api";

interface ProfileData {
  nickname: string;
  points: number;
  rank: number;
  preferences: {
    taste?: string[];
    favorites?: number[];
    preference?: string;
    goal: string;
    budget?: string;
    lunchTime?: string;
    avoid?: string;
    memoryEnabled?: boolean;
    connectedApps?: string[];
  };
  stats?: {
    logged_days: number;
    total_reviews: number;
    favorite_count: number;
    calories_today: number;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService.getProfile()
      .then((data) => setProfile(data));
  }, []);

  if (!profile) return null;

  const preferences = profile.preferences || { goal: "均衡" };
  const tastes = preferences.taste || [];

  const savePreferences = async (next: Partial<ProfileData["preferences"]>) => {
    const updated = { ...preferences, ...next };
    setProfile({ ...profile, preferences: updated });
    setSaving(true);
    try {
      await userService.updatePreferences({
        tastes: updated.taste || [],
        goal: updated.goal,
        budget: updated.budget,
        lunchTime: updated.lunchTime,
        avoid: updated.avoid,
        memoryEnabled: updated.memoryEnabled,
        connectedApps: updated.connectedApps,
      });
      localStorage.setItem("canteen_preference_memory", JSON.stringify({
        memoryEnabled: updated.memoryEnabled ?? true,
        tastes: updated.taste || [],
        goal: updated.goal || "均衡",
        budget: updated.budget || "15元以内",
        lunchTime: updated.lunchTime || "12:10",
        avoid: updated.avoid || "无",
      }));
    } finally {
      setSaving(false);
    }
  };

  const toggleTaste = (taste: string) => {
    const next = tastes.includes(taste) ? tastes.filter((item) => item !== taste) : [...tastes, taste];
    savePreferences({ taste: next });
  };

  const menuItems = [
    { icon: MessageSquare, label: "我的点评", count: profile.stats?.total_reviews ?? 0, color: "text-blue-500", bg: "bg-blue-50", path: "/profile" },
    { icon: Heart, label: "我的收藏", count: profile.stats?.favorite_count ?? 0, color: "text-red-500", bg: "bg-red-50", path: "/favorites" },
    { icon: UtensilsCrossed, label: "营养目标设置", color: "text-zju-green", bg: "bg-zju-green-light", path: "/track" },
    { icon: Settings, label: "AI 偏好记忆", color: "text-gray-500", bg: "bg-gray-100", path: "/recommend" },
  ];

  const statsCards = [
    { icon: Calendar, label: "打卡天数", value: profile.stats?.logged_days ?? 0, unit: "天", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Flame, label: "今日摄入", value: profile.stats?.calories_today ?? 0, unit: "kcal", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: TrendingUp, label: "本周进步", value: "+12", unit: "%", color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] pb-32">
      {/* Top Profile Header - Integrated into bg */}
      <div className="relative pt-20 pb-12 px-8 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zju-green/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-zju-accent/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center gap-6 relative">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-[32px] border-4 border-white shadow-premium p-1 bg-white ring-1 ring-gray-100 overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.nickname}`} className="w-full h-full rounded-[24px] bg-gray-50" alt="" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-zju-accent p-2 rounded-2xl border-4 border-white shadow-lg shadow-zju-accent/20">
               <Award className="w-4 h-4 text-white" />
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-[#1A1A1A]">{profile.nickname}</h2>
            <div className="flex bg-[#F7F8FA] rounded-2xl px-6 py-3 shadow-inner-soft border border-gray-100 gap-8">
              <div className="flex flex-col items-center">
                <span className="text-base font-black text-zju-green tracking-tight">{profile.points}</span>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">经验值</span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex flex-col items-center">
                <span className="text-base font-black text-[#1A1A1A] tracking-tight">#{profile.rank}</span>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">社区排名</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu List with Bento feel */}
      <div className="px-6 -mt-4 flex flex-col gap-6 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-white shadow-premium flex flex-col items-center gap-2"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-black text-[#1A1A1A] tracking-tight">{stat.value}</span>
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-white shadow-premium active:scale-98 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start translate-y-[1px]">
                   <span className="text-sm font-black text-[#1A1A1A] tracking-tight">{item.label}</span>
                   {item.count !== undefined && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.count} 项内容</span>}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-zju-green transition-colors" />
            </motion.button>
          ))}
        </div>

        <section className="bg-white rounded-3xl p-6 border border-white shadow-premium flex flex-col gap-5">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">AI 记忆</span>
              <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">让助手记住你的吃饭习惯</h3>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">用于推荐时自动考虑口味、预算、饭点和忌口。</p>
            </div>
            <button
              onClick={() => savePreferences({ memoryEnabled: !(preferences.memoryEnabled ?? true) })}
              className={cn(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                preferences.memoryEnabled ?? true ? "bg-zju-green text-white" : "bg-gray-100 text-gray-400"
              )}
            >
              {preferences.memoryEnabled ?? true ? "已开启" : "已关闭"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["少油", "高蛋白", "清淡", "爱吃辣", "控制预算", "素食友好"].map((taste) => (
              <button
                key={taste}
                onClick={() => toggleTaste(taste)}
                className={cn(
                  "px-4 py-2 rounded-2xl text-[11px] font-black transition-all",
                  tastes.includes(taste) ? "bg-zju-green-light text-zju-green border border-zju-green/20" : "bg-[#F7F8FA] text-gray-400 border border-gray-100"
                )}
              >
                {taste}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">营养目标</span>
              <select
                value={preferences.goal || "均衡"}
                onChange={(event) => savePreferences({ goal: event.target.value })}
                className="bg-[#F7F8FA] rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
              >
                <option>均衡</option>
                <option>减脂</option>
                <option>增肌</option>
                <option>控糖</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">午饭时间</span>
              <input
                value={preferences.lunchTime || "12:10"}
                onChange={(event) => savePreferences({ lunchTime: event.target.value })}
                className="bg-[#F7F8FA] rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">预算</span>
              <input
                value={preferences.budget || "15元以内"}
                onChange={(event) => savePreferences({ budget: event.target.value })}
                className="bg-[#F7F8FA] rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">忌口</span>
              <input
                value={preferences.avoid || "无"}
                onChange={(event) => savePreferences({ avoid: event.target.value })}
                className="bg-[#F7F8FA] rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(preferences.connectedApps || ["QQ 群", "日历", "运动 App"]).map((app) => (
              <div key={app} className="bg-[#F7F8FA] rounded-2xl px-3 py-3 text-center border border-gray-100">
                <span className="text-[10px] font-black text-gray-500">{app}</span>
              </div>
            ))}
          </div>

          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{saving ? "保存中..." : "偏好会同步给 AI 推荐"}</span>
        </section>

        <div className="bg-white rounded-3xl p-2 border border-white shadow-premium">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-2xl group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-[#1A1A1A] tracking-tight">关于助手</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-zju-green transition-colors" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-30 select-none py-10 grayscale">
           <div className="flex items-center gap-2">
             <div className="w-6 h-[1px] bg-gray-400" />
             <h1 className="text-xs font-black tracking-[0.3em] uppercase">校园食堂助手</h1>
             <div className="w-6 h-[1px] bg-gray-400" />
           </div>
           <span className="text-[9px] font-black tracking-widest text-zju-green">BUILD 2026.04.29-PREMIUM</span>
        </div>
      </div>
    </div>
  );
}


