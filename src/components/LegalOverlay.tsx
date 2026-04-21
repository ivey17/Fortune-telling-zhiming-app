import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, FileText } from 'lucide-react';

interface LegalOverlayProps {
  title: string;
  content: string;
  onClose: () => void;
}

export default function LegalOverlay({ title, content, onClose }: LegalOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-surface-container rounded-[2.5rem] overflow-hidden border border-primary/20 shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {title.includes('协议') ? <FileText size={20} /> : <ShieldAlert size={20} />}
            </div>
            <h4 className="text-xl font-headline font-black text-primary">{title}</h4>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant/40 hover:text-on-surface transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto no-scrollbar prose prose-invert prose-sm">
          <div className="text-on-surface-variant/80 leading-relaxed whitespace-pre-wrap font-sans text-sm">
            {content}
          </div>
        </div>

        <div className="p-6 bg-surface-container-highest border-t border-outline-variant/10">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-primary text-background rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            我已阅读并理解
          </button>
        </div>
      </motion.div>
    </div>
  );
}
