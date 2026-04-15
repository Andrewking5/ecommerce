import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗
   純背景 + 標題圖片分離，完整 RWD
   手機 9:16 / 電腦 16:9
   ────────────────────────────────────── */

const BASE = '/images/events/quiz';
const CACHE_V = '?v=2'; // cache bust
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';

const V = CACHE_V;
const questions = [
  { id: 1, bg: `${BASE}/q1.webp${V}`, bgWide: `${BASE}/q1-wide.webp${V}`, questionText: '如果今天突然有一整天的空閒，你最想？', options: ['找一家舒服的小店坐著放鬆', '隨便出門走走看看城市', '待在房間聽歌或想事情', '找朋友出去玩熱鬧一下'] },
  { id: 2, bg: `${BASE}/q2.webp${V}`, bgWide: `${BASE}/q2-wide.webp${V}`, questionText: '如果有一首歌讓你反覆聽很多次，通常是因為？', options: ['旋律很溫暖很好聽', '整體感覺很自由很流動', '歌詞或氛圍很有情緒', '節奏很強讓人很想跳舞'] },
  { id: 3, bg: `${BASE}/q3.webp${V}`, bgWide: `${BASE}/q3-wide.webp${V}`, questionText: '如果要去聽一場現場音樂，你比較想去？', options: ['小咖啡店 acoustic 演出', '戶外音樂表演', '深夜小酒吧', 'Live House 現場演出'] },
  { id: 4, bg: `${BASE}/q4.webp${V}`, bgWide: `${BASE}/q4-wide.webp${V}`, questionText: '如果你的生活是一種風景，它比較像？', options: ['和朋友在咖啡店聊天的午後', '海邊吹著風的海岸', '月光下安靜的夜晚', '充滿歡聲笑語居酒屋之夜'] },
  { id: 5, bg: `${BASE}/q5.webp${V}`, bgWide: `${BASE}/q5-wide.webp${V}`, questionText: '當你聽音樂時，你比較常呈現什麼樣的狀態？', options: ['覺得心情變得很舒服', '開始想像很多畫面', '想到很多回憶', '跟著節奏點頭或動起來'] },
  { id: 6, bg: `${BASE}/q6.webp${V}`, bgWide: `${BASE}/q6-wide.webp${V}`, questionText: '朋友們通常在什麼樣的場合最容易想到你？', options: ['需要有人陪著聊天、\n分享心事的時候', '突然想出門、\n說走就走的時候', '當想一個人靜靜待著、\n但又不想完全孤單的時候', '需要有人把氣氛炒熱、\n帶動大家的時候'] },
  { id: 7, bg: `${BASE}/q7.webp${V}`, bgWide: `${BASE}/q7-wide.webp${V}`, questionText: '如果你走在街上突然聽到有人彈吉他，你通常會？', options: ['停下來聽一下，\n看看是不是熟悉的旋律', '邊走邊聽，\n覺得街道變得很有感覺', '站遠一點靜靜聽完整首，\n能低調就低調', '忍不住走近一點，想看\n清楚表演者演出當下的樣子'] },
];

const CHARACTER_NAMES = ['火焰', '太陽', '煙火', '微光', '海浪', '深海', '月光'];

/* ── 角色閒聊台詞（3 秒沒選就出現） ── */
const CHARACTER_LINES: string[][] = [
  // Q1 — 火焰：熱情衝動
  [
    '欸欸快選啦！想太久火都要滅了🔥',
    '哪有人放假還在猶豫的啦！',
    '直覺直覺！不要想太多！',
    '我已經等到快燒起來了⋯',
    '選錯又不會怎樣，衝就對了！',
    '像刷和弦一樣，手動了答案就出來了🎸',
    '放假欸！開心的事不用想那麼久啦',
    '再不選我就自己幫你刷一段了喔～',
  ],
  // Q2 — 太陽：溫暖陽光
  [
    '慢慢來沒關係～但我快曬到融化了☀️',
    '每首歌都有它的故事呢～',
    '想一下也好，音樂值得被認真對待',
    '選哪個都很棒的！相信自己～',
    '你一定有那首聽到會微笑的歌吧？',
    '閉上眼睛，哪個旋律先浮出來？',
    '好的吉他聲就像陽光，暖暖的🎶',
    '有些和弦一聽就覺得被治癒了呢',
  ],
  // Q3 — 煙火：華麗短暫
  [
    '快點快點！精彩的瞬間不等人的✨',
    '哇這題好難選！但煙火不能等太久～',
    '想像一下那個畫面，答案就出來了！',
    '別猶豫！最閃亮的選擇就是現在！',
    '舞台上的吉他手可不會猶豫！',
    '你想當台上的人還是台下的人？',
    '煙火的哲學：先彈再說！🎸',
    '音樂現場最棒的就是那種心跳感！',
  ],
  // Q4 — 微光：安靜溫柔
  [
    '沒關係，慢慢想⋯我會在這裡等你🕯️',
    '每個風景都很美，就像你一樣',
    '靜靜感受一下，答案會自己浮現的',
    '不急不急，微光最懂等待的美',
    '你心裡一定有一個最安靜的角落',
    '深呼吸⋯感覺到了嗎？',
    '一把好吉他，輕輕撥就能感動人',
    '有時候最小的聲音，傳得最遠🎵',
  ],
  // Q5 — 海浪：自由奔放
  [
    '跟著感覺走就對了🌊～',
    '音樂就像海浪，讓它帶著你吧',
    '想太多就不自由了喔！',
    '隨波逐流也是一種答案啦～',
    '聽音樂幹嘛分析！享受就好啊',
    '浪來了就衝，別站在岸上看！',
    '在海邊彈吉他，那才叫自由🎸',
    '每個浪都不一樣，就像每次即興',
  ],
  // Q6 — 深海：神秘深沉
  [
    '⋯⋯（在深海裡安靜地等你）🫧',
    '有些答案藏在最深的地方',
    '不用急，深海的時間流動得很慢',
    '潛入內心深處，你會找到答案的',
    '⋯⋯（冒了一個泡泡）',
    '最深沉的琴聲，只有安靜才聽得見',
    '你是不是也喜歡一個人安靜彈琴？🎶',
    '最好的低音，藏在最深的共鳴裡',
  ],
  // Q7 — 月光：浪漫感性
  [
    '月光不催人，但夜不會永遠等你🌙',
    '這是最後一題了，好好感受吧',
    '街頭的吉他聲⋯你聽見了嗎？',
    '用心去選，這會成為你的靈魂記憶',
    '最後的選擇，往往最接近真實的你',
    '月光下彈吉他，每個音都特別誠實',
    '這首歌快結束了⋯你準備好了嗎？🎸',
    '把這個旋律留在心裡，然後選吧',
  ],
];

/* ── 計分邏輯（依 PDF 設計） ── */
type Soul = 'SUN' | 'WAVE' | 'MOON' | 'FIRE';
type Dim = '自由' | '故事';

// 每題 4 選項 → [Soul, Dimension]
// Q4-A 是 SUN+自由，其餘 A 都是 SUN+故事
const SCORING: [Soul, Dim][][] = [
  /* Q1 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q2 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q3 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q4 */ [['SUN', '自由'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q5 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q6 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q7 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
];

function calculateResult(ans: number[]): string {
  const soul: Record<Soul, number> = { SUN: 0, WAVE: 0, MOON: 0, FIRE: 0 };
  const dim: Record<Dim, number> = { '自由': 0, '故事': 0 };
  const lastQ: Record<Soul, number> = { SUN: -1, WAVE: -1, MOON: -1, FIRE: -1 };

  ans.forEach((a, q) => {
    const [s, d] = SCORING[q][a];
    soul[s]++;
    dim[d]++;
    lastQ[s] = q;
  });

  // Step 1: 最高 soul
  const maxS = Math.max(...Object.values(soul));
  const tops = (Object.keys(soul) as Soul[]).filter(s => soul[s] === maxS);
  // Step 2: 平手 → 最後出現的贏
  const mainSoul = tops.length === 1
    ? tops[0]
    : tops.reduce((a, b) => (lastQ[a] > lastQ[b] ? a : b));

  // Step 3: 自由 vs 故事
  let dimension: Dim;
  if (dim['自由'] !== dim['故事']) {
    dimension = dim['自由'] > dim['故事'] ? '自由' : '故事';
  } else {
    // Step 4: 平手 → 看 Q6（index 5）
    dimension = SCORING[5][ans[5]][1];
  }

  return `${mainSoul}_${dimension}`;
}

/* ── 8 種結果資料（依 PDF） ── */
interface ResultInfo {
  name: string;
  soulTitle: string;
  tag: string;
  city: string;
  cityDesc: string;
  description: string;
  music: string;
  compatible: string;
  compatibleDesc: string;
  incompatible: string;
  incompatibleDesc: string;
  colorName: string;
  charImg: string;
  themeColor: string;
  themeBg: string;
}

const RESULTS: Record<string, ResultInfo> = {
  SUN_自由: {
    name: 'Sunny Taipei',
    soulTitle: '溫暖大家的太陽吉他',
    tag: '陽光型生活家',
    city: '台北 華山文創園區',
    cityDesc: '城市的街頭、咖啡廳、午後的陽光與人群。你的音樂像城市裡亮起的霓虹燈，在忙碌的生活中帶來一點光。',
    description: '你給人的感覺自然、輕鬆，很容易讓人放下防備。你喜歡生活裡那些簡單卻舒服的瞬間，也很擅長把氣氛變得明亮。很多人和你相處時，會不自覺地放鬆下來。',
    music: '#清新民謠 #acoustic pop #Indie Folk #Campfire Acoustic',
    compatible: 'Wave Hualien',
    compatibleDesc: '他的自由感會讓你的世界更開闊。',
    incompatible: 'Deep Wave Jiufen',
    incompatibleDesc: '你喜歡輕盈往前，他比較容易停留在情緒裡。',
    colorName: '橘黃色',
    charImg: `${BASE}/progress/char-2.png`,
    themeColor: '#FF9A3E',
    themeBg: 'linear-gradient(135deg, #FFF4CC 0%, #FFE4A0 50%, #FF9A3E 100%)',
  },
  SUN_故事: {
    name: 'Soft Sun Taoyuan',
    soulTitle: '溫柔共感的微光吉他',
    tag: '溫暖的傾聽者',
    city: '桃園 大溪老街',
    cityDesc: '像城市與遠方之間的地方，安靜、溫和，也藏著很多故事。',
    description: '你細膩、溫柔，也很懂得理解別人的感受。你不一定話最多，但你很會聽，也很會接住情緒。很多人會在你身邊感到安心。',
    music: '#抒情民謠 #Acoustic Ballad #Folk Guitar #情感型彈唱',
    compatible: 'Dream Moon Tainan',
    compatibleDesc: '你的溫暖與他的情緒很容易產生共鳴。',
    incompatible: 'Fire Taichung',
    incompatibleDesc: '你喜歡慢慢醞釀，他習慣快速推進。',
    colorName: '橘黃色',
    charImg: `${BASE}/progress/char-4.png`,
    themeColor: '#F0B860',
    themeBg: 'linear-gradient(135deg, #FFF8E8 0%, #FFE8B0 50%, #F0B860 100%)',
  },
  WAVE_自由: {
    name: 'Wave Hualien',
    soulTitle: '嚮往自由的海浪靈魂',
    tag: '自由的探索者',
    city: '花蓮 七星潭海岸',
    cityDesc: '海風、山與海的交界、自由延伸的海岸線。你就像山海之間的風，開闊、自由，也沒有太多限制。',
    description: '你喜歡空間、變化和自由感，不太喜歡被固定模式困住。你很依靠感覺，也很容易被新的地方與新的體驗吸引。你的生活節奏通常比較流動，也讓身邊的人感到輕鬆自在。',
    music: '#Fingerstyle Guitar #Indie Acoustic #Instrumental Guitar #Travel folk',
    compatible: 'Sunny Taipei',
    compatibleDesc: '他的輕鬆會讓你的自由更自在。',
    incompatible: 'Moon Hsinchu',
    incompatibleDesc: '你喜歡流動，他比較習慣停下來思考。',
    colorName: '藍色',
    charImg: `${BASE}/progress/char-5.png`,
    themeColor: '#4A9EC5',
    themeBg: 'linear-gradient(135deg, #E0F2FE 0%, #7EC8E3 50%, #4A9EC5 100%)',
  },
  WAVE_故事: {
    name: 'Deep Wave Jiufen',
    soulTitle: '深海吉他靈魂',
    tag: '海霧裡的觀察者',
    city: '九份 阿妹茶樓',
    cityDesc: '像山城的霧與燈火，安靜、有故事，也帶著一點神秘感。',
    description: '你是一個很有內在世界的人。你很會觀察，也很容易注意到細節與情緒。你不急著表達，但其實想得很多。你喜歡有層次、有深度的東西。',
    music: '#Indie Folk #Ambient Acoustic #情緒指彈 #Acoustic Instrumental',
    compatible: 'Dream Moon Tainan',
    compatibleDesc: '你們都很容易感受到音樂裡的情緒。',
    incompatible: 'Sunny Taipei',
    incompatibleDesc: '你喜歡慢慢感受，他比較習慣輕快往前。',
    colorName: '藍色',
    charImg: `${BASE}/progress/char-6.png`,
    themeColor: '#2E6B8A',
    themeBg: 'linear-gradient(135deg, #C8E0EC 0%, #5A9AB5 50%, #2E6B8A 100%)',
  },
  MOON_故事: {
    name: 'Moon Hsinchu',
    soulTitle: '情感充沛的月光吉他',
    tag: '安靜的思考者',
    city: '新竹 新竹公園',
    cityDesc: '像夜晚的風，安靜、清楚，也有自己的節奏。',
    description: '你是一個很習慣向內思考的人。你習慣先觀察、先思考，再慢慢表達自己。你需要一些自己的空間，也很擅長整理內心的想法。你不是冷淡，只是比較安靜。',
    music: '#Fingerstyle Guitar #Ambient Acoustic #Indie Acoustic #Melodic Guitar',
    compatible: 'Fire Taichung',
    compatibleDesc: '他的行動力會幫你把想法更勇敢地說出來。',
    incompatible: 'Wave Hualien',
    incompatibleDesc: '你需要沉澱，他習慣一直往前探索。',
    colorName: '黑色 / 白色',
    charImg: `${BASE}/progress/char-7.png`,
    themeColor: '#6B6B9E',
    themeBg: 'linear-gradient(135deg, #E8E8F0 0%, #A0A0C8 50%, #6B6B9E 100%)',
  },
  MOON_自由: {
    name: 'Dream Moon Tainan',
    soulTitle: '追求浪漫的夢月吉他',
    tag: '月光裡的說故事的人',
    city: '台南 神農街',
    cityDesc: '老街的燈光、慢慢的步調與溫暖的人情味。老街的夜晚，慢慢流動，也帶著很多故事。',
    description: '你感受力很強，也很容易被一段旋律或一個畫面打動。你不是最外放的人，但你的內在世界很豐富。很多情緒在你心裡都會停留很久。很多時候，你的想法都帶著一點浪漫與自由。',
    music: '#Acoustic Folk #抒情民謠 #Indie Acoustic #情緒指彈',
    compatible: 'Soft Sun Taoyuan',
    compatibleDesc: '他的溫暖能接住你的情緒。',
    incompatible: 'Wave Hualien',
    incompatibleDesc: '你喜歡沉浸，他比較喜歡往外探索。',
    colorName: '黑色 / 白色',
    charImg: `${BASE}/progress/char-7.png`,
    themeColor: '#7B6BA0',
    themeBg: 'linear-gradient(135deg, #EDE8F5 0%, #B0A0D0 50%, #7B6BA0 100%)',
  },
  FIRE_自由: {
    name: 'Fire Taichung',
    soulTitle: '火焰吉他靈魂',
    tag: '帶著能量的人',
    city: '台中 勤美草悟道／圓滿舞台',
    cityDesc: '像 Live House 的夜晚，有燈光、有節奏，也很有現場感。',
    description: '你是一個很有行動力的人，想到什麼就會立刻去做，不太喜歡猶豫或等待。你喜歡熱鬧的氣氛，也很容易帶動身邊的人一起投入。很多時候，你的能量就像火一樣，讓場面瞬間變得有溫度、有速度。',
    music: '#Rock Acoustic #Rhythm Guitar #Blues Guitar #Live Acoustic',
    compatible: 'Moon Hsinchu',
    compatibleDesc: '他給深度，你給行動力。',
    incompatible: 'Soft Sun Taoyuan',
    incompatibleDesc: '你想快一點，他想慢慢感受。',
    colorName: '紅色',
    charImg: `${BASE}/result/fire/char.webp`,
    themeColor: '#E04040',
    themeBg: 'linear-gradient(135deg, #FFE0D0 0%, #F08060 50%, #E04040 100%)',
  },
  FIRE_故事: {
    name: 'Spark Kaohsiung',
    soulTitle: '煙花吉他靈魂',
    tag: '帶著火花的創作者',
    city: '高雄 駁二藝術特區',
    cityDesc: '像港口夜晚的光與風，開闊、有力量，也很有城市故事。',
    description: '你有很多想法，也很容易把感受變成表達。你不一定一直高調，但只要開始創作或說話，就很有力量。你喜歡有張力、有個性的東西。',
    music: '#Blues Guitar #Indie Rock Acoustic #Singer-Songwriter #情緒搖滾',
    compatible: 'Deep Wave Jiufen',
    compatibleDesc: '他的細節會讓你的表達更有層次。',
    incompatible: 'Sunny Taipei',
    incompatibleDesc: '你喜歡重量，他偏向輕鬆明亮。',
    colorName: '紅色',
    charImg: `${BASE}/progress/char-3.png`,
    themeColor: '#D05030',
    themeBg: 'linear-gradient(135deg, #FFE8D8 0%, #E88060 50%, #D05030 100%)',
  },
};

function useIsDesktop() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setD(mq.matches);
    const h = (e: MediaQueryListEvent) => setD(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return d;
}

/* ── 閒聊計時 hook ── */
function useIdleLine(currentQ: number) {
  const [lineIdx, setLineIdx] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    setLineIdx(-1);
    idxRef.current = 0;

    const showNext = () => {
      setLineIdx(idxRef.current);
      // 4~6 秒後消失
      const hideDelay = 4000 + Math.random() * 2000;
      hideRef.current = setTimeout(() => {
        setLineIdx(-1);
        // 消失後 6~10 秒再出現下一句
        const nextDelay = 6000 + Math.random() * 4000;
        nextRef.current = setTimeout(() => {
          idxRef.current = (idxRef.current + 1) % CHARACTER_LINES[currentQ].length;
          showNext();
        }, nextDelay);
      }, hideDelay);
    };

    // 3 秒後顯示第一句
    timerRef.current = setTimeout(showNext, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
      if (nextRef.current) clearTimeout(nextRef.current);
    };
  }, [currentQ]);

  const lines = CHARACTER_LINES[currentQ];
  return lineIdx >= 0 && lines ? lines[lineIdx] : null;
}

/* ── 按鈕 ── */
function QuizOption({ label, onClick, delay, active }: { label: string; onClick: () => void; delay: number; active: boolean }) {
  return (
    <motion.button type="button" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} whileTap={{ scale: 0.96 }} onClick={onClick} className="w-full cursor-pointer group relative">
      <img src={`${BASE}/btn-default.png`} alt="" className={`w-full h-auto transition-opacity duration-200 ${active ? 'opacity-0' : 'group-hover:opacity-0'}`} draggable={false} />
      <img src={`${BASE}/btn-selected.png`} alt="" className={`absolute inset-0 w-full h-auto transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} draggable={false} />
      <span className={`absolute inset-0 flex items-center justify-center text-[0.9rem] md:text-[1.1rem] leading-snug transition-colors duration-200 whitespace-pre-line text-center px-4 ${active ? 'text-white' : 'text-[#2a2a2a] group-hover:text-white'}`} style={{ fontFamily: QUIZ_FONT }}>{label}</span>
    </motion.button>
  );
}

/* ── 進度條（含角色氣泡） ── */
function ProgressBar({ current, idleLine, bubbleAbove }: { current: number; idleLine: string | null; bubbleAbove?: boolean }) {
  const progress = (current / (CHARACTER_NAMES.length - 1)) * 100;
  const isTalking = idleLine !== null;

  return (
    <div className="w-full">
      <div className="relative flex items-end justify-between">
        {/* 底線 */}
        <div className="absolute left-4 right-4 bottom-[5px] md:bottom-[6px] h-[2px]">
          <img src={`${BASE}/progress/line.png`} alt="" className="w-full h-full object-fill" draggable={false} />
        </div>
        {/* 進度線 */}
        <div
          className="absolute left-4 bottom-[5px] md:bottom-[6px] h-[2px] rounded-full transition-all duration-500"
          style={{
            width: `calc(${progress}% * (100% - 32px) / 100)`,
            background: 'linear-gradient(90deg, #c5a059, #6ba3b5)',
          }}
        />

        {/* 角色對話框 — 跟隨角色位置，不擋進度條 */}
        {isTalking && (() => {
          const charPct = (current / 6) * 100;
          const bubbleW = 55;
          const bubbleLeft = Math.max(2, Math.min(100 - bubbleW - 2, charPct - bubbleW / 2));

          return (
            <AnimatePresence mode="wait">
              <motion.div
                key={idleLine}
                initial={{ opacity: 0, y: bubbleAbove ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: bubbleAbove ? 4 : -4 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 right-0 z-30"
                style={bubbleAbove
                  ? { bottom: '100%', marginBottom: '58px' }
                  : { top: '100%', marginTop: '8px' }
                }
              >
                <div
                  className="absolute rounded-2xl border-2 border-[#2a2a2a] bg-white px-4 py-2 shadow-md"
                  style={{ left: `${bubbleLeft}%`, width: `${bubbleW}%`, fontFamily: QUIZ_FONT }}
                >
                  <p className="text-[0.75rem] md:text-[0.85rem] text-[#2a2a2a] leading-snug text-center">
                    {idleLine}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          );
        })()}

        {CHARACTER_NAMES.map((name, i) => {
          const isCurrent = i === current;
          const isPast = i < current;
          const isFuture = i > current;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              {/* 角色圖示 */}
              <motion.div
                className="relative"
                animate={{
                  scale: isCurrent ? 1.3 : 1,
                  opacity: isFuture ? 0.25 : 1,
                  filter: isFuture ? 'grayscale(100%)' : 'grayscale(0%)',
                  ...(isCurrent && isTalking ? { rotate: [0, -8, 8, -5, 5, 0] } : { rotate: 0 }),
                }}
                transition={isCurrent && isTalking
                  ? { rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }, scale: { type: 'spring', stiffness: 300, damping: 20 } }
                  : { type: 'spring', stiffness: 300, damping: 20 }
                }
              >
                <img
                  src={`${BASE}/progress/char-${i + 1}.png`}
                  alt={name}
                  className="w-6 h-6 md:w-7 md:h-7 object-contain"
                  draggable={false}
                />
                {isCurrent && (
                  <motion.div
                    className="absolute -inset-1 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.3) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>
              {/* 圓點 */}
              <motion.img
                src={`${BASE}/progress/${isCurrent || isPast ? 'dot-on' : 'dot-off'}.png`}
                alt=""
                className="w-2.5 h-2.5 md:w-3 md:h-3 mt-1 object-contain"
                draggable={false}
                animate={{ scale: isCurrent ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
              />

            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Loading ── */
function LoadingScreen({ onDone, isDesktop }: { onDone: () => void; isDesktop: boolean }) {
  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, 2000));
    const imgs = questions.flatMap((q) => [q.bg, q.bgWide]).map(
      (src) => new Promise<void>((r) => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = src; }),
    );
    const btns = ['/btn-default.png', '/btn-selected.png'].map(
      (f) => new Promise<void>((r) => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = `${BASE}${f}`; }),
    );
    Promise.all([min, ...imgs, ...btns]).then(onDone);
  }, [onDone, isDesktop]);

  return (
    <motion.div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0e8]" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <img src={`${BASE}/loading.webp`} alt="載入中" className="w-40 h-40 object-contain" draggable={false} />
      <motion.p className="mt-6 text-[#2a2a2a]/60 text-sm tracking-widest" style={{ fontFamily: QUIZ_FONT }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>正在為你準備測驗⋯</motion.p>
      <motion.p
        className="mt-4 text-[#2a2a2a]/40 text-xs flex items-center gap-1.5"
        style={{ fontFamily: QUIZ_FONT }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-base">🔊</span> 建議開啟聲音，體驗更佳
      </motion.p>
    </motion.div>
  );
}

/* ── 封面 ── */
function CoverPage({ onStart, isDesktop }: { onStart: () => void; isDesktop: boolean }) {
  return (
    <motion.div className="absolute inset-0 z-50 overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      {isDesktop ? (
        <img src={`${BASE}/cover-bg-wide.webp`} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      ) : (
        <video className="absolute inset-0 w-full h-full object-cover" src="/videos/soul-guitar-cover.mp4" autoPlay loop muted playsInline />
      )}
      <motion.button type="button" onClick={onStart}
        className="absolute z-10 left-1/2 -translate-x-1/2 bottom-[12%] w-[50%] max-w-[260px] md:w-[20%] md:max-w-[300px] active:scale-95 transition-transform"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, filter: ['drop-shadow(0 0 0px rgba(218,165,50,0.2))', 'drop-shadow(0 0 14px rgba(218,165,50,0.7))', 'drop-shadow(0 0 0px rgba(218,165,50,0.2))'] }}
        transition={{ opacity: { duration: 0.6, delay: 0.5 }, y: { duration: 0.6, delay: 0.5 }, filter: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        whileTap={{ scale: 0.95 }}
      >
        <img src={`${BASE}/cover-start-btn.png`} alt="解鎖你的吉他靈魂檔案" className="w-full h-auto" draggable={false} />
      </motion.button>
      <div className="absolute z-10 bottom-0 left-0 right-0 h-9 overflow-hidden" style={{ background: 'linear-gradient(90deg, #c5a059 0%, #a0a068 35%, #6a9a8a 65%, #4a7a8a 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="flex items-center h-full w-[200%]" style={{ animation: 'marquee 15s linear infinite' }}>
            <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
            <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── 題目頁面（通用：手機＋電腦共用邏輯） ── */
function QuestionView({
  question, currentQ, isFirstQ, tapped,
  onSelect, onPrev,
}: {
  question: typeof questions[0]; currentQ: number; isFirstQ: boolean;
  tapped: number | null; onSelect: (i: number) => void; onPrev: () => void;
}) {
  const idleLine = useIdleLine(currentQ);

  return (
    <div className="relative z-10 flex flex-col h-full">
      {/* 上一題 */}
      {!isFirstQ && (
        <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onPrev}
          className="absolute top-4 left-4 z-20 flex items-center gap-0.5 rounded-full bg-white/40 backdrop-blur-sm pl-1 pr-2.5 py-1 text-[#2a2a2a]/70 hover:bg-white/60 hover:text-[#2a2a2a] transition-all md:top-6 md:left-6 md:pl-2 md:pr-3.5 md:py-1.5">
          <ChevronLeft size={14} className="md:w-4 md:h-4" />
          <span className="text-[10px] md:text-xs" style={{ fontFamily: QUIZ_FONT }}>上一題</span>
        </motion.button>
      )}

      {/* 上半留白 */}
      <div className="flex-1 min-h-[40px] md:min-h-0 md:flex-none md:h-[20%]" />

      {/* 內容區 — 電腦版置中 */}
      <div className="px-5 md:px-0 md:mx-auto md:w-[40%] md:max-w-[480px]">
        {/* 手機版：進度條在 Q 上方，氣泡浮在進度條上方（留白區） */}
        <div className="md:hidden mb-1.5">
          <ProgressBar current={currentQ} idleLine={idleLine} bubbleAbove />
        </div>

        {/* Q 號碼 */}
        <motion.span
          className="text-[1.8rem] md:text-[2.8rem] leading-none block mb-0.5"
          style={{
            fontFamily: QUIZ_FONT,
            fontWeight: 900,
            color: '#2a2a2a',
            textShadow: '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 -1.5px 0 #fff, 0 1.5px 0 #fff, -1.5px 0 0 #fff, 1.5px 0 0 #fff',
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          Q{question.id}
        </motion.span>

        {/* 問題文字 */}
        <motion.p
          className="text-[1.05rem] md:text-[1.5rem] leading-snug mb-2.5 md:mb-4"
          style={{
            fontFamily: QUIZ_FONT,
            fontWeight: 900,
            color: '#2a2a2a',
            textShadow: '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 -1.5px 0 #fff, 0 1.5px 0 #fff, -1.5px 0 0 #fff, 1.5px 0 0 #fff',
          }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {question.questionText}
        </motion.p>

        {/* 選項按鈕 */}
        <div className="flex flex-col gap-1.5 md:gap-3">
          {question.options.map((opt, i) => (
            <QuizOption key={`${currentQ}-${i}`} label={opt} onClick={() => onSelect(i)} delay={0.05 + i * 0.06} active={tapped === i} />
          ))}
        </div>

        {/* 電腦版：進度條在選項下方，氣泡在進度條下方 */}
        <div className="hidden md:block mt-6 pb-12">
          <ProgressBar current={currentQ} idleLine={idleLine} />
        </div>
      </div>

      {/* 底部彈性空間 */}
      <div className="flex-1 min-h-[16px] md:flex-1" />
    </div>
  );
}

/* ── 結果 Loading 角色對應 ── */
const RESULT_LOADING_CHAR: Record<string, string> = {
  FIRE_自由: '火焰',
  SUN_自由:  '太陽',
  SUN_故事:  '微光',
  WAVE_自由: '海浪',
  WAVE_故事: '深海',
  MOON_故事: '月亮',
  MOON_自由: '夢月',
};

function ResultLoadingScreen({ resultKey, onDone }: { resultKey: string; onDone: () => void }) {
  const char = RESULT_LOADING_CHAR[resultKey] || '火焰';
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={`/images/events/quiz/loading-${char}.webp`}
        alt="分析中"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </motion.div>
  );
}

/* ── 結果頁面資料夾對應 ── */
const RESULT_FOLDER: Record<string, string> = {
  FIRE_自由: 'fire',
  // 其他角色待補：
  // FIRE_故事: 'spark',
  // SUN_自由: 'sunny',
  // SUN_故事: 'soft-sun',
  // WAVE_自由: 'wave',
  // WAVE_故事: 'deep-wave',
  // MOON_故事: 'moon',
  // MOON_自由: 'dream-moon',
};

/* ── 結果頁 ── */
function ResultPage({ resultKey, onRetry }: { resultKey: string; onRetry: () => void }) {
  const result = RESULTS[resultKey];
  const folder = RESULT_FOLDER[resultKey] || 'fire';
  const R = `${BASE}/result`;
  const RF = `${R}/${folder}`;
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `我的吉他靈魂是「${result.soulTitle}」！快來測測你的吉他靈魂 🎸`;
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) return null;

  const hasAssets = !!RESULT_FOLDER[resultKey];

  /* ── 沒有素材的角色：簡易文字版結果頁 ── */
  if (!hasAssets) {
    return (
      <motion.div
        className="absolute inset-0 z-50 overflow-y-auto overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ background: result.themeBg }}
      >
        <div className="relative z-10 flex flex-col items-center w-full max-w-[430px] mx-auto px-6 py-12" style={{ fontFamily: QUIZ_FONT }}>
          {/* 角色圖 */}
          <motion.img
            src={result.charImg}
            alt={result.name}
            className="w-28 h-28 object-contain"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            draggable={false}
          />

          {/* 標題 */}
          <motion.p
            className="mt-4 text-white/80 text-sm tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            你的吉他靈魂是
          </motion.p>
          <motion.h1
            className="mt-1 text-white text-3xl font-black"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {result.soulTitle}
          </motion.h1>
          <motion.p
            className="mt-2 text-white/70 text-base font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {result.name}
          </motion.p>

          {/* 標籤 */}
          <motion.p
            className="mt-3 text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            #{result.tag} #{result.colorName}
          </motion.p>

          {/* 描述 */}
          <motion.div
            className="mt-6 bg-white/15 backdrop-blur-sm rounded-2xl p-5 w-full"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-white/90 text-sm leading-relaxed">{result.description}</p>
          </motion.div>

          {/* 城市 */}
          <motion.div
            className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-5 w-full"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p className="text-white font-bold text-sm mb-1">你的音樂城市：{result.city}</p>
            <p className="text-white/80 text-xs leading-relaxed">{result.cityDesc}</p>
          </motion.div>

          {/* 音樂風格 */}
          <motion.div
            className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-5 w-full"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <p className="text-white font-bold text-sm mb-2">你會愛上的吉他音樂風格</p>
            <div className="flex flex-wrap gap-2">
              {result.music.split(' ').map((tag, i) => (
                <span key={i} className="bg-white/20 text-white/90 text-xs px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </motion.div>

          {/* 相輔 / 相斥 */}
          <motion.div
            className="mt-4 grid grid-cols-2 gap-3 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white font-bold text-xs mb-1">靈魂相輔</p>
              <p className="text-white/90 text-xs">{result.compatible}</p>
              <p className="text-white/60 text-[10px] mt-1">{result.compatibleDesc}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white font-bold text-xs mb-1">靈魂相斥</p>
              <p className="text-white/90 text-xs">{result.incompatible}</p>
              <p className="text-white/60 text-[10px] mt-1">{result.incompatibleDesc}</p>
            </div>
          </motion.div>

          {/* 靈魂顏色 */}
          <motion.p
            className="mt-6 text-white/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            你的靈魂顏色：<span className="text-white font-bold">{result.colorName}</span>
          </motion.p>

          {/* 按鈕 */}
          <motion.div
            className="mt-8 w-full flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <button
              type="button"
              onClick={handleShare}
              className="w-[70%] py-3 rounded-full font-bold text-sm text-[#2a2a2a] relative"
              style={{ background: 'rgba(255,255,255,0.85)' }}
            >
              {copied ? '已複製到剪貼簿！' : '分享你的測驗結果'}
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="w-[50%] py-2.5 rounded-full font-bold text-sm text-white border-2 border-white/50"
            >
              再測一次
            </button>
            <Link
              to="/e/soul-guitar/info"
              className="mt-1 text-white/60 text-xs underline underline-offset-2"
            >
              前往了解『2026 Ayers靈魂吉他手大賽』
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  /* ── 有素材的角色：完整圖片版結果頁 ── */
  return (
    <motion.div
      ref={scrollRef}
      className="absolute inset-0 z-50 overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 背景放內容層，讓漸層自動撐滿整個長條頁面高度 */}
      <div
        className="relative z-10 flex flex-col items-center w-full pb-16"
        style={{
          backgroundImage: `url(${RF}/bg.webp)`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >

        {/* ─── Hero Card 80% 寬，置中 ─── */}
        <motion.div
          className="w-[80%] mx-auto relative mt-[10%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={`${RF}/hero-card.webp`}
            alt={result.name}
            className="w-full h-auto block"
            draggable={false}
          />
        </motion.div>

        {/* ─── 以下內容縮 90%，wrapper 設 w-[90%] ─── */}
        <div className="w-[90%] mx-auto flex flex-col items-center">

        {/* 長按儲存提示 — 輕微浮動 */}
        <motion.div
          className="mt-3 w-[75%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 0.7 : 0, y: showContent ? [0, -3, 0] : 0 }}
          transition={{ opacity: { duration: 0.5 }, y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <img src={`${RF}/text-save.webp`} alt="長按上方結果圖儲存圖片" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* 往下看提示 — 向下彈跳暗示 */}
        <motion.div
          className="mt-4 w-[80%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? [0, 6, 0] : 10 }}
          transition={{ opacity: { duration: 0.5, delay: 0.2 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <img src={`${RF}/text-scroll.webp`} alt="往下看你的靈魂檔案" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* ─── 一個讓你被聽見的機會 ─── */}
        <motion.div
          className="mt-5 w-[90%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ opacity: { duration: 0.5, delay: 0.4 } }}
        >
          <img src={`${RF}/text-chance.webp`} alt="一個讓你被聽見的機會" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* ─── 角色圖 ─── */}
        <motion.img
          src={result.charImg}
          alt={result.name}
          className="mt-4 w-[60%] h-auto object-contain"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          draggable={false}
        />

        {/* ─── 你的個人特質 — 像翻開檔案般入場 ─── */}
        <motion.div
          className="mt-8 w-full"
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-60px', root: scrollRef }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 800 }}
        >
          <img src={`${RF}/personality-card.webp`} alt="你的個人特質" className="w-full h-auto rounded-xl" draggable={false} />
        </motion.div>

        {/* 你聽出來了嗎 — blur 解除 + scale */}
        <motion.div
          className="mt-8 w-[85%]"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px', root: scrollRef }}
          transition={{ duration: 0.6 }}
        >
          <img src={`${RF}/text-heard.webp`} alt="你聽出來了嗎" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* ─── 猜猜這是哪 + 城市卡 ─── */}
        <motion.div
          className="mt-5 w-[50%]"
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.5 }}
        >
          <img src={`${RF}/text-guess.webp`} alt="猜猜這是哪" className="w-full h-auto" draggable={false} />
        </motion.div>
        {/* 城市卡 — clipPath 揭露 */}
        <motion.div
          className="mt-3 w-full overflow-hidden rounded-xl"
          initial={{ opacity: 0, clipPath: 'inset(10% 10% 10% 10% round 12px)' }}
          whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 12px)' }}
          viewport={{ once: true, margin: '-50px', root: scrollRef }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={`${RF}/city-card.webp`} alt={result.city} className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* 這樣的你，會發出什麼樣的聲音？ — blur 解除 */}
        <motion.div
          className="mt-10 w-[85%]"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.6 }}
        >
          <img src={`${RF}/text-sound.webp`} alt="這樣的你，會發出什麼樣的聲音" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* ─── 你會愛上的吉他音樂風格 ─── */}
        <motion.div
          className="mt-6 w-[75%]"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.5 }}
        >
          <img src={`${RF}/title-music-style.webp`} alt="你會愛上的吉他音樂風格" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* 音樂風格標籤 — 逐個 stagger 從右滑入 */}
        <div className="mt-4 w-full flex flex-col gap-2.5">
          {[1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px', root: scrollRef }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={`${RF}/tag-${i}.webp`} alt="" className="w-full h-auto" draggable={false} />
            </motion.div>
          ))}
        </div>

        {/* ─── 你可能會喜歡的 Ayers 吉他款式 ─── */}
        <motion.div
          className="mt-10 w-[80%]"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.5 }}
        >
          <img src={`${RF}/title-ayers.webp`} alt="你可能會喜歡的Ayers吉他款式" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* 兩把吉他 — 左右各自從側邊滑入 */}
        <div className="mt-5 w-full grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, x: i === 1 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px', root: scrollRef }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={`${RF}/guitar-${i}.webp`} alt="Ayers 吉他" className="w-full h-auto" draggable={false} />
              <motion.button
                type="button"
                className="w-[80%]"
                whileTap={{ scale: 0.93 }}
              >
                <img src={`${RF}/btn-unlock-${i}.webp`} alt="解鎖它的音色" className="w-full h-auto" draggable={false} />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* ─── 靈魂顏色 — 光暈脈動 ─── */}
        <motion.div
          className="mt-10 w-[55%] relative"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute -inset-4 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${result.themeColor}30 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <img src={`${RF}/soul-color.webp`} alt={`靈魂顏色：${result.colorName}`} className="relative w-full h-auto" draggable={false} />
        </motion.div>

        <motion.div
          className="mt-3 w-[85%]"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <img src={`${RF}/text-contest-info.webp`} alt="比賽資訊" className="w-full h-auto" draggable={false} />
        </motion.div>

        {/* ─── 比賽海報 ─── */}
        <motion.div
          className="mt-6 w-[85%] overflow-hidden rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.6 }}
        >
          <img src={`${RF}/poster.webp`} alt="靈魂吉他手大賽海報" className="w-full h-auto rounded-xl" draggable={false} />
        </motion.div>

        {/* ─── 底部按鈕 ─── */}
        <motion.div
          className="mt-10 w-full flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, root: scrollRef }}
          transition={{ duration: 0.5 }}
        >
          {/* 分享按鈕 — 金色呼吸光暈 */}
          <motion.button
            type="button"
            onClick={handleShare}
            className="w-[70%] relative"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute -inset-1 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(218,165,50,0.3) 0%, transparent 70%)' }}
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.97, 1.03, 0.97] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <img src={`${RF}/btn-share.webp`} alt="分享你的測驗結果" className="relative w-full h-auto" draggable={false} />
            {copied && (
              <motion.span
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontFamily: QUIZ_FONT }}
              >
                已複製到剪貼簿
              </motion.span>
            )}
          </motion.button>
          <motion.button type="button" onClick={onRetry} className="w-[45%]" whileTap={{ scale: 0.93 }}>
            <img src={`${RF}/btn-retry.webp`} alt="再測一次" className="w-full h-auto" draggable={false} />
          </motion.button>
          <Link to="/e/soul-guitar/info" className="w-[70%] active:scale-95 transition-transform">
            <img src={`${RF}/btn-contest.webp`} alt="前往了解靈魂吉他手大賽" className="w-full h-auto" draggable={false} />
          </Link>
        </motion.div>

        {/* 底部留白 */}
        <div className="h-8" />

        </div>{/* end px-5 wrapper */}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   主元件
   ────────────────────────────────────── */
export default function SoulGuitarQuiz() {
  const isDesktop = useIsDesktop();
  const [phase, setPhase] = useState<'cover' | 'loading' | 'quiz' | 'result-loading' | 'result'>('cover');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [tapped, setTapped] = useState<number | null>(null);
  const [resultKey, setResultKey] = useState('');
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const question = questions[currentQ];
  const isFirstQ = currentQ === 0;

  const playBgm = () => {
    if (!bgmRef.current) {
      const audio = new Audio('/audio/quiz-bg.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      bgmRef.current = audio;
    }
    bgmRef.current.play().catch(() => {});
  };

  const handleStart = () => {
    playBgm();
    setPhase('loading');
  };

  const handleSelect = (i: number) => {
    if (tapped !== null) return;
    setTapped(i);
    const a = [...answers]; a[currentQ] = i; setAnswers(a);
    setTimeout(() => {
      setTapped(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        // 最後一題 → 計算結果 → 播角色 loading → 顯示結果
        const key = calculateResult(a);
        setResultKey(key);
        setPhase('result-loading');
      }
    }, 500);
  };

  const handlePrev = () => { if (currentQ > 0) setCurrentQ(currentQ - 1); };

  const handleRetry = () => {
    setCurrentQ(0);
    setAnswers([]);
    setTapped(null);
    setResultKey('');
    setPhase('cover');
  };

  const currentBg = phase === 'quiz' ? (isDesktop ? question.bgWide : question.bg) : `${BASE}/cover-bg.webp`;

  /* 結果 loading：全螢幕顯示角色動畫 */
  if (phase === 'result-loading') {
    return (
      <div className="w-full min-h-dvh relative flex justify-center bg-black">
        <div className="w-full max-w-[430px] relative min-h-dvh">
          <AnimatePresence>
            <ResultLoadingScreen resultKey={resultKey} onDone={() => setPhase('result')} />
          </AnimatePresence>
        </div>
      </div>
    );
  }

  /* 結果頁：獨立全螢幕滾動，不需要 16:9 容器 */
  if (phase === 'result') {
    const resultData = RESULTS[resultKey];
    return (
      <div
        className="w-full min-h-dvh relative flex justify-center"
        style={{ background: resultData ? `linear-gradient(180deg, ${resultData.themeColor}30 0%, #111 40%)` : '#111' }}
      >
        {/* 桌機：置中手機寬度欄，兩側帶主題色漸層 */}
        <div className="w-full max-w-[430px] relative min-h-dvh">
          <ResultPage resultKey={resultKey} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-dvh flex items-center justify-center relative overflow-hidden bg-black">
      {/* 模糊背景 — IG Story（手機版兩側） */}
      {!isDesktop && (
        <div className="absolute inset-0 bg-cover bg-center blur-lg scale-105 brightness-[0.35] transition-all duration-500" style={{ backgroundImage: `url(${currentBg})` }} />
      )}

      {/* ===== 容器 ===== */}
      <div
        className={isDesktop
          ? 'relative w-full overflow-hidden'
          : 'relative w-full h-dvh overflow-hidden'
        }
        style={isDesktop
          ? { height: 'min(100dvh, calc(100vw * 9 / 16))', maxWidth: 'calc(100dvh * 16 / 9)' }
          : {}
        }
      >
        <AnimatePresence>
          {phase === 'cover' && <CoverPage onStart={handleStart} isDesktop={isDesktop} />}
          {phase === 'loading' && <LoadingScreen onDone={() => setPhase('quiz')} isDesktop={isDesktop} />}
        </AnimatePresence>

        {phase === 'quiz' && (
          <>
            {/* 底層背景 — 防止切換時露出黑底 */}
            <img src={isDesktop ? question.bgWide : question.bg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            <AnimatePresence>
              <motion.div key={currentQ} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                <img src={isDesktop ? question.bgWide : question.bg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                <QuestionView question={question} currentQ={currentQ} isFirstQ={isFirstQ} tapped={tapped} onSelect={handleSelect} onPrev={handlePrev} />
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
