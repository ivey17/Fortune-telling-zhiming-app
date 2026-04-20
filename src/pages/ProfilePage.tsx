import { useState, useEffect } from 'react';
import { Star, History, MessageSquare, ChevronRight, Settings, ArrowLeft, Ticket, Wallet, PlusCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { fetchWithAuth } from '../services/api';

type ProfileSubPage = 'main' | 'fortune-history' | 'divination-history' | 'coupons' | 'recharge';

export default function ProfilePage({ onSettingsClick }: { onSettingsClick: () => void }) {
  const [subPage, setSubPage] = useState<ProfileSubPage>('main');
  const [membershipLevel, setMembershipLevel] = useState<'gold' | 'platinum'>('gold');
  const [selection, setSelection] = useState<string>('月度');
  const [selectedChat, setSelectedChat] = useState<{ title: string, messages: { role: 'user' | 'ai', content: string }[] } | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/api/user/profile').then(data => {
      setProfile(data);
      if (data.membership_level && data.membership_level !== 'none') {
        setMembershipLevel(data.membership_level);
      }
    }).catch(console.error);

    fetchWithAuth('/api/user/history').then(data => {
      setHistory(data.map((item: any) => ({
        date: new Date(item.created_at).toISOString().split('T')[0],
        title: item.title,
        type: item.type,
        messages: JSON.parse(item.messages)
      })));
    }).catch(console.error);

    fetchWithAuth('/api/user/coupons').then(data => {
      setCoupons(data || []);
    }).catch(console.error);
  }, []);

  const renderSubPage = () => {
    switch (subPage) {
      case 'fortune-history':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
            </button>
            <h3 className="text-3xl font-headline font-black text-primary">运势历史</h3>
            
            <AnimatePresence mode="wait">
              {!selectedChat ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {history.filter(h => h.type === 'AI 运势查询').map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedChat(item)}
                      className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 flex justify-between items-center group cursor-pointer hover:bg-surface-container transition-colors"
                    >
                      <div>
                        <p className="text-xs text-primary/60 font-label mb-1">{item.date} · {item.type}</p>
                        <h4 className="font-bold text-on-surface">{item.title}</h4>
                      </div>
                      <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <button onClick={() => setSelectedChat(null)} className="text-xs text-primary font-bold flex items-center gap-1">
                    <ArrowLeft size={14} /> 返回列表
                  </button>
                  <div className="space-y-6 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                    {selectedChat.messages.map((msg, i) => (
                      <div key={i} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                        <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant/40">
                          {msg.role === 'user' ? '我的提问' : '知命 AI'}
                        </span>
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                          msg.role === 'user' ? "bg-primary text-background font-bold shadow-lg" : "bg-surface-container-highest/40 text-on-surface border border-outline-variant/10"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'divination-history':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
            </button>
            <h3 className="text-3xl font-headline font-black text-primary">起卦历史</h3>
            
            <AnimatePresence mode="wait">
              {!selectedChat ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {history.filter(h => h.type === 'AI 起卦追问').map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedChat(item)}
                      className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 flex justify-between items-center group cursor-pointer hover:bg-surface-container transition-colors"
                    >
                      <div>
                        <p className="text-xs text-primary/60 font-label mb-1">{item.date} · {item.type}</p>
                        <h4 className="font-bold text-on-surface">{item.title}</h4>
                      </div>
                      <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <button onClick={() => setSelectedChat(null)} className="text-xs text-primary font-bold flex items-center gap-1">
                    <ArrowLeft size={14} /> 返回列表
                  </button>
                  <div className="space-y-6 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                    {selectedChat.messages.map((msg, i) => (
                      <div key={i} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                        <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant/40">
                          {msg.role === 'user' ? '我的提问' : '知命 AI'}
                        </span>
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                          msg.role === 'user' ? "bg-primary text-background font-bold shadow-lg" : "bg-surface-container-highest/40 text-on-surface border border-outline-variant/10"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'coupons':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
            </button>
            <h3 className="text-3xl font-headline font-black text-primary">我的优惠券</h3>
            <div className="space-y-4">
              {coupons.length > 0 ? coupons.map((coupon, idx) => (
                <div key={idx} className={cn(
                  "bg-gradient-to-r p-6 rounded-2xl border-l-4 relative overflow-hidden",
                  coupon.is_used 
                    ? "from-surface-container-high to-surface-container-low border-outline-variant/30 opacity-60" 
                    : "from-primary/20 to-primary/5 border-primary"
                )}>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded",
                        coupon.is_used ? "bg-outline-variant/20 text-on-surface-variant" : "bg-primary/20 text-primary"
                      )}>{coupon.tag}</span>
                      <span className={cn(
                        "text-2xl font-black",
                        coupon.is_used ? "text-on-surface-variant/60" : "text-primary"
                      )}>{coupon.discount_text}</span>
                    </div>
                    <h4 className="font-bold text-on-surface">
                      {coupon.title} {coupon.is_used && "(已使用)"}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      有效期至 {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : '长期有效'}
                    </p>
                  </div>
                  <Ticket className={cn(
                    "absolute -right-4 -bottom-4 w-24 h-24 rotate-12",
                    coupon.is_used ? "text-outline-variant/10" : "text-primary/5"
                  )} />
                </div>
              )) : (
                <div className="text-center text-on-surface-variant/60 py-10 font-label">暂无优惠券记录</div>
              )}
            </div>
          </div>
        );
      case 'recharge':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
            </button>
            <h3 className="text-3xl font-headline font-black text-primary">会员中心</h3>
            
            <div className="space-y-6">
              {/* Level Selector */}
              <div className="flex p-1 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                <button 
                  onClick={() => setMembershipLevel('gold')}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-headline font-bold text-sm transition-all",
                    membershipLevel === 'gold' ? "bg-primary text-background shadow-lg shadow-primary/20" : "text-on-surface-variant/60"
                  )}
                >
                  黄金会员
                </button>
                <button 
                  onClick={() => setMembershipLevel('platinum')}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-headline font-bold text-sm transition-all",
                    membershipLevel === 'platinum' ? "bg-primary text-background shadow-lg shadow-primary/20" : "text-on-surface-variant/60"
                  )}
                >
                  铂金会员
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-3 gap-3">
                {(membershipLevel === 'gold' ? [
                  { type: '月度', price: '¥ 6', duration: '30天' },
                  { type: '季度', price: '¥ 15', duration: '90天' },
                  { type: '年度', price: '¥ 58', duration: '365天', recommend: true },
                ] : [
                  { type: '月度', price: '¥ 18', duration: '30天' },
                  { type: '季度', price: '¥ 45', duration: '90天' },
                  { type: '年度', price: '¥ 158', duration: '365天', recommend: true },
                ]).map((pkg, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelection(pkg.type)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all relative overflow-hidden text-center flex flex-col items-center gap-1",
                      selection === pkg.type ? "bg-primary/10 border-primary ring-1 ring-primary/20" : "bg-surface-container-low border-outline-variant/10"
                    )}
                  >
                    <div className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{pkg.type}会员</div>
                    <div className="text-xl font-black text-on-surface">{pkg.price}</div>
                    <div className="text-[8px] text-on-surface-variant/60">有效期 {pkg.duration}</div>
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <button className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-background font-headline font-black text-lg rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                立即开通 {membershipLevel === 'gold' ? '黄金会员' : '铂金会员'}
                <Sparkles size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-sm text-on-surface-variant flex items-center gap-2">
                <PlusCircle size={14} className="text-primary" />
                当前等级权益
              </h4>
              <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest/30">
                      <th className="p-4 font-headline uppercase tracking-widest text-[9px] opacity-40">权益项目</th>
                      <th className="p-4 font-headline uppercase tracking-widest text-[9px] text-center">普通</th>
                      <th className={cn(
                        "p-4 font-headline uppercase tracking-widest text-[9px] text-center transition-colors",
                        membershipLevel === 'gold' ? "text-primary" : "opacity-40"
                      )}>黄金</th>
                      <th className={cn(
                        "p-4 font-headline uppercase tracking-widest text-[9px] text-center transition-colors",
                        membershipLevel === 'platinum' ? "text-primary" : "opacity-40"
                      )}>铂金</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    <tr>
                      <td className="p-4 font-medium opacity-80">日运深度对话</td>
                      <td className="p-4 text-center opacity-40">1次/日</td>
                      <td className={cn("p-4 text-center font-bold", membershipLevel === 'gold' ? "text-primary" : "opacity-40")}>10次/日</td>
                      <td className={cn("p-4 text-center font-black", membershipLevel === 'platinum' ? "text-primary" : "opacity-40")}>无限次</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium opacity-80">起卦深度追问</td>
                      <td className="p-4 text-center opacity-40">1次/日</td>
                      <td className={cn("p-4 text-center font-bold", membershipLevel === 'gold' ? "text-primary" : "opacity-40")}>10次/日</td>
                      <td className={cn("p-4 text-center font-black", membershipLevel === 'platinum' ? "text-primary" : "opacity-40")}>无限次</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium opacity-80">吉日提醒功能</td>
                      <td className="p-4 text-center opacity-40">—</td>
                      <td className={cn("p-4 text-center", membershipLevel === 'gold' ? "text-primary" : "opacity-40")}>支持</td>
                      <td className={cn("p-4 text-center", membershipLevel === 'platinum' ? "text-primary" : "opacity-40")}>支持</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-on-surface-variant/40 font-label leading-relaxed">
              您的测算历史将跨设备同步。支付即视为同意《知命会员服务协议》
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-10">
            <section className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-pulse opacity-30 scale-105" />
                <div className="w-24 h-24 rounded-2xl p-0.5 bg-gradient-to-br from-primary to-primary-container">
                  <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-background">
                    <img 
                      alt="用户头像" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDppiDiRfNhTJvXRgkr3DEx_pe5BMkU0ewotcHNJouNXGNzarGRajAPLf9eq2mPy2B0RrkBYwVxcoSlGOmsadP69mdyLH8z38H8eyLPDAuJj_sD7B-XxAN4m-a4awGwfXapN11oMS10stCtsFnMlZMah9-0PzyMCfoPW48rHf5xCv_eGMv949rSS-vUXV6nebTTgxsnfajE0g68lDD96csliNFbt4CBp0SRoke94rAHU4uWmaq58vV-x83_mSnBd3fwA6rhpfCcW3g" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-headline font-bold text-on-background">{profile?.nickname || '知命行者'}</h3>
              </div>
            </section>

            <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Star size={24} />
                </div>
                <div>
                  <div className="text-on-surface font-black text-xl">
                    普通用户
                  </div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">
                    当前未开通会员
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSubPage('recharge')}
                className="flex items-center gap-2 bg-primary text-background px-6 py-2.5 rounded-xl font-headline font-bold text-xs shadow-lg shadow-primary/20"
              >
                立即开通
              </button>
            </section>

            <section className="space-y-4">
              {[
                { icon: Ticket, title: '我的优惠券', sub: `当前可用 ${coupons.filter(c => !c.is_used).length} 张`, page: 'coupons' as const },
                { icon: History, title: '运势历史', sub: '回顾今日运势AI深度对话', page: 'fortune-history' as const },
                { icon: MessageSquare, title: '起卦历史', sub: '回顾历次占卜向AI追问记录', page: 'divination-history' as const },
              ].map((item, idx) => (
                <motion.button 
                  key={idx}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    setSelectedChat(null);
                    setSubPage(item.page);
                  }}
                  className="w-full text-left group block bg-surface-container-low p-6 rounded-2xl transition-all hover:bg-surface-container-high border border-outline-variant/10 shadow-sm" 
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <h4 className="text-on-background font-headline font-bold">{item.title}</h4>
                        <p className="text-on-surface-variant font-headline text-xs mt-1">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-outline group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </section>
          </div>
        );
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-start">
        <h2 className="text-primary text-4xl font-headline font-black tracking-tight">个人中心</h2>
        <motion.button 
          whileTap={{ rotate: 90 }}
          onClick={onSettingsClick}
          className="p-2 text-primary/60 hover:text-primary transition-colors"
        >
          <Settings size={28} />
        </motion.button>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={subPage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {renderSubPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
