import { Settings, ChevronRight, MessageSquare, History, Gift, CreditCard, LogOut, Sparkles, Loader2, Edit3, Save, X, Mars, Venus, Calendar, ArrowLeft, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import { cn } from '../lib/utils';

type ProfileSubPage = 'main' | 'fortune-history' | 'divination-history' | 'coupons' | 'recharge';

export default function ProfilePage({ profile, onProfileUpdate, onSettingsClick }: { profile: any, onProfileUpdate: () => void, onSettingsClick: () => void }) {
  const [subPage, setSubPage] = useState<ProfileSubPage>('main');
  const [membershipLevel, setMembershipLevel] = useState<'gold' | 'platinum'>('gold');
  const [selection, setSelection] = useState<string>('年度');
  const [selectedChat, setSelectedChat] = useState<any>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.membership_level && profile?.membership_level !== 'none') {
      setMembershipLevel(profile.membership_level);
    }
  }, [profile]);

  useEffect(() => {
    fetchWithAuth('/api/user/history').then(data => {
      setHistory(data.map((item: any) => ({
        id: item.id,
        date: new Date(item.created_at).toISOString().split('T')[0],
        title: item.title || (item.type === 'fortune' ? '运势解析' : '起卦追问'),
        type: item.type,
        messages: JSON.parse(item.messages || '[]')
      })));
    }).catch(console.error);

    fetchWithAuth('/api/user/coupons').then(data => {
      setCoupons(data || []);
    }).catch(console.error);
  }, []);

  const startEditing = () => {
    setEditBirthDate(profile?.birth_date ? new Date(profile.birth_date).toISOString().slice(0, 16) : '');
    setEditGender(profile?.gender || 'male');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetchWithAuth('/api/user/profile', {
        method: 'POST',
        body: JSON.stringify({ 
          nickname: profile?.nickname,
          birth_date: editBirthDate ? new Date(editBirthDate).toISOString() : null,
          gender: editGender
        })
      });
      onProfileUpdate();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSubPage = () => {
    switch (subPage) {
      case 'main':
        return (
          <div className="space-y-10">
            {/* Profile Header */}
            <div className="bg-surface-container rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-outline-variant/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container p-0.5 shadow-xl">
                    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-background/20">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.nickname || 'Guest'}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black font-headline text-on-surface">{profile?.nickname || '知命用户'}</h3>
                      <div className="px-2 py-0.5 bg-primary/10 rounded text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">
                        {membershipLevel === 'platinum' ? '铂金会员' : '黄金会员'}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant/60 font-label tracking-tighter">
                      账户ID: {profile?.id?.slice(0, 8) || '---'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="py-1 px-2 bg-surface-container-highest/50 rounded-lg w-fit text-[10px] text-primary font-bold">
                        {profile?.birth_date ? `${profile.gender === 'female' ? '坤造' : '乾造'} · ${new Date(profile.birth_date).toLocaleDateString('zh-CN')}` : '尚未设置生辰'}
                      </div>
                      <button onClick={startEditing} className="text-primary/40 hover:text-primary transition-colors">
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onSettingsClick}
                  className="p-3 bg-surface-container-highest/50 rounded-2xl text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10 shadow-sm"
                >
                  <Settings size={20} />
                </button>
              </div>

              {/* Inline Editing Form */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 pt-8 border-t border-outline-variant/10 space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-primary">修改生辰信息</h4>
                      <button onClick={() => setIsEditing(false)} className="text-on-surface-variant/40 hover:text-on-surface-variant">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-primary/60 ml-2">性别</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditGender('male')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold",
                              editGender === 'male' ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-highest border-transparent text-on-surface-variant/40"
                            )}
                          >
                            <Mars size={14} /> 乾造
                          </button>
                          <button 
                            onClick={() => setEditGender('female')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold",
                              editGender === 'female' ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-highest border-transparent text-on-surface-variant/40"
                            )}
                          >
                            <Venus size={14} /> 坤造
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-primary/60 ml-2">出生日期</label>
                        <input 
                          type="datetime-local" 
                          className="w-full bg-surface-container-highest px-3 py-3 rounded-xl focus:outline-none focus:ring-1 ring-primary/30 transition-all text-xs"
                          value={editBirthDate}
                          onChange={(e) => setEditBirthDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-3 bg-primary text-background rounded-xl font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      确认修改
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setSubPage('fortune-history'); setSelectedChat(null); }} className="bg-surface-container p-6 rounded-3xl flex items-center justify-between group border border-outline-variant/10 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><History size={20} /></div>
                  <span className="font-bold">运势记录</span>
                </div>
                <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
              </button>
              <button onClick={() => { setSubPage('divination-history'); setSelectedChat(null); }} className="bg-surface-container p-6 rounded-3xl flex items-center justify-between group border border-outline-variant/10 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><MessageSquare size={20} /></div>
                  <span className="font-bold">起卦记录</span>
                </div>
                <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
              </button>
              <button onClick={() => setSubPage('coupons')} className="bg-surface-container p-6 rounded-3xl flex items-center justify-between group border border-outline-variant/10 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Ticket size={20} /></div>
                  <span className="font-bold">我的券</span>
                </div>
                <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
              </button>
              <button onClick={() => setSubPage('recharge')} className="bg-surface-container p-6 rounded-3xl flex items-center justify-between group border border-outline-variant/10 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Sparkles size={20} /></div>
                  <span className="font-bold">会员中心</span>
                </div>
                <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        );
      case 'fortune-history':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
            </button>
            <h3 className="text-3xl font-headline font-black text-primary">运势记录</h3>
            <div className="space-y-4">
              {history.filter(h => h.type === 'fortune').length > 0 ? (
                history.filter(h => h.type === 'fortune').map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedChat(item)}
                    className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 flex justify-between items-center group cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <div>
                      <p className="text-xs text-primary/60 font-label mb-1">{item.date}</p>
                      <h4 className="font-bold text-on-surface">{item.title}</h4>
                    </div>
                    <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/20">
                  <History size={40} className="mx-auto text-primary/20 mb-4" />
                  <p className="text-on-surface-variant/60 font-label">暂无记录</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'divination-history':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
            </button>
            <h3 className="text-3xl font-headline font-black text-primary">起卦记录</h3>
            <div className="space-y-4">
              {history.filter(h => h.type === 'divination').length > 0 ? (
                history.filter(h => h.type === 'divination').map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedChat(item)}
                    className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 flex justify-between items-center group cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <div>
                      <p className="text-xs text-primary/60 font-label mb-1">{item.date}</p>
                      <h4 className="font-bold text-on-surface">{item.title}</h4>
                    </div>
                    <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/20">
                  <MessageSquare size={40} className="mx-auto text-primary/20 mb-4" />
                  <p className="text-on-surface-variant/60 font-label">暂无记录</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'coupons':
        return (
          <div className="space-y-8">
            <button onClick={() => setSubPage('main')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回</span>
            </button>
            <h3 className="text-3xl font-headline font-black text-primary">我的券</h3>
            <div className="space-y-4">
              {coupons.length > 0 ? coupons.map((c, idx) => (
                <div key={idx} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex justify-between items-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform"><Ticket size={60} /></div>
                   <div className="space-y-1 relative z-10">
                     <div className="text-xs font-black text-primary uppercase tracking-widest">{c.code}</div>
                     <h4 className="text-2xl font-black text-on-surface">¥ {c.discount_amount} 优惠券</h4>
                     <p className="text-[10px] text-on-surface-variant/60">有效期至: {new Date(c.expires_at).toLocaleDateString()}</p>
                   </div>
                   <div className="bg-primary text-background px-4 py-2 rounded-xl font-bold text-xs relative z-10">
                     {c.is_active ? '可使用' : '已失效'}
                   </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/20">
                  <Ticket size={40} className="mx-auto text-primary/20 mb-4" />
                  <p className="text-on-surface-variant/60 font-label">暂无优惠券</p>
                </div>
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
               <div className="flex p-1 bg-surface-container-high rounded-2xl">
                 <button 
                  onClick={() => setMembershipLevel('gold')}
                  className={cn("flex-1 py-3 rounded-xl font-bold transition-all", membershipLevel === 'gold' ? "bg-primary text-background" : "text-on-surface-variant/60")}
                 >黄金会员</button>
                 <button 
                  onClick={() => setMembershipLevel('platinum')}
                  className={cn("flex-1 py-3 rounded-xl font-bold transition-all", membershipLevel === 'platinum' ? "bg-primary text-background" : "text-on-surface-variant/60")}
                 >铂金会员</button>
               </div>
               <div className="grid grid-cols-3 gap-3">
                 {['月度', '季度', '年度'].map(t => (
                   <button 
                    key={t}
                    onClick={() => setSelection(t)}
                    className={cn("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all", selection === t ? "border-primary bg-primary/5" : "border-outline-variant/10 bg-surface-container-low")}
                   >
                     <span className="text-[10px] opacity-40 font-bold uppercase">{t}</span>
                     <span className="text-lg font-black">{t === '月度' ? '¥6' : t === '季度' ? '¥15' : '¥58'}</span>
                   </button>
                 ))}
               </div>
               <button className="w-full h-16 bg-primary text-background rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                 立即开通
               </button>
            </div>
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

      {selectedChat ? (
        <div className="space-y-8">
           <button onClick={() => setSelectedChat(null)} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-headline font-bold uppercase tracking-widest text-sm">返回列表</span>
            </button>
            <div className="space-y-6 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
              {selectedChat.messages.map((msg: any, i: number) => (
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
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={subPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderSubPage()}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
