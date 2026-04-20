import { Info, Sparkles, TrendingUp, ShieldCheck, Loader2, Edit3, Save, X, Mars, Venus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Solar } from 'lunar-javascript';
import { fetchWithAuth } from '../services/api';
import { cn } from '../lib/utils';

export default function ChartPage({ profile, onProfileUpdate }: { profile: any, onProfileUpdate: () => void }) {
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [isSaving, setIsSaving] = useState(false);

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

  const baziData = useMemo(() => {
    if (!profile?.birth_date) return null;
    
    try {
      const date = new Date(profile.birth_date);
      const solar = Solar.fromYmdHms(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        0
      );
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      const getElement = (gan: string, zhi: string) => {
        const elements: Record<string, string> = {
          '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
          '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
        };
        return `${elements[gan] || '?'} / ${elements[zhi] || '?'}`;
      };

      const getColor = (char: string) => {
        const ganElements: Record<string, string> = {
          '甲': 'text-[#81c784]', '乙': 'text-[#81c784]', 
          '丙': 'text-[#ff8a65]', '丁': 'text-[#ff8a65]', 
          '戊': 'text-[#f2c36b]', '己': 'text-[#f2c36b]', 
          '庚': 'text-[#cfd8dc]', '辛': 'text-[#cfd8dc]', 
          '壬': 'text-[#64b5f6]', '癸': 'text-[#64b5f6]'
        };
        };
        return ganElements[char] || zhiElements[char] || 'text-on-surface';
      };

      return [
        { label: '年柱', stem: eightChar.getYearGan(), branch: eightChar.getYearZhi(), stemColor: getColor(eightChar.getYearGan()), branchColor: getColor(eightChar.getYearZhi()), elements: getElement(eightChar.getYearGan(), eightChar.getYearZhi()) },
        { label: '月柱', stem: eightChar.getMonthGan(), branch: eightChar.getMonthZhi(), stemColor: getColor(eightChar.getMonthGan()), branchColor: getColor(eightChar.getMonthZhi()), elements: getElement(eightChar.getMonthGan(), eightChar.getMonthZhi()) },
        { label: '日主', stem: eightChar.getDayGan(), branch: eightChar.getDayZhi(), stemColor: getColor(eightChar.getDayGan()), branchColor: getColor(eightChar.getDayZhi()), elements: getElement(eightChar.getDayGan(), eightChar.getDayZhi()), highlight: true },
        { label: '时柱', stem: eightChar.getTimeGan(), branch: eightChar.getTimeZhi(), stemColor: getColor(eightChar.getTimeGan()), branchColor: getColor(eightChar.getTimeZhi()), elements: getElement(eightChar.getTimeGan(), eightChar.getTimeZhi()) },
      ];
    } catch (e) {
      console.error("Bazi calculation error", e);
      return null;
    }
  }, [profile]);

  const PILLARS_DISPLAY = baziData || [
    { label: '年柱', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置' },
    { label: '月柱', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置' },
    { label: '日主', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置', highlight: true },
    { label: '时柱', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置' },
  ];

  const ANNUAL_FORTUNES = [
    { year: '2026年', text: '丙午', color: 'text-[#ff8a65]', sub: '流年值此', analysis: '今年丙午流年，火气极旺，与命局形成感应。虽然事业压力较大，但贵人运强，适合在稳定中寻求突破。情感方面宜多沟通，避免口舌。' },
    { year: '2027年', text: '丁未', color: 'text-[#ff8a65]', sub: '展望明岁', analysis: '丁未之年，土气厚重。财运方面有稳步增长的迹象，适合长期投资。事业上需注意团队合作，不可独断专行。身体方面注意脾胃调理。' },
    { year: '2028年', text: '戊申', color: 'text-[#f2c36b]', sub: '后岁可见', analysis: '戊申流年，申金生水，财源广进。这一年可能是你的一个交接点，可能会有重大的职业变动或人生转折。凡事宜早做准备，顺势而为。' },
    { year: '2029年', text: '己酉', color: 'text-[#cfd8dc]', sub: '再而可见', analysis: '己酉之年，金气纯正。食伤生财，灵感迸发，适合从事创意或技术类工作。情感生活丰富多彩，单身者有望脱单。' },
  ];

  return (
    <div className="space-y-10 pb-24">
      <div className="flex justify-between items-end">
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary">八字命盘</h2>
        {!isEditing && (
          <button 
            onClick={startEditing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/50 text-primary/60 hover:text-primary transition-colors text-xs font-bold"
          >
            <Edit3 size={14} />
            修改出生信息
          </button>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface-container-low p-6 rounded-2xl border border-primary/20 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-primary">快速修改生辰</h4>
              <button onClick={() => setIsEditing(false)} className="text-on-surface-variant/40 hover:text-on-surface-variant">
                <X size={18} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-primary/60 ml-2">性别</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditGender('male')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-bold",
                      editGender === 'male' ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-highest border-transparent text-on-surface-variant/40"
                    )}
                  >
                    <Mars size={16} /> 乾造
                  </button>
                  <button 
                    onClick={() => setEditGender('female')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-bold",
                      editGender === 'female' ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-highest border-transparent text-on-surface-variant/40"
                    )}
                  >
                    <Venus size={16} /> 坤造
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-primary/60 ml-2">出生日期 (精确到分钟)</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-surface-container-highest px-4 py-3 rounded-xl focus:outline-none focus:ring-1 ring-primary/30 transition-all text-sm"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-primary text-background rounded-xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              立即同步命盘
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Four Pillars Card */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 shadow-2xl bento-texture border border-outline-variant/10"
      >
        {!profile?.birth_date && (
          <div className="absolute inset-0 z-20 bg-surface-container-low/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
            <div className="space-y-4">
              <p className="text-on-surface-variant font-bold">请先在“个人中心-设置”中设置出生日期</p>
              <div className="text-[10px] text-primary/60 uppercase tracking-widest">开启您的数字化命理旅程</div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-4 items-end">
          {PILLARS_DISPLAY.map((p, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-6 relative">
              {p.highlight && (
                <div className="absolute -inset-x-2 -inset-y-4 bg-primary/5 rounded-xl border border-primary/20 backdrop-blur-sm -z-10"></div>
              )}
              <span className={`font-label text-xs uppercase tracking-tighter ${p.highlight ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                {p.label}
              </span>
              <div className="flex flex-col items-center space-y-2">
                <div className={`text-5xl font-headline font-bold ${p.stemColor}`}>{p.stem}</div>
                <div className={`text-3xl font-headline font-medium ${p.branchColor}`}>{p.branch}</div>
              </div>
              <span className="text-[10px] text-on-surface-variant/40 font-label">{p.elements}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-outline-variant/10 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-surface-container-highest rounded text-[10px] font-label text-on-surface-variant">
              {profile?.gender === 'female' ? '坤造 (女)' : '乾造 (男)'}
            </div>
            <div className="px-3 py-1 bg-surface-container-highest rounded text-[10px] font-label text-on-surface-variant">
              公历: {profile?.birth_date ? new Date(profile.birth_date).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') : '未设置'}
            </div>
          </div>
          <motion.div whileHover={{ rotate: 15 }}>
            <Info size={18} className="text-primary/40 cursor-help" />
          </motion.div>
        </div>
      </motion.section>

      {/* Detailed Analysis Content (Simplified placeholder logic) */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5 shadow-inner"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-primary" size={20} />
          <h3 className="font-headline font-bold text-lg">命盘深度解析</h3>
        </div>
        <div className="font-body text-sm text-on-surface-variant leading-relaxed text-justify space-y-4">
          {!profile?.birth_date ? (
             <p className="italic opacity-60">请完成出生日期设置以解锁 AI 深度解析内容。</p>
          ) : (
            <>
              <p>
                此命盘日主为{PILLARS_DISPLAY[2].stem}木，生于{PILLARS_DISPLAY[1].branch}月。根据干支五行分布，您属于“{PILLARS_DISPLAY[2].stem}金命”或对应五行属性。这赋予了你极强的执行力与韧性。
              </p>
              <p>
                目前的五年大运正值关键转型点，虽有挑战，但亦是跨越阶层的绝佳契机。建议在日常生活中根据五行喜忌调整心态与环境。
              </p>
            </>
          )}
        </div>
      </motion.section>

      {/* Analysis Bento */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '格局', value: profile?.birth_date ? '正在分析' : '—', color: 'text-on-surface' },
          { label: '辅星', value: profile?.birth_date ? '正在计算' : '—', color: 'text-on-surface' },
          { label: '喜用', value: profile?.birth_date ? '水/木' : '—', color: 'text-primary' },
          { label: '忌讳', value: profile?.birth_date ? '火/土' : '—', color: 'text-error' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5 flex flex-col items-center justify-center space-y-2 shadow-sm"
          >
            <span className="text-[10px] text-on-surface-variant/60 font-label tracking-[0.2em]">{item.label}</span>
            <span className={`text-xl font-headline font-bold ${item.color}`}>{item.value}</span>
          </motion.div>
        ))}
      </section>

      {/* Annual Fortune Overview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg tracking-wide">年度运势概览</h3>
          <div className="h-px flex-1 mx-6 bg-gradient-to-r from-outline-variant/30 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ANNUAL_FORTUNES.map((item, idx) => (
            <motion.div 
              key={idx}
              layoutId={`card-${idx}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedYear(item)}
              className={`flex flex-col items-center p-6 rounded-xl bg-surface-container-low border transition-all cursor-pointer shadow-md ${selectedYear?.year === item.year ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/10'}`}
            >
              <span className="font-label text-xs text-on-surface-variant mb-2">{item.year}</span>
              <span className={`font-headline font-bold text-2xl ${item.color}`}>{item.text}</span>
              <span className="text-[10px] mt-2 font-label text-on-surface-variant/60">{item.sub}</span>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedYear && (
            <motion.div 
              key={selectedYear.year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-primary" size={18} />
                <h4 className="font-headline font-bold text-primary">{selectedYear.year} {selectedYear.text} 流年解析</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {selectedYear.analysis}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-primary/60">
                <ShieldCheck size={12} />
                <span>知命 AI 专属年度预测：风险系数 20% | 机遇指数 85%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
