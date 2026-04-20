import { Info, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const PILLARS = [
  { label: '年柱', stem: '甲', branch: '子', stemColor: 'text-[#81c784]', branchColor: 'text-[#64b5f6]', elements: '木 / 水' },
  { label: '月柱', stem: '丙', branch: '午', stemColor: 'text-[#ff8a65]', branchColor: 'text-[#ff8a65]', elements: '火 / 火' },
  { label: '日主', stem: '戊', branch: '申', stemColor: 'text-[#f2c36b]', branchColor: 'text-[#64b5f6]', elements: '土 / 水', highlight: true },
  { label: '时柱', stem: '庚', branch: '辰', stemColor: 'text-[#cfd8dc]', branchColor: 'text-[#f2c36b]', elements: '金 / 土' },
];

const ANNUAL_FORTUNES = [
  { year: '2026年', text: '丙午', color: 'text-[#ff8a65]', sub: '流年值此', analysis: '今年丙午流年，火气极旺，与日主戊土形成火土相生之势。虽然事业压力较大，但贵人运强，适合在稳定中寻求突破。情感方面宜多沟通，避免口舌。' },
  { year: '2027年', text: '丁未', color: 'text-[#ff8a65]', sub: '展望明岁', analysis: '丁未之年，土气厚重。财运方面有稳步增长的迹象，适合长期投资。事业上需注意团队合作，不可独断专行。身体方面注意脾胃调理。' },
  { year: '2028年', text: '戊申', color: 'text-[#f2c36b]', sub: '后岁可见', analysis: '戊申流年，申金生水，财源广进。这一年是你的大运交接点，可能会有重大的职业变动或人生转折。凡事宜早做准备，顺势而为。' },
  { year: '2029年', text: '己酉', color: 'text-[#cfd8dc]', sub: '再而可见', analysis: '己酉之年，金气纯正。食伤生财，灵感迸发，适合从事创意或技术类工作。情感生活丰富多彩，单身者有望脱单。' },
];

export default function ChartPage() {
  const [selectedYear, setSelectedYear] = useState<typeof ANNUAL_FORTUNES[0] | null>(null);

  return (
    <div className="space-y-10 pb-24">
      <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary">八字命盘</h2>

      {/* Four Pillars Card */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 shadow-2xl bento-texture border border-outline-variant/10"
      >
        <div className="grid grid-cols-4 gap-4 items-end">
          {PILLARS.map((p, idx) => (
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
            <div className="px-3 py-1 bg-surface-container-highest rounded text-[10px] font-label text-on-surface-variant">乾造 (男)</div>
            <div className="px-3 py-1 bg-surface-container-highest rounded text-[10px] font-label text-on-surface-variant">公历: 1984-12-23</div>
          </div>
          <motion.div whileHover={{ rotate: 15 }}>
            <Info size={18} className="text-primary/40 cursor-help" />
          </motion.div>
        </div>
      </motion.section>

      {/* Detailed Analysis Content */}
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
          <p>
            此命盘日主为戊土，生于午月，身旺气足。火、土两行占据主导，命局火旺土焦，格取“正官格”。戊土天性厚重，执着且有韧性，这赋予了你极强的执行力与领导潜质。然而，由于局中金水能量较弱，缺乏足够的润泽与流动，你在处理复杂人际关系时可能稍显僵化。
          </p>
          <p>
            喜用神提取为“水、木”。“水”为财星，代表你的财运与应变能力；“木”为官杀，代表你的事业深度。目前的五年大运正值金火交战之期，事业面临关键转型点，虽有摩擦之痛，但亦是跨越阶层的绝佳契机。
          </p>
          <p>
            生平运势多得长辈或贵人提携。建议在日常生活中多穿青、黑、深蓝色系的服饰以补足木水能量。总体而言，此乃“中晚发之命”，建议三十岁前扎实磨砺技术，四十岁后厚积薄发，必显峥嵘之象。
          </p>
        </div>
      </motion.section>

      {/* Analysis Bento */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '格局', value: '正官格', color: 'text-on-surface' },
          { label: '辅星', value: '偏印辅', color: 'text-on-surface' },
          { label: '喜用', value: '水木', color: 'text-primary' },
          { label: '忌讳', value: '火土', color: 'text-error' },
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
        
        {/* Responsive Grid for cards */}
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

        {/* Selected Year Analysis */}
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
