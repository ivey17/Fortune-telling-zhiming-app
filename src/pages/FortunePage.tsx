import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Briefcase, Wallet, Heart, BrainCircuit, X, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askFortuneAI, askAIStream } from '../services/aiService';
import { cn } from '../lib/utils';
import { toPng } from 'html-to-image';
import { Solar } from 'lunar-javascript';
import ZenLoader from '../components/ZenLoader';
import MarkdownContent from '../components/MarkdownContent';
import { useUser } from '../contexts/UserContext';
import { analyzeBazi } from '../lib/bazi';
import { cacheService, getSecondsUntilEndOfDay } from '../services/cacheService';

const ICON_MAP: Record<string, any> = {
  Sparkles, Briefcase, Wallet, Heart
};

export default function FortunePage() {
  const { profile, history, refreshHistory } = useUser();
  const [selectedFortune, setSelectedFortune] = useState<any | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const posterRef = React.useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [spiritDiary, setSpiritDiary] = useState<string | null>(null);
  const [isDiaryLoading, setIsDiaryLoading] = useState(false);

  // 加载今日历史对话
  useEffect(() => {
    if (!history) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayFortuneHistory = history
      .filter(h => h.type === 'fortune' && h.date === todayStr)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (todayFortuneHistory.length > 0) {
      const flattenedMessages = todayFortuneHistory.flatMap(h => h.messages);
      setChatMessages(flattenedMessages);
    }
  }, [history]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Dynamic Lunar Date
  const now = new Date();
  const solar = Solar.fromDate(now);
  const lunar = solar.getLunar();
  const lunarDateStr = `农历 ${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  const lunarDayOnly = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  const lunarYearOnly = `农历 ${lunar.getYearInGanZhi()}年`;

  const baziData = useMemo(() => {
    if (!profile?.birth_date) return null;
    return analyzeBazi(profile.birth_date);
  }, [profile?.birth_date]);

  // 动态计算分数
  const scores = useMemo(() => {
    const baseScores = [
      { label: '今日总运', icon: 'Sparkles', score: 3, analysis: '今日气场平稳。建议顺势而为，保持平常心。' },
      { label: '事业功名', icon: 'Briefcase', score: 3, analysis: '工作中规中矩，适合处理日常事务。' },
      { label: '财源利禄', icon: 'Wallet', score: 3, analysis: '财运平平，宜守不宜攻，谨慎理财。' },
      { label: '姻缘情感', icon: 'Heart', score: 3, analysis: '感情生活平静，多与伴侣沟通可增进感情。' },
    ];

    if (!baziData) return baseScores;

    const dayStem = lunar.getDayGan();
    const isFavorable = baziData.favorableElements.includes({
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    }[dayStem] || '');

    if (isFavorable) {
      return baseScores.map(s => ({ ...s, score: 5, analysis: '今日受到吉星感应，整体运势上升。适合执行重要计划。' }));
    }
    return baseScores;
  }, [baziData, lunar]);

  // 获取灵启日记并缓存
  useEffect(() => {
    if (!profile?.id || !baziData) return;

    const todayStr = now.toISOString().split('T')[0];
    const cacheKey = `spirit_v2_diary_${profile.id}_${todayStr}`;
    const cached = cacheService.get<string>(cacheKey);

    if (cached && !cached.includes("天机混沌")) {
      setSpiritDiary(cached);
    } else {
      fetchDiary();
    }

    async function fetchDiary() {
      setIsDiaryLoading(true);
      try {
        const prompt = `请作为生活洞察者，根据今日干支[${lunar.getDayInGanZhi()}]为日主[${baziData?.pillars[2].stem}]写一段今日灵启。
        要求：
        1. 采用自然连贯的段落，严禁使用 ### 或列表符号。
        2. 字数在80字左右，用语亲切、现代、有启发感。
        3. 重点描述今日的心境建议或行动契机，不要有说教感。`;

        setSpiritDiary("");
        const stream = askAIStream('/api/ai/fortune', { query: prompt, context: null, title: "今日灵启" });
        let fullContent = "";
        let firstChunk = true;
        
        for await (const chunk of stream) {
          fullContent += chunk;
          setSpiritDiary(fullContent);
          if (firstChunk) {
            setIsDiaryLoading(false);
            firstChunk = false;
          }
        }

        if (fullContent && !fullContent.includes("天机混沌")) {
          cacheService.set(cacheKey, fullContent, getSecondsUntilEndOfDay());
        } else if (!fullContent) {
          throw new Error("AI Stream returned empty content");
        }
      } catch (e) {
        setSpiritDiary("今日气场平稳。适合静心思考，在平凡中寻找突破的契机。保持专注，好运自然降临。");
        setIsDiaryLoading(false);
      }
    }
  }, [profile?.id, baziData, lunar]);

  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAiLoading]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      setChatMessages(prev => [...prev, { role: 'ai', content: '' }]);
      let fullContent = '';
      
      for await (const chunk of askAIStream('/api/ai/fortune', { 
        query: userMsg, 
        context: { bazi: baziData, day: lunar.getDayInGanZhi() },
        title: userMsg
      })) {
        fullContent += chunk;
        setChatMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'ai') {
            return [...prev.slice(0, -1), { ...last, content: fullContent }];
          }
          return prev;
        });
      }
      
      refreshHistory();
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', content: '（系统波动）星象暂时模糊，请稍后再试。' }]);
    } finally {
      setIsAiLoading(false);
    }
  };
  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        backgroundColor: '#120b1e',
      });
      const link = document.createElement('a');
      link.download = `知命运势-${lunar.getYearInGanZhi()}-${lunar.getMonthInChinese()}${lunar.getDayInChinese()}.png`;
      link.href = dataUrl;
      link.click();
      setShowShareCard(false);
      setToast('海报已保存至相册，快去分享吧！');
    } catch (err) {
      alert('海报生成失败，请尝试手动截图。');
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Title */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-primary">今日运势</h2>
          <p className="text-on-surface-variant font-label tracking-widest uppercase text-xs">{lunarDateStr}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShareCard(true)}
          className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <Sparkles size={16} />
          生成海报
        </motion.button>
      </motion.section>

      {/* Yi/Ji Banner */}
      <section className="flex gap-4 items-center justify-center">
        <div className="flex-1 bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-400/60 shadow-[0_0_8px_rgba(74,222,128,0.4)]"></span>
          <span className="font-headline font-bold text-on-surface">宜：{lunar.getDayYi().slice(0, 2).join('·') || '诸事不宜'}</span>
        </div>
        <div className="flex-1 bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
          <span className="font-headline font-bold text-on-surface">忌：{lunar.getDayJi().slice(0, 2).join('·') || '诸事不忌'}</span>
        </div>
      </section>

      {/* Fortune Scores Grid */}
      <section className="grid grid-cols-2 gap-4">
        {scores.map((item, idx) => {
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
              <h3 className="font-headline font-bold text-xl text-primary">{selectedFortune.label}解析</h3>
            </div>
            <p className="font-body text-on-surface leading-relaxed text-sm">
              {selectedFortune.analysis}
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] text-primary/60 font-label tracking-widest uppercase">
              <Sparkles size={12} />
              知命引擎动态计算中
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Spirit Diary */}
      <section className="bg-surface-container-low p-8 rounded-[2rem] border border-primary/5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="text-primary" size={18} />
          </div>
          <h3 className="font-headline font-bold text-primary">今日灵启</h3>
        </div>
        {isDiaryLoading ? (
          <div className="py-6 flex flex-col items-center gap-4">
            <ZenLoader message="正在同步今日能量..." />
          </div>
        ) : (
          <div className="relative">
            <p className="text-on-surface/90 font-medium leading-relaxed text-sm md:text-base">
              {spiritDiary || "完善生辰信息，开启每日指引。"}
            </p>
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <span className="font-headline text-[10px] tracking-widest text-primary/30 uppercase italic">Daily Insight Report</span>
        </div>
      </section>

      {/* Chat Section */}
      {chatMessages.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <MessageCircle size={20} />
            </div>
            <h3 className="font-headline font-bold text-primary">命盘 AI 对话</h3>
          </div>

          <div className="space-y-4 pb-32">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col gap-1 max-w-[90%]",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.role === 'user'
                    ? "bg-primary text-background font-bold rounded-tr-none whitespace-pre-wrap"
                    : "bg-surface-container-low text-on-surface rounded-tl-none border border-outline-variant/10"
                )}>
                  {msg.role === 'user' ? msg.content : <MarkdownContent content={msg.content} />}
                </div>
              </motion.div>
            ))}
            {isAiLoading && (
              <div className="py-4">
                <ZenLoader message="AI 正在解析星象能量..." />
              </div>
            )}
          </div>
        </section>
      )}

      <div className="h-32" />

      {/* Fixed Input at bottom */}
      <div className="fixed bottom-24 left-0 w-full px-4 z-40">
        <div className="max-w-screen-md mx-auto relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <MessageCircle size={18} className="text-primary/60" />
          </div>
          <input
            className="w-full bg-surface-container-highest/90 backdrop-blur-md border border-outline-variant/20 rounded-2xl py-5 pl-14 pr-16 text-on-surface placeholder-on-surface-variant/40 focus:ring-1 focus:ring-primary shadow-2xl outline-none"
            placeholder="咨询今日运势细节..."
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendChat();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSendChat}
            disabled={isAiLoading || !chatInput.trim()}
            className="absolute right-3 top-2 bottom-2 px-4 bg-gradient-to-br from-primary to-primary-container text-background rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isAiLoading ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} fill="currentColor" />
            )}
          </button>
        </div>
      </div>

      {/* Share Card Modal */}
      <AnimatePresence>
        {showShareCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareCard(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-sm bg-surface-container rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/20 flex flex-col"
            >
              <div ref={posterRef} className="p-8 space-y-8 bento-texture bg-gradient-to-b from-primary/10 to-transparent bg-[#120b1e]">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-3xl font-headline font-black text-primary tracking-tighter">知命</h4>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40">Destiny Insight</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-bold text-on-surface">{lunarDayOnly}</p>
                    <p className="text-[10px] text-on-surface-variant/60">{lunarYearOnly}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-background shadow-lg shadow-primary/20">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-bold uppercase tracking-widest">今日总运</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Sparkles key={i} size={14} className={i < 4 ? "text-primary fill-primary" : "text-primary/20"} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-surface-container-highest/40 rounded-3xl border border-primary/10 backdrop-blur-sm">
                    <p className="text-sm text-on-surface leading-relaxed text-justify italic">
                      {spiritDiary || "天机待显，开启命盘即可查看专属指引。"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-400/5 p-4 rounded-2xl border border-green-400/10">
                    <p className="text-[10px] text-green-400/60 font-bold mb-1">宜</p>
                    <p className="text-sm font-bold text-on-surface">{lunar.getDayYi().slice(0, 2).join('·') || '诸事不宜'}</p>
                  </div>
                  <div className="bg-red-400/5 p-4 rounded-2xl border border-red-400/10">
                    <p className="text-[10px] text-red-400/60 font-bold mb-1">忌</p>
                    <p className="text-sm font-bold text-on-surface">{lunar.getDayJi().slice(0, 2).join('·') || '诸事不忌'}</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-outline-variant/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="qr" className="w-5 h-5 opacity-40" />
                    </div>
                    <p className="text-[8px] text-on-surface-variant/40 leading-tight">
                      长按保存海报<br />
                      扫码开启您的命盘
                    </p>
                  </div>
                  <Sparkles size={24} className="text-primary/10" />
                </div>
              </div>

              <div className="p-4 bg-surface-container-highest border-t border-outline-variant/10 flex gap-4">
                <button
                  onClick={() => setShowShareCard(false)}
                  className="flex-1 py-4 text-sm font-bold text-on-surface-variant/60 hover:text-on-surface transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDownloadPoster}
                  className="flex-[2] py-4 bg-primary text-background rounded-2xl font-bold text-sm shadow-xl shadow-primary/10"
                >
                  保存海报
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-on-surface text-surface rounded-full shadow-2xl font-bold text-sm flex items-center gap-2"
          >
            <Sparkles size={16} className="text-primary" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
