import { Info, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { analyzeBazi } from '../lib/bazi';
import { cacheService } from '../services/cacheService';
import { askAIStream } from '../services/aiService';
import MarkdownContent from '../components/MarkdownContent';
import ZenLoader from '../components/ZenLoader';

export default function ChartPage({ onGoToProfile }: { onGoToProfile: () => void }) {
  const { refreshHistory } = useUser();
  const { profile } = useUser();
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 监听隐私设置
  const [hideBirth, setHideBirth] = useState<boolean>(
    () => localStorage.getItem('hideBirth') === 'true'
  );

  useEffect(() => {
    setHideBirth(localStorage.getItem('hideBirth') === 'true');
    const onStorage = () => setHideBirth(localStorage.getItem('hideBirth') === 'true');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const baziData = useMemo(() => {
    if (!profile?.birth_date) return null;
    return analyzeBazi(profile.birth_date);
  }, [profile?.birth_date]);

  // 获取 AI 深度解析并缓存
  useEffect(() => {
    if (!profile?.birth_date || hideBirth || !baziData) return;

    const cacheKey = `bazi_v2_analysis_${profile.id}`;
    const cached = cacheService.get<string>(cacheKey);

    if (cached && !cached.includes("天机混沌")) {
      setDeepAnalysis(cached);
    } else {
      fetchDeepAnalysis();
    }

    async function fetchDeepAnalysis() {
      setIsAnalyzing(true);
      try {
        const prompt = `请作为资深命理顾问，为日主[${baziData?.pillars[2].stem}]提供一份专业的人格简评。
        要求：
        1. 采用自然连贯的段落，严禁使用 ### 或列表符号分段。
        2. 字数在100字左右，用语通俗、精准、沉稳。
        3. 重点点出性格底色与发展建议，不要有大师语气的废话。`;
        
        setDeepAnalysis("");
        const stream = askAIStream('/api/ai/fortune', { query: prompt, context: null, title: "命盘简评", save_history: false });
        let fullContent = "";
        let firstChunk = true;
        
        for await (const chunk of stream) {
          fullContent += chunk;
          setDeepAnalysis(fullContent);
          if (firstChunk) {
            setIsAnalyzing(false);
            firstChunk = false;
          }
        }
        
        if (fullContent && !fullContent.includes("天机混沌")) {
          cacheService.set(cacheKey, fullContent, 60 * 60 * 24 * 7);
          refreshHistory();
        } else if (!fullContent) {
          throw new Error("AI Stream returned empty content");
        }
      } catch (e) {
        console.error('Deep analysis failed', e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [profile?.birth_date, hideBirth, baziData, profile?.id]);

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

  const pillars = baziData?.pillars.map(p => ({
    ...p,
    stemColor: getColor(p.stem),
    branchColor: getColor(p.branch),
    highlight: p.label === '日柱'
  })) || [
    { label: '年柱', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置' },
    { label: '月柱', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置' },
    { label: '日柱', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置', highlight: true },
    { label: '时柱', stem: '?', branch: '?', stemColor: 'text-outline', branchColor: 'text-outline', elements: '未设置' },
  ];

  // 动态生成年度运势
  const ANNUAL_FORTUNES = useMemo(() => {
    const years = [2026, 2027, 2028, 2029];
    const ganzhi = ['丙午', '丁未', '戊申', '己酉'];
    const colors = ['text-[#ff8a65]', 'text-[#ff8a65]', 'text-[#f2c36b]', 'text-[#cfd8dc]'];
    
    return years.map((y, i) => {
      const isFavorable = baziData?.favorableElements.some(el => ganzhi[i].includes(el));
      return {
        year: `${y}年`,
        text: ganzhi[i],
        color: colors[i],
        sub: i === 0 ? '流年值此' : '未来展望',
        analysis: `此年为${ganzhi[i]}年。${isFavorable ? '流年五行对您的命局有正面助益，事业与财运稳步上升，宜积极进取。' : '流年与命局存在一定冲耗，凡事宜稳健为主，注意情绪调节与身体健康。'}建议保持谦逊，多听取贵人建议。`
      };
    });
  }, [baziData]);

  return (
    <div className="space-y-10 pb-24">
      <div className="flex justify-between items-end">
        <h2 className="text-4xl font-headline font-black tracking-tight text-primary">八字命盘</h2>
      </div>

      {/* Four Pillars Card */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 shadow-2xl border border-outline-variant/10"
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
              <button 
                onClick={onGoToProfile}
                className="w-full py-3 bg-primary text-background rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                {hideBirth ? '去设置中心管理' : '前往完善资料'}
              </button>
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
          { label: '主星', value: (profile?.birth_date && !hideBirth) ? (baziData?.stars[0] || '吉星') : '—', color: 'text-on-surface' },
          { label: '喜用', value: (profile?.birth_date && !hideBirth) ? (baziData?.favorableElements.join('/') || '—') : '—', color: 'text-primary' },
          { label: '忌讳', value: (profile?.birth_date && !hideBirth) ? (baziData?.unfavorableElements.join('/') || '—') : '—', color: 'text-error' },
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

      {/* AI Detailed Analysis */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Sparkles className="text-primary" size={20} />
          <h3 className="font-headline font-bold text-lg text-primary">命理深度报告</h3>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-lg relative min-h-[160px] flex flex-col justify-center"
        >
          {(!profile?.birth_date || hideBirth) ? (
             <div className="text-center py-10 text-on-surface-variant/40 italic text-sm">
               {hideBirth ? '由于隐私保护，命理报告已锁定' : '请先完善生辰信息以解锁深度解析'}
             </div>
          ) : isAnalyzing ? (
            <ZenLoader message="正在感应星象能量..." />
          ) : (
            <>
              <div className="relative z-10">
                <p className="text-on-surface/90 leading-relaxed text-sm md:text-base font-medium">
                  {deepAnalysis || '暂时无法获取深度解析。'}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                <span className="text-[10px] text-primary/40 font-bold uppercase tracking-[0.2em]">知命 AI 研究所</span>
                <div className="flex items-center gap-2 text-[10px] text-primary/40 italic">
                  <ShieldCheck size={12} />
                  已结合八字排盘实时计算
                </div>
              </div>
            </>
          )}
        </motion.div>
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
                <span>知命 AI 专属年度预测 · 逻辑演算</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
