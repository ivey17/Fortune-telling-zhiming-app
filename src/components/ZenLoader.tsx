import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function ZenLoader({ message = "正在感应天机..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative w-24 h-24">
        {/* Outer glowing ring */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary/60 shadow-[0_0_30px_rgba(242,195,107,0.1)]"
        />
        
        {/* Middle pulsing circles */}
        <motion.div 
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 rounded-full bg-primary/5 border border-primary/10"
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              rotateY: [0, 180, 360],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-primary"
          >
            <Sparkles size={32} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(242,195,107,0.5)]" />
          </motion.div>
        </div>
        
        {/* Floating particles (simulated with small divs) */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 2 + i, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: "easeInOut" 
            }}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{ 
              top: `${20 + i * 20}%`, 
              left: `${10 + i * 25}%` 
            }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm font-headline font-bold text-primary tracking-[0.2em] animate-pulse">
          {message}
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-1 bg-primary rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
