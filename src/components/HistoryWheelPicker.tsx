import { motion } from 'motion/react';
import { Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

const WheelSelector = ({ options, value, onChange, label }: any) => {
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
    <div className="flex flex-col items-center gap-2 flex-1 select-none">
      <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">{label}</span>
      <div 
        className="relative h-32 w-full overflow-hidden bg-surface-container-highest/10 rounded-xl border border-outline-variant/5 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-x-0 top-[46px] h-10 bg-primary/5 border-y border-primary/10 pointer-events-none" />
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory px-2 scroll-smooth"
        >
          <div className="h-[46px]" />
          {options.map((opt: number) => (
            <div key={opt} onClick={() => onChange(opt)} className={cn(
              "h-10 flex items-center justify-center snap-center transition-all duration-200 cursor-pointer",
              opt === value ? "text-primary text-sm font-black" : "text-on-surface-variant/30 text-[10px] font-bold scale-90"
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

interface HistoryWheelPickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export default function HistoryWheelPicker({ selectedDate, onSelect, onClose }: HistoryWheelPickerProps) {
  const initialDate = useMemo(() => selectedDate ? new Date(selectedDate) : new Date(), [selectedDate]);
  
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth() + 1);
  const [day, setDay] = useState(initialDate.getDate());

  const years = useMemo(() => Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  useEffect(() => {
    if (day > daysInMonth) setDay(daysInMonth);
  }, [daysInMonth]);

  const handleConfirm = () => {
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onSelect(formattedDate);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute top-full left-0 right-0 mt-4 z-[100] bg-surface-container/98 backdrop-blur-3xl rounded-[2.5rem] border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <CalendarIcon size={18} />
            </div>
            <h4 className="text-sm font-black text-on-surface">
              {year}年 {month}月 {day}日
            </h4>
          </div>
          <button onClick={onClose} className="text-on-surface-variant/40 hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-3">
          <WheelSelector label="年" options={years} value={year} onChange={setYear} />
          <WheelSelector label="月" options={months} value={month} onChange={setMonth} />
          <WheelSelector label="日" options={days} value={day} onChange={setDay} />
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => { onSelect(''); onClose(); }}
            className="flex-1 py-4 bg-surface-container-highest/30 text-on-surface-variant/60 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all"
          >
            显示全部
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-[2] py-4 bg-primary text-background rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Check size={16} strokeWidth={3} />
            确认筛选
          </button>
        </div>
      </div>
    </motion.div>
  );
}
