import { Info, Sparkles, TrendingUp, ShieldCheck, Loader2, Edit3, Save, X, Mars, Venus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { Solar } from 'lunar-javascript';
import { fetchWithAuth } from '../services/api';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

export default function ChartPage({ onGoToProfile }: { onGoToProfile: () => void }) {
  const { profile } = useUser();
  const [selectedYear, setSelectedYear] = useState<any>(null);

  // 直接从 localStorage 读取，并监听 storage 事件以实现实时同步
  const [hideBirth, setHideBirth] = useState<boolean>(
    () => localStorage.getItem('hideBirth') === 'true'
  );

  useEffect(() => {
    // 每次组件挂载/Tab 切换时重新读取最新值
    setHideBirth(localStorage.getItem('hideBirth') === 'true');

    const onStorage = () => {
      setHideBirth(localStorage.getItem('hideBirth') === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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

      // Calculation for Pattern (格局)
      const getPattern = () => {
        const monthZhi = eightChar.getMonthZhi();
        const dayGan = eightChar.getDayGan();
        
        // Simplified pattern recognition based on Month Branch's hidden stems
        const zhiHideGans: Record<string, string[]> = {
          '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
          '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'], '午': ['丁', '己'], '未': ['己', '丁', '乙'],
          '申': ['庚', '壬', '戊'], '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
        };

        const hiddenGans = zhiHideGans[monthZhi] || [];
        const mainHiddenGan = hiddenGans[0];
        
        const getShiShen = (gan: string, dayGan: string) => {
          const relations: Record<string, Record<string, string>> = {
            '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
            '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
            '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
            '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
            '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
            '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
            '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
            '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
            '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
            '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' },
          };
          return relations[dayGan]?.[gan] || '普通';
        };

        const pattern = getShiShen(mainHiddenGan, dayGan);
        return pattern === '普通' ? '建禄格' : `${pattern}格`;
      };

      // Calculation for Shen Sha (Stars)
      const getStars = () => {
        const stars: string[] = [];
        const dayGan = eightChar.getDayGan();
        const yearZhi = eightChar.getYearZhi();
        const monthZhi = eightChar.getMonthZhi();
        const dayZhi = eightChar.getDayZhi();
        const timeZhi = eightChar.getTimeZhi();
        
        // Tian Yi
        const tianYiMap: Record<string, string[]> = {
          '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
          '乙': ['子', '申'], '己': ['子', '申'],
          '丙': ['亥', '酉'], '丁': ['亥', '酉'],
          '壬': ['卯', '巳'], '癸': ['卯', '巳'],
          '辛': ['午', '寅']
        };
        const ty = tianYiMap[dayGan] || [];
        if ([yearZhi, monthZhi, dayZhi, timeZhi].some(z => ty.includes(z))) stars.push('天乙贵人');

        // Wen Chang
        const wenChangMap: Record<string, string> = { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' };
        if ([yearZhi, monthZhi, dayZhi, timeZhi].includes(wenChangMap[dayGan])) stars.push('文昌贵人');

        // Tao Hua
        const taoHuaMap: Record<string, string> = { '寅': '卯', '午': '卯', '戌': '卯', '申': '酉', '子': '酉', '辰': '酉', '亥': '子', '卯': '子', '未': '子', '巳': '午', '酉': '午', '丑': '午' };
        if ([monthZhi, dayZhi, timeZhi].includes(taoHuaMap[yearZhi])) stars.push('桃花');

        // Yi Ma
        const yiMaMap: Record<string, string> = { '申': '寅', '子': '寅', '辰': '寅', '寅': '申', '午': '申', '戌': '申', '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳' };
        if ([monthZhi, dayZhi, timeZhi].includes(yiMaMap[yearZhi])) stars.push('驿马');

        return stars.slice(0, 2).join(' / ') || '吉星高照';
      };

      const getElement = (gan: string, zhi: string) => {
        const elements: Record<string, string> = {
          '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
          '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
        };
        return `${elements[gan] || '?'} / ${elements[zhi] || '?'}`;
      };

      const getColor = (char: string) => {
        const elements: Record<string, string> = {
          '甲': 'text-[#81c784]', '乙': 'text-[#81c784]', '寅': 'text-[#81c784]', '卯': 'text-[#81c784]',
          '丙': 'text-[#ff8a65]', '丁': 'text-[#ff8a65]', '巳': 'text-[#ff8a65]', '午': 'text-[#ff8a65]',
          '戊': 'text-[#f2c36b]', '己': 'text-[#f2c36b]', '辰': 'text-[#f2c36b]', '戌': 'text-[#f2c36b]', '丑': 'text-[#f2c36b]', '未': 'text-[#f2c36b]',
          '庚': 'text-[#cfd8dc]', '辛': 'text-[#cfd8dc]', '申': 'text-[#cfd8dc]', '酉': 'text-[#cfd8dc]',
          '壬': 'text-[#64b5f6]', '癸': 'text-[#64b5f6]', '子': 'text-[#64b5f6]', '亥': 'text-[#64b5f6]'
        };
        return elements[char] || 'text-on-surface';
      };
      return {
        pillars: [
          { label: '年柱', stem: eightChar.getYearGan(), branch: eightChar.getYearZhi(), stemColor: getColor(eightChar.getYearGan()), branchColor: getColor(eightChar.getYearZhi()), elements: getElement(eightChar.getYearGan(), eightChar.getYearZhi()) },
          { label: '月柱', stem: eightChar.getMonthGan(), branch: eightChar.getMonthZhi(), stemColor: getColor(eightChar.getMonthGan()), branchColor: getColor(eightChar.getMonthZhi()), elements: getElement(eightChar.getMonthGan(), eightChar.getMonthZhi()) },
          { label: '日主', stem: eightChar.getDayGan(), branch: eightChar.getDayZhi(), stemColor: getColor(eightChar.getDayGan()), branchColor: getColor(eightChar.getDayZhi()), elements: getElement(eightChar.getDayGan(), eightChar.getDayZhi()), highlight: true },
          { label: '时柱', stem: eightChar.getTimeGan(), branch: eightChar.getTimeZhi(), stemColor: getColor(eightChar.getTimeGan()), branchColor: getColor(eightChar.getTimeZhi()), elements: getElement(eightChar.getTimeGan(), eightChar.getTimeZhi()) },
        ],
        pattern: getPattern(),
        stars: getStars()
      };

    } catch (e) {
      console.error("Bazi calculation error", e);
      return null;
    }
  }, [profile]);

  const pillars = baziData?.pillars || [
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
        <h2 className="text-4xl font-headline font-black tracking-tight text-primary">八字命盘</h2>
      </div>

      {/* Four Pillars Card */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 shadow-2xl bento-texture border border-outline-variant/10"
      >
        {(!profile?.birth_date || hideBirth) && (
          <div className="absolute inset-0 z-20 bg-surface-container-low/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
            <div className="space-y-6 max-w-xs">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-2">
                <p className="text-on-surface font-bold text-lg">{hideBirth ? '隐私保护已开启' : '天机待定'}</p>
                <p className="text-on-surface-variant text-sm">
                  {hideBirth ? '为了您的隐私安全，命盘信息已同步隐藏。' : '请先完善您的生辰信息以解锁数字化命盘'}
                </p>
              </div>
              {hideBirth ? (
                <button 
                  onClick={onGoToProfile}
                  className="w-full py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary/20 transition-all shadow-lg"
                >
                  去隐私管理调整
                </button>
              ) : (
                <button 
                  onClick={onGoToProfile}
                  className="w-full py-3 bg-primary text-background rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
                >
                  前往完善资料
                </button>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-4 items-end">
          {pillars.map((p, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center space-y-6 relative"
            >
              {p.highlight && (
                <div className="absolute -inset-x-2 -inset-y-4 bg-primary/5 rounded-xl border border-primary/20 backdrop-blur-sm -z-10"></div>
              )}
              <span className={`font-label text-xs uppercase tracking-tighter ${p.highlight ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                {p.label}
              </span>
              <div className="flex flex-col items-center space-y-2">
                <div className={`text-5xl font-headline font-bold ${p.stemColor} drop-shadow-sm`}>{p.stem}</div>
                <div className={`text-3xl font-headline font-medium ${p.branchColor} opacity-80`}>{p.branch}</div>
              </div>
              <span className="text-[10px] text-on-surface-variant/40 font-label">{p.elements}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-outline-variant/10 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-surface-container-highest/30 rounded text-[10px] font-label text-on-surface-variant border border-outline-variant/5">
              {profile?.gender === 'female' ? '坤造 (女)' : '乾造 (男)'}
            </div>
            <div className="px-3 py-1 bg-surface-container-highest/30 rounded text-[10px] font-label text-on-surface-variant border border-outline-variant/5">
              公历: {profile?.birth_date ? (hideBirth ? '已隐藏' : new Date(profile.birth_date).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')) : '未设置'}
            </div>
          </div>
          <motion.div whileHover={{ rotate: 15 }}>
            <Info size={18} className="text-primary/40 cursor-help" />
          </motion.div>
        </div>
      </motion.section>

      {/* Analysis Bento */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '格局', value: (profile?.birth_date && !hideBirth) ? (baziData?.pattern || '计算中') : '—', color: 'text-on-surface' },
          { label: '辅星', value: (profile?.birth_date && !hideBirth) ? (baziData?.stars || '计算中') : '—', color: 'text-on-surface' },
          { label: '喜用', value: (profile?.birth_date && !hideBirth) ? '水/木' : '—', color: 'text-primary' },
          { label: '忌讳', value: (profile?.birth_date && !hideBirth) ? '火/土' : '—', color: 'text-error' },
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

      {/* Detailed Analysis Content */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5 shadow-inner relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="text-primary" size={20} />
          <h3 className="font-headline font-bold text-lg">命盘深度解析</h3>
        </div>
        <div className="font-body text-sm text-on-surface-variant leading-relaxed text-justify space-y-6">
          {(!profile?.birth_date || hideBirth) ? (
             <p className="italic opacity-60">
               {hideBirth ? '由于您的隐私保护设置，AI 解析内容已暂时锁定。' : '请完成出生日期设置以解锁 AI 深度解析内容。'}
             </p>
          ) : (
            <>
              <p>
                此命盘日主为<span className="text-primary font-bold">{pillars[2].stem}木</span>，生于<span className="text-primary font-bold">{pillars[1].branch}月</span>。根据干支五行分布，您属于“<span className="text-on-surface font-black px-2 py-0.5 bg-primary/10 rounded">{baziData?.pattern || '---'}</span>”。这赋予了你极强的执行力与独特的个人魅力。
              </p>
              <p className="p-4 bg-surface-container-highest/30 rounded-lg border-l-4 border-primary italic">
                “目前正值关键转型点，虽有挑战，但亦是跨越阶层的绝佳契机。建议在日常生活中多亲近具有<span className="text-primary">水、木</span>气息的环境，有助于提升个人磁场。”
              </p>
            </>
          )}
        </div>
      </motion.section>



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
