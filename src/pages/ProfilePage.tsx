import { 
  Settings, ChevronRight, MessageSquare, History, Gift, CreditCard, LogOut, 
  Sparkles, Loader2, Edit3, Save, X, Mars, Venus, Calendar, ArrowLeft, 
  Ticket, PlusCircle, Star, ShieldCheck, Bell, Eye, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { fetchWithAuth } from '../services/api';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import MarkdownContent from '../components/MarkdownContent';
import HistoryWheelPicker from '../components/HistoryWheelPicker';

type ProfileSubPage = 'main' | 'fortune-history' | 'divination-history' | 'coupons' | 'recharge' | 'security' | 'about' | 'change-password' | 'privacy-settings';

export default function ProfilePage() {
  const { profile, history, coupons, refreshProfile, clearUser } = useUser();
  const [subPage, setSubPage] = useState<ProfileSubPage>('main');
  const [membershipLevel, setMembershipLevel] = useState<'none' | 'gold' | 'platinum'>('none');
  const [selection, setSelection] = useState<string>('年度');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  
  // Notification states
  const [fortuneNotify, setFortuneNotify] = useState(true);
  const [systemNotify, setSystemNotify] = useState(false);
  
  // Search states
  const [fortuneSearchDate, setFortuneSearchDate] = useState('');
  const [divSearchDate, setDivSearchDate] = useState('');
  const [showFortuneCalendar, setShowFortuneCalendar] = useState(false);
  const [showDivCalendar, setShowDivCalendar] = useState(false);
  
  // Privacy states
  // 直接读 localStorage，确保切换 subPage 时最新值始终同步
  const [hideBirth, setHideBirthLocal] = useState<boolean>(
    () => localStorage.getItem('hideBirth') === 'true'
  );

  const setHideBirth = (val: boolean) => {
    setHideBirthLocal(val);
    localStorage.setItem('hideBirth', val.toString());
    // 主动触发 storage 事件，让其他组件即时响应
    window.dispatchEvent(new Event('storage'));
  };

  const [aiImprovement, setAiImprovement] = useState(true);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Notification Toast
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [isSaving, setIsSaving] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);

  useEffect(() => {
    if (profile?.membership_level) {
      setMembershipLevel(profile.membership_level);
    }
  }, [profile]);

  const startEditing = () => {
    setEditBirthDate(profile?.birth_date ? new Date(profile.birth_date).toISOString().slice(0, 16) : '');
    setEditGender(profile?.gender || 'male');
    setEditNickname(profile?.nickname || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetchWithAuth('/api/user/profile', {
        method: 'POST',
        body: JSON.stringify({ 
          nickname: editNickname,
          birth_date: editBirthDate ? new Date(editBirthDate).toISOString() : null,
          gender: editGender
        })
      });
      refreshProfile();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    window.location.href = '/';
  };

  const renderSubPage = () => {
    switch (subPage) {
      case 'main':
        return (
          <div className="space-y-8">
            {/* Profile Hero Card */}
            <div className="bg-surface-container rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl border border-outline-variant/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-6 items-center w-full">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container p-0.5 shadow-xl shrink-0">
                    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-background/20">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || 'Guest'}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black font-headline text-on-surface truncate">{profile?.nickname || '知命用户'}</h3>
                      <div className="px-2 py-0.5 bg-primary/10 rounded text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20 shrink-0">
                        {membershipLevel === 'platinum' ? '铂金会员' : membershipLevel === 'gold' ? '黄金会员' : '普通用户'}
                      </div>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/40 font-label tracking-widest uppercase">
                      User ID: {profile?.id?.slice(0, 8) || '---'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="py-1 px-3 bg-surface-container-highest/50 rounded-lg w-fit text-[10px] text-primary font-bold">
                        {profile?.birth_date ? (
                          hideBirth ? '生辰信息已隐藏' : `${profile.gender === 'female' ? '坤造' : '乾造'} · ${new Date(profile.birth_date).toLocaleDateString('zh-CN')}`
                        ) : '尚未设置生辰'}
                      </div>
                      {!isEditing && (
                        <button onClick={startEditing} className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/5 text-primary/40 hover:text-primary transition-colors">
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-primary/60">完善生辰档案</h4>
                      <button onClick={() => setIsEditing(false)} className="text-on-surface-variant/40 hover:text-on-surface-variant">
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant/40 ml-2">我的昵称</label>
                        <input 
                          type="text" 
                          className="w-full bg-surface-container-highest px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 ring-primary/30 transition-all text-sm font-bold" 
                          value={editNickname}
                          onChange={(e) => setEditNickname(e.target.value)}
                          placeholder="设置您的新昵称"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-on-surface-variant/40 ml-2">性别</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditGender('male')}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all text-xs font-bold",
                                editGender === 'male' ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-highest border-transparent text-on-surface-variant/40"
                              )}
                            >
                              <Mars size={14} /> 乾造
                            </button>
                            <button 
                              onClick={() => setEditGender('female')}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all text-xs font-bold",
                                editGender === 'female' ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-highest border-transparent text-on-surface-variant/40"
                              )}
                            >
                              <Venus size={14} /> 坤造
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-on-surface-variant/40 ml-2">出生日期</label>
                          <button 
                            onClick={() => setShowPicker(true)}
                            className="w-full h-12 bg-surface-container-highest px-4 rounded-2xl border border-transparent hover:border-primary/20 transition-all flex items-center justify-between group"
                          >
                            <span className="text-[10px] font-bold text-on-surface truncate">
                              {editBirthDate ? new Date(editBirthDate).toLocaleString('zh-CN', { hour12: false }) : '请选择日期'}
                            </span>
                            <Calendar size={14} className="text-primary/40 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-4 bg-primary text-background rounded-2xl font-black flex items-center justify-center gap-2 text-sm shadow-xl shadow-primary/20"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      保存并同步天机
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: History, label: '运势记录', page: 'fortune-history' },
                { icon: MessageSquare, label: '起卦记录', page: 'divination-history' },
                { icon: Ticket, label: '我的优惠券', page: 'coupons' },
                { icon: Sparkles, label: '会员中心', page: 'recharge' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setSubPage(item.page as any)} 
                  className="bg-surface-container p-6 rounded-[2rem] flex items-center justify-between group border border-outline-variant/10 hover:border-primary/20 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform"><item.icon size={20} /></div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-outline group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            {/* Settings Sections */}
            <div className="space-y-6 pt-4">
              <div className="bg-surface-container rounded-[2.5rem] p-4 border border-outline-variant/10">
                <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-on-surface-variant/40 mb-4 ml-4">系统与安全</h4>
                <div className="space-y-1">
                  <button 
                    onClick={() => setSubPage('security')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-highest/40 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck size={20} /></div>
                      <span className="text-sm font-bold">账号安全</span>
                    </div>
                    <ChevronRight size={16} className="text-outline/40 group-hover:text-primary transition-colors" />
                  </button>

                  <div className="flex items-center justify-between p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary"><Bell size={20} /></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">每日运势提醒</span>
                        <span className="text-[8px] text-on-surface-variant/40">每日晨间为您推送今日天机</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFortuneNotify(!fortuneNotify)}
                      className={cn(
                        "w-10 h-5 rounded-full relative flex items-center px-1 transition-colors duration-300",
                        fortuneNotify ? "bg-primary/30" : "bg-surface-container-highest"
                      )}
                    >
                      <motion.div 
                        animate={{ x: fortuneNotify ? 20 : 0 }}
                        className={cn("w-3 h-3 rounded-full", fortuneNotify ? "bg-primary" : "bg-outline-variant")}
                      />
                    </button>
                  </div>

                  <button 
                    onClick={() => setSubPage('privacy-settings')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-highest/40 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary"><Eye size={20} /></div>
                      <span className="text-sm font-bold">隐私与权限</span>
                    </div>
                    <ChevronRight size={16} className="text-outline/40 group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>

              <div className="bg-surface-container rounded-[2.5rem] p-4 border border-outline-variant/10">
                <button 
                  onClick={() => setSubPage('about')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-highest/40 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary"><Info size={20} /></div>
                    <div className="text-left">
                      <span className="block text-sm font-bold">关于知命</span>
                      <span className="text-[8px] text-on-surface-variant/40 font-label uppercase">Version 2.4.0 • 天地合一</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-outline/40 group-hover:text-primary transition-colors" />
                </button>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-5 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-black text-sm flex items-center justify-center gap-3 border border-primary/20 hover:from-primary/20 transition-all"
              >
                <LogOut size={20} />
                退出登录
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('main')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">账号安全</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-surface-container p-8 rounded-[2.5rem] border border-outline-variant/10 space-y-2">
                <button 
                  onClick={() => setSubPage('change-password')}
                  className="w-full flex justify-between items-center py-4 px-2 hover:bg-primary/5 rounded-xl transition-colors group"
                >
                  <span className="text-sm font-bold">修改登录密码</span>
                  <ChevronRight size={18} className="text-outline group-hover:text-primary" />
                </button>
                <div className="h-px bg-outline-variant/10 mx-2" />
                <div className="flex justify-between items-center py-4 px-2">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold">绑定手机</span>
                    <span className="text-[10px] text-on-surface-variant/40">{profile?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
                  </div>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">已验证</span>
                </div>
              </div>
              <div className="px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] text-primary/60 leading-relaxed italic">
                  知命采用端到端加密技术保障您的账号安全。如需更换绑定手机，请联系人工客服核实身份后进行。
                </p>
              </div>
            </div>
          </div>
        );
      case 'change-password':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('security')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">修改密码</h3>
            </div>
            <div className="bg-surface-container p-8 rounded-[2.5rem] border border-outline-variant/10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant/40 ml-2">原密码</label>
                <input 
                  type="password" 
                  className="w-full bg-surface-container-highest px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 ring-primary/30 transition-all text-sm font-bold" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="请输入当前密码"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant/40 ml-2">新密码</label>
                <input 
                  type="password" 
                  className="w-full bg-surface-container-highest px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 ring-primary/30 transition-all text-sm font-bold" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant/40 ml-2">确认新密码</label>
                <input 
                  type="password" 
                  className="w-full bg-surface-container-highest px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 ring-primary/30 transition-all text-sm font-bold" 
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                />
              </div>
              <button 
                onClick={() => { alert('密码修改成功'); setSubPage('security'); }}
                className="w-full py-4 bg-primary text-background rounded-2xl font-black text-sm shadow-xl shadow-primary/20 mt-4"
              >
                提交修改
              </button>
            </div>
          </div>
        );
      case 'privacy-settings':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('main')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">隐私与权限</h3>
            </div>
            <div className="bg-surface-container p-6 rounded-[2.5rem] border border-outline-variant/10 space-y-2">
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold">隐藏生辰信息</span>
                  <span className="text-[10px] text-on-surface-variant/40">在公开界面隐藏您的具体生辰</span>
                </div>
                <button 
                  onClick={() => {
                    // 直接合并今日所有的运势对话记录（排除掉“今日灵启”缓存记录）
                    const flattenedMessages = todayFortuneHistory
                      .filter(h => h.messages && h.messages.length > 0 && h.title !== "今日灵启")
                      .flatMap(h => h.messages);
                    setChatMessages(flattenedMessages);
                    const newVal = !hideBirth;
                    setHideBirth(newVal);
                    showToast(newVal ? '生辰信息已隐藏' : '生辰信息已恢复公开', 'info');
                  }}
                  className={cn(
                    "w-10 h-5 rounded-full relative flex items-center px-1 transition-colors duration-300",
                    hideBirth ? "bg-primary/30" : "bg-surface-container-highest"
                  )}
                >
                  <motion.div 
                    animate={{ x: hideBirth ? 20 : 0 }}
                    className={cn("w-3 h-3 rounded-full", hideBirth ? "bg-primary" : "bg-outline-variant")}
                  />
                </button>
              </div>
              <div className="h-px bg-outline-variant/10 mx-4" />
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">加入 AI 改进计划</span>
                  <span className="text-[10px] text-on-surface-variant/40">允许系统分析测算准确度以优化算法</span>
                </div>
                <button 
                  onClick={() => setAiImprovement(!aiImprovement)}
                  className={cn(
                    "w-10 h-5 rounded-full relative flex items-center px-1 transition-colors duration-300",
                    aiImprovement ? "bg-primary/30" : "bg-surface-container-highest"
                  )}
                >
                  <motion.div 
                    animate={{ x: aiImprovement ? 20 : 0 }}
                    className={cn("w-3 h-3 rounded-full", aiImprovement ? "bg-primary" : "bg-outline-variant")}
                  />
                </button>
              </div>
            </div>
            <div className="bg-surface-container rounded-[2.5rem] p-6 border border-outline-variant/10 space-y-2">
              {[
                { icon: Bell, label: '通知推送权限', desc: '用于推送运势与吉日提醒', status: '已开启' },
                { icon: Save, label: '本地存储权限', desc: '用于加速页面加载与缓存数据', status: '已开启' }
              ].map((perm, i) => {
                const Icon = perm.icon;
                return (
                  <Fragment key={i}>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary/40">
                          <Icon size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-on-surface/80">{perm.label}</span>
                          <span className="text-[9px] text-on-surface-variant/40">{perm.desc}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        {perm.status}
                      </div>
                    </div>
                    {i === 0 && <div className="h-px bg-outline-variant/10 mx-4" />}
                  </Fragment>
                );
              })}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('main')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">关于知命</h3>
            </div>
            <div className="bg-surface-container p-10 rounded-[3rem] border border-primary/10 space-y-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
               <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-container rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                 <Sparkles size={48} className="text-background" />
               </div>
               <div className="space-y-2">
                 <h4 className="text-2xl font-black text-primary">知命 · Zhiming</h4>
                 <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-[0.4em]">Ancient Wisdom • AI Insights</p>
               </div>
               <p className="text-sm leading-relaxed text-on-surface-variant/80 italic px-4">
                 “知命” 是一款传承东方传统智慧，融合现代 AI 大数据算法的命理测算平台。我们致力于让每一个生命都能洞悉自己的运行轨迹，在天时地利中寻找最优雅的前行姿态。
               </p>
               <div className="pt-8 border-t border-outline-variant/10 space-y-1">
                 <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">© 2026 知命智慧实验室</p>
                 <p className="text-[9px] text-on-surface-variant/30">All Cosmic Rights Reserved.</p>
               </div>
            </div>
          </div>
        );
      case 'fortune-history':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('main')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">运势历史</h3>
            </div>
            
            {/* Traditional but Beautified Search Bar */}
            <div className="relative">
              <div className="bg-surface-container p-2 rounded-[1.5rem] border border-outline-variant/10 shadow-inner flex items-center gap-2 group focus-within:border-primary/30 transition-all">
                <button 
                  onClick={() => setShowFortuneCalendar(!showFortuneCalendar)}
                  className="flex-1 flex items-center gap-4 pl-4 py-4 rounded-xl hover:bg-primary/5 transition-all text-left"
                >
                  <Calendar size={18} className="text-primary/40" />
                  <span className={cn("text-sm font-bold", fortuneSearchDate ? "text-on-surface" : "text-on-surface-variant/30")}>
                    {fortuneSearchDate || '选择日期搜索历史...'}
                  </span>
                </button>
                {fortuneSearchDate && (
                  <button 
                    onClick={() => setFortuneSearchDate('')}
                    className="px-6 py-3 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    清除
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showFortuneCalendar && (
                  <HistoryWheelPicker 
                    selectedDate={fortuneSearchDate}
                    onSelect={setFortuneSearchDate}
                    onClose={() => setShowFortuneCalendar(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              {history.filter(h => h.type === 'fortune' && h.title !== "今日灵启" && (!fortuneSearchDate || h.date === fortuneSearchDate)).length > 0 ? (
                history.filter(h => h.type === 'fortune' && h.title !== "今日灵启" && (!fortuneSearchDate || h.date === fortuneSearchDate)).map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedChat(item)}
                    className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex justify-between items-center group cursor-pointer hover:bg-surface-container transition-all"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <History size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1">{item.date} · 运势解析</p>
                        <h4 className="font-bold text-on-surface">{item.title}</h4>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-outline/40 group-hover:text-primary transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-surface-container-low rounded-[2.5rem] border border-dashed border-outline-variant/20">
                  <History size={40} className="mx-auto text-primary/20 mb-4" />
                  <p className="text-on-surface-variant/60 text-sm">暂无探索记录</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'divination-history':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('main')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">起卦历史</h3>
            </div>

            {/* Traditional but Beautified Search Bar */}
            <div className="relative">
              <div className="bg-surface-container p-2 rounded-[1.5rem] border border-outline-variant/10 shadow-inner flex items-center gap-2 group focus-within:border-primary/30 transition-all">
                <button 
                  onClick={() => setShowDivCalendar(!showDivCalendar)}
                  className="flex-1 flex items-center gap-4 pl-4 py-4 rounded-xl hover:bg-primary/5 transition-all text-left"
                >
                  <Calendar size={18} className="text-primary/40" />
                  <span className={cn("text-sm font-bold", divSearchDate ? "text-on-surface" : "text-on-surface-variant/30")}>
                    {divSearchDate || '选择日期搜索历史...'}
                  </span>
                </button>
                {divSearchDate && (
                  <button 
                    onClick={() => setDivSearchDate('')}
                    className="px-6 py-3 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    清除
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showDivCalendar && (
                  <HistoryWheelPicker 
                    selectedDate={divSearchDate}
                    onSelect={setDivSearchDate}
                    onClose={() => setShowDivCalendar(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              {history.filter(h => h.type === 'divination' && (!divSearchDate || h.date === divSearchDate)).length > 0 ? (
                history.filter(h => h.type === 'divination' && (!divSearchDate || h.date === divSearchDate)).map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedChat(item)}
                    className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex justify-between items-center group cursor-pointer hover:bg-surface-container transition-all"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1">{item.date} · 易经起卦</p>
                        <h4 className="font-bold text-on-surface">{item.title}</h4>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-outline/40 group-hover:text-primary transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-surface-container-low rounded-[2.5rem] border border-dashed border-outline-variant/20">
                  <MessageSquare size={40} className="mx-auto text-primary/20 mb-4" />
                  <p className="text-on-surface-variant/60 text-sm">暂无卜卦记录</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'coupons':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('main')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">我的优惠券</h3>
            </div>
            <div className="space-y-4">
              {coupons.length > 0 ? coupons.map((coupon, idx) => (
                <div key={idx} className={cn(
                  "bg-gradient-to-r p-8 rounded-3xl border-l-4 relative overflow-hidden",
                  coupon.status === 'expired' 
                    ? "from-surface-container-high to-surface-container-low border-outline-variant/30 opacity-60" 
                    : "from-primary/20 to-primary/5 border-primary"
                )}>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-black rounded uppercase tracking-widest",
                        coupon.status === 'expired' ? "bg-outline-variant/20 text-on-surface-variant" : "bg-primary/20 text-primary"
                      )}>{coupon.tag}</span>
                      <span className={cn(
                        "text-3xl font-black",
                        coupon.status === 'expired' ? "text-on-surface-variant/60" : "text-primary"
                      )}>{coupon.discount_text}</span>
                    </div>
                    <h4 className="text-lg font-black text-on-surface">
                      {coupon.title} {coupon.status === 'expired' && "(已失效)"}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant font-bold mt-2 uppercase tracking-tighter">
                      VALID THRU: {coupon.expireDate || 'PERPETUAL'}
                    </p>
                  </div>
                  <Ticket className={cn(
                    "absolute -right-4 -bottom-4 w-28 h-28 rotate-12",
                    coupon.status === 'expired' ? "text-outline-variant/10" : "text-primary/5"
                  )} />
                </div>
              )) : (
                <div className="text-center py-20 bg-surface-container-low rounded-[2.5rem] border border-dashed border-outline-variant/20">
                  <Ticket size={40} className="mx-auto text-primary/20 mb-4" />
                  <p className="text-on-surface-variant/60 text-sm">暂无有效卡券</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'recharge':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSubPage('main')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-headline font-black text-primary">会员中心</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex p-1.5 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                <button 
                  onClick={() => setMembershipLevel('gold')}
                  className={cn(
                    "flex-1 py-3.5 rounded-xl font-headline font-black text-xs uppercase tracking-widest transition-all",
                    membershipLevel === 'gold' ? "bg-primary text-background shadow-lg shadow-primary/20" : "text-on-surface-variant/60"
                  )}
                >
                  黄金会员
                </button>
                <button 
                  onClick={() => setMembershipLevel('platinum')}
                  className={cn(
                    "flex-1 py-3.5 rounded-xl font-headline font-black text-xs uppercase tracking-widest transition-all",
                    membershipLevel === 'platinum' ? "bg-primary text-background shadow-lg shadow-primary/20" : "text-on-surface-variant/60"
                  )}
                >
                  铂金会员
                </button>
              </div>

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
                      "p-5 rounded-3xl border transition-all relative overflow-hidden text-center flex flex-col items-center gap-2",
                      selection === pkg.type ? "bg-primary/10 border-primary ring-1 ring-primary/20" : "bg-surface-container-low border-outline-variant/10"
                    )}
                  >
                    <div className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">{pkg.type}会员</div>
                    <div className="text-2xl font-black text-on-surface">{pkg.price}</div>
                    <div className="text-[8px] text-on-surface-variant/60 font-bold">有效 {pkg.duration}</div>
                  </button>
                ))}
              </div>

              <button className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-background font-headline font-black text-lg rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
                立即开通 {membershipLevel === 'gold' ? '黄金会员' : '铂金会员'}
                <Sparkles size={20} />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-headline font-black text-xs text-primary flex items-center gap-2 uppercase tracking-widest">
                <Star size={16} fill="currentColor" />
                会员尊享权益
              </h4>
              <div className="bg-surface-container-low rounded-[2rem] border border-outline-variant/10 overflow-hidden">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest/20">
                      <th className="p-4 font-black uppercase tracking-widest opacity-40">项目</th>
                      <th className="p-4 font-black uppercase tracking-widest text-center">普通</th>
                      <th className={cn("p-4 font-black uppercase tracking-widest text-center", membershipLevel === 'gold' ? "text-primary" : "opacity-40")}>黄金</th>
                      <th className={cn("p-4 font-black uppercase tracking-widest text-center", membershipLevel === 'platinum' ? "text-primary" : "opacity-40")}>铂金</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {[
                      { name: '日运深度解析', none: '1次', gold: '10次', plat: '无限' },
                      { name: '卦象深度追问', none: '1次', gold: '10次', plat: '无限' },
                      { name: '吉日良时提醒', none: '×', gold: '√', plat: '√' },
                      { name: '专属星盘标识', none: '×', gold: '√', plat: '√' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="p-4 font-bold text-on-surface/80">{row.name}</td>
                        <td className="p-4 text-center opacity-30">{row.none}</td>
                        <td className={cn("p-4 text-center font-bold", membershipLevel === 'gold' ? "text-primary" : "opacity-30")}>{row.gold}</td>
                        <td className={cn("p-4 text-center font-black", membershipLevel === 'platinum' ? "text-primary" : "opacity-30")}>{row.plat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {!selectedChat && subPage === 'main' && (
        <header>
          <h2 className="text-primary text-4xl font-headline font-black tracking-tight uppercase tracking-widest">个人中心</h2>
        </header>
      )}

      {selectedChat ? (
        <div className="space-y-8">
           <div className="flex items-center gap-4">
             <button onClick={() => setSelectedChat(null)} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary/60 hover:text-primary transition-all border border-outline-variant/10 shadow-lg">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-xl font-bold text-primary font-headline">对话详情</h3>
           </div>
           <div className="space-y-6 bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/5 shadow-inner">
              {selectedChat.messages.map((msg: any, i: number) => (
                <div key={i} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30">
                    {msg.role === 'user' ? 'Me' : 'Zhiming AI'}
                  </span>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' ? "bg-primary text-background font-bold shadow-lg" : "bg-surface-container-highest/40 text-on-surface border border-outline-variant/10"
                  )}>
                    {msg.role === 'user' ? msg.content : <MarkdownContent content={msg.content} />}
                  </div>
                </div>
              ))}
            </div>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={subPage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderSubPage()}
            </motion.div>
          </AnimatePresence>
          
          <AnimatePresence>
            {showPicker && (
              <BirthDatePicker 
                initialDate={editBirthDate}
                onConfirm={(date, unknown) => {
                  setEditBirthDate(date);
                  setIsTimeUnknown(unknown);
                  setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
              />
            )}
          </AnimatePresence>

          {/* Global Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-on-surface text-surface rounded-full shadow-2xl font-bold text-sm flex items-center gap-2"
              >
                {toast.type === 'success' && <Sparkles size={16} className="text-primary" />}
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
