import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useState, useEffect } from 'react';
import { Guitar, Music, Trophy, Users, Star, ChevronDown, ExternalLink, FileText, X, ZoomIn, ArrowUp, Menu as MenuIcon } from 'lucide-react';
import SEO from '../components/SEO';

const POSTER_SRC = '/images/events/soul-guitar-poster.jpg';

const CONTEST_COLORS = [
  { name: '藍', hex: '#3b82f6' },
  { name: '紅', hex: '#ef4444' },
  { name: '黃', hex: '#facc15' },
  { name: '橘', hex: '#f97316' },
  { name: '黑', hex: '#1a1a1a' },
  { name: '白', hex: '#ffffff' },
];

const JUDGES = [
  { name: '四分衛-虎神', role: '吉他手 / 四分衛樂團團長', photo: '/images/events/judges/hushen.jpg', color: '#ef4444' },
  { name: 'Pia 吳蓓雅', role: '創作歌手 / 木吉他手', photo: '/images/events/judges/pia.jpg', color: '#f97316' },
  { name: 'Joyce 就以斯', role: '創作歌手', photo: '/images/events/judges/joyce.jpg', color: '#facc15' },
  { name: '林小歐', role: '吉他手 / 最佳吉他手獎', photo: '/images/events/judges/linxiaoou.jpg', color: '#3b82f6' },
  { name: '張仲麟', role: '指彈吉他演奏家', photo: '/images/events/judges/zhangzhonglin.jpg', color: '#c5a059' },
];

const AWARDS = [
  { title: '最佳彈唱獎', prize: 'AYERS 全單吉他 A07c-30th Anniversary', value: 'NT$48,800 + 獎金 NT$5,000', icon: '🏆' },
  { title: '最佳演奏獎', prize: 'AYERS 全單吉他 A07c-30th-Engelmann Anniversary（英格曼雲衫版）', value: 'NT$48,800 + 獎金 NT$5,000', icon: '🎸' },
  { title: '最佳吉他手', prize: 'AYERS 全單吉他 A07c Sun + 雲聲錄音電容麥克風一隻', value: '市價 NT$42,000', icon: '🌟' },
  { title: '最佳 Vocal', prize: 'AYERS 全單吉他 A02c Sun + 聲潮麥克風一隻', value: '市價 NT$26,000', icon: '🎤' },
  { title: '最佳人氣獎', prize: 'AYERS 面單彩色吉他 ST2-Color Light', value: '市價 NT$15,500', icon: '❤️' },
  { title: '評審團優選', prize: 'AYERS 與評審獎牌、AYERS 吉他架與奧昇弦釘', value: '五位', icon: '🏅' },
  { title: '海馬特別獎', prize: '一年海馬91PU會員', value: '五位（由海馬執行長王翰選出）', icon: '🐴' },
];

const TIMELINE = [
  { label: '初賽收件', date: '2026/4/22 – 6/7', sub: '台灣時間 23:59 截止', icon: FileText },
  { label: '比賽評審', date: '2026/6/8 – 6/17', sub: '', icon: Users },
  { label: '得獎公佈', date: '2026/6/29', sub: '台灣時間 21:00', icon: Trophy },
];

const NAV_ITEMS = [
  { label: '宗旨', href: '#mission' },
  { label: '時程', href: '#timeline' },
  { label: '評審', href: '#judges' },
  { label: '評分', href: '#scoring' },
  { label: '獎項', href: '#awards' },
  { label: '規則', href: '#rules' },
];

/* ── Shared ── */

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <motion.h2
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-3 text-ayers-ink"
    >
      {children}
    </motion.h2>
  );
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-ayers-ink/30 text-[10px] tracking-[0.3em] uppercase mb-14">{children}</p>
  );
}

function ContestColorBar() {
  return (
    <div className="flex h-1">
      {CONTEST_COLORS.map((c) => (
        <div key={c.name} className="flex-1" style={{ backgroundColor: c.hex }} />
      ))}
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-20 h-px bg-gradient-to-r from-transparent via-ayers-gold/40 to-transparent" />
    </div>
  );
}

type Slice = { label: string; pct: number; desc: string; color: string };

function DonutChart({ slices, title, icon }: { slices: Slice[]; title: string; icon: React.ReactNode }) {
  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const arcs = slices.map((s) => {
    const offset = circumference - (accumulated / 100) * circumference;
    const length = (s.pct / 100) * circumference;
    accumulated += s.pct;
    return { ...s, offset, length };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/70 rounded-2xl p-8 border border-ayers-gold/10"
    >
      <h3 className="text-xl font-serif italic font-bold mb-8 flex items-center gap-3 text-ayers-ink">
        {icon}
        {title}
      </h3>

      <div className="flex flex-col items-center gap-8">
        {/* SVG Donut */}
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Background ring */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a1a1a" strokeOpacity={0.05} strokeWidth={strokeWidth} />
            {/* Slices */}
            {arcs.map((arc) => (
              <motion.circle
                key={arc.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                initial={{ strokeDashoffset: circumference }}
                whileInView={{ strokeDashoffset: arc.offset }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-serif italic font-bold text-ayers-ink">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-3">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <div className="flex-1 flex items-baseline justify-between">
                <span className="text-sm font-bold text-ayers-ink">{s.label}</span>
                <span className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.pct}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full space-y-1.5">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-[11px] text-ayers-ink/35">
              <span className="font-bold" style={{ color: s.color }}>{s.label}</span>
              <span>— {s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ── */

export default function SoulGuitarInfo() {
  const [posterOpen, setPosterOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60);
      setShowTop(window.scrollY > 500);
    };
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
    <div className="bg-ayers-cream min-h-screen text-ayers-ink selection:bg-ayers-gold/30">
      <SEO
        title="2026 Ayers 靈魂吉他手大賽 | 活動簡章"
        description="拿起手中那一把吉他，展現你的靈魂性格。2026 Ayers Soul Guitar 靈魂吉他手大賽，獎項總價值超過 NT$200,000！"
      />

      {/* ── Scroll progress ── */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left bg-ayers-gold" style={{ width: progressWidth }} />

      {/* ── Floating Nav ── */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ${
          scrolled ? 'bg-ayers-cream/90 backdrop-blur-xl shadow-sm border-b border-ayers-gold/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <a href="/e/soul-guitar/info" className="flex items-center gap-3">
            <img src="/images/ayers-logo.svg" alt="Ayers" className="h-6 opacity-70" />
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-ayers-ink/40 hover:text-ayers-ink transition-colors">
                {item.label}
              </a>
            ))}
            <a
              href="https://forms.gle/Wat3juxXdQ6vXbAi9"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-5 py-2 text-[10px] font-bold tracking-[0.15em] uppercase bg-ayers-ink text-white rounded-full hover:bg-ayers-ink/80 transition-colors"
            >
              立即報名
            </a>
          </nav>
          <button type="button" aria-label="選單" className="md:hidden p-2 text-ayers-ink/50" onClick={() => setMobileNavOpen(true)}>
            <MenuIcon size={20} />
          </button>
        </div>
      </motion.header>

      {/* ── Mobile Nav ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] bg-ayers-ink/40 backdrop-blur-sm md:hidden" onClick={() => setMobileNavOpen(false)}>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-ayers-cream border-l border-ayers-gold/15 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" aria-label="關閉" onClick={() => setMobileNavOpen(false)} className="absolute top-4 right-4 text-ayers-ink/30 hover:text-ayers-ink"><X size={20} /></button>
              <div className="mt-12 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)} className="block px-4 py-3 text-sm text-ayers-ink/60 hover:text-ayers-ink hover:bg-ayers-gold/5 rounded-xl transition-colors">{item.label}</a>
                ))}
                <div className="pt-4 mt-4 border-t border-ayers-gold/10 space-y-3">
                  <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer" className="block text-center px-4 py-3 text-sm font-bold bg-ayers-ink text-white rounded-xl">立即報名</a>
                  <a href="/e/soul-guitar" className="block text-center px-4 py-3 text-sm font-bold text-ayers-gold border border-ayers-gold/30 rounded-xl">心理測驗</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Poster Lightbox ── */}
      <AnimatePresence>
        {posterOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-ayers-ink/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPosterOpen(false)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-label="關閉海報" onClick={() => setPosterOpen(false)} className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"><X size={28} /></button>
              <img src={POSTER_SRC} alt="2026 Ayers 靈魂吉他手大賽 官方海報" className="w-full h-auto rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back to Top ── */}
      <AnimatePresence>
        {showTop && (
          <motion.button type="button" aria-label="回到頂部" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-[80] w-10 h-10 rounded-full bg-ayers-ink text-white flex items-center justify-center shadow-lg hover:bg-ayers-ink/80 transition-colors">
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-ayers-dark">
        {/* Subtle warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-ayers-dark via-ayers-dark to-[#2a1a0e]/80" />
        {/* Ambient gold glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ayers-gold/[0.04] rounded-full blur-[150px]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:py-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 items-center">

            {/* Text — 3 cols */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-3 order-2 md:order-1 text-center md:text-left"
            >
              <p className="text-[10px] tracking-[0.4em] uppercase text-ayers-gold/60 mb-6 font-mono">
                2026 Ayers Soul Guitar Competition
              </p>
              <h1 className="font-serif italic font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-4 leading-[1.1]">
                靈魂吉他手
                <br />
                <span className="text-ayers-gold">大賽</span>
              </h1>
              <p className="text-base md:text-lg text-white/40 max-w-md mx-auto md:mx-0 mb-6 leading-relaxed">
                拿起手中那一把吉他，展現你的靈魂性格
              </p>

              {/* Info pills */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs">
                  <FileText size={11} /> 收件 4/22 – 6/7
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs">
                  <Users size={11} /> 限額 200 位
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ayers-gold/10 border border-ayers-gold/20 text-ayers-gold text-xs">
                  <Trophy size={11} /> 獎品總值 20 萬+
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a
                  href="https://forms.gle/Wat3juxXdQ6vXbAi9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-ayers-gold text-ayers-dark font-bold text-sm hover:bg-ayers-gold-light transition-colors"
                >
                  <FileText size={16} />
                  立即報名
                  <ExternalLink size={11} className="opacity-40 group-hover:opacity-80" />
                </a>
                <a href="/e/soul-guitar/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/15 text-white/70 font-bold text-sm hover:bg-white/5 transition-colors">
                  活動報名頁
                </a>
                <a href="/e/soul-guitar" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-ayers-gold/25 text-ayers-gold font-bold text-sm hover:bg-ayers-gold/5 transition-colors">
                  <Guitar size={16} /> 心理測驗
                </a>
              </div>
            </motion.div>

            {/* Poster — 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-2 order-1 md:order-2 flex justify-center"
            >
              <div className="relative group cursor-pointer" onClick={() => setPosterOpen(true)}>
                <div className="absolute -inset-4 bg-ayers-gold/[0.06] rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-b from-ayers-gold/30 via-ayers-gold/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                <img
                  src={POSTER_SRC}
                  alt="2026 Ayers 靈魂吉他手大賽 官方海報"
                  className="relative w-full max-w-[320px] h-auto rounded-2xl shadow-2xl shadow-black/50 group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-2.5 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contest color bar at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <ContestColorBar />
        </div>

        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
          <ChevronDown size={18} className="text-white/20" />
        </motion.div>
      </section>

      {/* ═══════════ MISSION ═══════════ */}
      <section className="py-24 md:py-32 px-4" id="mission">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTitle>大賽宗旨</SectionTitle>
          <SectionSub>Our Mission</SectionSub>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-ayers-ink/55 leading-[2] tracking-wide"
          >
            在網路上有各式吉他彈唱演奏的短影音，音樂製作及推廣已經不像以往需要高成本、人力，現今吉他手除了練習琴藝、歌藝、練團，還需要網路社群平台推廣。怎麼樣在短影音吸引目光？Ayers 特此辦比賽號召世界各地琴友，讓各位靈魂吉他手們在網路相聚，展現你最獨特的風格。
          </motion.p>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════ PLATFORM ═══════════ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>比賽平台</SectionTitle>
          <SectionSub>Platforms</SectionSub>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/60 rounded-2xl p-10 border border-ayers-gold/10 text-center"
          >
            <p className="text-sm text-ayers-ink/50 mb-8">
              將你的彈唱（限中文或英文）或演奏影片上傳至
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['YouTube', 'Instagram', 'Facebook'].map((p) => (
                <span key={p} className="px-7 py-3.5 rounded-xl bg-ayers-cream border border-ayers-ink/8 text-ayers-ink font-bold text-base">
                  {p}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-ayers-ink/30 mt-8 tracking-wide">
              報名上限 200 位 ・ 依 Google 表單收件時間 ・ 額滿為止
            </p>
          </motion.div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════ TIMELINE ═══════════ */}
      <section className="py-24 md:py-32 px-4" id="timeline">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>重要時程</SectionTitle>
          <SectionSub>Timeline</SectionSub>
          {/* Connected timeline */}
          <div className="relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-px bg-ayers-gold/20" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative text-center"
                >
                  {/* Circle node */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-ayers-cream border-2 border-ayers-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:border-ayers-gold transition-colors">
                    <item.icon size={20} className="text-ayers-gold" />
                  </div>
                  {/* Card */}
                  <div className="bg-white/70 rounded-2xl p-6 border border-ayers-gold/8 hover:shadow-lg hover:shadow-ayers-gold/5 hover:-translate-y-1 transition-all duration-500">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-ayers-ink text-white text-[8px] font-bold tracking-[0.2em] mb-3">STEP {i + 1}</span>
                    <h3 className="text-base font-bold text-ayers-ink mb-2">{item.label}</h3>
                    <p className="text-xl font-serif italic font-bold text-ayers-gold mb-1">{item.date}</p>
                    {item.sub && <p className="text-[11px] text-ayers-ink/30">{item.sub}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContestColorBar />

      {/* ═══════════ JUDGES ═══════════ */}
      <section className="py-24 md:py-32 px-4 bg-ayers-dark text-white" id="judges">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-3 text-white"
          >
            評審陣容
          </motion.h2>
          <p className="text-center text-white/25 text-[10px] tracking-[0.3em] uppercase mb-16">5 Judges</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {JUDGES.map((judge, i) => (
              <motion.div
                key={judge.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center group"
              >
                {/* Photo container */}
                <div className="relative mx-auto mb-5 w-28 h-28 md:w-32 md:h-32">
                  {/* Colored ring on hover */}
                  <div
                    className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                    style={{ backgroundColor: judge.color + '30' }}
                  />
                  <div
                    className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ border: `2px solid ${judge.color}50` }}
                  />
                  <img
                    src={judge.photo}
                    alt={judge.name}
                    className="relative w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 shadow-lg"
                    onError={(e) => {
                      // Fallback: show star icon if photo not found
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  {/* Fallback icon (hidden by default) */}
                  <div
                    className="relative w-full h-full rounded-full items-center justify-center bg-white/5 border border-white/10"
                    style={{ display: 'none' }}
                  >
                    <Star size={28} style={{ color: judge.color }} />
                  </div>
                </div>

                {/* Name & role */}
                <h3 className="font-bold text-white text-sm md:text-base leading-tight mb-1 group-hover:text-ayers-gold transition-colors duration-300">{judge.name}</h3>
                <p className="text-[10px] text-white/30 leading-snug">{judge.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ContestColorBar />

      {/* ═══════════ SCORING ═══════════ */}
      <section className="py-24 md:py-32 px-4" id="scoring">
        <div className="max-w-5xl mx-auto">
          <SectionTitle>評分標準</SectionTitle>
          <SectionSub>Scoring Criteria</SectionSub>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DonutChart
              title="彈唱組"
              icon={<span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Music size={18} className="text-blue-500" /></span>}
              slices={[
                { label: 'Vocal', pct: 35, desc: '音準、動態、聲音表現', color: '#3b82f6' },
                { label: '吉他', pct: 30, desc: '內聲部編排、節奏感', color: '#f97316' },
                { label: '影音呈現', pct: 15, desc: '錄音品質、影像品質', color: '#ef4444' },
                { label: '融合度', pct: 10, desc: 'Vocal 和吉他搭配協調性', color: '#facc15' },
                { label: '風格特色', pct: 10, desc: '畫面、服裝、場景', color: '#c5a059' },
              ]}
            />
            <DonutChart
              title="演奏組"
              icon={<span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center"><Guitar size={18} className="text-orange-500" /></span>}
              slices={[
                { label: '技巧', pct: 40, desc: '音色、精準度', color: '#f97316' },
                { label: '音樂性', pct: 35, desc: '旋律、和聲、節奏呈現', color: '#3b82f6' },
                { label: '影音呈現', pct: 15, desc: '錄音品質、影像品質', color: '#ef4444' },
                { label: '風格特色', pct: 10, desc: '畫面、服裝、場景', color: '#c5a059' },
              ]}
            />
          </div>

          <p className="text-center text-[11px] text-ayers-ink/25 mt-8 leading-relaxed">
            最佳彈唱獎、最佳演奏獎、最佳吉他手、最佳 Vocal 由五位評審共同評分選出
            <br />
            最佳人氣獎：Facebook、Instagram 讚數最高獲得 ｜ 評審團優選：五位評審各自選出
          </p>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════ AWARDS ═══════════ */}
      <section className="py-24 md:py-32 px-4" id="awards">
        <div className="max-w-5xl mx-auto">
          <SectionTitle>獎項</SectionTitle>
          <SectionSub>Awards</SectionSub>

          {/* Top 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {AWARDS.slice(0, 2).map((award, i) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="relative bg-white/60 rounded-2xl p-8 border border-ayers-gold/15 hover:shadow-md hover:shadow-ayers-gold/5 transition-all overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-ayers-gold" />
                <div className="flex items-start gap-5">
                  <div className="text-3xl">{award.icon}</div>
                  <div>
                    <h3 className="text-lg font-serif italic font-bold text-ayers-ink mb-1">{award.title}</h3>
                    <p className="text-sm text-ayers-ink/50 mb-2 leading-relaxed">{award.prize}</p>
                    <p className="text-sm font-mono font-bold text-ayers-gold">{award.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Rest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AWARDS.slice(2).map((award, i) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.7 }}
                className="relative bg-white/60 rounded-2xl p-6 border border-ayers-gold/10 hover:shadow-md hover:shadow-ayers-gold/5 transition-all overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-ayers-gold/30" />
                <div className="text-2xl mb-3">{award.icon}</div>
                <h3 className="text-base font-bold text-ayers-ink mb-1">{award.title}</h3>
                <p className="text-xs text-ayers-ink/45 mb-2 leading-relaxed">{award.prize}</p>
                <p className="text-xs font-mono font-bold text-ayers-gold">{award.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ContestColorBar />

      {/* ═══════════ RULES ═══════════ */}
      <section className="py-24 md:py-32 px-4 bg-ayers-dark text-white" id="rules">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-3 text-white"
          >
            參賽規則
          </motion.h2>
          <p className="text-center text-white/25 text-[10px] tracking-[0.3em] uppercase mb-14">Competition Rules</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-2xl border border-white/8 divide-y divide-white/5 overflow-hidden"
          >
            {rules.map((rule, i) => (
              <div key={i} className="px-6 md:px-8 py-5 flex gap-4 items-start hover:bg-white/[0.03] transition-colors">
                <span className="shrink-0 w-7 h-7 rounded-lg bg-ayers-gold/15 flex items-center justify-center text-[11px] font-bold text-ayers-gold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-white/50 leading-relaxed">{rule}</p>
              </div>
            ))}
          </motion.div>

          {/* Dress code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-white/5 rounded-2xl p-10 border border-white/8"
          >
            <h3 className="text-base font-serif italic font-bold text-white mb-1 text-center">指定穿著顏色</h3>
            <p className="text-[10px] text-white/20 text-center mb-8 tracking-wide">同一組別穿著顏色需相同</p>
            <div className="flex flex-wrap justify-center gap-6">
              {CONTEST_COLORS.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2 group">
                  <div
                    className="w-14 h-14 rounded-xl border-2 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: c.name === '白' ? '#555' : c.hex === '#1a1a1a' ? '#444' : c.hex + '80',
                    }}
                  />
                  <span className="text-[10px] text-white/35">{c.name}色</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <ContestColorBar />

      {/* ═══════════ NOTES ═══════════ */}
      <section className="py-24 md:py-32 px-4" id="notes">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>注意事項</SectionTitle>
          <SectionSub>Important Notes</SectionSub>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {notes.map((note, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/60 rounded-xl p-5 border border-ayers-gold/8">
                <span className="shrink-0 w-6 h-6 rounded-full bg-ayers-gold/15 flex items-center justify-center text-[10px] font-bold text-ayers-gold">
                  {i + 1}
                </span>
                <p className="text-sm text-ayers-ink/50 leading-relaxed">{note}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-28 md:py-36 px-4 bg-ayers-dark text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-ayers-gold/[0.04] rounded-full blur-[120px]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-white mb-4">
              準備好了嗎？
            </h2>
            <p className="text-base text-white/35 mb-12">展現你的靈魂性格，成為 2026 Ayers 靈魂吉他手</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://forms.gle/Wat3juxXdQ6vXbAi9"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-ayers-gold text-ayers-dark font-bold text-lg hover:bg-ayers-gold-light transition-colors"
              >
                <FileText size={20} />
                Google 表單報名
                <ExternalLink size={12} className="opacity-40 group-hover:opacity-80" />
              </a>
              <a href="/e/soul-guitar/register" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full border border-white/15 text-white/70 font-bold text-lg hover:bg-white/5 transition-colors">
                活動報名頁
              </a>
            </div>
            <p className="text-[10px] text-white/15 mt-10 tracking-wide">報名上限 200 位 ・ 依 Google 表單收件時間 ・ 額滿為止</p>
          </motion.div>
        </div>
      </section>

      <ContestColorBar />

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-10 px-4 bg-ayers-cream">
        <div className="max-w-4xl mx-auto text-center">
          <img src="/images/ayers-logo.svg" alt="Ayers Guitars" className="h-7 mx-auto opacity-25 mb-4" />
          <p className="text-[10px] text-ayers-ink/20 tracking-wide">&copy; 2026 Ayers Guitars. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-3">
            <a href="https://ayersguitars.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-ayers-ink/20 hover:text-ayers-ink/40 transition-colors tracking-widest uppercase">Official Site</a>
            <a href="/e/soul-guitar" className="text-[10px] text-ayers-ink/20 hover:text-ayers-ink/40 transition-colors tracking-widest uppercase">心理測驗</a>
            <a href="/e/soul-guitar/register" className="text-[10px] text-ayers-ink/20 hover:text-ayers-ink/40 transition-colors tracking-widest uppercase">活動報名</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
