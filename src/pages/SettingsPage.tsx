import { useState } from 'react';
import { User, ShieldCheck, Bell, Eye, Info, ChevronRight, ArrowLeft, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function SettingsPage({ onBack, onLogout }: { onBack: () => void, onLogout: () => void }) {
  const [subPage, setSubPage] = useState<'main' | 'profile' | 'security' | 'about'>('main');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const renderSubPage = () => {
    switch (subPage) {
      case 'profile':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={18} />
              <span className="font-headline font-bold text-xs">返回</span>
            </button>
            <h2 className="text-2xl font-bold text-primary font-headline">个人资料</h2>
            <div className="space-y-6">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                <p className="text-on-surface-variant text-sm mb-4">完善您的生辰八字信息以获得更精准的测算结果。</p>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-primary/60 ml-2 font-bold font-headline">昵称</label>
                    <input type="text" className="w-full bg-surface-container-highest px-4 py-3 rounded-xl focus:outline-none" defaultValue="知命行者" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-primary/60 ml-2 font-bold font-headline">出生日期</label>
                    <input type="date" className="w-full bg-surface-container-highest px-4 py-3 rounded-xl focus:outline-none" defaultValue="1984-12-23" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={18} />
              <span className="font-headline font-bold text-xs">返回</span>
            </button>
            <h2 className="text-2xl font-bold text-primary font-headline">账号安全</h2>
            <div className="space-y-6">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                <div className="flex justify-between items-center py-2">
                  <span className="text-on-surface/80">修改密码</span>
                  <ChevronRight size={16} />
                </div>
                <div className="h-[1px] bg-outline-variant/10 my-4"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-on-surface/80">注销账号</span>
                  <span className="text-error text-xs">危险操作</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={18} />
              <span className="font-headline font-bold text-xs">返回</span>
            </button>
            <h2 className="text-2xl font-bold text-primary font-headline">关于知命</h2>
            <div className="space-y-6">
              <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-container rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <Sparkles size={40} className="text-background" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-on-surface">知命 · Zhiming</h3>
                  <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Version 2.4.0</p>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant/80 text-center italic px-4">
                  “知命” 是一款传承东方传统智慧，融合现代AI大数据算法的命理测算平台。我们致力于让每一个生命都能洞悉自己的运行轨迹，在天时地利中寻找最优雅的前行姿态。
                </p>
                <div className="pt-4 border-t border-outline-variant/10 text-[10px] text-center text-primary/40 leading-loose">
                  <p>© 2026 知命智慧实验室 出品</p>
                  <p>All Wisdom Reserved.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <section className="space-y-6">
              <div className="bg-surface-container-low p-2 rounded-[2rem]">
                <div className="space-y-1">
                  <button 
                    onClick={() => setSubPage('profile')}
                    className="w-full flex items-center justify-between p-5 glass-card rounded-full hover:bg-surface-container-highest transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-container/10 text-primary">
                        <User size={20} />
                      </div>
                      <span className="text-lg font-medium tracking-wide">个人资料</span>
                    </div>
                    <ChevronRight size={20} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                  </button>
                  <button 
                    onClick={() => setSubPage('security')}
                    className="w-full flex items-center justify-between p-5 glass-card rounded-full hover:bg-surface-container-highest transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-container/10 text-primary">
                        <ShieldCheck size={20} />
                      </div>
                      <span className="text-lg font-medium tracking-wide">账号安全</span>
                    </div>
                    <ChevronRight size={20} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10">
                <h3 className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] mb-6 px-2 font-headline">系统偏好</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="w-full flex items-center justify-between group py-2"
                  >
                    <div className="flex items-center gap-4">
                      <Bell size={20} className={cn("transition-colors", notificationsEnabled ? "text-primary" : "text-outline")} />
                      <span className="text-on-surface/80">通知设置</span>
                    </div>
                    <div className={cn(
                      "w-10 h-5 rounded-full relative flex items-center px-1 transition-colors duration-300",
                      notificationsEnabled ? "bg-primary/20" : "bg-surface-container-highest"
                    )}>
                      <motion.div 
                        animate={{ x: notificationsEnabled ? 20 : 0 }}
                        className={cn(
                          "w-3 h-3 rounded-full shadow-lg transition-colors",
                          notificationsEnabled ? "bg-primary shadow-primary/60" : "bg-outline"
                        )}
                      />
                    </div>
                  </button>
                  <div className="h-[1px] bg-outline-variant/10 my-4"></div>
                  <button className="w-full flex items-center justify-between group py-2">
                    <div className="flex items-center gap-4">
                      <Eye size={20} className="text-primary" />
                      <span className="text-on-surface/80">隐私管理</span>
                    </div>
                    <Info size={14} className="text-on-surface-variant/30" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setSubPage('about')}
                className="w-full p-6 bg-surface-container-low rounded-[2rem] flex items-center justify-between border border-primary/10 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                    <Info size={24} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="block text-lg font-bold text-on-surface">关于知命</span>
                    <span className="text-[10px] text-on-surface-variant/50 font-label uppercase">版本 2.4.0 • 天地合一</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-primary" />
              </button>
            </section>

            <footer className="mt-16">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className="w-full py-5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-background font-headline font-extrabold text-lg shadow-[0_20px_40px_-10px_rgba(212,168,83,0.3)] flex items-center justify-center gap-3"
              >
                <LogOut size={20} />
                退出登录
              </motion.button>
              <div className="mt-8 text-center">
                <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-[0.5em]">顺应天命 · 笃行致远</p>
              </div>
            </footer>
          </>
        );
    }
  };

  return (
    <div className="space-y-12">
      <header>
        {subPage === 'main' && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
          </button>
        )}
        <h1 className="text-primary text-5xl font-extrabold tracking-tight mb-2 font-headline">
          {subPage === 'main' ? '设置' : subPage === 'profile' ? '个人' : '安全'}
        </h1>
        <p className="text-on-surface-variant/60 font-label text-xs uppercase tracking-widest">
          {subPage === 'main' ? '系统配置与星象校准' : '您的数字化命理身份'}
        </p>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={subPage}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderSubPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
