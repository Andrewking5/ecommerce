import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Guitar, Music, Trophy, Users, FileText, X, ZoomIn, ExternalLink, Star, Hash, MessageCircle, Camera, Clock } from 'lucide-react';
import SEO from '../components/SEO';

const POSTER = '/images/events/soul-guitar-poster.jpg';
const GOLD = '#c5a059';

const SIX = [
  { n: '藍', h: '#3b82f6' }, { n: '紅', h: '#ef4444' }, { n: '黃', h: '#facc15' },
  { n: '橘', h: '#f97316' }, { n: '黑', h: '#111' }, { n: '白', h: '#f5f5f5' },
];

const JUDGES = [
  { name: '四分衛-虎神', title: '吉他手 / 四分衛樂團團長', photo: '/images/events/judges/hushen.jpg', ig: 'https://www.instagram.com/quarterback_band/' },
  { name: 'Pia 吳蓓雅', title: '創作歌手 / 木吉他手', photo: '/images/events/judges/pia.jpg', ig: 'https://www.instagram.com/piaxstudio/' },
  { name: 'Joyce 就以斯', title: '創作歌手', photo: '/images/events/judges/joyce.jpg', ig: 'https://www.instagram.com/joyce.ch0627/' },
  { name: '林小歐', title: '吉他手 / 最佳吉他手獎', photo: '/images/events/judges/linxiaoou.jpg', ig: 'https://www.facebook.com/novsherry/' },
  { name: '張仲麟', title: '指彈吉他演奏家', photo: '/images/events/judges/zhangzhonglin.jpg', ig: 'https://www.facebook.com/woodywoody2g/' },
];

/* Countdown hook */
function useCountdown(target: string) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setLeft({ d: 0, h: 0, m: 0 });
      setLeft({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000) });
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

/* Mini donut */
function MiniDonut({ slices, label }: { slices: { name: string; pct: number; color: string; desc: string }[]; label: string }) {
  const s = 140, sw = 22, r = (s - sw) / 2, C = 2 * Math.PI * r;
  let acc = 0;
  const arcs = slices.map((sl) => {
    const off = C - (acc / 100) * C;
    const len = (sl.pct / 100) * C;
    const mid = ((acc + sl.pct / 2) / 100) * 360 - 90;
    const rad = (mid * Math.PI) / 180;
    const lr = r + sw / 2 + 18;
    acc += sl.pct;
    return { ...sl, off, len, lx: s / 2 + lr * Math.cos(rad), ly: s / 2 + lr * Math.sin(rad) };
  });
  return (
    <div>
      <p className="text-xs font-bold text-white/80 mb-3 flex items-center gap-1.5">
        {label === '彈唱組' ? <Music size={13} className="text-blue-400" /> : <Guitar size={13} className="text-orange-400" />}
        {label}
      </p>
      <div className="flex items-start gap-4">
        <svg width={s + 40} height={s + 40} viewBox={`-20 -20 ${s + 40} ${s + 40}`} className="shrink-0">
          <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke="white" strokeOpacity={0.05} strokeWidth={sw} />
          {arcs.map((a) => (
            <circle key={a.name} cx={s / 2} cy={s / 2} r={r} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="butt"
              strokeDasharray={`${a.len} ${C - a.len}`} strokeDashoffset={a.off}
              className="-rotate-90" style={{ transformOrigin: `${s / 2}px ${s / 2}px` }} />
          ))}
          {arcs.map((a) => (
            <text key={a.name + 'l'} x={a.lx} y={a.ly} textAnchor="middle" dominantBaseline="central"
              fill={a.color} fontSize={a.pct >= 15 ? 11 : 9} fontWeight="bold" fontFamily="ui-monospace, monospace">{a.pct}%</text>
          ))}
        </svg>
        <div className="space-y-2 pt-3">
          {slices.map((sl) => (
            <div key={sl.name} className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: sl.color }} />
              <div>
                <span className="text-[11px] font-bold text-white/60">{sl.name} <span className="font-mono" style={{ color: sl.color }}>{sl.pct}%</span></span>
                <p className="text-[10px] text-white/25">{sl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Card component */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/[0.06] bg-white/[0.03] ${className}`}>{children}</div>;
}

function GoldLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-white mb-0.5 flex items-center gap-2">{children}</h2>;
}

function GoldLine() {
  return <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, ${GOLD}50, transparent)` }} />;
}

function Strip() {
  return <div className="flex h-1">{SIX.map((c) => <div key={c.n} className="flex-1" style={{ backgroundColor: c.h }} />)}</div>;
}

export default function SoulGuitarInfo() {
  const [posterOpen, setPosterOpen] = useState(false);
  const countdown = useCountdown('2026-06-07T23:59:00+08:00');
  const deadlinePassed = countdown.d === 0 && countdown.h === 0 && countdown.m === 0;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(180deg, #1a2744, #152036)' }}>
      <SEO title="2026 Ayers 靈魂吉他手大賽 | 活動簡章" description="拿起手中那一把吉他，展現你的靈魂性格。獎項總價值超過 NT$200,000！" />

      {/* Lightbox */}
      <AnimatePresence>
        {posterOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPosterOpen(false)}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-label="關閉" onClick={() => setPosterOpen(false)} className="absolute -top-10 right-0 text-white/60 hover:text-white"><X size={24} /></button>
              <img src={POSTER} alt="官方海報" className="w-full rounded-xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Strip />

      {/* ═══════════════════════════════════════════
          SECTION 1：Hero — 海報 + 所有關鍵資訊
         ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* 海報 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 flex justify-center lg:sticky lg:top-6">
            <div className="relative group cursor-pointer" onClick={() => setPosterOpen(true)}>
              <div className="absolute -inset-3 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: GOLD + '20' }} />
              <img src={POSTER} alt="官方海報" className="relative w-full max-w-[280px] rounded-xl shadow-2xl shadow-black/50 group-hover:scale-[1.01] transition-transform duration-500" />
              <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn size={16} className="text-white" /></div>
              </div>
              <p className="text-center text-[9px] text-white/20 mt-2">點擊放大海報</p>
            </div>
          </motion.div>

          {/* 右欄資訊 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-5">

            {/* 標題 */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <img src="/images/ayers-logo.svg" alt="Ayers" className="h-5 brightness-0 invert opacity-50" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-mono" style={{ color: GOLD + '80' }}>2026 Soul Guitar Competition</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">靈魂吉他手<span className="font-serif italic" style={{ color: GOLD }}>大賽</span></h1>
              <p className="text-sm text-white/35 mt-1">大聲點，讓世界聽見你的聲音！</p>
            </div>

            {/* 日期 + 倒數 + 報名 */}
            <div className="flex flex-wrap items-center gap-3">
              <Card className="flex items-center gap-3 px-4 py-2.5">
                <div className="text-center">
                  <p className="text-[8px] text-white/25 uppercase">開始</p>
                  <p className="text-lg font-black" style={{ color: GOLD }}>4.22</p>
                  <p className="text-[8px] text-white/20">Wed.</p>
                </div>
                <div className="w-4 h-px bg-white/15" />
                <div className="text-center">
                  <p className="text-[8px] text-white/25 uppercase">截止</p>
                  <p className="text-lg font-black" style={{ color: GOLD }}>6.07</p>
                  <p className="text-[8px] text-white/20">Sun.</p>
                </div>
              </Card>
              {!deadlinePassed && (
                <Card className="flex items-center gap-2 px-3 py-2">
                  <Clock size={12} className="text-red-400" />
                  <span className="text-[11px] font-mono font-bold text-red-400">{countdown.d}天 {countdown.h}時 {countdown.m}分</span>
                  <span className="text-[9px] text-white/25">截止倒數</span>
                </Card>
              )}
              <span className="text-[10px] text-white/25 px-2.5 py-1 rounded-full border border-white/10">限額 200 位</span>
            </div>

            {/* CTA 按鈕列 */}
            <div className="flex flex-wrap items-center gap-3">
              <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-bold text-[#1a2744] hover:brightness-110 transition-all shadow-lg" style={{ backgroundColor: GOLD }}>
                <FileText size={14} /> 立即報名（Google 表單）<ExternalLink size={10} className="opacity-50" />
              </a>
              <a href="/e/soul-guitar/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border border-white/15 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                活動報名頁
              </a>
              <a href="/e/soul-guitar" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border hover:bg-white/5 transition-all" style={{ borderColor: GOLD + '40', color: GOLD }}>
                <Guitar size={14} /> 心理測驗
              </a>
            </div>

            {/* 大賽宗旨 */}
            <Card className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>大賽宗旨</h3>
              <p className="text-[13px] text-white/40 leading-relaxed">
                在網路上有各式吉他彈唱演奏的短影音，音樂製作及推廣已經不像以往需要高成本、人力。怎麼樣在短影音吸引目光？Ayers 特此辦比賽號召世界各地琴友，讓各位靈魂吉他手們在網路相聚，展現你最獨特的風格。
              </p>
            </Card>

            {/* 時程 + 平台 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <GoldLabel><FileText size={14} style={{ color: GOLD }} /> 重要時程</GoldLabel>
                <GoldLine />
                <div className="space-y-2">
                  {[
                    { s: '1', l: '初賽收件', d: '4/22 – 6/7', sub: '23:59 截止' },
                    { s: '2', l: '比賽評審', d: '6/8 – 6/17', sub: '' },
                    { s: '3', l: '得獎公佈', d: '6/29', sub: '21:00 公佈' },
                  ].map((t) => (
                    <div key={t.s} className="flex items-center gap-3">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: GOLD, color: '#1a2744' }}>STEP {t.s}</span>
                      <span className="text-[12px] text-white/50">{t.l}</span>
                      <span className="text-[12px] font-bold font-serif italic ml-auto" style={{ color: GOLD }}>{t.d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <GoldLabel><Camera size={14} style={{ color: GOLD }} /> 比賽平台</GoldLabel>
                <GoldLine />
                <p className="text-[12px] text-white/35 mb-2">將你的彈唱（限中文或英文）或演奏影片上傳至：</p>
                <div className="flex flex-wrap gap-2">
                  {['YouTube', 'Instagram', 'Facebook'].map((p) => (
                    <span key={p} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 border border-white/[0.08] bg-white/[0.02]">{p}</span>
                  ))}
                </div>
                <p className="text-[10px] text-white/20 mt-2">上傳後填寫報名表單，每支影片對應一份表單</p>
              </div>
            </div>

            {/* Hashtag + 命名格式 */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash size={14} style={{ color: GOLD }} />
                <span className="text-xs font-bold text-white/70">影片標題命名格式</span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg bg-white/[0.04] px-4 py-2.5 font-mono text-[12px] text-white/60 border-l-2" style={{ borderColor: '#3b82f6' }}>
                  <span className="text-blue-400">彈唱組：</span>參賽曲名_姓名_彈唱組 <span className="font-bold text-yellow-400">#2026Ayers靈魂吉他手大賽</span>
                </div>
                <div className="rounded-lg bg-white/[0.04] px-4 py-2.5 font-mono text-[12px] text-white/60 border-l-2" style={{ borderColor: '#f97316' }}>
                  <span className="text-orange-400">演奏組：</span>參賽曲名_姓名_演奏組 <span className="font-bold text-yellow-400">#2026Ayers靈魂吉他手大賽</span>
                </div>
              </div>
              <p className="text-[10px] text-white/20 mt-2">IG / FB 貼文亦須加上 <span className="text-yellow-400/60">#2026Ayers靈魂吉他手大賽</span></p>
            </Card>

            {/* 自我介紹範本 */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={14} style={{ color: GOLD }} />
                <span className="text-xs font-bold text-white/70">影片開頭自我介紹（必說）</span>
              </div>
              <div className="rounded-lg bg-white/[0.04] px-4 py-3 text-[12px] text-white/50 leading-relaxed italic border-l-2" style={{ borderColor: GOLD }}>
                「大家好我是<span className="text-white/80">（本名/藝名）</span>，今天來參加2026Ayers靈魂吉他手大賽，報名<span className="text-white/80">（演奏組/彈唱組）</span>，我的靈魂是<span className="text-white/80">（xx）</span>吉他魂，<span className="text-white/80">（想帶給大家的一句話）</span>。比賽曲目是<span className="text-white/80">（創作者）</span>的<span className="text-white/80">（歌名）</span>。」
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Strip />

      {/* ═══════════════════════════════════════════
          SECTION 2：評審 + 評分
         ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* 評審 */}
          <div>
            <GoldLabel><Users size={14} style={{ color: GOLD }} /> 評審陣容 <span className="text-xs text-white/25 font-normal ml-1">5 Judges</span></GoldLabel>
            <GoldLine />
            <div className="space-y-4">
              {JUDGES.map((j) => (
                <div key={j.name} className="flex items-center gap-4 group">
                  <div className="relative shrink-0 w-16 h-16">
                    <img src={j.photo} alt={j.name}
                      className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-[#c5a059] shadow-md"
                      onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                    />
                    <div className="w-full h-full rounded-full items-center justify-center bg-white/5 border border-white/10" style={{ display: 'none' }}>
                      <Star size={20} style={{ color: GOLD }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-[#c5a059] transition-colors">{j.name}</p>
                    <p className="text-[11px] text-white/30">{j.title}</p>
                  </div>
                  <a href={j.ig} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[10px] text-white/20 hover:text-white/50 transition-colors border border-white/10 rounded-full px-2.5 py-1 hover:border-white/20">
                    {j.ig.includes('instagram') ? 'IG' : 'FB'} →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 評分標準 */}
          <div>
            <GoldLabel><Trophy size={14} style={{ color: GOLD }} /> 評分標準 <span className="text-xs text-white/25 font-normal ml-1">Scoring</span></GoldLabel>
            <GoldLine />
            <div className="space-y-6">
              <MiniDonut label="彈唱組" slices={[
                { name: 'Vocal', pct: 35, color: '#3b82f6', desc: '音準、動態、聲音表現' },
                { name: '吉他', pct: 30, color: '#f97316', desc: '內聲部編排、節奏感' },
                { name: '影音呈現', pct: 15, color: '#ef4444', desc: '錄音品質、影像品質' },
                { name: '融合度', pct: 10, color: '#facc15', desc: 'Vocal和吉他搭配' },
                { name: '風格特色', pct: 10, color: GOLD, desc: '畫面、服裝、場景' },
              ]} />
              <MiniDonut label="演奏組" slices={[
                { name: '技巧', pct: 40, color: '#f97316', desc: '音色、精準度' },
                { name: '音樂性', pct: 35, color: '#3b82f6', desc: '旋律、和聲、節奏呈現' },
                { name: '影音呈現', pct: 15, color: '#ef4444', desc: '錄音品質、影像品質' },
                { name: '風格特色', pct: 10, color: GOLD, desc: '畫面、服裝、場景' },
              ]} />
            </div>
            <p className="text-[9px] text-white/15 mt-4 leading-relaxed">
              最佳彈唱/演奏/吉他手/Vocal 由評審評分 ｜ 人氣獎由社群讚數 ｜ 評審優選由各評審選出
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3：獎項
         ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <GoldLabel><Trophy size={14} style={{ color: GOLD }} /> 獎項 <span className="text-xs text-white/25 font-normal ml-1">Awards · 總價值超過 NT$200,000</span></GoldLabel>
        <GoldLine />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: '🏆', t: '最佳彈唱獎', p: 'AYERS A07c-30th Anniversary 全單吉他', v: 'NT$48,800 + 獎金NT$5,000' },
            { icon: '🎸', t: '最佳演奏獎', p: 'AYERS A07c-30th-Engelmann Anniversary', v: 'NT$48,800 + 獎金NT$5,000' },
            { icon: '🌟', t: '最佳吉他手', p: 'AYERS A07c Sun + 雲聲錄音電容麥克風', v: '市價 NT$42,000' },
            { icon: '🎤', t: '最佳Vocal', p: 'AYERS A02c Sun + 聲潮麥克風', v: '市價 NT$26,000' },
          ].map((a) => (
            <Card key={a.t} className="p-4 relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-300">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: GOLD }} />
              <span className="text-xl block mb-2">{a.icon}</span>
              <p className="text-xs font-bold text-white mb-0.5">{a.t}</p>
              <p className="text-[10px] text-white/30 leading-snug mb-1.5">{a.p}</p>
              <p className="text-[11px] font-mono font-bold" style={{ color: GOLD }}>{a.v}</p>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {[
            { icon: '❤️', t: '最佳人氣獎', d: 'FB/IG 讚數最高', v: 'AYERS ST2-Color Light NT$15,500' },
            { icon: '🏅', t: '評審團優選 x5', d: '五位評審各自選出', v: '獎牌 + 吉他架 + 奧昇弦釘' },
            { icon: '🐴', t: '海馬特別獎 x5', d: '海馬執行長王翰選出', v: '一年海馬91PU會員' },
          ].map((a) => (
            <Card key={a.t} className="p-3 flex items-center gap-3">
              <span className="text-lg">{a.icon}</span>
              <div>
                <p className="text-[11px] font-bold text-white">{a.t}</p>
                <p className="text-[9px] text-white/20">{a.d}</p>
                <p className="text-[9px] font-mono" style={{ color: GOLD }}>{a.v}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Strip />

      {/* ═══════════════════════════════════════════
          SECTION 4：規則 + 注意事項 + CTA
         ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* 規則 — 3 cols */}
          <div className="lg:col-span-3">
            <GoldLabel><FileText size={14} style={{ color: GOLD }} /> 參賽規則 <span className="text-xs text-white/25 font-normal ml-1">Rules</span></GoldLabel>
            <GoldLine />
            <Card className="divide-y divide-white/[0.04] overflow-hidden">
              {[
                '影片上傳至 YouTube + IG/FB，標題依指定格式命名',
                '影片開頭需自我介紹（姓名、組別、靈魂吉他魂、曲目）',
                '影片總時長 30~120 秒',
                '直式固定鏡頭一鏡到底，禁止剪輯/運鏡/轉場',
                '同組別穿著指定顏色（藍/紅/黃/橘/黑/白 擇一）',
                '清楚露臉，至少完整上半身可看清彈奏姿勢',
                '自選一首中文/英文/演奏曲，改編曲及原創均可',
                '僅限本人歌聲 + 木吉他聲，禁止效果器/Loop',
                '限 1~5 人，至少一把鋼弦吉他，禁止對嘴代彈',
                '影片須於評審期間維持公開狀態',
                '每支影片對應一份報名表單',
                'Ayers 主辦保有最終決策權',
              ].map((r, i) => (
                <div key={i} className="px-4 py-2 flex gap-3 items-start">
                  <span className="shrink-0 w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center mt-0.5" style={{ backgroundColor: GOLD + '15', color: GOLD }}>{i + 1}</span>
                  <p className="text-[12px] text-white/40 leading-relaxed">{r}</p>
                </div>
              ))}
            </Card>

            {/* 穿著顏色 */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-white/30">指定穿著顏色：</span>
              {SIX.map((c) => (
                <div key={c.n} className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded border" style={{ backgroundColor: c.h, borderColor: c.n === '白' || c.n === '黑' ? '#555' : c.h + '80' }} />
                  <span className="text-[9px] text-white/20">{c.n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 注意事項 + CTA — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <GoldLabel><FileText size={14} style={{ color: GOLD }} /> 注意事項</GoldLabel>
              <GoldLine />
              <div className="space-y-1.5">
                {[
                  '獎品由台灣/越南出貨，獲獎者須負擔運費',
                  '翻唱曲目版權問題與主辦無關',
                  '報名後同意影片授權於 AYERS 各平台推廣',
                  '主辦保有活動修改及變更獎品之權力',
                  '影像和聲音品質均列為評分標準',
                  '請確認影片在 YouTube 播放清單中',
                  '每支影片對應一份表單',
                ].map((n, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="shrink-0 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center mt-0.5" style={{ backgroundColor: GOLD + '15', color: GOLD }}>{i + 1}</span>
                    <p className="text-[11px] text-white/30 leading-relaxed">{n}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 報名 CTA */}
            <Card className="p-6 text-center">
              <p className="text-lg font-bold text-white mb-1">準備好了嗎？</p>
              <p className="text-[11px] text-white/25 mb-5">展現你的靈魂性格，成為 2026 Ayers 靈魂吉他手</p>
              <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-7 py-3 rounded-full text-sm font-bold text-[#1a2744] hover:brightness-110 transition-all shadow-lg" style={{ backgroundColor: GOLD }}>
                <FileText size={14} /> Google 表單報名 <ExternalLink size={10} className="opacity-50" />
              </a>
              <div className="flex justify-center gap-4 mt-4">
                <a href="/e/soul-guitar/register" className="text-[11px] text-white/30 hover:text-white/60 underline underline-offset-2 transition-colors">活動報名頁</a>
                <a href="/e/soul-guitar" className="text-[11px] underline underline-offset-2 hover:brightness-125 transition-colors" style={{ color: GOLD }}>心理測驗</a>
              </div>
            </Card>

            {/* 官方連結 */}
            <div>
              <p className="text-[10px] text-white/20 mb-2">官方連結</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'ayersguitars.com', url: 'https://ayersguitars.com' },
                  { label: 'Instagram', url: 'https://www.instagram.com/ayersguitars/' },
                  { label: 'Facebook', url: 'https://www.facebook.com/ayersguitars/' },
                  { label: 'YouTube', url: 'https://www.youtube.com/@ayersguitars' },
                ].map((l) => (
                  <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/20 hover:text-white/40 border border-white/10 rounded-full px-2.5 py-1 hover:border-white/20 transition-all">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Strip />

      {/* Footer */}
      <footer className="py-5 px-4 text-center" style={{ backgroundColor: '#0d1626' }}>
        <img src="/images/ayers-logo.svg" alt="Ayers" className="h-5 mx-auto brightness-0 invert opacity-15 mb-2" />
        <p className="text-[9px] text-white/10">&copy; 2026 Ayers Guitars. All rights reserved.</p>
      </footer>
    </div>
  );
}
