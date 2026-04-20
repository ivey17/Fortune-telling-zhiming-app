import { Menu } from 'lucide-react';
import { motion } from 'motion/react';

export default function TopBar({ onMenuClick, onProfileClick }: { onMenuClick: () => void; onProfileClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl bg-gradient-to-b from-background to-transparent">
      <div className="flex items-center w-full px-6 py-4 max-w-screen-xl mx-auto gap-4 justify-start">
        <button 
          onClick={onMenuClick}
          className="text-primary active:scale-95 transition-all duration-300 hover:opacity-80 p-1"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold tracking-[0.2em] text-primary uppercase font-headline flex-1">知命</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 transition-all duration-300"
        >
          <img
            alt="用户头像"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB27th0QFtPScocydJfz9eixQjVIpfRVfqqvx9G8hha_ipIoLOPhLnT7xSY6ribtoFgsEvdGWa-ovYk91dJI86F2tUZWCXWp0-WuCeqmIN86Q30pfGYrbF7jeC4sgaL727vyWOp6BwrvzUj_1_LIgZXNpD9Q9oRod0rKKeOZZmLDxdKnq0E8uuy-TZ8s87tPH5YSIZeXa5qEiBqlixqQUpaSroGwFMMBs8YxoTSVyuemN8T0TqquASso7sm1d1z4dpEQzKv8y7Wml8"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </motion.button>
      </div>
    </header>
  );
}
