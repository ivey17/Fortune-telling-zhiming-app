import { Solar, Lunar, EightChar } from 'lunar-javascript';

/**
 * Bazi Analysis Utility
 * Focuses on accuracy and traditional logic
 */

export interface BaziAnalysis {
  pillars: {
    label: string;
    stem: string;
    branch: string;
    elements: string;
    shiShen: string;
    hiddenGans: string[];
    nayun: string;
  }[];
  pattern: string; // 格局
  stars: string[]; // 神煞
  favorableElements: string[]; // 喜用神
  unfavorableElements: string[]; // 忌神
  elementStrengths: Record<string, number>; // 五行能量分布
  dayMasterStrength: string; // 日主强弱
}

// Five Elements relations
const RELATION_MAP: Record<string, Record<string, string>> = {
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

const ELEMENT_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const ZHI_HIDE_GANS: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
  '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'], '午': ['丁', '己'], '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'], '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

export function analyzeBazi(birthDate: string): BaziAnalysis | null {
  try {
    const date = new Date(birthDate);
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
    
    const dayGan = eightChar.getDayGan();
    const monthZhi = eightChar.getMonthZhi();

    // 1. Calculate Pillars
    const pillars = [
      { label: '年柱', stem: eightChar.getYearGan(), branch: eightChar.getYearZhi() },
      { label: '月柱', stem: eightChar.getMonthGan(), branch: eightChar.getMonthZhi() },
      { label: '日柱', stem: eightChar.getDayGan(), branch: eightChar.getDayZhi() },
      { label: '时柱', stem: eightChar.getTimeGan(), branch: eightChar.getTimeZhi() },
    ].map(p => ({
      ...p,
      elements: `${ELEMENT_MAP[p.stem]} / ${ELEMENT_MAP[p.branch]}`,
      shiShen: RELATION_MAP[dayGan]?.[p.stem] || '日主',
      hiddenGans: ZHI_HIDE_GANS[p.branch] || [],
      nayun: lunar.getEightChar().getYearNaYin() // Simplified, usually based on stem/branch
    }));

    // 2. Pattern (格局)
    const getPattern = () => {
      const mainHiddenGan = ZHI_HIDE_GANS[monthZhi][0];
      const relation = RELATION_MAP[dayGan]?.[mainHiddenGan];
      if (relation === '比肩' || relation === '劫财') return '建禄格';
      return relation ? `${relation}格` : '普通格局';
    };

    // 3. Stars (神煞) - More complete
    const getStars = () => {
      const stars: string[] = [];
      const yearZhi = eightChar.getYearZhi();
      const dayZhi = eightChar.getDayZhi();
      const timeZhi = eightChar.getTimeZhi();
      const allZhi = [eightChar.getYearZhi(), eightChar.getMonthZhi(), eightChar.getDayZhi(), eightChar.getTimeZhi()];

      // Tian Yi
      const tianYiMap: Record<string, string[]> = {
        '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
        '乙': ['子', '申'], '己': ['子', '申'],
        '丙': ['亥', '酉'], '丁': ['亥', '酉'],
        '壬': ['卯', '巳'], '癸': ['卯', '巳'],
        '辛': ['午', '寅']
      };
      const ty = tianYiMap[dayGan] || [];
      if (allZhi.some(z => ty.includes(z))) stars.push('天乙贵人');

      // Wen Chang
      const wenChangMap: Record<string, string> = { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' };
      if (allZhi.includes(wenChangMap[dayGan])) stars.push('文昌贵人');

      // Tao Hua (based on year and day)
      const taoHuaMap: Record<string, string> = { '寅': '卯', '午': '卯', '戌': '卯', '申': '酉', '子': '酉', '辰': '酉', '亥': '子', '卯': '子', '未': '子', '巳': '午', '酉': '午', '丑': '午' };
      if (allZhi.includes(taoHuaMap[yearZhi]) || allZhi.includes(taoHuaMap[dayZhi])) stars.push('桃花');

      // Yi Ma
      const yiMaMap: Record<string, string> = { '申': '寅', '子': '寅', '辰': '寅', '寅': '申', '午': '申', '戌': '申', '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳' };
      if (allZhi.includes(yiMaMap[yearZhi]) || allZhi.includes(yiMaMap[dayZhi])) stars.push('驿马');

      return stars;
    };

    // 4. Element Strengths (Simplified Energy Calculation)
    const calculateStrengths = () => {
      const strengths: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
      const allChars = [
        eightChar.getYearGan(), eightChar.getYearZhi(),
        eightChar.getMonthGan(), eightChar.getMonthZhi(),
        eightChar.getDayGan(), eightChar.getDayZhi(),
        eightChar.getTimeGan(), eightChar.getTimeZhi()
      ];

      allChars.forEach(char => {
        const element = ELEMENT_MAP[char];
        if (element) strengths[element] += 10;
      });

      // Season (Month Zhi) multiplier (Simulating "Ling")
      const seasonElement = ELEMENT_MAP[monthZhi];
      if (seasonElement) strengths[seasonElement] += 20;

      return strengths;
    };

    const strengths = calculateStrengths();
    const dayMasterElement = ELEMENT_MAP[dayGan];
    
    // Determine Strength of Day Master
    const supportElements = {
      '木': ['水', '木'],
      '火': ['木', '火'],
      '土': ['火', '土'],
      '金': ['土', '金'],
      '水': ['金', '水']
    }[dayMasterElement] || [];

    const totalStrength = Object.values(strengths).reduce((a, b) => a + b, 0);
    const dayMasterScore = supportElements.reduce((sum, el) => sum + strengths[el], 0);
    const dayMasterStrength = dayMasterScore > (totalStrength * 0.45) ? '身旺' : '身弱';

    // 5. Favorable Elements (Simplified)
    const getFavorable = () => {
      const sorted = Object.entries(strengths).sort((a, b) => a[1] - b[1]);
      if (dayMasterStrength === '身旺') {
        // Needs to be weakened (Output, Wealth, Power)
        const weakens: Record<string, string[]> = {
          '木': ['火', '土', '金'],
          '火': ['土', '金', '水'],
          '土': ['金', '水', '木'],
          '金': ['水', '木', '火'],
          '水': ['木', '火', '土']
        };
        return weakens[dayMasterElement] || [sorted[0][0], sorted[1][0]];
      } else {
        // Needs support (Self, Support)
        return supportElements;
      }
    };

    const favorable = getFavorable();
    const unfavorable = Object.keys(strengths).filter(el => !favorable.includes(el));

    return {
      pillars,
      pattern: getPattern(),
      stars: getStars(),
      favorableElements: favorable,
      unfavorableElements: unfavorable,
      elementStrengths: strengths,
      dayMasterStrength
    };
  } catch (e) {
    console.error('Bazi Analysis Failed:', e);
    return null;
  }
}

/**
 * Compare a day with user's Bazi for personalization
 */
export function checkDayPersonalized(birthDate: string, targetDate: Date) {
  const analysis = analyzeBazi(birthDate);
  if (!analysis) return null;

  const solar = Solar.fromDate(targetDate);
  const lunar = solar.getLunar();
  const dayBranch = lunar.getDayZhi();
  
  // Check for Clash (Chong)
  // 子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥
  const clashingMap: Record<string, string> = {
    '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
  };

  const userYearBranch = analysis.pillars[0].branch;
  const userDayBranch = analysis.pillars[2].branch;

  const isClashYear = clashingMap[dayBranch] === userYearBranch;
  const isClashDay = clashingMap[dayBranch] === userDayBranch;

  return {
    isClash: isClashYear || isClashDay,
    clashType: isClashYear ? '冲年支' : (isClashDay ? '冲日支' : null),
    dayElement: ELEMENT_MAP[lunar.getDayGan()]
  };
}
