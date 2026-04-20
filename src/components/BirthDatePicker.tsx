import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Check } from 'lucide-react';
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
    document.body.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const walk = (e.pageY - startY.current) * 1.5;
    containerRef.current.scrollTop = scrollTop.current - walk;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = 'default';
    
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / 40);
      containerRef.current.scrollTo({
        top: index * 40,
        behavior: 'smooth'
      });
      if (options[index] !== undefined && options[index] !== value) {
        onChange(options[index]);
      }
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
      <span className="text-[9px] font-bold text-primary/40 uppercase tracking-[0.2em]">{label}</span>
      <div 
        className="relative h-40 w-full overflow-hidden bg-surface-container-highest/20 rounded-2xl border border-outline-variant/10 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-x-0 top-[60px] h-10 bg-primary/10 border-y border-primary/20 pointer-events-none" />
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory px-2 scroll-smooth"
        >
          <div className="h-[60px]" />
          {options.map((opt: number) => (
            <div 
              key={opt} 
              onClick={() => onChange(opt)}
              className={cn(
                "h-10 flex items-center justify-center snap-center transition-all duration-200 cursor-pointer",
                opt === value ? "text-primary text-xl font-black" : "text-on-surface-variant/40 text-sm font-bold scale-90"
              )}
            >
              {opt.toString().padStart(label === '年份' ? 4 : 2, '0')}
            </div>
          ))}
          <div className="h-[60px]" />
        </div>
      </div>
    </div>
  );
};

interface BirthDatePickerProps {
  initialDate?: string;
  onConfirm: (date: string, isTimeUnknown: boolean) => void;
  onClose: () => void;
}

export default function BirthDatePicker({ initialDate, onConfirm, onClose }: BirthDatePickerProps) {
  const current = useMemo(() => new Date(), []);
  const initial = useMemo(() => initialDate ? new Date(initialDate) : new Date(), [initialDate]);
  
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [day, setDay] = useState(initial.getDate());
  const [hour, setHour] = useState(initial.getHours());
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);

  const years = useMemo(() => {
    const endYear = current.getFullYear();
    return Array.from({ length: 121 }, (_, i) => endYear - i).filter(y => y <= endYear);
  }, [current]);

  const months = useMemo(() => {
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    if (year === current.getFullYear()) {
      return allMonths.filter(m => m <= current.getMonth() + 1);
    }
    return allMonths;
  }, [year, current]);

  // Adjust month if it exceeds the new limit
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

  // Adjust day if it exceeds the new limit
  useEffect(() => {
    if (year === current.getFullYear() && month === current.getMonth() + 1 && day > current.getDate()) {
      setDay(current.getDate());
    } else if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [year, month, daysInMonth]);

  const hours = useMemo(() => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    if (year === current.getFullYear() && month === current.getMonth() + 1 && day === current.getDate()) {
      return allHours.filter(h => h <= current.getHours());
    }
    return allHours;
  }, [year, month, day, current]);

  // Adjust hour if it exceeds the new limit
  useEffect(() => {
    if (year === current.getFullYear() && month === current.getMonth() + 1 && day === current.getDate() && hour > current.getHours()) {
      setHour(current.getHours());
    }
  }, [year, month, day]);

  const handleConfirm = () => {
    const date = new Date(year, month - 1, day, isTimeUnknown ? 12 : hour, 0);
    onConfirm(date.toISOString(), isTimeUnknown);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-md bg-surface-container rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/20 flex flex-col"
      >
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-2xl font-headline font-black text-primary">设定生辰</h4>
              <p className="text-xs text-on-surface-variant/60">请选择您的出生时间（不可超过当前时间）</p>
            </div>
            <button onClick={onClose} className="p-2 text-on-surface-variant/40 hover:text-on-surface transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Wheel Selectors */}
          <div className="flex gap-2">
            <WheelSelector label="年份" options={years} value={year} onChange={setYear} className="flex-[1.5]" />
            <WheelSelector label="月份" options={months} value={month} onChange={setMonth} />
            <WheelSelector label="日期" options={days} value={day} onChange={setDay} />
            <WheelSelector 
              label="小时" 
              options={hours} 
              value={hour} 
              onChange={setHour} 
              className={cn(isTimeUnknown && "opacity-10 pointer-events-none transition-opacity")}
            />
          </div>

          {/* Unknown Time Toggle */}
          <div 
            onClick={() => setIsTimeUnknown(!isTimeUnknown)}
            className="flex items-center justify-between p-5 rounded-2xl bg-surface-container-highest/30 border border-outline-variant/10 cursor-pointer group hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                isTimeUnknown ? "bg-primary border-primary" : "border-outline-variant/40 group-hover:border-primary/40"
              )}>
                {isTimeUnknown && <Check size={14} className="text-background font-bold" />}
              </div>
              <span className="text-sm font-bold text-on-surface">不清楚具体出生时间</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface-container-highest border-t border-outline-variant/10">
          <button 
            onClick={handleConfirm}
            className="w-full py-5 bg-primary text-background rounded-2xl font-headline font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            确认生辰
            <Check size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
