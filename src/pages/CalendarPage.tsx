import { ChevronLeft, ChevronRight, Sparkles, X, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Solar, Lunar } from 'lunar-javascript';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const ASSISTANTS = [
  { emoji: '💍', label: '婚嫁吉日', filter: '嫁娶' },
  { emoji: '🏢', label: '开业吉日', filter: '开市' },
  { emoji: '🏠', label: '搬家吉日', filter: '入宅' },
  { emoji: '✈️', label: '出行吉日', filter: '出行' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedResult, setSelectedResult] = useState<{ label: string, dates: { month: string, day: number }[] } | null>(null);

  // Update current time every 10 seconds for the fortune card
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const lunarData = useMemo(() => {
    const solar = Solar.fromDate(selectedDay);
    const lunar = solar.getLunar();
    return {
      solarDate: solar.toFullString(),
      lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      gzDay: lunar.getDayInGanZhi() + '日',
      gzMonth: lunar.getMonthInGanZhi() + '月',
      gzYear: lunar.getYearInGanZhi() + '年',
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
      isLucky: lunar.getDayYi().length > lunar.getDayJi().length
    };
  }, [selectedDay]);

  const currentFortune = useMemo(() => {
    // Use precise YMD HMS for real-time Shichen calculation
    const solar = Solar.fromYmdHms(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate(),
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds()
    );
    const lunar = solar.getLunar();
    const timeZhi = lunar.getTimeZhi();
    
    const hourYi = lunar.getTimeYi();
    const hourJi = lunar.getTimeJi();
    
    return {
      hour: timeZhi + '时',
      isLucky: hourYi.length > 0 && !hourYi.includes('无'),
      yi: hourYi.slice(0, 3),
      ji: hourJi.slice(0, 3)
    };
  }, [currentDate]);

  const [hoveredDayData, setHoveredDayData] = useState<{ day: number, yi: string[], ji: string[] } | null>(null);

  const monthDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const s = Solar.fromDate(d);
      const l = s.getLunar();
      days.push({
        date: d,
        day: i,
        yi: l.getDayYi().slice(0, 3),
        ji: l.getDayJi().slice(0, 3),
        isToday: d.toDateString() === new Date().toDateString()
      });
    }
    return days;
  }, [viewDate]);

  const handleAssistantClick = (assistant: typeof ASSISTANTS[0]) => {
    const results: { month: string, day: number }[] = [];
    let checkDate = new Date();
    
    // Search for the next 60 days
    for (let i = 0; i < 60 && results.length < 3; i++) {
      const d = new Date(checkDate.getTime() + i * 24 * 60 * 60 * 1000);
      const l = Solar.fromDate(d).getLunar();
      if (l.getDayYi().includes(assistant.filter)) {
        results.push({
          month: (d.getMonth() + 1) + '月',
          day: d.getDate()
        });
      }
    }
    
    setSelectedResult({ 
      label: assistant.label, 
      dates: results
    });
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  return (
    <div className="space-y-10 pb-20">
      <h2 className="text-4xl font-extrabold tracking-tight font-headline text-primary">择吉日历</h2>

      {/* Real-time Fortune Card */}
      <section>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden",
            currentFortune.isLucky ? "bg-primary/5 border-primary/20" : "bg-surface-container-low border-outline-variant/10"
          )}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-inner",
              currentFortune.isLucky ? "bg-primary text-background" : "bg-outline-variant text-on-surface-variant"
            )}>
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-on-surface">当前时辰：{currentFortune.hour}</h3>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                  currentFortune.isLucky ? "bg-primary text-background" : "bg-surface-container-highest text-on-surface-variant"
                )}>
                  {currentFortune.isLucky ? '大吉' : '中平'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest block">宜</span>
              <p className="text-sm font-bold text-on-surface">{currentFortune.yi.join(' ') || '诸事不宜'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-error uppercase tracking-widest block">忌</span>
              <p className="text-sm font-bold text-on-surface">{currentFortune.ji.join(' ') || '诸事不忌'}</p>
            </div>
          </div>

          <Sparkles size={120} className="absolute -right-8 -bottom-8 text-primary/5 pointer-events-none" />
        </motion.div>
      </section>

      {/* Monthly Calendar */}
      <section className="relative">
        <div className="bg-surface-container-low rounded-xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none bento-texture" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold font-headline text-on-surface">
                {viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月
              </h3>
              <span className="text-xs text-primary/60 font-label tracking-tighter">
                {Lunar.fromDate(viewDate).getYearInGanZhi()}年 {Lunar.fromDate(viewDate).getMonthInGanZhi()}月
              </span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-on-surface-variant hover:text-primary" />
              </button>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                <ChevronRight size={20} className="text-on-surface-variant hover:text-primary" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-4 text-center relative z-10">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-[10px] font-bold text-primary/40 uppercase tracking-widest font-label pb-2">{w}</div>
            ))}
            
            {monthDays.map((d, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "relative flex flex-col items-center justify-center h-12 group transition-all",
                  d ? "cursor-pointer" : "pointer-events-none"
                )}
                onMouseEnter={() => d && setHoveredDayData({ day: d.day, yi: d.yi, ji: d.ji })}
                onMouseLeave={() => setHoveredDayData(null)}
                onClick={() => d && setSelectedDay(d.date)}
              >
                {d && selectedDay.toDateString() === d.date.toDateString() && (
                  <motion.div 
                    layoutId="calendar-select"
                    className="absolute w-10 h-10 bg-primary/10 rounded-lg border border-primary/20 scale-110 z-0"
                  />
                )}
                {d && (
                  <>
                    <span className={cn(
                      "font-bold relative z-10 transition-colors",
                      selectedDay.toDateString() === d.date.toDateString() ? 'text-primary' : 'text-on-surface/60 group-hover:text-primary',
                      d.isToday && "underline decoration-primary underline-offset-4"
                    )}>
                      {d.day}
                    </span>

                    {/* Hover Tooltip */}
                    <AnimatePresence>
                      {hoveredDayData?.day === d.day && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full mb-2 w-40 bg-surface-container-highest/95 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-outline-variant/20 z-[100] pointer-events-none"
                        >
                          <div className="space-y-2 text-left">
                            <div className="flex gap-2 items-start">
                              <span className="text-green-400 font-bold text-[9px] bg-green-500/10 px-1 rounded h-4 flex items-center">宜</span>
                              <span className="text-[10px] text-on-surface-variant font-medium leading-tight">{d.yi.join(', ') || '诸事不宜'}</span>
                            </div>
                            <div className="flex gap-2 items-start">
                              <span className="text-error font-bold text-[9px] bg-error/10 px-1 rounded h-4 flex items-center">忌</span>
                              <span className="text-[10px] text-on-surface-variant font-medium leading-tight">{d.ji.join(', ') || '诸事不忌'}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Day Detail Card & Result */}
      <section className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <motion.div 
            key={selectedDay.toDateString()}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container rounded-xl p-8 border-l-4 border-primary/40 shadow-xl"
          >
            <div className="flex items-baseline gap-4 mb-6">
              <h3 className="text-5xl font-black font-headline text-on-surface">{selectedDay.getDate()}</h3>
              <div>
                <p className="text-lg font-bold">{selectedDay.getMonth() + 1}月</p>
                <p className="text-xs text-on-surface-variant font-label">
                  {WEEKDAYS[selectedDay.getDay()]} · {lunarData.gzDay}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-400 font-bold text-sm">宜</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-on-surface text-lg font-medium">{lunarData.yi.slice(0, 5).join(', ') || '诸事不宜'}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded bg-error/10 flex items-center justify-center">
                  <span className="text-error font-bold text-sm">忌</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-on-surface text-lg font-medium">{lunarData.ji.slice(0, 5).join(', ') || '诸事不忌'}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-primary fill-primary" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary/80">AI 智能解读</span>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed italic">
                  此日为{lunarData.lunarDate}，{lunarData.gzDay}，五行感应良好。适合安排{lunarData.yi[0]}等事务。
                  {lunarData.ji.length > 0 && `注意防范${lunarData.ji[0]}相关的突发状况。`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Assistants */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-on-surface-variant/60 ml-2">智能择吉推荐</h4>
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
                  <h4 className="font-bold text-primary">推荐吉日 (当前日期之后)</h4>
                </div>
                <div className="flex gap-3">
                  {selectedResult.dates.length > 0 ? selectedResult.dates.map((dateObj, idx) => (
                    <div key={idx} className="flex-1 bg-surface-container-low p-3 rounded-lg text-center border border-primary/10">
                      <span className="block text-2xl font-black text-primary font-headline">{dateObj.day}</span>
                      <span className="text-[10px] text-on-surface-variant font-label">{dateObj.month}</span>
                    </div>
                  )) : (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant/60 py-4">
                      <AlertCircle size={14} />
                      近期暂无完全符合条件的极佳吉日。
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-primary/60 mt-4 leading-relaxed">
                  以上日期经《玉匣记》标准实时计算。已自动过滤过期日期，为您展示未来最优选。
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
