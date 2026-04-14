import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { X, ZoomIn, ExternalLink, Star, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';

/* ═══════════════════════════════════════════════════
   2026 Ayers 靈魂吉他手大賽 — 活動簡章
   Inspired by: KIKK, Creative South, FlowFest
   一頁式簡章，資訊清晰、視覺大氣
   ═══════════════════════════════════════════════════ */

const POSTER = '/images/events/soul-guitar-poster.webp';
const GOLD = '#c5a059';
const DARK = '#111827';

const SIX = ['#3b82f6', '#ef4444', '#facc15', '#f97316', '#1a1a1a', '#f5f5f5'];
const SIX_NAMES = ['藍', '紅', '黃', '橘', '黑', '白'];

const JUDGES = [
  { name: '四分衛-虎神', title: '四分衛樂團 吉他手/團長', photo: '/images/events/judges/hushen.webp', link: 'https://www.instagram.com/quarterback_band/' },
  { name: 'Pia 吳蓓雅', title: '創作歌手 / 木吉他手', photo: '/images/events/judges/pia.webp', link: 'https://www.instagram.com/piaxstudio/' },
  { name: 'Joyce 就以斯', title: '創作歌手', photo: '/images/events/judges/joyce.webp', link: 'https://www.instagram.com/joyce.ch0627/' },
  { name: '林小歐', title: '吉他手 / 最佳吉他手獎', photo: '/images/events/judges/linxiaoou.webp', link: 'https://www.facebook.com/novsherry/' },
  { name: '張仲麟', title: '指彈吉他演奏家', photo: '/images/events/judges/zhangzhonglin.jpg', link: 'https://www.facebook.com/woodywoody2g/' },
];

function Strip() {
  return <div className="flex h-1.5">{SIX.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}</div>;
}

function CTA({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a href="https://forms.gle/Wat3juxXdQ6vXbAi9" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-orange-500/20" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
        立即報名 <ExternalLink size={12} className="opacity-60" />
      </a>
      <a href="/e/soul-guitar" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border-2 text-white/70 hover:bg-white/5 transition-colors" style={{ borderColor: GOLD + '50', color: GOLD }}>心理測驗</a>
    </div>
  );
}

function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return;
      setLeft({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000) });
    };
    calc(); const id = setInterval(calc, 60000); return () => clearInterval(id);
  }, [target]);
  if (left.d === 0 && left.h === 0 && left.m === 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      {left.d}天{left.h}時{left.m}分 截止
    </span>
  );
}

export default function SoulGuitarInfo() {
  const [posterOpen, setPosterOpen] = useState(false);
  const [openAward, setOpenAward] = useState<number | null>(null);

  const rules = [
    { short: '影片上傳 YouTube + IG/FB', full: '並將影片標題命名為「參賽曲名_姓名_組別 #2026Ayers靈魂吉他手大賽」。IG / FB 貼文亦須加上 #2026Ayers靈魂吉他手大賽。' },
    { short: '影片開頭自我介紹', full: '「大家好我是（本名/藝名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂，（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」' },
    { short: '影片 30~120 秒', full: '影片總時長需為 30 秒至 120 秒。' },
    { short: '直式一鏡到底', full: '錄製影像需為直式固定鏡頭一鏡到底，禁止合成、剪輯、運鏡、轉場效果。' },
    { short: '穿著指定顏色', full: '同一組別穿著顏色需相同（指定顏色為：橘色、黃色、藍色、黑色、白色或紅色其中一種）。' },
    { short: '露臉 + 完整上半身', full: '參賽者須清楚露臉、至少完整上半身得以看清楚左、右手彈奏姿勢。' },
    { short: '自選一首中/英文曲', full: '限定參賽者自選一首中文（本土語系）、英文或演奏曲目，改編曲及原創曲均可。' },
    { short: '禁止效果器 / Loop', full: '聲音呈現，只能出現收錄當下參賽者本人歌聲、畫面中彈奏的木吉他聲。禁止人聲合音效果器、Loop 錄音循環。' },
    { short: '1~5 人，至少一把鋼弦吉他', full: '禁止對嘴代彈，如不符合以上規定將取消比賽資格。' },
    { short: '影片須維持公開', full: '參賽影片須於評審期間維持公開狀態，如因刪除或隱藏導致無法評分，視同放棄資格。' },
    { short: '每支影片對應一份表單', full: '' },
    { short: 'Ayers 主辦保有最終決策權', full: '' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
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

      {/* ═══════════ HERO — 深藍全幅 ═══════════ */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, #1a2744, #0f1b33)` }}>
        <Strip />

        {/* Ambient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[150px]" style={{ backgroundColor: GOLD + '06' }} />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* 左：文字 */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/ayers-logo.svg" alt="Ayers" className="h-5 brightness-0 invert opacity-50" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-mono" style={{ color: GOLD }}>2026 Soul Guitar Competition</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-2">
                靈魂吉他手
              </h1>
              <h2 className="text-4xl md:text-5xl font-serif italic font-bold mb-6" style={{ color: GOLD }}>大賽</h2>

              <p className="text-lg text-white/50 mb-8 max-w-lg">大聲點，讓世界聽見你的聲音！拿起手中那一把吉他，展現你的靈魂性格。</p>

              {/* 日期 */}
              <div className="flex items-end gap-6 mb-6">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">收件開始</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: GOLD }}>4.22</p>
                </div>
                <div className="text-2xl text-white/15 font-light pb-1">—</div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">截止日期</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: GOLD }}>6.07</p>
                </div>
                <div className="pb-2">
                  <Countdown target="2026-06-07T23:59:00+08:00" />
                </div>
              </div>

              <CTA />

              <p className="text-[11px] text-white/20 mt-4">報名上限 200 位 · 依 Google 表單收件時間 · 額滿為止</p>
            </motion.div>

            {/* 右：海報 */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => setPosterOpen(true)}>
                <div className="absolute -inset-4 rounded-2xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: GOLD + '20' }} />
                <img src={POSTER} alt="官方海報" className="relative w-full max-w-[340px] rounded-2xl shadow-2xl shadow-black/50 group-hover:scale-[1.02] transition-transform duration-500" />
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-colors">
                  <div className="bg-black/50 rounded-full p-3 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all"><ZoomIn size={20} className="text-white" /></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <Strip />
      </section>

      {/* ═══════════ 快速資訊帶 ═══════════ */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: '比賽平台', value: 'YouTube · IG · FB' },
            { label: '評審時間', value: '6/8 – 6/17' },
            { label: '得獎公佈', value: '6/29 21:00' },
            { label: '影片長度', value: '30 – 120 秒' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-sm font-bold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ 大賽宗旨 ═══════════ */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">大賽宗旨</h3>
        <p className="text-gray-500 leading-relaxed">
          在網路上有各式吉他彈唱演奏的短影音，音樂製作及推廣已經不像以往需要高成本、人力。怎麼樣在短影音吸引目光？Ayers 特此辦比賽號召世界各地琴友，讓各位靈魂吉他手們在網路相聚，展現你最獨特的風格。
        </p>
      </section>

      {/* ═══════════ 評審 — 大照片網格 ═══════════ */}
      <section className="text-white" style={{ backgroundColor: DARK }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <h3 className="text-2xl font-bold text-center mb-2">評審陣容</h3>
          <p className="text-center text-white/30 text-sm mb-10">5 位音樂人共同評選</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {JUDGES.map((j) => (
              <a key={j.name} href={j.link} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-800">
                  <img src={j.photo} alt={j.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                  />
                  <div className="w-full h-full items-center justify-center bg-gray-800" style={{ display: 'none' }}>
                    <Star size={32} style={{ color: GOLD }} />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-bold text-white group-hover:text-[#c5a059] transition-colors">{j.name}</p>
                <p className="text-[11px] text-white/30">{j.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 評分標準 — 乾淨表格式 ═══════════ */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-center mb-2">評分標準</h3>
        <p className="text-center text-gray-400 text-sm mb-10">Scoring Criteria</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* 彈唱組 */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> 彈唱組
            </h4>
            {[
              { label: 'Vocal', desc: '音準、動態、聲音表現', pct: 35, color: '#3b82f6' },
              { label: '吉他', desc: '內聲部編排、節奏感', pct: 30, color: '#f97316' },
              { label: '影音呈現', desc: '錄音品質、影像品質', pct: 15, color: '#ef4444' },
              { label: '融合度', desc: 'Vocal 和吉他搭配', pct: 10, color: '#facc15' },
              { label: '風格特色', desc: '畫面、服裝、場景', pct: 10, color: GOLD },
            ].map((s) => (
              <div key={s.label} className="mb-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-bold">{s.label} <span className="font-normal text-gray-400 text-xs">— {s.desc}</span></span>
                  <span className="text-sm font-mono font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
          {/* 演奏組 */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" /> 演奏組
            </h4>
            {[
              { label: '技巧', desc: '音色、精準度', pct: 40, color: '#f97316' },
              { label: '音樂性', desc: '旋律、和聲、節奏', pct: 35, color: '#3b82f6' },
              { label: '影音呈現', desc: '錄音品質、影像品質', pct: 15, color: '#ef4444' },
              { label: '風格特色', desc: '畫面、服裝、場景', pct: 10, color: GOLD },
            ].map((s) => (
              <div key={s.label} className="mb-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-bold">{s.label} <span className="font-normal text-gray-400 text-xs">— {s.desc}</span></span>
                  <span className="text-sm font-mono font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-gray-300 mt-6">
          最佳彈唱/演奏/吉他手/Vocal 由評審評分 · 人氣獎由社群讚數 · 評審優選由各評審選出
        </p>
      </section>

      <Strip />

      {/* ═══════════ 獎項 ═══════════ */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: DARK }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px] pointer-events-none" style={{ backgroundColor: GOLD + '08' }} />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <h3 className="text-3xl font-black text-center mb-1">獎項</h3>
          <p className="text-center text-sm mb-4" style={{ color: GOLD }}>AWARDS — 總價值超過 NT$200,000</p>
          <p className="text-center text-[11px] text-white/20 mb-12">點擊各獎項查看詳細資訊</p>

          <div className="space-y-4">
            {[
              { id: 0, icon: '🏆', title: '最佳彈唱獎', money: 'NT$48,800 + 獎金$5,000', color: '#facc15', tag: '1ST PRIZE',
                detail: { guitar: 'AYERS A07c-30th Anniversary 全單吉他', value: '市價 NT$48,800', bonus: '獎金 NT$5,000', method: '由五位評審共同評分選出', desc: 'A07c-30th Anniversary 是 Ayers 為紀念 30 週年推出的限量款全單板木吉他，採用頂級雲杉面板搭配玫瑰木背側板，音色溫潤飽滿。' } },
              { id: 1, icon: '🎸', title: '最佳演奏獎', money: 'NT$48,800 + 獎金$5,000', color: '#f97316', tag: '1ST PRIZE',
                detail: { guitar: 'AYERS A07c-30th-Engelmann Anniversary 全單吉他（英格曼雲衫版）', value: '市價 NT$48,800', bonus: '獎金 NT$5,000', method: '由五位評審共同評分選出', desc: '英格曼雲杉面板版本，音色更加細膩通透，適合指彈演奏，是演奏家的理想之選。' } },
              { id: 2, icon: '🌟', title: '最佳吉他手', money: 'NT$42,000', color: GOLD, tag: '',
                detail: { guitar: 'AYERS A07c Sun 全單吉他 + 雲聲錄音電容麥克風一隻', value: '市價 NT$42,000', bonus: '', method: '由五位評審共同評分選出', desc: 'A07c Sun 小太陽系列，輕巧手感搭配溫暖音色。附贈雲聲錄音電容麥克風，讓你錄音也能擁有專業品質。' } },
              { id: 3, icon: '🎤', title: '最佳 Vocal', money: 'NT$26,000', color: '#3b82f6', tag: '',
                detail: { guitar: 'AYERS A02c Sun 全單吉他 + 聲潮麥克風一隻', value: '市價 NT$26,000', bonus: '', method: '由五位評審共同評分選出', desc: 'A02c Sun 入門全單板吉他，音色清亮適合彈唱。附贈聲潮麥克風，輕鬆升級你的錄音設備。' } },
              { id: 4, icon: '❤️', title: '最佳人氣獎', money: 'NT$15,500', color: '#ef4444', tag: 'POPULAR',
                detail: { guitar: 'AYERS ST2-Color Light 面單彩色吉他', value: '市價 NT$15,500', bonus: '', method: 'Facebook、Instagram 讚數最高獲得', desc: '繽紛彩色系列面單吉他，外型亮眼，音色出色，適合喜歡展現個性的吉他手。' } },
              { id: 5, icon: '🏅', title: '評審團優選', money: '5 位', color: '#a855f7', tag: 'x5',
                detail: { guitar: 'AYERS 與評審獎牌、AYERS 吉他架與奧昇弦釘', value: '', bonus: '', method: '五位評審各自選出一位', desc: '由每位評審親自挑選心目中最具潛力的參賽者，獲得專屬獎牌及 Ayers 周邊配件。' } },
              { id: 6, icon: '🐴', title: '海馬特別獎', money: '5 位', color: '#14b8a6', tag: 'x5',
                detail: { guitar: '一年海馬91PU會員', value: '', bonus: '', method: '由海馬執行長王翰選出', desc: '海馬91PU 提供專業吉他拾音器及音樂資源，一年會員讓你享受完整的音樂學習與交流服務。' } },
            ].map((a) => {
              const isOpen = openAward === a.id;
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  {/* Clickable header */}
                  <button
                    type="button"
                    onClick={() => setOpenAward(isOpen ? null : a.id)}
                    className="w-full text-left rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="h-[3px]" style={{ backgroundColor: a.color }} />
                    <div className={`flex items-center gap-4 px-6 py-5 border border-t-0 rounded-b-2xl transition-colors ${isOpen ? 'bg-white/[0.06] border-white/[0.12]' : 'bg-white/[0.03] border-white/[0.06]'}`}>
                      <span className="text-3xl">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold">{a.title}</h4>
                          {a.tag && <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: a.color + '20', color: a.color }}>{a.tag}</span>}
                        </div>
                      </div>
                      <span className="text-base font-mono font-bold shrink-0" style={{ color: GOLD }}>{a.money}</span>
                      <ChevronDown size={16} className={`text-white/30 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expandable detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-5 mx-1 mb-1 rounded-b-xl bg-white/[0.04] border border-t-0 border-white/[0.06] space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">獎品內容</p>
                              <p className="text-sm text-white/70 leading-relaxed">{a.detail.guitar}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">評選方式</p>
                              <p className="text-sm text-white/70">{a.detail.method}</p>
                            </div>
                          </div>
                          {a.detail.value && (
                            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                              <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">市價</p>
                                <p className="text-lg font-mono font-black" style={{ color: GOLD }}>{a.detail.value}</p>
                              </div>
                              {a.detail.bonus && (
                                <div>
                                  <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">加碼</p>
                                  <p className="text-lg font-mono font-black text-white/60">{a.detail.bonus}</p>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-white/25 leading-relaxed pt-1">{a.detail.desc}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <CTA />
          </div>
        </div>
      </section>

      {/* ═══════════ 影片格式說明 ═══════════ */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-center mb-8">影片格式</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 標題命名 */}
          <div className="rounded-2xl bg-gray-50 p-6">
            <h4 className="text-sm font-bold mb-3 text-gray-600 uppercase tracking-wider">影片標題命名</h4>
            <div className="space-y-2">
              <p className="font-mono text-sm bg-white rounded-lg px-4 py-3 border-l-4 border-blue-500 text-gray-700">
                <span className="text-blue-600">彈唱組：</span>曲名_姓名_彈唱組<br />
                <span className="text-yellow-600 font-bold">#2026Ayers靈魂吉他手大賽</span>
              </p>
              <p className="font-mono text-sm bg-white rounded-lg px-4 py-3 border-l-4 border-orange-500 text-gray-700">
                <span className="text-orange-600">演奏組：</span>曲名_姓名_演奏組<br />
                <span className="text-yellow-600 font-bold">#2026Ayers靈魂吉他手大賽</span>
              </p>
            </div>
          </div>

          {/* 自我介紹 */}
          <div className="rounded-2xl bg-gray-50 p-6">
            <h4 className="text-sm font-bold mb-3 text-gray-600 uppercase tracking-wider">開頭自我介紹（必說）</h4>
            <div className="bg-white rounded-lg px-4 py-3 text-sm text-gray-600 leading-relaxed border-l-4" style={{ borderColor: GOLD }}>
              「大家好我是<b>（本名/藝名）</b>，今天來參加2026Ayers靈魂吉他手大賽，報名<b>（演奏組/彈唱組）</b>，我的靈魂是<b>（xx）</b>吉他魂，<b>（想帶給大家的一句話）</b>。比賽曲目是<b>（創作者）</b>的<b>（歌名）</b>。」
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 規則 ═══════════ */}
      <section className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
          <h3 className="text-2xl font-bold text-center mb-2">參賽規則</h3>
          <p className="text-center text-gray-400 text-sm mb-8">共 {rules.length} 條規則</p>

          <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
            {rules.map((r, i) => (
              <div key={i} className="px-5 py-4 flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5" style={{ backgroundColor: GOLD + '15', color: GOLD }}>{i + 1}</span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-800">{r.short}</span>
                  {r.full && <span className="text-gray-400">{'　'}— {r.full}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* 穿著顏色 */}
          <div className="mt-6 flex items-center gap-4 justify-center flex-wrap">
            <span className="text-sm text-gray-400">指定穿著顏色：</span>
            {SIX.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg border" style={{ backgroundColor: c, borderColor: i >= 4 ? '#ccc' : c }} />
                <span className="text-xs text-gray-400">{SIX_NAMES[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 注意事項 ═══════════ */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <h3 className="text-lg font-bold mb-4 text-gray-600">注意事項</h3>
        <div className="columns-1 md:columns-2 gap-6 text-sm text-gray-400 leading-relaxed space-y-2">
          {[
            '獲獎者須負擔國內外貨運費用（獎品由台灣、越南出貨）。',
            '參賽者須注意翻唱曲目之版權規章，如遇侵權問題與主辦單位無關。',
            '報名後同意影片授權公開於 AYERS 各網路平台推廣。',
            '主辦單位保有修改活動辦法及變更獎品之權力。',
            '影像呈現和聲音品質均列為評分標準。',
            '請確認影片有在 YouTube 播放清單中。',
            '每支影片對應一份表單。',
          ].map((n, i) => (
            <p key={i} className="break-inside-avoid">{i + 1}. {n}</p>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA Footer ═══════════ */}
      <section className="text-white text-center" style={{ backgroundColor: DARK }}>
        <Strip />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
          <h3 className="text-3xl md:text-4xl font-black mb-3">準備好了嗎？</h3>
          <p className="text-white/40 mb-8">展現你的靈魂性格，成為 2026 Ayers 靈魂吉他手</p>
          <CTA className="justify-center" />
          <p className="text-[10px] text-white/15 mt-6">報名上限 200 位 · 依 Google 表單收件時間 · 額滿為止</p>

          {/* 官方連結 */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              { label: 'ayersguitars.com', url: 'https://ayersguitars.com' },
              { label: 'Instagram', url: 'https://www.instagram.com/ayersguitars/' },
              { label: 'Facebook', url: 'https://www.facebook.com/ayersguitars/' },
              { label: 'YouTube', url: 'https://www.youtube.com/@ayersguitars' },
            ].map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/20 hover:text-white/40 border border-white/10 rounded-full px-3 py-1 hover:border-white/20 transition-all">{l.label} ↗</a>
            ))}
          </div>
        </div>

        <footer className="border-t border-white/5 py-6">
          <img src="/images/ayers-logo.svg" alt="Ayers" className="h-5 mx-auto brightness-0 invert opacity-10 mb-2" />
          <p className="text-[9px] text-white/10">&copy; 2026 Ayers Guitars. All rights reserved.</p>
        </footer>
      </section>
    </div>
  );
}
