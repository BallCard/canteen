import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Activity, User, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

// Pages (will implement next)
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import DishDetail from "./pages/DishDetail";
import Recommend from "./pages/Recommend";
import Nutrition from "./pages/Nutrition";
import Profile from "./pages/Profile";
import CanteenMap from "./pages/CanteenMap";
import Favorites from "./pages/Favorites";

function BottomNav() {
  const location = useLocation();
  const tabs = [
    { name: "首页", path: "/", icon: Home },
    { name: "推荐", path: "/recommend", icon: Sparkles },
    { name: "追踪", path: "/track", icon: Activity },
    { name: "我的", path: "/profile", icon: User },
  ];

  const showNav = ["/", "/recommend", "/track", "/profile"].includes(location.pathname);

  if (!showNav) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 z-50 pointer-events-none">
      <nav className="max-w-md mx-auto h-16 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white shadow-premium flex justify-around items-center px-4 pointer-events-auto overflow-hidden relative">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="relative flex flex-col items-center justify-center gap-1 group flex-1"
            >
              <div className="relative">
                <tab.icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "text-zju-green scale-110" : "text-gray-400 group-hover:text-gray-600"
                )} />
                {isActive && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute -inset-2 bg-zju-green/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                isActive ? "text-zju-green opacity-100" : "text-gray-400 opacity-60"
              )}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F7F8FA] text-[#333333] font-sans pb-20">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
            <Route path="/menu/:canteenId" element={<PageWrapper><Menu /></PageWrapper>} />
            <Route path="/dish/:dishId" element={<PageWrapper><DishDetail /></PageWrapper>} />
            <Route path="/recommend" element={<PageWrapper><Recommend /></PageWrapper>} />
            <Route path="/track" element={<PageWrapper><Nutrition /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/map" element={<PageWrapper><CanteenMap /></PageWrapper>} />
            <Route path="/favorites" element={<PageWrapper><Favorites /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
        <BottomNav />
      </div>
    </Router>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
