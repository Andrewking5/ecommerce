import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Guitar, Music, Trophy, Users, FileText, X, ZoomIn, ExternalLink, Star } from 'lucide-react';
import SEO from '../components/SEO';

/* ═══════════════════════════════════════
   2026 Ayers 靈魂吉他手大賽 — 活動簡章
   緊湊單頁簡章設計，資訊密集
   ═══════════════════════════════════════ */

const POSTER = '/images/events/soul-guitar-poster.jpg';
const GOLD = '#c5a059';
const BG = '#152036';

const SIX = [
  { n: '藍', h: '#3b82f6' }, { n: '紅', h: '#ef4444' }, { n: '黃', h: '#facc15' },
  { n: '橘', h: '#f97316' }, { n: '黑', h: '#111' }, { n: '白', h: '#f5f5f5' },
];

const JUDGES = [
  { name: '四分衛-虎神', title: '四分衛樂團團長', photo: '/images/events/judges/hushen.jpg' },
  { name: 'Pia 吳蓓雅', title: '創作歌手/木吉他手', photo: '/images/events/judges/pia.jpg' },
  { name: 'Joyce 就以斯', title: '創作歌手', photo: '/images/events/judges/joyce.jpg' },
  { name: '林小歐', title: '吉他手/最佳吉他手', photo: '/images/events/judges/linxiaoou.jpg' },
  { name: '張仲麟', title: '指彈吉他演奏家', photo: '/images/events/judges/zhangzhonglin.jpg' },
];

/* Mini donut for compact layout */
function MiniDonut({ slices, label }: { slices: { name: string; pct: number; color: string }[]; label: string }) {
  const s = 130, sw = 20, r = (s - sw) / 2, C = 2 * Math.PI * r;
  let acc = 0;
  const arcs = slices.map((sl) => {
    const off = C - (acc / 100) * C;
    const len = (sl.pct / 100) * C;
    const midAngle = ((acc + sl.pct / 2) / 100) * 360 - 90;
    const rad = (midAngle * Math.PI) / 180;
    const lr = r + sw / 2 + 16;
    acc += sl.pct;
    return { ...sl, off, len, lx: s / 2 + lr * Math.cos(rad), ly: s / 2 + lr * Math.sin(rad) };
  });
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-bold text-white/80 mb-3 flex items-center gap-1.5">
        {label === '彈唱組' ? <Music size={13} className="text-blue-400" /> : <Guitar size={13} className="text-orange-400" />}
        {label}
      </p>
      <svg width={s + 40} height={s + 40} viewBox={`-20 -20 ${s + 40} ${s + 40}`}>
        <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke="white" strokeOpacity={0.05} strokeWidth={sw} />
        {arcs.map((a) => (
          <circle key={a.name} cx={s / 2} cy={s / 2} r={r} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="butt"
            strokeDasharray={`${a.len} ${C - a.len}`} strokeDashoffset={a.off}
            className="-rotate-90" style={{ transformOrigin: `${s / 2}px ${s / 2}px` }} />
        ))}
        {arcs.map((a) => (
          <text key={a.name + 'l'} x={a.lx} y={a.ly} textAnchor="middle" dominantBaseline="central"
            fill={a.color} fontSize={a.pct >= 15 ? 10 : 8} fontWeight="bold" fontFamily="ui-monospace, monospace">{a.pct}%</text>
        ))}
      </svg>
      <div className="mt-2 space-y-1">
        {slices.map((sl) => (
          <div key={sl.name} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sl.color }} />
            <span className="text-white/50">{sl.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SoulGuitarInfo() {
  const [posterOpen, setPosterOpen] = useState(false);

  return (
    <div className="min-h-screen text-white" style={{ background: `linear-gradient(180deg, #1a2744, ${BG})` }}>
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

      {/* ═══ 六色帶 ═══ */}
      <div className="flex h-1">{SIX.map((c) => <div key={c.n} className="flex-1" style={{ backgroundColor: c.h }} />)}</div>

      {/* ═══════════════════════════════════════════════
          第一區塊：Hero + 基本資訊 + 時程 + 平台
          目標：一個螢幕內看到所有關鍵資訊
         ═══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* 左欄：海報 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-1 flex justify-center lg:sticky lg:top-8">
            <div className="relative group cursor-pointer" onClick={() => setPosterOpen(true)}>
              <div className="absolute -inset-3 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: GOLD + '20' }} />
              <img src={POSTER} alt="官方海報" className="relative w-full max-w-[280px] rounded-xl shadow-2xl shadow-black/50 group-hover:scale-[1.01] transition-transform duration-500" />
              <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn size={16} className="text-white" /></div>
              </div>
            </div>
          </motion.div>

          {/* 右欄：所有關鍵資訊 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="lg:col-span-2 space-y-6">

            {/* 標題 + 日期 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/images/ayers-logo.svg" alt="Ayers" className="h-5 brightness-0 invert opacity-50" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-mono" style={{ color: GOLD + '80' }}>2026 Soul Guitar Competition</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">靈魂吉他手<span className="font-serif italic" style={{ color: GOLD }}>大賽</span></h1>
              <p className="text-sm text-white/35 mt-1">拿起手中那一把吉他，展現你的靈魂性格</p>
            </div>

            {/* 日期 + 報名 — 橫排 */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="text-center">
                  <p className="text-[8px] text-white/25 uppercase">開始</p>
                  <p className="text-lg font-black" style={{ color: GOLD }}>4.22</p>
                </div>
                <div className="w-4 h-px bg-white/15" />
                <div className="text-center">
                  <p className="text-[8px] text-white/25 uppercase">截止</p>
                  <p className="text-lg font-black" style={{ color: GOLD }}>6.07</p>
                </div>
              </div>
              <span className="text-[10px] text-white/25 px-2.5 py-1 rounded-full border border-white/10">限額 200 位</span>
              <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-[#1a2744] hover:brightness-110 transition-all" style={{ backgroundColor: GOLD }}>
                <FileText size={14} /> 立即報名 <ExternalLink size={10} className="opacity-50" />
              </a>
              <a href="/e/soul-guitar/register" className="text-sm font-bold text-white/50 hover:text-white/80 underline underline-offset-4 transition-colors">活動報名頁</a>
              <a href="/e/soul-guitar" className="text-sm font-bold hover:brightness-125 underline underline-offset-4 transition-colors" style={{ color: GOLD }}>心理測驗</a>
            </div>

            {/* 大賽宗旨 */}
            <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>大賽宗旨</h3>
              <p className="text-[13px] text-white/40 leading-relaxed">
                在網路上有各式吉他彈唱演奏的短影音，音樂製作及推廣已經不像以往需要高成本、人力。怎麼樣在短影音吸引目光？Ayers 特此辦比賽號召世界各地琴友，讓各位靈魂吉他手們在網路相聚，展現你最獨特的風格。
              </p>
            </div>

            {/* 時程 — 三欄橫排 */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>重要時程</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: '1', label: '初賽收件', date: '4/22 – 6/7', sub: '23:59 截止' },
                  { step: '2', label: '比賽評審', date: '6/8 – 6/17', sub: '' },
                  { step: '3', label: '得獎公佈', date: '6/29', sub: '21:00 公佈' },
                ].map((t) => (
                  <div key={t.step} className="rounded-lg p-3 border border-white/[0.06] bg-white/[0.02] text-center">
                    <span className="inline-block text-[8px] font-bold px-1.5 py-0.5 rounded mb-1.5" style={{ backgroundColor: GOLD, color: '#1a2744' }}>STEP {t.step}</span>
                    <p className="text-[11px] text-white/50 mb-0.5">{t.label}</p>
                    <p className="text-sm font-bold font-serif italic" style={{ color: GOLD }}>{t.date}</p>
                    {t.sub && <p className="text-[9px] text-white/20">{t.sub}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* 比賽平台 */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-white/30">比賽平台：</span>
              {['YouTube', 'Instagram', 'Facebook'].map((p) => (
                <span key={p} className="px-3 py-1 rounded-lg text-xs font-bold text-white/60 border border-white/[0.08] bg-white/[0.02]">{p}</span>
              ))}
              <span className="text-[10px] text-white/20">（上傳彈唱或演奏影片）</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="flex h-1">{SIX.map((c) => <div key={c.n} className="flex-1" style={{ backgroundColor: c.h }} />)}</div>

      {/* ═══════════════════════════════════════════════
          第二區塊：評審 + 評分標準（並排）
         ═══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* 評審 */}
          <div>
            <h2 className="text-lg font-bold text-white mb-1">評審陣容<span className="text-xs text-white/25 ml-2 font-normal">5 Judges</span></h2>
            <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
            <div className="grid grid-cols-5 gap-3">
              {JUDGES.map((j) => (
                <div key={j.name} className="text-center group">
                  <div className="relative mx-auto w-14 h-14 md:w-16 md:h-16 mb-2">
                    <img src={j.photo} alt={j.name}
                      className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-[#c5a059] shadow-md"
                      onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                    />
                    <div className="w-full h-full rounded-full items-center justify-center bg-white/5 border border-white/10" style={{ display: 'none' }}>
                      <Star size={18} style={{ color: GOLD }} />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-white/80 leading-tight">{j.name}</p>
                  <p className="text-[9px] text-white/25 leading-tight mt-0.5">{j.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 評分標準 */}
          <div>
            <h2 className="text-lg font-bold text-white mb-1">評分標準<span className="text-xs text-white/25 ml-2 font-normal">Scoring</span></h2>
            <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
            <div className="grid grid-cols-2 gap-4">
              <MiniDonut label="彈唱組" slices={[
                { name: 'Vocal 35%', pct: 35, color: '#3b82f6' },
                { name: '吉他 30%', pct: 30, color: '#f97316' },
                { name: '影音 15%', pct: 15, color: '#ef4444' },
                { name: '融合度 10%', pct: 10, color: '#facc15' },
                { name: '風格 10%', pct: 10, color: GOLD },
              ]} />
              <MiniDonut label="演奏組" slices={[
                { name: '技巧 40%', pct: 40, color: '#f97316' },
                { name: '音樂性 35%', pct: 35, color: '#3b82f6' },
                { name: '影音 15%', pct: 15, color: '#ef4444' },
                { name: '風格 10%', pct: 10, color: GOLD },
              ]} />
            </div>
            <p className="text-[9px] text-white/15 mt-3 text-center leading-relaxed">
              最佳彈唱/演奏/吉他手/Vocal 由評審評分 ｜ 人氣獎由社群讚數 ｜ 評審優選由各評審選出
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          第三區塊：獎項
         ═══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="text-lg font-bold text-white mb-1">獎項<span className="text-xs text-white/25 ml-2 font-normal">Awards · 總價值超過 NT$200,000</span></h2>
        <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: '🏆', t: '最佳彈唱獎', p: 'A07c-30th Anniversary', v: 'NT$48,800+獎金$5,000' },
            { icon: '🎸', t: '最佳演奏獎', p: 'A07c-30th-Engelmann', v: 'NT$48,800+獎金$5,000' },
            { icon: '🌟', t: '最佳吉他手', p: 'A07c Sun+雲聲麥克風', v: 'NT$42,000' },
            { icon: '🎤', t: '最佳Vocal', p: 'A02c Sun+聲潮麥克風', v: 'NT$26,000' },
          ].map((a) => (
            <div key={a.t} className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: GOLD }} />
              <div className="flex items-start gap-2">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className="text-xs font-bold text-white">{a.t}</p>
                  <p className="text-[10px] text-white/30 leading-snug mt-0.5">{a.p}</p>
                  <p className="text-[10px] font-mono font-bold mt-1" style={{ color: GOLD }}>{a.v}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 其他獎項 — 更簡潔 */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { icon: '❤️', t: '最佳人氣獎', v: 'ST2-Color Light NT$15,500' },
            { icon: '🏅', t: '評審團優選 x5', v: '獎牌+吉他架+奧昇弦釘' },
            { icon: '🐴', t: '海馬特別獎 x5', v: '一年海馬91PU會員' },
          ].map((a) => (
            <div key={a.t} className="rounded-lg p-3 border border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
              <span className="text-lg">{a.icon}</span>
              <div>
                <p className="text-[11px] font-bold text-white">{a.t}</p>
                <p className="text-[9px] text-white/25">{a.v}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex h-1">{SIX.map((c) => <div key={c.n} className="flex-1" style={{ backgroundColor: c.h }} />)}</div>

      {/* ═══════════════════════════════════════════════
          第四區塊：參賽規則 + 注意事項（雙欄）
         ═══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* 參賽規則 — 3 cols */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-bold text-white mb-1">參賽規則<span className="text-xs text-white/25 ml-2 font-normal">Rules</span></h2>
            <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04] overflow-hidden">
              {[
                '影片上傳至 YouTube + IG/FB，標題命名「曲名_姓名_組別 #2026Ayers靈魂吉他手大賽」',
                '影片開頭需自我介紹：姓名、組別、靈魂吉他魂、比賽曲目',
                '影片總時長 30~120 秒',
                '直式固定鏡頭一鏡到底，禁止剪輯/運鏡/轉場',
                '同組別穿著指定顏色（藍/紅/黃/橘/黑/白 擇一）',
                '清楚露臉，至少完整上半身可看清彈奏姿勢',
                '自選一首中文/英文/演奏曲，改編曲及原創均可',
                '僅限本人歌聲+木吉他聲，禁止效果器/Loop',
                '限 1~5 人，至少一把鋼弦吉他，禁止對嘴代彈',
                '影片須於評審期間維持公開狀態',
                '每支影片對應一份報名表單',
                'Ayers 主辦保有最終決策權',
              ].map((r, i) => (
                <div key={i} className="px-4 py-2.5 flex gap-3 items-start">
                  <span className="shrink-0 w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center mt-0.5" style={{ backgroundColor: GOLD + '15', color: GOLD }}>{i + 1}</span>
                  <p className="text-[12px] text-white/40 leading-relaxed">{r}</p>
                </div>
              ))}
            </div>

            {/* 穿著顏色 */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[11px] text-white/30">指定穿著顏色：</span>
              {SIX.map((c) => (
                <div key={c.n} className="w-6 h-6 rounded border" style={{ backgroundColor: c.h, borderColor: c.n === '白' || c.n === '黑' ? '#555' : c.h + '80' }} title={c.n + '色'} />
              ))}
            </div>
          </div>

          {/* 注意事項 — 2 cols */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-1">注意事項<span className="text-xs text-white/25 ml-2 font-normal">Notes</span></h2>
            <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
            <div className="space-y-2">
              {[
                '獎品由台灣/越南出貨，獲獎者須負擔運費',
                '翻唱曲目版權問題與主辦無關',
                '報名後同意影片授權於 AYERS 各平台推廣',
                '主辦保有活動修改及變更獎品之權力',
                '影像呈現和聲音品質均列為評分標準',
                '請確認影片在 YouTube 播放清單中',
                '每支影片對應一份表單',
              ].map((n, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="shrink-0 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center mt-0.5" style={{ backgroundColor: GOLD + '15', color: GOLD }}>{i + 1}</span>
                  <p className="text-[11px] text-white/35 leading-relaxed">{n}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-xl p-6 border border-white/[0.08] bg-white/[0.03] text-center">
              <p className="text-sm font-bold text-white mb-1">準備好了嗎？</p>
              <p className="text-[11px] text-white/25 mb-4">展現你的靈魂性格</p>
              <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-bold text-[#1a2744] hover:brightness-110 transition-all" style={{ backgroundColor: GOLD }}>
                <FileText size={14} /> Google 表單報名 <ExternalLink size={10} className="opacity-50" />
              </a>
              <div className="flex justify-center gap-4 mt-3">
                <a href="/e/soul-guitar/register" className="text-[11px] text-white/30 hover:text-white/60 underline underline-offset-2 transition-colors">活動報名頁</a>
                <a href="/e/soul-guitar" className="text-[11px] underline underline-offset-2 hover:brightness-125 transition-colors" style={{ color: GOLD }}>心理測驗</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex h-1">{SIX.map((c) => <div key={c.n} className="flex-1" style={{ backgroundColor: c.h }} />)}</div>

      {/* Footer */}
      <footer className="py-6 px-4 text-center" style={{ backgroundColor: '#0d1626' }}>
        <img src="/images/ayers-logo.svg" alt="Ayers" className="h-5 mx-auto brightness-0 invert opacity-15 mb-2" />
        <p className="text-[9px] text-white/10">&copy; 2026 Ayers Guitars · <a href="https://ayersguitars.com" className="hover:text-white/25 transition-colors">ayersguitars.com</a></p>
      </footer>
    </div>
  );
}
