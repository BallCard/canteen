import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Heart, Settings, UtensilsCrossed, Info, ChevronRight, Award } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface ProfileData {
  nickname: string;
  points: number;
  rank: number;
  preferences: {
    taste: string[];
    goal: string;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  if (!profile) return null;

  const menuItems = [
    { icon: MessageSquare, label: "我的点评", count: 12, color: "text-blue-500", bg: "bg-blue-50", path: "/profile" },
    { icon: Heart, label: "我的收藏", count: 8, color: "text-red-500", bg: "bg-red-50", path: "/favorites" },
    { icon: UtensilsCrossed, label: "营养目标设置", color: "text-zju-green", bg: "bg-zju-green-light", path: "/track" },
    { icon: Settings, label: "偏好设置", color: "text-gray-500", bg: "bg-gray-100", path: "/profile" },
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
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">校内排名</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu List with Bento feel */}
      <div className="px-6 -mt-4 flex flex-col gap-6 relative z-10">
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
             <h1 className="text-xs font-black tracking-[0.3em] uppercase">浙大食堂助手</h1>
             <div className="w-6 h-[1px] bg-gray-400" />
           </div>
           <span className="text-[9px] font-black tracking-widest text-zju-green">BUILD 2026.04.29-PREMIUM</span>
        </div>
      </div>
    </div>
  );
}


