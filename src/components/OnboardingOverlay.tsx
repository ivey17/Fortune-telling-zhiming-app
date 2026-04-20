import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Mars, Venus, Clock } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import { cn } from '../lib/utils';

const WheelSelector = ({ options, value, onChange, label, className }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  useEffect(() => {
    if (containerRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * 40;
      }
    }
  }, [value, options]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDragging.current) return;
    const index = Math.round(e.currentTarget.scrollTop / 40);
    if (options[index] !== undefined && options[index] !== value) {
      onChange(options[index]);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.pageY;
    scrollTop.current = containerRef.current?.scrollTop || 0;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const walk = (e.pageY - startY.current) * 1.5;
    containerRef.current.scrollTop = scrollTop.current - walk;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / 40);
      containerRef.current.scrollTo({ top: index * 40, behavior: 'smooth' });
      if (options[index] !== undefined && options[index] !== value) onChange(options[index]);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [options, value]);

  return (
    <div className={cn("flex flex-col items-center gap-2 flex-1 select-none", className)}>
      <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">{label}</span>
      <div 
        className="relative h-32 w-full overflow-hidden bg-surface-container-highest/20 rounded-xl border border-outline-variant/10 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-x-0 top-[46px] h-10 bg-primary/10 border-y border-primary/20 pointer-events-none" />
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory px-2 scroll-smooth"
        >
          <div className="h-[46px]" />
          {options.map((opt: number) => (
            <div key={opt} onClick={() => onChange(opt)} className={cn(
              "h-10 flex items-center justify-center snap-center transition-all duration-200 cursor-pointer",
              opt === value ? "text-primary text-base font-black" : "text-on-surface-variant/40 text-[10px] font-bold scale-90"
            )}>
              {opt.toString().padStart(label === '年' ? 4 : 2, '0')}
            </div>
          ))}
          <div className="h-[46px]" />
        </div>
      </div>
    </div>
  );
};

export default function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const current = useMemo(() => new Date(), []);
  
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const years = useMemo(() => {
    const endYear = current.getFullYear();
    return Array.from({ length: 101 }, (_, i) => endYear - i);
  }, [current]);

  const months = useMemo(() => {
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    if (year === current.getFullYear()) {
      return allMonths.filter(m => m <= current.getMonth() + 1);
    }
    return allMonths;
  }, [year, current]);

  useEffect(() => {
    if (year === current.getFullYear() && month > current.getMonth() + 1) {
      setMonth(current.getMonth() + 1);
    }
  }, [year]);

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);
  const days = useMemo(() => {
    const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    if (year === current.getFullYear() && month === current.getMonth() + 1) {
      return allDays.filter(d => d <= current.getDate());
    }
    return allDays;
  }, [year, month, daysInMonth, current]);

  useEffect(() => {
    if (year === current.getFullYear() && month === current.getMonth() + 1 && day > current.getDate()) {
      setDay(current.getDate());
    } else if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [year, month, daysInMonth]);

  const hoursArr = useMemo(() => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    if (year === current.getFullYear() && month === current.getMonth() + 1 && day === current.getDate()) {
      return allHours.filter(h => h <= current.getHours());
    }
    return allHours;
  }, [year, month, day, current]);

  useEffect(() => {
    if (year === current.getFullYear() && month === current.getMonth() + 1 && day === current.getDate() && hour > current.getHours()) {
      setHour(current.getHours());
    }
  }, [year, month, day]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const birthDate = new Date(year, month - 1, day, isTimeUnknown ? 12 : hour, 0);
      await fetchWithAuth('/api/user/profile', {
        method: 'POST',
        body: JSON.stringify({ 
          birth_date: birthDate.toISOString(),
          gender: gender
        })
      });
      onComplete();
    } catch (e) {
      alert('同步天机失败，请检查网络');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#1b0b2f]/95 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 py-10"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary border border-primary/20">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-headline font-black text-primary tracking-tight">开启命理之旅</h2>
          <p className="text-on-surface-variant/60 text-xs px-4">请输入您的生辰与性别，以获得精准测算</p>
        </div>

        <div className="bg-surface-container/40 p-6 rounded-[2.5rem] border border-primary/10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary/60 ml-2">
              <span className="text-[10px] uppercase font-bold tracking-widest">选择性别</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setGender('male')} className={cn(
                "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all text-sm font-bold",
                gender === 'male' ? "bg-primary/10 border-primary text-primary" : "bg-background/40 border-transparent text-on-surface-variant/40"
              )}>
                <Mars size={18} /> 乾造
              </button>
              <button onClick={() => setGender('female')} className={cn(
                "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all text-sm font-bold",
                gender === 'female' ? "bg-primary/10 border-primary text-primary" : "bg-background/40 border-transparent text-on-surface-variant/40"
              )}>
                <Venus size={18} /> 坤造
              </button>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-primary/60 ml-2">
               <span className="text-[10px] uppercase font-bold tracking-widest">生辰日期</span>
             </div>
             <div className="flex gap-2">
                <WheelSelector label="年" options={years} value={year} onChange={setYear} className="flex-[1.5]" />
                <WheelSelector label="月" options={months} value={month} onChange={setMonth} />
                <WheelSelector label="日" options={days} value={day} onChange={setDay} />
                <WheelSelector label="时" options={hoursArr} value={hour} onChange={setHour} className={cn(isTimeUnknown && "opacity-10 pointer-events-none")} />
             </div>
             
             <div 
               onClick={() => setIsTimeUnknown(!isTimeUnknown)}
               className="flex items-center justify-between p-4 rounded-xl bg-background/20 border border-outline-variant/10 cursor-pointer group hover:bg-primary/5 transition-colors"
             >
               <div className="flex items-center gap-2">
                 <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all", isTimeUnknown ? "bg-primary border-primary" : "border-outline-variant/40")}>
                   {isTimeUnknown && <Check size={10} className="text-background" />}
                 </div>
                 <span className="text-[10px] font-bold text-on-surface-variant">不清楚具体时间</span>
               </div>
               <Clock size={14} className={isTimeUnknown ? "text-primary" : "text-outline-variant/20"} />
             </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full py-5 bg-primary text-background rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
          >
            {isSubmitting ? '同步中...' : '确认开启'}
            <Check size={24} />
          </motion.button>
        </div>

        <button onClick={onComplete} className="w-full text-center text-on-surface-variant/30 hover:text-on-surface-variant/60 transition-colors text-xs">
          暂时跳过
        </button>
      </motion.div>
    </div>
  );
}
