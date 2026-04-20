import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, MessageCircle, Apple, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAction = async () => {
    if (!isAgreed) {
      setErrorVisible(true);
      setTimeout(() => setErrorVisible(false), 2000);
      return;
    }
    if (!phoneNumber || !password) {
      setErrorMessage('请输入手机号和密码');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || '登录失败，请重试');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-surface-container-highest/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm py-16 space-y-10 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-container shadow-[0_20px_50px_-10px_rgba(242,195,107,0.4)] mb-2">
            <Sparkles size={40} className="text-background" />
          </div>
          <h1 className="text-4xl font-headline font-black tracking-tight text-primary">知命</h1>
          <p className="text-on-surface-variant font-label text-xs uppercase tracking-[0.4em]">Ancient Wisdom • Modern Insight</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary/60 ml-4">手机号 / 账号</label>
              <input 
                type="text" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="请输入手机号"
                className="w-full h-15 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] px-8 font-headline text-lg focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary/60 ml-4">密码</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full h-15 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] px-8 font-headline text-lg focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-4">
            <button 
              onClick={() => setIsAgreed(!isAgreed)}
              className={cn(
                "w-4 h-4 rounded border transition-all flex items-center justify-center",
                isAgreed ? "bg-primary border-primary" : "border-outline-variant/30"
              )}
            >
              {isAgreed && <div className="w-2 h-2 bg-background rounded-sm" />}
            </button>
            <p className={cn(
              "text-[11px] text-on-surface-variant/60 transition-colors",
              errorVisible && !isAgreed ? "text-red-400 font-bold" : ""
            )}>
              已阅读并同意知命的
              <span className="text-primary mx-0.5">用户协议</span>
              与
              <span className="text-primary mx-0.5">隐私条款</span>
            </p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-4 text-center"
              >
                <p className="text-sm font-bold text-red-500 bg-red-500/10 py-2 rounded-xl">
                  {errorMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-background font-headline font-black text-xl rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(242,195,107,0.3)] flex items-center justify-center gap-3"
          >
            {mode === 'login' ? '登 录' : '注 册'}
            <ArrowRight size={20} />
          </motion.button>

          <div className="text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-on-surface-variant/60 font-headline text-sm hover:text-primary transition-colors"
            >
              {mode === 'login' ? '还没有账号？立即注册' : '已有账号？返回登录'}
            </button>
          </div>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-outline-variant/10" />
              <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/30">社交账号登录</span>
              <div className="h-px flex-1 bg-outline-variant/10" />
            </div>
            
            <div className="flex justify-center gap-8">
              <motion.button 
                whileHover={{ y: -2 }}
                className="w-12 h-12 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-on-surface hover:text-[#07C160] transition-colors border border-outline-variant/5"
              >
                <MessageCircle size={24} />
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                className="w-12 h-12 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-on-surface hover:text-on-surface/80 transition-colors border border-outline-variant/5"
              >
                <Apple size={24} fill="currentColor" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <footer className="absolute bottom-12 text-center w-full px-8 pointer-events-none">
        <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-[0.5em]">顺应天命 · 笃行致远</p>
      </footer>
    </div>
  );
}
