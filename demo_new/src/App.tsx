/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChefHat, MessageSquare, Handshake, Sparkles, Smartphone, ArrowRight } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#51CF66] rounded-lg flex items-center justify-center text-white">
              <ChefHat size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">食堂助手</span>
          </div>
          <a
            href="/demo-animation.html"
            className="flex items-center gap-2 px-4 py-2 bg-[#51CF66] text-white rounded-full text-sm font-medium hover:bg-[#45bd59] transition-colors"
          >
            播放演示动画 <ArrowRight size={14} />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              让每一餐都变得<span className="text-[#51CF66]">智能简单</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI 驱动的校园食堂助手，通过对话交互、数据共建，为您提供最精准的个性化点餐推荐与营养管理。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/demo-animation.html"
                className="w-full sm:w-auto px-8 py-4 bg-[#51CF66] text-white rounded-2xl font-semibold shadow-lg shadow-green-200 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                播放比赛演示
              </a>
              <button className="w-full sm:w-auto px-8 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-semibold hover:bg-neutral-50 transition-all">
                了解更多功能
              </button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <section className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MessageSquare className="text-green-500" />}
              title="AI 对话助手"
              description="像聊天一样说出需求，AI 为你精准匹配菜品。"
            />
            <FeatureCard
              icon={<Handshake className="text-blue-500" />}
              title="菜单共建"
              description="用户参与评价与分享，社区数据让推荐更智能。"
            />
            <FeatureCard
              icon={<Sparkles className="text-amber-500" />}
              title="多元化呈现"
              description="视觉差异化展示，更直观的营养与口味分类。"
            />
            <FeatureCard
              icon={<Smartphone className="text-purple-500" />}
              title="摇一摇选菜"
              description="个性化随机推荐，解决“纠结症”的选择难题。"
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-10 text-center text-neutral-400 text-sm">
        <p>© 2026 智能食堂助手项目组. 保留所有权利。</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 bg-white rounded-[2rem] border border-neutral-100 shadow-sm text-left transition-all"
    >
      <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
