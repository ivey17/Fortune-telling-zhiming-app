import React from 'react';
import { Sparkles, Grid3X3, CalendarDays, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { Tab } from '../types';
import { cn } from '../lib/utils';

interface NavItem {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

const ITEMS: NavItem[] = [
  { id: 'fortune', label: '运势', icon: Sparkles },
  { id: 'chart', label: '命盘', icon: Grid3X3 },
  { id: 'calendar', label: '择日', icon: CalendarDays },
  { id: 'divination', label: '问卦', icon: BrainCircuit },
];

export default function BottomNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#231437]/70 backdrop-blur-xl shadow-[0_-8px_32px_rgba(27,11,47,0.12)] rounded-t-[2rem]">
      {ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-300 rounded-lg",
              isActive 
                ? "bg-gradient-to-br from-primary to-primary-container text-background shadow-[0_0_15px_rgba(242,195,107,0.3)]"
                : "text-on-background/50 hover:text-primary"
            )}
          >
            <Icon size={20} fill={isActive ? "currentColor" : "none"} />
            <span className="font-headline text-[10px] font-semibold tracking-wider uppercase mt-1">
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
