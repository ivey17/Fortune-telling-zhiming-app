import { motion } from 'motion/react';
import { useUser } from '../contexts/UserContext';

export default function TopBar({ onProfileClick }: { onProfileClick: () => void }) {
  const { profile } = useUser();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl bg-gradient-to-b from-background to-transparent">
      <div className="flex items-center w-full px-6 py-4 max-w-screen-xl mx-auto gap-4 justify-start">
        <h1 className="text-2xl font-bold tracking-[0.2em] text-primary uppercase font-headline flex-1">知命</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 transition-all duration-300 bg-primary/10"
        >
          <img
            alt="用户头像"
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || 'Guest'}`}
            className="w-full h-full object-cover"
          />
        </motion.button>
      </div>
    </header>
  );
}
