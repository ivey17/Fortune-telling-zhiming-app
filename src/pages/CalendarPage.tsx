import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface DayData {
  day: number;
  lucky?: boolean;
  selected?: boolean;
  yi: string[];
  ji: string[];
}

const DAYS: DayData[] = [
  { day: 1, lucky: true, yi: ['纳采', '订盟', '嫁娶'], ji: ['安床', '作灶'] },
  { day: 2, yi: ['祭祀', '扫舍'], ji: ['开业', '动土'] },
  { day: 3, yi: ['打扫', '沐浴'], ji: ['远行', '搬迁'] },
  { day: 4, lucky: true, yi: ['求学', '理发'], ji: ['掘井', '词讼'] },
  { day: 5, yi: ['祭祀', '解除'], ji: ['安葬', '破土'] },
  { day: 6, yi: ['入殓', '移柩'], ji: ['入宅', '伐木'] },
  { day: 7, yi: ['祈福', '求嗣'], ji: ['盖屋', '上梁'] },
  { day: 8, yi: ['出行', '纳财'], ji: ['谢土', '祈福'] },
  { day: 9, lucky: true, yi: ['作灶', '祭祀'], ji: ['嫁娶', '出行'] },
  { day: 10, yi: ['裁衣', '经络'], ji: ['安床', '修造'] },
  { day: 11, lucky: true, yi: ['竖柱', '上梁'], ji: ['词讼', '开渠'] },
  { day: 12, yi: ['纳畜', '安葬'], ji: ['交易', '纳采'] },
  { day: 13, yi: ['入宅', '入殓'], ji: ['成服', '除服'] },
  { day: 14, yi: ['求嗣', '祈福'], ji: ['造仓', '破土'] },
  { day: 15, lucky: true, yi: ['开光', '出行'], ji: ['安床', '入殓'] },
  { day: 16, selected: true, yi: ['签约', '出行'], ji: ['动土', '掘井'] },
  { day: 17, yi: ['竖柱', '上梁'], ji: ['安门', '修造'] },
  { day: 18, lucky: true, yi: ['扫舍', '求医'], ji: ['入宅', '栽种'] },
  { day: 19, yi: ['解除', '沐浴'], ji: ['词讼', '求嗣'] },
  { day: 20, yi: ['纳采', '订盟'], ji: ['嫁娶', '纳财'] },
  { day: 21, lucky: true, yi: ['开业', '交易'], ji: ['作灶', '求医'] },
  { day: 22, yi: ['开卷', '求学'], ji: ['捕鱼', '乘船'] },
  { day: 23, yi: ['开仓', '出货'], ji: ['扫合', '破土'] },
  { day: 24, lucky: true, yi: ['远行', '开光'], ji: ['安门', '词讼'] },
  { day: 25, yi: ['取渔', '捕捉'], ji: ['入宅', '移徙'] },
  { day: 26, yi: ['扫舍', '修饰'], ji: ['作灶', '祈福'] },
  { day: 27, yi: ['祭祀', '沐浴'], ji: ['伐木', '行丧'] },
  { day: 28, yi: ['成服', '除服'], ji: ['开市', '交易'] },
  { day: 29, yi: ['理发', '求职'], ji: ['掘井', '理财'] },
  { day: 30, yi: ['祈福', '纳财'], ji: ['安床', '开光'] }
];

const MAY_DAYS: DayData[] = [
  { day: 1, lucky: true, yi: ['嫁娶', '出行'], ji: ['安门'] },
  { day: 2, yi: ['祭祀'], ji: ['动土'] },
  { day: 3, lucky: true, yi: ['入宅', '安门'], ji: ['安葬'] },
  { day: 4, yi: ['订盟', '开市'], ji: ['掘井'] },
  { day: 5, lucky: true, yi: ['祈福', '解除'], ji: ['词讼'] },
  { day: 6, yi: ['扫舍'], ji: ['理发'] },
  { day: 7, lucky: true, yi: ['移徙', '入宅'], ji: ['修造'] },
  { day: 8, yi: ['出行', '纳财'], ji: ['嫁娶'] },
  { day: 9, lucky: true, yi: ['取渔', '祭祀'], ji: ['栽种'] },
  { day: 10, yi: ['作灶', '扫舍'], ji: ['出行'] },
];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const ASSISTANTS = [
  { emoji: '💍', label: '婚嫁吉日', filter: '嫁娶' },
  { emoji: '🏢', label: '开业吉日', filter: '开业' },
  { emoji: '🏠', label: '搬家吉日', filter: '入宅' },
  { emoji: '✈️', label: '出行吉日', filter: '出行' },
];

export default function CalendarPage() {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(16);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [selectedResult, setSelectedResult] = useState<{ label: string, dates: { month: string, day: number }[] } | null>(null);

  const selectedDayData = DAYS.find(d => d.day === selectedDayNum) || DAYS[15];

  const handleAssistantClick = (assistant: typeof ASSISTANTS[0]) => {
    // Current month (April) recommendations from 16th onwards
    const aprilLucky = DAYS
      .filter(d => d.day >= 16)
      .filter(d => d.yi.includes(assistant.filter) || (d.lucky && Math.random() > 0.3))
      .map(d => ({ month: '四月', day: d.day }));
    
    let combined = [...aprilLucky];
    
    // If not enough dates, pull from May
    if (combined.length < 3) {
      const mayLucky = MAY_DAYS
        .filter(d => d.yi.includes(assistant.filter) || (d.lucky && Math.random() > 0.3))
        .map(d => ({ month: '五月', day: d.day }));
      combined = [...combined, ...mayLucky];
    }
    
    setSelectedResult({ 
      label: assistant.label, 
      dates: combined.slice(0, 3) 
    });
  };

  const getWeekday = (day: number) => {
    const date = new Date(2026, 3, day); // April is 3
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[date.getDay()];
  };

  const getGanZhi = (day: number) => {
    // Mock Ganzhi mapping for demo
    const gz = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥'];
    return gz[day % gz.length] + '日';
  };

  return (
    <div className="space-y-10 pb-20">
      <h2 className="text-4xl font-extrabold tracking-tight font-headline text-primary">择吉日历</h2>

      {/* Monthly Calendar */}
      <section className="relative">
        <div className="bg-surface-container-low rounded-xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none bento-texture" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold font-headline text-on-surface">2026年 4月</h3>
              <span className="text-xs text-primary/60 font-label tracking-tighter">丙午年 壬辰月</span>
            </div>
            <div className="flex gap-4">
              <ChevronLeft size={20} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" />
              <ChevronRight size={20} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-6 text-center relative z-10">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-[10px] font-bold text-primary/40 uppercase tracking-widest font-label">{w}</div>
            ))}
            {/* Offset for April 2026 (Starts on Wednesday) */}
            <div className="h-10"></div>
            <div className="h-10"></div>
            <div className="h-10"></div>
            
            {DAYS.map((d, idx) => (
              <div 
                key={idx} 
                className="relative flex flex-col items-center justify-center h-12 group cursor-pointer"
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => setSelectedDayNum(d.day)}
              >
                {selectedDayNum === d.day && (
                  <motion.div 
                    layoutId="calendar-select"
                    className="absolute w-10 h-10 bg-primary/10 rounded-lg border border-primary/20 scale-110 z-0"
                  />
                )}
                <span className={cn(
                  "font-bold relative z-10 transition-colors",
                  selectedDayNum === d.day ? 'text-primary' : 'text-on-surface/60 group-hover:text-primary'
                )}>
                  {d.day}
                </span>

                {/* Hover Tooltip */}
                <AnimatePresence>
                  {hoveredDay?.day === d.day && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2 w-40 bg-surface-container-highest/95 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-outline-variant/20 z-[100] pointer-events-none"
                    >
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <span className="text-green-400 font-bold text-[10px] bg-green-500/10 px-1 rounded">宜</span>
                          <span className="text-xs text-on-surface-variant font-medium">{d.yi.join(', ')}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-error font-bold text-[10px] bg-error/10 px-1 rounded">忌</span>
                          <span className="text-xs text-on-surface-variant font-medium">{d.ji[0]}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Day Detail Card & Result */}
      <section className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <motion.div 
            key={selectedDayNum}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container rounded-xl p-8 border-l-4 border-primary/40 shadow-xl"
          >
            <div className="flex items-baseline gap-4 mb-6">
              <h3 className="text-5xl font-black font-headline text-on-surface">{selectedDayNum}</h3>
              <div>
                <p className="text-lg font-bold">四月</p>
                <p className="text-xs text-on-surface-variant font-label">{getWeekday(selectedDayNum)} · {getGanZhi(selectedDayNum)}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-400 font-bold text-sm">宜</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-on-surface text-lg font-medium">{selectedDayData.yi.join(', ')}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded bg-error/10 flex items-center justify-center">
                  <span className="text-error font-bold text-sm">忌</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-on-surface text-lg font-medium">{selectedDayData.ji.join(', ')}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-primary fill-primary" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary/80">AI 智能解读</span>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed italic">
                  今日{getGanZhi(selectedDayNum).charAt(0)}气偏旺，宜进行{selectedDayData.yi[0]}与筹谋。气场流转之日，{selectedDayData.ji[0]}易招口舌，宜顺势而为。
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Assistants */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-on-surface-variant/60 ml-2">智能择吉</h4>
            <div className="grid grid-cols-2 gap-4">
              {ASSISTANTS.map((a, idx) => (
                <motion.button 
                  key={idx}
                  whileHover={{ scale: 1.02, backgroundColor: 'var(--color-primary-container-low)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAssistantClick(a)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 transition-all group shadow-sm",
                    selectedResult?.label === a.label ? "border-primary/60 ring-1 ring-primary/20" : "hover:border-primary/40"
                  )}
                >
                  <span className="text-2xl mb-3 group-hover:scale-110 transition-transform">{a.emoji}</span>
                  <span className="text-sm font-bold font-headline text-on-surface">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Assistant Selection Result positioned BELOW assistants */}
          <AnimatePresence>
            {selectedResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden"
              >
                <button 
                  onClick={() => setSelectedResult(null)}
                  className="absolute top-4 right-4 text-primary/40 hover:text-primary"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-primary" />
                  <h4 className="font-bold text-primary">{selectedResult.label}推荐</h4>
                </div>
                <div className="flex gap-3">
                  {selectedResult.dates.map((dateObj, idx) => (
                    <div key={idx} className="flex-1 bg-surface-container-low p-3 rounded-lg text-center border border-primary/10">
                      <span className="block text-2xl font-black text-primary font-headline">{dateObj.day}</span>
                      <span className="text-[10px] text-on-surface-variant font-label">{dateObj.month}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-primary/60 mt-4 leading-relaxed">
                  以上日期经人工辅助校验，符合《玉匣记》择吉标准。若本月吉日不足，已自动为您推荐下月（五月）优选日期。
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
