/**
 * I-Ching (Liuyao) Utility
 */

export interface HexagramInfo {
  name: string;
  pinyin: string;
  symbol: string;
  meaning: string;
  description: string;
}

// Map of binary representation (bottom to top, 0=Yin, 1=Yang) to Hexagram Info
export const HEXAGRAMS: Record<string, HexagramInfo> = {
  "111111": { name: "乾为天", pinyin: "Qián", symbol: "䷀", meaning: "元亨利贞", description: "大吉。如日中天，阳刚刚健。宜积极进取，但需戒骄戒躁。" },
  "000000": { name: "坤为地", pinyin: "Kūn", symbol: "䷁", meaning: "厚德载物", description: "大吉。柔顺伸展，包容万物。宜守持正道，顺势而为。" },
  "010001": { name: "水雷屯", pinyin: "Zhūn", symbol: "䷂", meaning: "起始维艰", description: "小凶。万事开头难，充满挑战。宜积蓄力量，不可轻举妄动。" },
  "100010": { name: "山水蒙", pinyin: "Méng", symbol: "䷃", meaning: "启蒙开发", description: "中。混沌初开，需受教育。宜虚心求教，明辨是非。" },
  "111010": { name: "水天需", pinyin: "Xū", symbol: "䷄", meaning: "守正待时", description: "中。云在天上，待雨而下。宜耐心等待，做好准备。" },
  "010111": { name: "天水讼", pinyin: "Sòng", symbol: "䷅", meaning: "慎争戒讼", description: "凶。意见不合，易生口舌。宜退避三舍，和为贵。" },
  "000010": { name: "地水师", pinyin: "Shī", symbol: "䷆", meaning: "忧劳组织", description: "中。行军打仗，需有纪律。宜统筹兼顾，严于律己。" },
  "010000": { name: "水地比", pinyin: "Bǐ", symbol: "䷇", meaning: "亲善依附", description: "吉。水在地上，亲密无间。宜团结互助，寻找靠山。" },
  "110111": { name: "风天小畜", pinyin: "Xiǎo Xù", symbol: "䷈", meaning: "力量微薄", description: "中。密云不雨，蓄养待发。宜小有作为，不可大动干戈。" },
  "111011": { name: "天泽履", pinyin: "Lǚ", symbol: "䷉", meaning: "如履薄冰", description: "中。跟随强者，需防危险。宜小心翼翼，循规蹈矩。" },
  "000111": { name: "地天泰", pinyin: "Tài", symbol: "䷊", meaning: "天地交泰", description: "大吉。上下沟通，万物通达。宜乘胜追击，发展事业。" },
  "111000": { name: "天地否", pinyin: "Pǐ", symbol: "䷋", meaning: "闭塞不通", description: "凶。小人得志，大行其道。宜收敛光芒，静待时机。" },
  "111101": { name: "天火同人", pinyin: "Tóng Rén", symbol: "䷌", meaning: "志同道合", description: "吉。与人和谐，共同进取。宜广结良缘，合作共赢。" },
  "101111": { name: "火天大有", pinyin: "Dà Yǒu", symbol: "䷍", meaning: "盛大丰收", description: "大吉。如日中天，收获颇丰。宜谦虚谨慎，回馈社会。" },
  "000100": { name: "地山谦", pinyin: "Qiān", symbol: "䷎", meaning: "谦虚受益", description: "吉。内高外低，谦虚谨慎。宜低调行事，必有后福。" },
  "001000": { name: "雷地豫", pinyin: "Yù", symbol: "䷏", meaning: "愉悦振奋", description: "吉。顺应民心，欢乐预备。宜早作打算，享受成果。" },
  "011001": { name: "泽雷随", pinyin: "Suí", symbol: "䷐", meaning: "顺随而动", description: "吉。随遇而安，顺应潮流。宜弃旧迎新，随从正道。" },
  "100110": { name: "山风蛊", pinyin: "Gǔ", symbol: "䷑", meaning: "整治腐败", description: "凶。积弊已久，需大刀阔斧。宜反省自救，清除隐患。" },
  "000011": { name: "地泽临", pinyin: "Lín", symbol: "䷒", meaning: "君临天下", description: "吉。以上临下，充满希望。宜积极介入，但需防后续。" },
  "110000": { name: "风地观", pinyin: "Guān", symbol: "䷓", meaning: "观察思考", description: "中。风行地上，周游观察。宜冷静分析，不可草率。" },
  "101001": { name: "火雷噬嗑", pinyin: "Shì Ké", symbol: "䷔", meaning: "严惩不贷", description: "中。排除障碍，咬合完整。宜果断处理，赏罚分明。" },
  "100101": { name: "山火贲", pinyin: "Bì", symbol: "䷕", meaning: "装饰文采", description: "吉。夕阳映射，美轮美奂。宜修饰仪表，注重形象。" },
  "100000": { name: "山地剥", pinyin: "Bō", symbol: "䷖", meaning: "剥落衰退", description: "凶。阴盛阳衰，根基动摇。宜沉稳待机，不可妄动。" },
  "000001": { name: "地雷复", pinyin: "Fù", symbol: "䷗", meaning: "一阳来复", description: "吉。冬去春来，生机重现。宜确立目标，重整旗鼓。" },
  "111001": { name: "天雷无妄", pinyin: "Wú Wàng", symbol: "䷘", meaning: "真诚自然", description: "中。顺应天命，不可投机。宜坚守真诚，防范意外。" },
  "100111": { name: "山天大畜", pinyin: "Dà Xù", symbol: "䷙", meaning: "大有积蓄", description: "吉。学识丰富，等待重用。宜自我提升，拓宽视野。" },
  "100001": { name: "山雷颐", pinyin: "Yí", symbol: "䷚", meaning: "颐养天年", description: "中。自我修养，言语谨慎。宜注意身体，祸从口出。" },
  "011110": { name: "泽风大过", pinyin: "Dà Guò", symbol: "䷛", meaning: "负担过重", description: "凶。栋梁弯曲，承受有限。宜寻求支持，量力而行。" },
  "010010": { name: "坎为水", pinyin: "Kǎn", symbol: "䷜", meaning: "重重困难", description: "凶。深陷困境，危机四伏。宜坚守信念，沉着应对。" },
  "101101": { name: "离为火", pinyin: "Lí", symbol: "䷝", meaning: "依附光明", description: "吉。如火依薪，光明灿烂。宜保持进取，选对方向。" },
  "011100": { name: "泽山咸", pinyin: "Xián", symbol: "䷞", meaning: "心灵感应", description: "吉。情感交流，互相吸引。宜以诚相待，促进感情。" },
  "001110": { name: "雷风恒", pinyin: "Héng", symbol: "䷟", meaning: "持之以恒", description: "吉。雷风相与，长久稳定。宜坚定信念，不改初衷。" },
  "111100": { name: "天山遁", pinyin: "Dùn", symbol: "䷠", meaning: "退避保身", description: "凶。小人势力，应当避让。宜隐忍退让，保存实力。" },
  "001111": { name: "雷天大壮", pinyin: "Dà Zhuàng", symbol: "䷡", meaning: "声势浩大", description: "中。雷在天上，威力惊人。宜运用理性，不可恃强凌弱。" },
  "101000": { name: "火地晋", pinyin: "Jìn", symbol: "䷢", meaning: "平步青云", description: "吉。日出地表，照耀四方。宜积极展示，获得认可。" },
  "000101": { name: "地火明夷", pinyin: "Míng Yí", symbol: "䷣", meaning: "光明受阻", description: "凶。才华被埋，处境艰难。宜韬光养晦，暗中积累。" },
  "110101": { name: "风火家人", pinyin: "Jiā Rén", symbol: "䷤", meaning: "治家有道", description: "吉。各安其位，和谐相处。宜注重家庭，各尽其责。" },
  "101011": { name: "火泽睽", pinyin: "Kuí", symbol: "䷥", meaning: "背道而驰", description: "凶。人心相违，矛盾突出。宜求同存异，求小事成。" },
  "010100": { name: "水山蹇", pinyin: "Jiǎn", symbol: "䷦", meaning: "艰难险阻", description: "凶。高山流水，前路艰难。宜止步反省，寻求智者。" },
  "001010": { name: "雷水解", pinyin: "Xiè", symbol: "䷧", meaning: "解除困境", description: "吉。雨过天晴，束缚消散。宜把握时机，解决问题。" },
  "100011": { name: "山泽损", pinyin: "Sǔn", symbol: "䷨", meaning: "先损后益", description: "中。减损浮华，回归真诚。宜牺牲局部，顾全大局。" },
  "110001": { name: "风雷益", pinyin: "Yì", symbol: "䷩", meaning: "增益进步", description: "吉。损上益下，顺流而下。宜积极进取，大显身手。" },
  "011111": { name: "泽天夬", pinyin: "Guài", symbol: "䷪", meaning: "决断果行", description: "中。决堤之水，势不可挡。宜果断处理，严防反复。" },
  "111110": { name: "天风姤", pinyin: "Gòu", symbol: "䷫", meaning: "偶然相遇", description: "凶。意外邂逅，需防隐患。宜保持警惕，不可轻信。" },
  "011000": { name: "泽地萃", pinyin: "Cuì", symbol: "䷬", meaning: "精英汇聚", description: "吉。水汇聚地，人才聚集。宜增强实力，寻求合作。" },
  "000110": { name: "地风升", pinyin: "Shēng", symbol: "䷭", meaning: "步步高升", description: "吉。树生土中，稳健上升。宜顺势而上，必有所获。" },
  "010011": { name: "泽水困", pinyin: "Kùn", symbol: "䷮", meaning: "穷困潦倒", description: "凶。泽中无水，孤立无援。宜忍耐坚持，修身养性。" },
  "010110": { name: "水风井", pinyin: "Jǐng", symbol: "䷯", meaning: "取之不竭", description: "中。改邑不改井，坚持原则。宜深耕不辍，服务大众。" },
  "011101": { name: "泽火革", pinyin: "Gé", symbol: "䷰", meaning: "变革求新", description: "吉。去旧迎新，顺应天意。宜大胆创新，重塑自我。" },
  "101110": { name: "火风鼎", pinyin: "Dǐng", symbol: "䷱", meaning: "稳重权威", description: "吉。鼎立之势，大吉大利。宜稳扎稳打，树立公信。" },
  "001001": { name: "震为雷", pinyin: "Zhèn", symbol: "䷲", meaning: "震惊百里", description: "中。惊雷滚滚，震动人心。宜处变不惊，反省自查。" },
  "100100": { name: "艮为山", pinyin: "Gèn", symbol: "䷳", meaning: "适可而止", description: "中。两山相对，止其所止。宜静思观心，动静得时。" },
  "110100": { name: "风山渐", pinyin: "Jiàn", symbol: "䷴", meaning: "循序渐进", description: "吉。山上之木，缓慢生长。宜积累点滴，水到渠成。" },
  "001011": { name: "雷泽归妹", pinyin: "Guī Mèi", symbol: "䷵", meaning: "错失先机", description: "凶。终始无位，名不正言不顺。宜审视关系，防范后果。" },
  "001101": { name: "雷火丰", pinyin: "Fēng", symbol: "䷶", meaning: "盛大丰收", description: "吉。如日中天，雷电齐发。宜居安思危，把握全盛。" },
  "101100": { name: "火山旅", pinyin: "Lǚ", symbol: "䷷", meaning: "羁旅漂泊", description: "凶。火烧山岗，居无定所。宜安分守己，谨慎行事。" },
  "110110": { name: "巽为风", pinyin: "Xùn", symbol: "䷸", meaning: "谦逊顺从", description: "中。风行无孔不入，顺服长久。宜谦卑待人，深谋远虑。" },
  "011011": { name: "兑为泽", pinyin: "Duì", symbol: "䷹", meaning: "喜悦交流", description: "吉。两泽相连，润泽万物。宜分享快乐，真诚沟通。" },
  "110010": { name: "风水涣", pinyin: "Huàn", symbol: "䷺", meaning: "涣散化解", description: "吉。风行水上，冰雪消融。宜凝聚人心，化解矛盾。" },
  "011010": { name: "水泽节", pinyin: "Jié", symbol: "䷻", meaning: "节制有度", description: "中。泽水有限，需有节约。宜开源节流，适可而止。" },
  "110011": { name: "风泽中孚", pinyin: "Zhōng Fú", symbol: "䷼", meaning: "诚信感悟", description: "吉。心中诚实，感化万物。宜以诚动人，建立信任。" },
  "001100": { name: "雷山小过", pinyin: "Xiǎo Guò", symbol: "䷽", meaning: "小事可成", description: "中。飞鸟遗音，宜下不宜上。宜细致入微，不可大动。" },
  "010101": { name: "水火既济", pinyin: "Jì Jì", symbol: "䷾", meaning: "大功告成", description: "中。阴阳调和，万事圆满。宜防微杜渐，防止衰落。" },
  "101010": { name: "火水未济", pinyin: "Wèi Jì", symbol: "䷿", meaning: "尚未成功", description: "吉。阴阳失位，仍有希望。宜保持进取，继续努力。" }
};

/**
 * Gets the hexagram info from a list of scores
 * @param lines Array of 6 numbers (6, 7, 8, 9)
 * @returns HexagramInfo
 */
export function getHexagramInfo(lines: number[]): HexagramInfo {
  // Convert scores to binary (Yin=0, Yang=1)
  const binary = lines.map(l => (l === 7 || l === 9) ? "1" : "0").join("");
  return HEXAGRAMS[binary] || { name: "未知卦", pinyin: "", symbol: "", meaning: "天机难测", description: "此卦象罕见，请重新感应。" };
}

/**
 * Generates random scores for 6 lines based on coin tossing
 */
export function generateLiuyao(): number[] {
  const scores: number[] = [];
  for (let i = 0; i < 6; i++) {
    // 3 coins
    let sum = 0;
    for (let c = 0; c < 3; c++) {
      sum += Math.random() > 0.5 ? 3 : 2; // Head=3, Tail=2
    }
    scores.push(sum);
  }
  return scores;
}
