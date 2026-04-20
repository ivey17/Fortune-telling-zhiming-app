import React, { useState } from 'react';
import { Sparkles, Briefcase, Wallet, Heart, BrainCircuit, X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FortuneScore } from '../types';
import { askFortuneAI } from '../services/aiService';
import { cn } from '../lib/utils';

const SCORES: FortuneScore[] = [
  { label: '今日总运', icon: 'Sparkles', score: 4, analysis: '今日受到紫微星感应，整体气场呈现平稳上升态势。天干地支相合，是执行长远计划的好时机。建议保持谦逊，多听取周围人的建议，会有意外之喜。' },
  { label: '事业功名', icon: 'Briefcase', score: 5, analysis: '驿马星动，事业运势如日中天。你的才华今天特别容易被上司或贵人察觉。不要害怕展示你的新想法，果断出击是今日的成功秘诀。' },
  { label: '财源利禄', icon: 'Wallet', score: 3, analysis: '财星入库但略有冲撞，正财稳健，偏财则需谨慎。今日不宜进行激进的财务投资或大额消费。守稳根基，理性理财可以有效规避潜在风险。' },
  { label: '姻缘情感', icon: 'Heart', score: 4, analysis: '红鸾星若隐若现，单身者适合参加社交活动，容易遇到品位一致的新朋友。有伴侣者适宜共同探讨未来计划，感情在深度交流中会进一步升华。' },
];

const ICON_MAP: Record<string, any> = {
  Sparkles, Briefcase, Wallet, Heart
};

export default function FortunePage() {
  const [selectedFortune, setSelectedFortune] = useState<typeof SCORES[0] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const response = await askFortuneAI(userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', content: response.content }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', content: '（系统波动）星象暂时模糊，请稍后再试。' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Title */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h2 className="text-4xl font-extrabold tracking-tight font-headline text-primary">今日运势</h2>
        <p className="text-on-surface-variant font-label tracking-widest uppercase text-xs">农历 丁未年 三月初七</p>
      </motion.section>

      {/* Yi/Ji Banner */}
      <section className="flex gap-4 items-center justify-center">
        <div className="flex-1 bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-400/60 shadow-[0_0_8px_rgba(74,222,128,0.4)]"></span>
          <span className="font-headline font-bold text-on-surface">宜：签约·出行</span>
        </div>
        <div className="flex-1 bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3 opacity-60">
          <span className="w-2 h-2 rounded-full bg-on-surface-variant/40"></span>
          <span className="font-headline font-bold text-on-surface-variant">忌：动土·嫁娶</span>
        </div>
      </section>

      {/* Fortune Scores Grid */}
      <section className="grid grid-cols-2 gap-4">
        {SCORES.map((item, idx) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFortune(item)}
              className="bg-surface-container-low p-6 rounded-xl space-y-4 cursor-pointer hover:bg-surface-container-highest transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="font-headline text-xs uppercase tracking-widest text-primary/70">{item.label}</span>
                <Icon className="text-primary" size={20} />
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Sparkles 
                    key={i} 
                    size={16} 
                    className={i < item.score ? "text-primary fill-primary" : "text-primary/20"} 
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Fortune Analysis Overlay */}
      <AnimatePresence>
        {selectedFortune && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-primary/10 border border-primary/20 p-6 rounded-2xl relative overflow-hidden"
          >
            <button 
              onClick={() => setSelectedFortune(null)}
              className="absolute top-4 right-4 text-primary opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary text-background rounded-lg">
                {React.createElement(ICON_MAP[selectedFortune.icon], { size: 18 })}
              </div>
              <h3 className="font-headline font-bold text-xl text-primary">{selectedFortune.label}深度解析</h3>
            </div>
            <p className="font-body text-on-surface leading-relaxed text-sm">
              {selectedFortune.analysis}
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] text-primary/60 font-label tracking-widest uppercase">
              <Sparkles size={12} />
              知命 AI 运势引擎计算中
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Diary */}
      <section className="glass-card p-8 rounded-[2rem] border border-outline-variant/10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center">
            <BrainCircuit className="text-primary" size={18} />
          </div>
          <h3 className="font-headline font-bold text-primary">灵启日记</h3>
        </div>
        <p className="font-body text-lg leading-relaxed text-on-surface/90">
          今日天干丁火与命盘食神相合，虽有忙碌之象，但在事业规划上容易获得贵人点拨。建议在午后时刻关注西南方位的讯息，或许能化解多日以来的决策困境。情绪平稳是今日致胜的关键。
        </p>
        <div className="mt-8 flex justify-end">
          <span className="font-headline text-[10px] tracking-widest text-primary/40">知命 AI 洞察报告</span>
        </div>
      </section>

      {/* CTA Button */}
      <section className="pt-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsChatOpen(true)}
          className="w-full py-5 px-8 rounded-xl bg-gradient-to-br from-primary to-primary-container text-background font-headline font-extrabold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(242,195,107,0.2)]"
        >
          向命盘 AI 追问今日运势
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Sparkles size={20} />
          </motion.span>
        </motion.button>
      </section>

      {/* Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col"
          >
            <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MessageCircle size={20} />
                </div>
                <span className="font-headline font-bold">命盘 AI 对话</span>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40 space-y-4">
                  <Sparkles size={48} className="opacity-20 animate-pulse" />
                  <p className="text-sm font-headline">您可以咨询关于今日运势的任何深度细节</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-background font-bold rounded-tr-none" 
                      : "bg-surface-container-highest text-on-surface rounded-tl-none border border-outline-variant/10"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-primary/60 text-xs animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  正在解析星象能量...
                </div>
              )}
            </div>

            <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low/50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="请输入您的追问..."
                  className="flex-1 bg-background border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button 
                  onClick={handleSendChat}
                  disabled={isAiLoading || !chatInput.trim()}
                  className="p-3 bg-primary text-background rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
