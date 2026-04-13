import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useState, useEffect } from 'react';
import { Guitar, Music, Trophy, Users, Star, ChevronDown, ExternalLink, FileText, X, ZoomIn, ArrowUp, Menu as MenuIcon } from 'lucide-react';
import SEO from '../components/SEO';

/* ═══════════════════════════════════════════
   2026 Ayers 靈魂吉他手大賽 — 活動簡章
   色系：深藍漸層 + 金色強調（與海報一致）
   ═══════════════════════════════════════════ */

const POSTER = '/images/events/soul-guitar-poster.jpg';
const BG_FROM = '#1a2744';
const BG_TO = '#0f1b33';
const GOLD = '#c5a059';
const GOLD_LIGHT = '#e8d5a3';
const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SIX_COLORS = [
  { name: '藍', hex: '#3b82f6' },
  { name: '紅', hex: '#ef4444' },
  { name: '黃', hex: '#facc15' },
  { name: '橘', hex: '#f97316' },
  { name: '黑', hex: '#111111' },
  { name: '白', hex: '#f5f5f5' },
];

const JUDGES = [
  { name: '四分衛-虎神', title: '吉他手 / 四分衛樂團團長', photo: '/images/events/judges/hushen.jpg' },
  { name: 'Pia 吳蓓雅', title: '創作歌手 / 木吉他手', photo: '/images/events/judges/pia.jpg' },
  { name: 'Joyce 就以斯', title: '創作歌手', photo: '/images/events/judges/joyce.jpg' },
  { name: '林小歐', title: '吉他手 / 最佳吉他手獎', photo: '/images/events/judges/linxiaoou.jpg' },
  { name: '張仲麟', title: '指彈吉他演奏家', photo: '/images/events/judges/zhangzhonglin.jpg' },
];

const AWARDS = [
  { title: '最佳彈唱獎', prize: 'AYERS 全單吉他 A07c-30th Anniversary', value: 'NT$48,800 + 獎金 NT$5,000', icon: '🏆' },
  { title: '最佳演奏獎', prize: 'AYERS 全單吉他 A07c-30th-Engelmann Anniversary（英格曼雲衫版）', value: 'NT$48,800 + 獎金 NT$5,000', icon: '🎸' },
  { title: '最佳吉他手', prize: 'AYERS 全單吉他 A07c Sun + 雲聲錄音電容麥克風', value: '市價 NT$42,000', icon: '🌟' },
  { title: '最佳 Vocal', prize: 'AYERS 全單吉他 A02c Sun + 聲潮麥克風', value: '市價 NT$26,000', icon: '🎤' },
  { title: '最佳人氣獎', prize: 'AYERS 面單彩色吉他 ST2-Color Light', value: '市價 NT$15,500', icon: '❤️' },
  { title: '評審團優選', prize: 'AYERS 與評審獎牌、吉他架與奧昇弦釘', value: '五位', icon: '🏅' },
  { title: '海馬特別獎', prize: '一年海馬91PU會員', value: '五位（海馬執行長王翰選出）', icon: '🐴' },
];

const NAV = [
  { label: '宗旨', id: 'mission' },
  { label: '時程', id: 'timeline' },
  { label: '評審', id: 'judges' },
  { label: '評分', id: 'scoring' },
  { label: '獎項', id: 'awards' },
  { label: '規則', id: 'rules' },
];

/* ── Sub-components ── */

function ColorStrip() {
  return (
    <div className="flex h-1 w-full">
      {SIX_COLORS.map((c) => <div key={c.name} className="flex-1" style={{ backgroundColor: c.hex }} />)}
    </div>
  );
}

function GoldLine() {
  return <div className="mx-auto my-16 w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)` }} />;
}

function Heading({ children, id, light = true }: { children: React.ReactNode; id?: string; light?: boolean }) {
  return (
    <motion.h2
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EXPO }}
      className={`font-serif italic font-bold text-3xl md:text-4xl text-center mb-2 ${light ? 'text-white' : 'text-white'}`}
    >
      {children}
    </motion.h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-white/25 text-[10px] tracking-[0.3em] uppercase mb-14">{children}</p>;
}

type Slice = { label: string; pct: number; desc: string; color: string };

function Donut({ slices, title, icon }: { slices: Slice[]; title: string; icon: React.ReactNode }) {
  const size = 220;
  const sw = 34;
  const r = (size - sw) / 2;
  const C = 2 * Math.PI * r;
  const labelR = r + sw / 2 + 22; // radius for % labels outside the ring

  let acc = 0;
  const arcs = slices.map((s) => {
    const startPct = acc;
    const off = C - (acc / 100) * C;
    const len = (s.pct / 100) * C;
    acc += s.pct;
    const midAngle = ((startPct + s.pct / 2) / 100) * 360 - 90; // -90 because SVG starts at top
    const rad = (midAngle * Math.PI) / 180;
    const lx = size / 2 + labelR * Math.cos(rad);
    const ly = size / 2 + labelR * Math.sin(rad);
    return { ...s, off, len, lx, ly };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EXPO }}
      className="rounded-2xl p-8 border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
    >
      <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
        {icon}
        {title}
      </h3>
      <div className="flex flex-col items-center gap-6">
        {/* Donut with % labels on slices */}
        <div className="relative" style={{ width: size + 60, height: size + 60 }}>
          <svg width={size + 60} height={size + 60} viewBox={`-30 -30 ${size + 60} ${size + 60}`}>
            {/* Background ring */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeOpacity={0.04} strokeWidth={sw} />
            {/* Slices — no rotation needed, we calculate angles manually */}
            {arcs.map((a) => (
              <motion.circle
                key={a.label} cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={a.color} strokeWidth={sw} strokeLinecap="butt"
                strokeDasharray={`${a.len} ${C - a.len}`}
                strokeDashoffset={a.off}
                className="-rotate-90 origin-center"
                style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
              />
            ))}
            {/* % labels positioned at midpoint of each arc */}
            {arcs.map((a) => (
              <text
                key={a.label + '-label'}
                x={a.lx}
                y={a.ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill={a.color}
                fontSize={a.pct >= 15 ? 13 : 11}
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
              >
                {a.pct}%
              </text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2.5">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-sm text-white/70">{s.label}</span>
              <span className="text-xs text-white/30">{s.desc}</span>
            </div>
          ))}
        </div>
        <div className="w-full pt-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-white/25">
            {slices.map((s, i) => (<span key={s.label}><span style={{ color: s.color }}>{s.label} {s.pct}%</span>{i < slices.length - 1 ? ' · ' : ''}</span>))}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ── */

export default function SoulGuitarInfo() {
  const [posterOpen, setPosterOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const barW = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 60); setShowTop(window.scrollY > 500); };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const rules = [
    '演奏組參賽者須將影片上傳至 YouTube 及 Instagram / Facebook，並將影片標題命名為「參賽曲名_姓名_演奏組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。',
    '彈唱組參賽者須將影片上傳至 YouTube 及 Instagram / Facebook，並將影片標題命名為「參賽曲名_姓名_彈唱組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。',
    '影片彈唱前需說明：「大家好我是（本名/藝名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂，（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」',
    '影片總時長需為 30 秒至 120 秒。',
    '錄製影像需為直式固定鏡頭一鏡到底，禁止合成、剪輯、運鏡、轉場效果。',
    '同一組別穿著顏色需相同（指定顏色為：橘色、黃色、藍色、黑色、白色或紅色其中一種）。',
    '參賽者須清楚露臉、至少完整上半身得以看清楚左、右手彈奏姿勢。',
    '限定參賽者自選一首中文（本土語系）、英文或演奏曲目，改編曲及原創曲均可。',
    '聲音呈現，只能出現收錄當下參賽者本人歌聲、畫面中彈奏的木吉他聲。禁止人聲合音效果器、Loop 錄音循環。',
    '限 1~5 人參賽，至少出現一把鋼弦吉他。禁止對嘴代彈，如不符合以上規定將取消比賽資格。',
    '參賽影片須於評審期間維持公開狀態，如因刪除或隱藏導致無法評分，視同放棄資格。',
    '所有評斷 Ayers 主辦官方保有最終決策權。',
  ];

  const notes = [
    '獲獎者注意事項：獎品由台灣、越南出貨仍須負擔國內外貨運費用。',
    '參賽者須注意翻唱曲目之版權規章，如遇侵權問題與主辦單位無關。',
    '影片在報名資料確認後，參賽者將同意影片授權公開於 AYERS 官方粉絲專頁 IG 與 YouTube 頻道等各網路平台，作為推廣分享之用途。',
    '參加比賽者同意本規定之效力（主辦單位保有所有權限），如遇重大不可抗之因素，主辦單位有權力中止本活動或隨時修改活動辦法及變更等價獎品。',
    '線上比賽影像呈現和聲音品質均列為評分標準。',
    '請隨時注意參賽影像是否有在 YouTube 2026Ayers靈魂吉他手大賽播放清單。',
    '每支影片對應一份表單。',
  ];

  return (
    <div className="min-h-screen text-white selection:bg-[#c5a059]/30" style={{ background: `linear-gradient(180deg, ${BG_FROM} 0%, ${BG_TO} 100%)` }}>
      <SEO title="2026 Ayers 靈魂吉他手大賽 | 活動簡章" description="拿起手中那一把吉他，展現你的靈魂性格。獎項總價值超過 NT$200,000！" />

      {/* ── Progress bar ── */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left" style={{ width: barW, backgroundColor: GOLD }} />

      {/* ── Nav ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#1a2744]/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <a href="/e/soul-guitar/info"><img src="/images/ayers-logo.svg" alt="Ayers" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-opacity" /></a>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-white/35 hover:text-white transition-colors">{n.label}</a>
            ))}
            <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer" className="ml-3 px-5 py-2 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full text-[#1a2744] transition-colors" style={{ backgroundColor: GOLD }}> 立即報名</a>
          </nav>
          <button type="button" aria-label="選單" className="md:hidden p-2 text-white/50" onClick={() => setNavOpen(true)}><MenuIcon size={20} /></button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {navOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setNavOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute right-0 top-0 bottom-0 w-72 p-6 border-l border-white/10" style={{ backgroundColor: BG_FROM }} onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-label="關閉" onClick={() => setNavOpen(false)} className="absolute top-4 right-4 text-white/30"><X size={20} /></button>
              <div className="mt-12 space-y-1">
                {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setNavOpen(false)} className="block px-4 py-3 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors">{n.label}</a>)}
                <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                  <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer" className="block text-center py-3 text-sm font-bold rounded-xl text-[#1a2744]" style={{ backgroundColor: GOLD }}>立即報名</a>
                  <a href="/e/soul-guitar" className="block text-center py-3 text-sm font-bold rounded-xl border" style={{ borderColor: GOLD + '40', color: GOLD }}>心理測驗</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {posterOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPosterOpen(false)}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} transition={{ type: 'spring', damping: 25 }} className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-label="關閉" onClick={() => setPosterOpen(false)} className="absolute -top-12 right-0 text-white/60 hover:text-white"><X size={28} /></button>
              <img src={POSTER} alt="官方海報" className="w-full h-auto rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back to top ── */}
      <AnimatePresence>
        {showTop && (
          <motion.button type="button" aria-label="回到頂部" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-dvh flex items-center overflow-hidden pt-14">
        {/* Ambient glow */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ backgroundColor: GOLD + '08' }} />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ backgroundColor: '#3b82f6' + '06' }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 items-center">
            {/* Text — 3 cols */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO }} className="md:col-span-3 order-2 md:order-1 text-center md:text-left">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-6 font-mono" style={{ color: GOLD + '90' }}>2026 Ayers Soul Guitar Competition</p>

              <h1 className="font-bold text-5xl md:text-6xl lg:text-7xl mb-2 leading-[1.1] tracking-tight text-white">靈魂吉他手</h1>
              <h1 className="font-serif italic font-bold text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.1]" style={{ color: GOLD }}>大賽</h1>

              <p className="text-base md:text-lg text-white/40 max-w-md mx-auto md:mx-0 mb-5">拿起手中那一把吉他，展現你的靈魂性格</p>

              {/* Date highlight */}
              <div className="flex items-center gap-4 justify-center md:justify-start mb-8">
                <div className="text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">開始</p>
                  <p className="text-3xl font-black" style={{ color: GOLD }}>4.22</p>
                </div>
                <div className="w-8 h-px" style={{ backgroundColor: GOLD + '40' }} />
                <div className="text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">截止</p>
                  <p className="text-3xl font-black" style={{ color: GOLD }}>6.07</p>
                </div>
                <div className="ml-2 px-3 py-1 rounded-full text-[10px] font-bold border" style={{ borderColor: GOLD + '30', color: GOLD }}>
                  限額 200 位
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-[#1a2744] hover:brightness-110 transition-all" style={{ backgroundColor: GOLD }}>
                  <FileText size={16} /> 立即報名 <ExternalLink size={11} className="opacity-40 group-hover:opacity-80" />
                </a>
                <a href="/e/soul-guitar/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm border border-white/15 text-white/70 hover:bg-white/5 transition-colors">活動報名頁</a>
                <a href="/e/soul-guitar" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm border hover:bg-white/5 transition-colors" style={{ borderColor: GOLD + '30', color: GOLD }}>
                  <Guitar size={16} /> 心理測驗
                </a>
              </div>
            </motion.div>

            {/* Poster — 2 cols */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: EXPO }} className="md:col-span-2 order-1 md:order-2 flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => setPosterOpen(true)}>
                <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" style={{ backgroundColor: GOLD + '15' }} />
                <div className="absolute -inset-[2px] rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" style={{ background: `linear-gradient(180deg, ${GOLD}60, transparent)` }} />
                <img src={POSTER} alt="官方海報" className="relative w-full max-w-[320px] h-auto rounded-2xl shadow-2xl shadow-black/60 group-hover:scale-[1.015] transition-transform duration-500" />
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-2.5 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300"><ZoomIn size={18} className="text-white" /></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/15">SCROLL</span>
          <ChevronDown size={16} className="text-white/15" />
        </motion.div>
      </section>

      <ColorStrip />

      {/* ═══════════════════ MISSION ═══════════════════ */}
      <section className="py-24 md:py-32 px-4" id="mission">
        <div className="max-w-3xl mx-auto text-center">
          <Heading>大賽宗旨</Heading>
          <Sub>Our Mission</Sub>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EXPO }} className="text-base md:text-lg text-white/45 leading-[2] tracking-wide">
            在網路上有各式吉他彈唱演奏的短影音，音樂製作及推廣已經不像以往需要高成本、人力，現今吉他手除了練習琴藝、歌藝、練團，還需要網路社群平台推廣。怎麼樣在短影音吸引目光？Ayers 特此辦比賽號召世界各地琴友，讓各位靈魂吉他手們在網路相聚，展現你最獨特的風格。
          </motion.p>
        </div>
      </section>

      <GoldLine />

      {/* ═══════════════════ PLATFORM ═══════════════════ */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Heading>比賽平台</Heading>
          <Sub>Platforms</Sub>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl p-10 border border-white/[0.06] bg-white/[0.03] text-center">
            <p className="text-sm text-white/40 mb-8">將你的彈唱（限中文或英文）或演奏影片上傳至</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['YouTube', 'Instagram', 'Facebook'].map((p) => (
                <span key={p} className="px-7 py-3.5 rounded-xl text-white font-bold text-base border border-white/[0.08] bg-white/[0.03]">{p}</span>
              ))}
            </div>
            <p className="text-[11px] text-white/20 mt-8 tracking-wide">報名上限 200 位 · 依 Google 表單收件時間 · 額滿為止</p>
          </motion.div>
        </div>
      </section>

      <GoldLine />

      {/* ═══════════════════ TIMELINE ═══════════════════ */}
      <section className="py-24 md:py-32 px-4" id="timeline">
        <div className="max-w-4xl mx-auto">
          <Heading>重要時程</Heading>
          <Sub>Timeline</Sub>
          <div className="relative">
            <div className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px" style={{ backgroundColor: GOLD + '25' }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: '初賽收件', date: '4/22 – 6/7', sub: '台灣時間 23:59 截止', icon: FileText },
                { label: '比賽評審', date: '6/8 – 6/17', sub: '', icon: Users },
                { label: '得獎公佈', date: '6/29', sub: '台灣時間 21:00', icon: Trophy },
              ].map((t, i) => (
                <motion.div key={t.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7, ease: EXPO }} className="text-center">
                  <div className="relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center mx-auto mb-6" style={{ borderColor: GOLD + '40', backgroundColor: BG_FROM }}>
                    <t.icon size={18} style={{ color: GOLD }} />
                  </div>
                  <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.03] hover:-translate-y-1 transition-transform duration-500">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold tracking-[0.2em] mb-3" style={{ backgroundColor: GOLD, color: BG_FROM }}>STEP {i + 1}</span>
                    <h3 className="text-sm font-bold text-white mb-2">{t.label}</h3>
                    <p className="text-xl font-serif italic font-bold mb-1" style={{ color: GOLD }}>{t.date}</p>
                    {t.sub && <p className="text-[11px] text-white/25">{t.sub}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ColorStrip />

      {/* ═══════════════════ JUDGES ═══════════════════ */}
      <section className="py-24 md:py-32 px-4" id="judges">
        <div className="max-w-5xl mx-auto">
          <Heading>評審陣容</Heading>
          <Sub>5 Judges</Sub>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {JUDGES.map((j, i) => (
              <motion.div key={j.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease: EXPO }} className="text-center group">
                <div className="relative mx-auto mb-4 w-28 h-28 md:w-32 md:h-32">
                  <div className="absolute -inset-1 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: GOLD + '25' }} />
                  <div className="absolute -inset-[2px] rounded-full border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: GOLD + '60' }} />
                  <img
                    src={j.photo} alt={j.name}
                    className="relative w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 shadow-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                  />
                  <div className="relative w-full h-full rounded-full items-center justify-center border border-white/10 bg-white/5" style={{ display: 'none' }}>
                    <Star size={28} style={{ color: GOLD }} />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm leading-tight mb-1 group-hover:transition-colors duration-300" style={{ color: 'white' }}>{j.name}</h3>
                <p className="text-[10px] text-white/25 leading-snug">{j.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldLine />

      {/* ═══════════════════ SCORING ═══════════════════ */}
      <section className="py-24 md:py-32 px-4" id="scoring">
        <div className="max-w-5xl mx-auto">
          <Heading>評分標準</Heading>
          <Sub>Scoring Criteria</Sub>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Donut
              title="彈唱組"
              icon={<span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f6' + '18' }}><Music size={16} className="text-blue-400" /></span>}
              slices={[
                { label: 'Vocal', pct: 35, desc: '音準、動態、聲音表現', color: '#3b82f6' },
                { label: '吉他', pct: 30, desc: '內聲部編排、節奏感', color: '#f97316' },
                { label: '影音呈現', pct: 15, desc: '錄音品質、影像品質', color: '#ef4444' },
                { label: '融合度', pct: 10, desc: 'Vocal 和吉他搭配協調性', color: '#facc15' },
                { label: '風格特色', pct: 10, desc: '畫面、服裝、場景', color: GOLD },
              ]}
            />
            <Donut
              title="演奏組"
              icon={<span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f97316' + '18' }}><Guitar size={16} className="text-orange-400" /></span>}
              slices={[
                { label: '技巧', pct: 40, desc: '音色、精準度', color: '#f97316' },
                { label: '音樂性', pct: 35, desc: '旋律、和聲、節奏呈現', color: '#3b82f6' },
                { label: '影音呈現', pct: 15, desc: '錄音品質、影像品質', color: '#ef4444' },
                { label: '風格特色', pct: 10, desc: '畫面、服裝、場景', color: GOLD },
              ]}
            />
          </div>
          <p className="text-center text-[11px] text-white/20 mt-8 leading-relaxed">
            最佳彈唱獎、最佳演奏獎、最佳吉他手、最佳 Vocal 由五位評審共同評分選出<br />
            最佳人氣獎：Facebook、Instagram 讚數最高獲得 ｜ 評審團優選：五位評審各自選出
          </p>
        </div>
      </section>

      <ColorStrip />

      {/* ═══════════════════ AWARDS ═══════════════════ */}
      <section className="py-24 md:py-32 px-4" id="awards">
        <div className="max-w-5xl mx-auto">
          <Heading>獎項</Heading>
          <Sub>Awards</Sub>
          {/* Top 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {AWARDS.slice(0, 2).map((a, i) => (
              <motion.div key={a.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease: EXPO }} className="relative rounded-2xl p-8 border border-white/[0.08] bg-white/[0.03] hover:-translate-y-1 transition-transform duration-500 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: GOLD }} />
                <div className="flex items-start gap-5">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{a.title}</h3>
                    <p className="text-sm text-white/40 mb-2 leading-relaxed">{a.prize}</p>
                    <p className="text-sm font-mono font-bold" style={{ color: GOLD }}>{a.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Rest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AWARDS.slice(2).map((a, i) => (
              <motion.div key={a.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, ease: EXPO }} className="relative rounded-2xl p-6 border border-white/[0.06] bg-white/[0.03] hover:-translate-y-1 transition-transform duration-500 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: GOLD + '50' }} />
                <span className="text-2xl block mb-3">{a.icon}</span>
                <h3 className="text-base font-bold text-white mb-1">{a.title}</h3>
                <p className="text-xs text-white/35 mb-2 leading-relaxed">{a.prize}</p>
                <p className="text-xs font-mono font-bold" style={{ color: GOLD }}>{a.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldLine />

      {/* ═══════════════════ RULES ═══════════════════ */}
      <section className="py-24 md:py-32 px-4" id="rules">
        <div className="max-w-4xl mx-auto">
          <Heading>參賽規則</Heading>
          <Sub>Competition Rules</Sub>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] divide-y divide-white/[0.04] overflow-hidden">
            {rules.map((r, i) => (
              <div key={i} className="px-6 md:px-8 py-5 flex gap-4 items-start hover:bg-white/[0.02] transition-colors">
                <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold mt-0.5" style={{ backgroundColor: GOLD + '15', color: GOLD }}>{i + 1}</span>
                <p className="text-sm text-white/40 leading-relaxed">{r}</p>
              </div>
            ))}
          </motion.div>

          {/* Dress colors */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 rounded-2xl p-10 border border-white/[0.06] bg-white/[0.03]">
            <h3 className="text-base font-bold text-white mb-1 text-center">指定穿著顏色</h3>
            <p className="text-[10px] text-white/20 text-center mb-8 tracking-wide">同一組別穿著顏色需相同</p>
            <div className="flex flex-wrap justify-center gap-6">
              {SIX_COLORS.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-xl border-2 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: c.hex, borderColor: c.name === '白' || c.name === '黑' ? '#555' : c.hex + '80' }} />
                  <span className="text-[10px] text-white/30">{c.name}色</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <ColorStrip />

      {/* ═══════════════════ NOTES ═══════════════════ */}
      <section className="py-24 md:py-32 px-4" id="notes">
        <div className="max-w-4xl mx-auto">
          <Heading>注意事項</Heading>
          <Sub>Important Notes</Sub>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-3">
            {notes.map((n, i) => (
              <div key={i} className="flex gap-4 items-start rounded-xl p-5 border border-white/[0.06] bg-white/[0.03]">
                <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: GOLD + '18', color: GOLD }}>{i + 1}</span>
                <p className="text-sm text-white/40 leading-relaxed">{n}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <GoldLine />

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-28 md:py-36 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: GOLD + '06' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-white mb-4">準備好了嗎？</h2>
            <p className="text-base text-white/30 mb-12">展現你的靈魂性格，成為 2026 Ayers 靈魂吉他手</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-lg text-[#1a2744] hover:brightness-110 transition-all" style={{ backgroundColor: GOLD }}>
                <FileText size={20} /> Google 表單報名 <ExternalLink size={12} className="opacity-40 group-hover:opacity-80" />
              </a>
              <a href="/e/soul-guitar/register" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-lg border border-white/15 text-white/70 hover:bg-white/5 transition-colors">活動報名頁</a>
            </div>
            <p className="text-[10px] text-white/15 mt-10 tracking-wide">報名上限 200 位 · 依 Google 表單收件時間 · 額滿為止</p>
          </motion.div>
        </div>
      </section>

      <ColorStrip />

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="py-10 px-4" style={{ backgroundColor: BG_TO }}>
        <div className="max-w-4xl mx-auto text-center">
          <img src="/images/ayers-logo.svg" alt="Ayers" className="h-7 mx-auto brightness-0 invert opacity-20 mb-4" />
          <p className="text-[10px] text-white/10 tracking-wide">&copy; 2026 Ayers Guitars. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-3">
            <a href="https://ayersguitars.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/15 hover:text-white/30 transition-colors tracking-widest uppercase">Official Site</a>
            <a href="/e/soul-guitar" className="text-[10px] text-white/15 hover:text-white/30 transition-colors tracking-widest uppercase">心理測驗</a>
            <a href="/e/soul-guitar/register" className="text-[10px] text-white/15 hover:text-white/30 transition-colors tracking-widest uppercase">活動報名</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
