import { Send, Languages, Sparkles, RotateCcw, User, Loader2 } from 'lucide-react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { askDivinationAI, saveDivination } from '../services/aiService';
import { cn } from '../lib/utils';
import { generateLiuyao, getHexagramInfo, HexagramInfo } from '../lib/iching';
import ZenLoader from '../components/ZenLoader';
import MarkdownContent from '../components/MarkdownContent';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function DivinationPage() {
  const [lines, setLines] = useState<number[]>([]); // 6, 7, 8, 9
  const [isCasting, setIsCasting] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [hexInfo, setHexInfo] = useState<HexagramInfo | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const coinControls = Array.from({ length: 6 }, () => useAnimation());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const castFullGua = async () => {
    if (isCasting) return;
    setIsCasting(true);
    setInterpretation(null);
    setHexInfo(null);
    setLines([]);

    const newLines = generateLiuyao();

    await Promise.all(coinControls.map((ctrl, i) => 
      ctrl.start({
        rotateY: [0, 1080],
        scale: [1, 1.2, 1],
        transition: { duration: 1.5, delay: i * 0.1, ease: "easeInOut" }
      })
    ));

    setLines(newLines);
    setIsCasting(false);
    
    // Simple interpretation
    const info = getHexagramInfo(newLines);
    setHexInfo(info);
    const simpleResult = `【${info.name}】（${info.symbol}）\n${info.meaning}\n\n解读：${info.description}`;
    setInterpretation(simpleResult);
    
    // Save to history
    saveDivination(newLines, simpleResult, `起卦：${info.name}`);
  };


  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSending(true);

    // Logic: If not casted, prompt to cast
    if (lines.length === 0) {
      setToast('心诚则灵，请阁下先点击“起卦”按钮感应天地。');
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: '【系统提示】：请阁下先起卦，乾坤定后方可深解析。' }]);
        setIsSending(false);
      }, 500);
      return;
    }

    try {
      // Logic: Combined analysis
      const response = await askDivinationAI(userMsg, { lines });
      setMessages(prev => [...prev, { role: 'ai', content: response.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: '（玄理波动）此时心绪难宁，无法深度解析。' }]);
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setLines([]);
    setInterpretation(null);
    setMessages([]);
    coinControls.forEach(ctrl => ctrl.set({ rotateY: 0, scale: 1 }));
  };

  return (
    <div className="flex flex-col gap-8 pb-48">
      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-4xl font-headline font-black tracking-tight text-primary uppercase">占卜问卦</h2>
      </motion.section>

      {/* Intro Header */}
      <section className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(242,195,107,0.2)] flex-shrink-0">
            <Sparkles className="text-background" size={18} fill="currentColor" />
          </div>
          <div className="bg-surface-container-low p-5 rounded-tr-3xl rounded-br-3xl rounded-bl-lg max-w-[85%] border-l-2 border-primary/30 min-h-[5rem] flex items-center">
            <p className="text-on-surface leading-relaxed font-medium">
              {lines.length === 0 ? "请静心冥想你心中所求，点击下方按钮起卦。亦可在此之前先行咨询。" : "乾坤已现，天机示于阁下。请结合卦象继续追问。"}
            </p>
          </div>
        </div>
      </section>

      {/* Ritual Activity Area */}
      <section className="glass-card p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl flex flex-col items-center gap-12">
        {/* 6 Coins Grid */}
        <div className="grid grid-cols-3 gap-8 md:gap-12">
          {coinControls.map((ctrl, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <motion.div
                animate={ctrl}
                className="w-20 h-20 rounded-full flex items-center justify-center relative bg-gradient-to-br from-[#f2c36b] to-[#d4a853] shadow-[0_0_20px_rgba(242,195,107,0.3)] border border-primary/20"
              >
                {lines.length === 0 ? (
                  // Ancient Chinese Coin Style (Golden)
                  <div className="w-7 h-7 border-2 border-background/40 rounded-sm bg-background/5 shadow-inner" />
                ) : (
                  // Result Bar Style
                  <div className="w-12 flex flex-col gap-1.5 items-center">
                    {(lines[i] === 7 || lines[i] === 9) ? (
                      // Solid Line
                      <div className="w-full h-2.5 bg-background rounded-full shadow-sm" />
                    ) : (
                      // Broken Line
                      <div className="w-full flex gap-1.5">
                        <div className="h-2.5 flex-1 bg-background rounded-full shadow-sm" />
                        <div className="h-2.5 flex-1 bg-background rounded-full shadow-sm" />
                      </div>
                    )}
                    {(lines[i] === 6 || lines[i] === 9) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-16 h-16 border border-white/20 rounded-full animate-ping opacity-30" />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              <span className="text-[10px] font-headline font-bold text-primary/40 tracking-widest uppercase">
                {['初', '二', '三', '四', '五', '上'][i]}爻
              </span>
            </div>
          ))}
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isCasting}
          onClick={castFullGua}
          className="px-12 py-4 bg-gradient-to-br from-primary to-primary-container text-background font-bold rounded-xl shadow-[0_10px_30px_rgba(212,168,83,0.4)] tracking-[0.25em] text-lg uppercase font-headline disabled:opacity-50"
        >
          {isCasting ? '正在感应天机...' : '起卦'}
        </motion.button>
      </section>

      {/* Complete Hexagram & Interpretation */}
      <AnimatePresence>
        {(isInterpreting || interpretation) && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Visual Hexagram Bar Summary */}
            <div className="flex justify-center py-6 bg-surface-container-low rounded-3xl border border-primary/10">
              <div className="flex flex-col-reverse gap-3 w-40">
                {lines.map((score, i) => (
                  <div key={i} className="flex items-center justify-center gap-4">
                    <span className="text-[8px] text-primary/30 w-4">{i+1}</span>
                    <div className="flex-1 h-2 flex gap-2">
                      {(score === 7 || score === 9) ? (
                         <div className="flex-1 bg-primary rounded-full" />
                      ) : (
                        <>
                          <div className="flex-1 bg-primary rounded-full" />
                          <div className="flex-1 bg-primary rounded-full" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Text Interpretation */}
            <div className="bg-surface-container-high p-8 rounded-3xl border border-primary/20 shadow-xl space-y-4 h-auto">
              <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-4">
                <Sparkles size={20} />
                <h3 className="font-headline font-bold text-lg">卦象解析</h3>
              </div>
              <div className="font-body text-on-surface/90 leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base">
                {interpretation}
              </div>
            </div>

            {/* Chat History - Moved here from top */}
            <section className="flex flex-col gap-6 pt-4 pb-24">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-start gap-4 mb-2",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      msg.role === 'user' ? "bg-surface-container-highest" : "bg-primary/20"
                    )}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} className="text-primary" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-background rounded-tr-none whitespace-pre-wrap" 
                        : "bg-surface-container-low text-on-surface rounded-tl-none border-l-2 border-primary/30"
                    )}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <MarkdownContent content={msg.content} />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSending && (
                <div className="py-4">
                  <ZenLoader message="大师正在深度解析卦象..." />
                </div>
              )}
            </section>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="fixed bottom-24 left-0 w-full px-4 z-40">
        <div className="max-w-screen-md mx-auto relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Languages size={18} className="text-primary/60" />
          </div>
          <input 
            className="w-full bg-surface-container-highest/90 backdrop-blur-md border border-outline-variant/20 rounded-2xl py-5 pl-14 pr-16 text-on-surface placeholder-on-surface-variant/40 focus:ring-1 focus:ring-primary shadow-2xl outline-none" 
            placeholder="输入您想求占的问题..." 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button 
            type="button"
            onClick={handleSendMessage}
            disabled={isSending}
            className="absolute right-3 top-2 bottom-2 px-4 bg-gradient-to-br from-primary to-primary-container text-background rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-on-surface text-surface rounded-full shadow-2xl font-bold text-sm flex items-center gap-2"
          >
            <Sparkles size={16} className="text-primary" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
