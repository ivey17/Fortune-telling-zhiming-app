import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, MessageCircle, Apple, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import LegalOverlay from '../components/LegalOverlay';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showLegal, setShowLegal] = useState(false);
  const [legalType, setLegalType] = useState<'agreement' | 'privacy'>('agreement');

  const AGREEMENT_TEXT = `知命用户服务协议

欢迎您使用知命。本协议是您与知命平台之间就服务使用所订立的契约。

1. 服务内容
知命利用人工智能技术为您提供命理分析、起卦参考等服务。相关结果仅供娱乐与学术参考，不作为决策依据。

2. 用户规范
您承诺遵守法律法规，不利用本平台传播违规信息。

3. 账号安全
您负责保护您的账号密码安全，因泄露造成的损失由您自行承担。

4. 知识产权
本平台所有内容、算法、设计之版权均归知命所有。

5. 免责声明
命理测算具有不确定性，本平台不对测算结果的绝对准确性做担保，亦不承担任何法律责任。`;

  const PRIVACY_TEXT = `知命隐私政策

知命非常重视您的隐私保护。

1. 信息采集
我们会采集您的出生日期、性别用于排盘计算。我们会加密存储您的手机号用于登录校验。

2. 信息使用
采集的信息仅用于为您生成命理报告，未经许可不会提供给第三方。

3. 信息安全
我们采用工业级加密技术保障您的数据安全。

4. 权限说明
本应用可能需要获取您的通知权限用于提醒每日运势更新。

5. 您的权利
您可以随时在“设置”中注销账号并要求删除所有个人数据。`;

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

    // Phone validation
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage('请输入正确的11位手机号');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Password confirmation
    if (mode === 'register' && password !== confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
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
      
      const text = await response.text();
      if (!text) {
        throw new Error('服务器响应为空，请稍后重试');
      }
      
      const data = JSON.parse(text);

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        window.location.href = '/'; 
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
              <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary/60 ml-4">手机号</label>
              <input 
                type="tel" 
                maxLength={11}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入11位手机号"
                className="w-full h-15 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] px-8 font-headline text-lg focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary/60 ml-4">
                {mode === 'login' ? '密码' : '设置密码'}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full h-15 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] px-8 font-headline text-lg focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            {mode === 'register' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary/60 ml-4">确认密码</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="w-full h-15 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] px-8 font-headline text-lg focus:outline-none focus:border-primary/40 transition-colors"
                />
              </motion.div>
            )}
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
              <span 
                onClick={() => { setLegalType('agreement'); setShowLegal(true); }}
                className="text-primary mx-0.5 cursor-pointer hover:underline underline-offset-4"
              >
                用户协议
              </span>
              与
              <span 
                onClick={() => { setLegalType('privacy'); setShowLegal(true); }}
                className="text-primary mx-0.5 cursor-pointer hover:underline underline-offset-4"
              >
                隐私条款
              </span>
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

      <AnimatePresence>
        {showLegal && (
          <LegalOverlay 
            title={legalType === 'agreement' ? '用户服务协议' : '隐私政策条款'}
            content={legalType === 'agreement' ? AGREEMENT_TEXT : PRIVACY_TEXT}
            onClose={() => setShowLegal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
