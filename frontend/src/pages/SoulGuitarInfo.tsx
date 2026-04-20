import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { X, ZoomIn, Star } from 'lucide-react';
import SEO from '../components/SEO';
import eventService from '../services/eventService';

/* ═══════════════════════════════════════════════════
   2026 Ayers 靈魂吉他手大賽 — 活動簡章
   Inspired by: KIKK, Creative South, FlowFest
   一頁式簡章，資訊清晰、視覺大氣
   ═══════════════════════════════════════════════════ */

const POSTER = '/images/events/soul-guitar-poster.webp';
const GOLD = '#c5a059';
const DARK = '#111827';

const SIX = ['#3b82f6', '#ef4444', '#facc15', '#f97316'];
const SIX_NAMES = ['藍', '紅', '黃', '橘'];

const SOUL_CARDS = [
  { color: '#ef4444', colorName: '紅色', soul: '火焰吉他靈魂', tag: '帶著能量的人',          path: 'fire'       },
  { color: '#ef4444', colorName: '紅色', soul: '煙火吉他靈魂', tag: '帶著火花的創作者',       path: 'fireworks'  },
  { color: '#f97316', colorName: '橘色', soul: '太陽吉他靈魂', tag: '陽光型生活家',           path: 'sun'        },
  { color: '#facc15', colorName: '黃色', soul: '微光吉他靈魂', tag: '溫暖的傾聽者',           path: 'glow'       },
  { color: '#3b82f6', colorName: '藍色', soul: '海浪吉他靈魂', tag: '自由的探索者',           path: 'wave'       },
  { color: '#3b82f6', colorName: '藍色', soul: '深海吉他靈魂', tag: '海霧裡的觀察者',         path: 'deep-sea'   },
  { color: '#6B6B9E', colorName: '黑/白', soul: '月光吉他靈魂', tag: '安靜的思考者',          path: 'moon'       },
  { color: '#7B6BA0', colorName: '黑/白', soul: '夢月吉他靈魂', tag: '月光裡的說故事的人',    path: 'dream-moon' },
];

const JUDGES = [
  { name: '四分衛－虎神', title: '四分衛樂團 吉他手/團長', photo: '/images/events/judges/hushen.webp?v=2', link: 'https://www.instagram.com/quarterback_band/', posClass: 'object-center' },
  { name: 'PiA 吳蓓雅', title: '創作歌手', photo: '/images/events/judges/pia.webp?v=2', link: 'https://www.instagram.com/piaxstudio/', posClass: 'object-top' },
  { name: 'JOYCE 就以斯', title: '創作歌手', photo: '/images/events/judges/joyce.webp?v=2', link: 'https://www.instagram.com/joyce.ch0627/', posClass: 'object-center' },
  { name: '林小歐', title: '職業樂手', photo: '/images/events/judges/linxiaoou.webp?v=2', link: 'https://www.instagram.com/novsherry?igsh=a2NjaXFrcXN5Z2Mz', posClass: 'object-center' },
  { name: '張仲麟', title: '指彈吉他演奏家', photo: '/images/events/judges/zhangzhonglin.webp?v=2', link: 'https://www.instagram.com/chang.chung.lin?igsh=Mjd3aG5mbWprd2Z4', posClass: 'object-top' },
];

function Strip() {
  return <div className="flex h-1.5">{SIX.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}</div>;
}

function CTA({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${className}`}>
      <a href="/e/soul-guitar/register"
        className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-orange-500/20" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
        立即報名
      </a>
      <a href="/e/soul-guitar" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold border-2 text-white/70 hover:bg-white/5 transition-colors" style={{ borderColor: GOLD + '50', color: GOLD }}>心理測驗</a>
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

const DEFAULT_RULES = [
  { short: '演奏組上傳 YouTube（必須）及 Instagram / Facebook（擇一）', full: '並將影片標題命名為「參賽曲名_姓名_演奏組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。' },
  { short: '彈唱組上傳 YouTube（必須）及 Instagram / Facebook（擇一）', full: '並將影片標題命名為「參賽曲名_姓名_彈唱組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。' },
  { short: '影片彈唱前需說明', full: '「大家好我是（本名/藝名/團名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂（⚠️需與身上顏色相同），（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」' },
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

const DEFAULT_SPONSORS: Record<string, string> = {
  ayers: '', '91pu': '', soundtide: '', 'born-for-guitar': '', aosen: '', yunsound: '',
};

export default function SoulGuitarInfo() {
  const [posterOpen, setPosterOpen] = useState(false);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventMeta, setEventMeta] = useState<Record<string, unknown>>({});
  const [sponsors, setSponsors] = useState<Record<string, string>>(DEFAULT_SPONSORS);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const isEdit = window.location.search.includes('edit');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    eventService.getEventBySlug('soul-guitar/info').then((event) => {
      if (!event) return;
      setEventId(event.id);
      setEventMeta((event.metadata as Record<string, unknown>) ?? {});
      const apiRules = event?.metadata?.rules;
      if (Array.isArray(apiRules) && apiRules.length > 0) setRules(apiRules);
      const apiSponsors = event?.metadata?.sponsors;
      if (apiSponsors) setSponsors(prev => ({ ...prev, ...apiSponsors }));
    }).catch(() => {});
  }, []);

  async function saveSponsors() {
    if (!eventId) return;
    setSaving(true);
    try {
      await eventService.updateEvent(eventId, { metadata: { ...eventMeta, sponsors } });
      setSaveMsg('儲存成功！');
    } catch {
      setSaveMsg('儲存失敗，請確認已登入管理員帳號。');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  }

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
              <h2 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6">大賽</h2>

              <p className="text-lg text-white/50 mb-8 max-w-lg">大聲點，讓世界聽見你的聲音！拿起手中那一把吉他，展現你的靈魂性格。</p>

              {/* 日期 */}
              <div className="flex items-end gap-4 sm:gap-6 mb-3">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">收件開始</p>
                  <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: GOLD }}>4.22</p>
                </div>
                <div className="text-xl sm:text-2xl text-white/15 font-light pb-1">—</div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">截止日期</p>
                  <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: GOLD }}>6.07</p>
                </div>
              </div>
              <div className="mb-6">
                <Countdown target="2026-06-07T23:59:00+08:00" />
              </div>

              <CTA />

              <p className="text-sm font-bold text-orange-400 mt-4">報名上限 200 位 · 額滿為止</p>
              <p className="text-sm font-bold text-orange-400 mt-1">
                即日起報名就送 AYERS 吉他折價券！
              </p>
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
            { label: '比賽平台', value: 'YouTube + IG 或 FB' },
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
        <p className="text-lg text-gray-700 font-medium mb-4">拿起手中的吉他，展現你的靈魂性格。</p>
        <p className="text-gray-500 leading-relaxed">
          在短影音時代，各式吉他彈唱與演奏內容蓬勃發展，音樂創作與推廣不如以往需要高成本與大量人力。<br />
          現今吉他手除了精進琴藝與歌藝，更需要經營網路社群。<br />
          Ayers 特此舉辦本次比賽，號召世界各地琴友在線上相聚，展現最獨特的風格。
        </p>
      </section>

      {/* ═══════════ 活動參賽流程 ═══════════ */}
      <section className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10 sm:mb-14">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">活動參賽流程</h3>
            <p className="text-gray-400 text-sm">How to Join</p>
          </motion.div>

          {(() => {
            const STEPS = [
              { n: 1, title: '心理測驗', desc: '完成心理測驗，測出你的吉他靈魂' },
              { n: 2, title: '拍攝影片', desc: '穿上你測驗結果對應的「靈魂顏色」服裝，拍攝你的參賽影片' },
              { n: 3, title: '上傳影片', desc: '上傳至 YouTube（必須）及 IG / FB（擇一）' },
              { n: 4, title: '填寫表單', desc: '填寫報名表單，完成報名' },
              { n: 5, title: '收到 Email', desc: '收到報名成功 Email，即完成參賽' },
            ];
            return (
              <>
                {/* 桌機：橫向 */}
                <div className="hidden md:flex items-start">
                  {STEPS.map((step, idx) => (
                    <div key={step.n} className="flex items-start flex-1 min-w-0">
                      <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.12 }}
                        className="flex flex-col items-center text-center flex-1 min-w-0 px-2 group cursor-default"
                      >
                        {/* 圓圈數字 */}
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg mb-2 shadow-md group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${GOLD}, #e8b86d)` }}>
                          {step.n}
                        </div>
                        <p className="text-sm font-bold text-gray-800 mb-1">{step.title}</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{step.desc}</p>
                      </motion.div>
                      {/* 連接箭頭 */}
                      {idx < STEPS.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          whileInView={{ opacity: 1, scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: idx * 0.12 + 0.2 }}
                          className="shrink-0 flex items-center gap-0.5 mt-7 origin-left"
                        >
                          <div className="w-6 h-px bg-gray-300" />
                          <div className="text-gray-300 text-xs">▶</div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 手機：直向 */}
                <div className="flex md:hidden flex-col">
                  {STEPS.map((step, idx) => (
                    <motion.div
                      key={step.n}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: idx * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      {/* 左側：圓圈 + 連線 */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md" style={{ background: `linear-gradient(135deg, ${GOLD}, #e8b86d)` }}>
                          {step.n}
                        </div>
                        {idx < STEPS.length - 1 && (
                          <motion.div
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: idx * 0.1 + 0.25 }}
                            className="w-px flex-1 min-h-[36px] my-1 origin-top"
                            style={{ backgroundColor: GOLD + '50' }}
                          />
                        )}
                      </div>
                      {/* 右側：文字 */}
                      <div className="pb-6 pt-1.5">
                        <p className="text-sm font-bold text-gray-800 mb-0.5">{step.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ═══════════ 評審 — 大照片網格 ═══════════ */}
      <section className="text-white" style={{ backgroundColor: DARK }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <h3 className="text-2xl font-bold text-center mb-2">評審陣容</h3>
          <p className="text-center text-white/30 text-sm mb-10">5 位音樂人共同評選</p>

          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {JUDGES.map((j) => (
              <a key={j.name} href={j.link} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 bg-gray-800">
                  <img src={j.photo} alt={j.name}
                    className={`w-full h-full object-cover ${j.posClass} grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                  />
                  <div className="w-full h-full items-center justify-center bg-gray-800" style={{ display: 'none' }}>
                    <Star size={32} style={{ color: GOLD }} />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] sm:text-sm font-bold text-white group-hover:text-[#c5a059] transition-colors leading-tight">{j.name}</p>
                <p className="text-[9px] sm:text-[11px] text-white/30 leading-tight mt-0.5">{j.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 評分標準 — 乾淨表格式 ═══════════ */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-center mb-2">評分標準</h3>
        <p className="text-center text-gray-400 text-sm mb-10">Scoring Criteria</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 彈唱組 */}
          <div className="rounded-2xl bg-gray-50 p-5 sm:p-6">
            <h4 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" /> 彈唱組
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Vocal', desc: '音準、動態、聲音表現', pct: 35 },
                { label: '吉他', desc: '內聲部編排、節奏感', pct: 30 },
                { label: '融合度', desc: 'Vocal 和吉他搭配協調性', pct: 10 },
                { label: '影音呈現', desc: '錄音品質、影像品質', pct: 15 },
                { label: '風格特色', desc: '畫面、服裝、場景', pct: 10 },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                  <div className="min-w-0 mr-3">
                    <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                    <span className="text-xs text-gray-400 ml-1.5">（{s.desc}）</span>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-blue-500 tabular-nums">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 演奏組 */}
          <div className="rounded-2xl bg-gray-50 p-5 sm:p-6">
            <h4 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" /> 演奏組
            </h4>
            <div className="space-y-2">
              {[
                { label: '技巧', desc: '音色、精準度', pct: 40 },
                { label: '音樂性', desc: '旋律、和聲、節奏呈現', pct: 35 },
                { label: '影音呈現', desc: '錄音品質、影像品質', pct: 15 },
                { label: '風格特色', desc: '畫面、服裝、場景', pct: 10 },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                  <div className="min-w-0 mr-3">
                    <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                    <span className="text-xs text-gray-400 ml-1.5">（{s.desc}）</span>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-orange-500 tabular-nums">{s.pct}%</span>
                </div>
              ))}
            </div>
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
          <p className="text-center text-sm mb-12" style={{ color: GOLD }}>AWARDS — 總價值超過 NT$200,000</p>

          {/* 兩大獎 — 大卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[
              { icon: '🏆', title: '最佳彈唱獎', guitar: 'A07c-30th Anniversary', type: '全單吉他', money: '48,800', bonus: '5,000', method: '五位評審共同評分', color: '#facc15' },
              { icon: '🎸', title: '最佳演奏獎', guitar: 'A07c-30th-Engelmann Anniversary', type: '全單吉他（英格曼雲杉版）', money: '48,800', bonus: '5,000', method: '五位評審共同評分', color: '#f97316' },
            ].map((a) => (
              <div key={a.title} className="relative rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${a.color}, ${GOLD})` }} />
                <div className="p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-t-0 border-white/[0.08] rounded-b-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-4xl">{a.icon}</span>
                    <div>
                      <h4 className="text-xl font-black">{a.title}</h4>
                    </div>
                  </div>
                  <div className="space-y-2 mb-5">
                    <p className="text-sm text-white/60">AYERS {a.type}</p>
                    <p className="text-xs text-white/30">{a.guitar}</p>
                  </div>
                  <div className="flex flex-wrap items-end gap-x-1.5 gap-y-1">
                    <span className="text-[10px] text-white/25">NT$</span>
                    <span className="text-2xl sm:text-3xl font-black font-mono leading-none" style={{ color: GOLD }}>{a.money}</span>
                    <span className="text-xs sm:text-sm text-white/30">+ 獎金 NT${a.bonus}</span>
                  </div>
                  <p className="text-[10px] text-white/20 mt-3">{a.method}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 三個獎 — 中卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
            {[
              { icon: '🌟', title: '最佳吉他手', guitar: 'A07c Sun 全單吉他', extra: '+ 雲聲錄音電容麥克風', money: '42,000', method: '評審評分', color: GOLD },
              { icon: '🎤', title: '最佳 Vocal', guitar: 'A02c Sun 全單吉他', extra: '+ 聲潮麥克風', money: '26,000', method: '評審評分', color: '#3b82f6' },
              { icon: '❤️', title: '最佳人氣獎', guitar: 'ST2-Color Light 面單彩色吉他', extra: '', money: '15,500', method: 'FB/IG 讚數最高', color: '#ef4444' },
            ].map((a) => (
              <div key={a.title} className="rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="h-1" style={{ backgroundColor: a.color }} />
                <div className="p-5 bg-white/[0.03] border border-t-0 border-white/[0.06] rounded-b-2xl">
                  <span className="text-2xl block mb-2">{a.icon}</span>
                  <h4 className="text-base font-bold mb-2">{a.title}</h4>
                  <p className="text-xs text-white/40 mb-0.5">AYERS {a.guitar}</p>
                  {a.extra && <p className="text-[10px] text-white/25">{a.extra}</p>}
                  <div className="flex items-end gap-1 mt-3 mb-1">
                    <span className="text-[9px] text-white/20">NT$</span>
                    <span className="text-xl font-black font-mono leading-none" style={{ color: GOLD }}>{a.money}</span>
                  </div>
                  <p className="text-[9px] text-white/15">{a.method}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 特別獎 — 緊湊 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🏅', title: '評審團優選', n: '5 位', prize: 'AYERS 與評審獎牌、吉他架與奧昇弦釘', note: '五位評審各自選出' },
              { icon: '🐴', title: '海馬特別獎', n: '3 位', prize: '一年海馬91PU會員', note: '由海馬執行長王翰選出' },
            ].map((a) => (
              <div key={a.title} className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] flex items-start gap-3">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold">{a.title}</h4>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full border border-white/10 text-white/30">{a.n}</span>
                  </div>
                  <p className="text-xs text-white/35">{a.prize}</p>
                  <p className="text-[10px] text-white/15 mt-0.5">{a.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <CTA />
          </div>
        </div>
      </section>

      {/* ═══════════ 影片格式說明 ═══════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">影片格式</h3>

        <div className="space-y-4 sm:space-y-6">
          {/* 演奏組 */}
          <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
            <h4 className="text-xs sm:text-sm font-bold mb-4 text-gray-700">
              <span className="text-orange-500">1.</span> 演奏組上傳規則
            </h4>
            <div className="space-y-3">
              {/* YouTube */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold tracking-wide">▶ YouTube</span>
                  <span className="text-[10px] text-gray-400">必須上傳</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-1.5">影片標題命名：</p>
                <div className="font-mono text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 break-all border-l-4 border-red-400">
                  參賽曲名_姓名_演奏組 <span className="text-red-500 font-bold">#2026Ayers靈魂吉他手大賽</span>
                </div>
              </div>
              {/* IG / FB */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold tracking-wide">◆ IG / FB</span>
                  <span className="text-[10px] text-gray-400">擇一上傳</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-1.5">貼文須包含 Hashtag：</p>
                <div className="font-mono text-xs sm:text-sm text-red-500 font-bold bg-gray-50 rounded-lg px-3 py-2 break-all border-l-4 border-red-400">
                  #2026Ayers靈魂吉他手大賽
                </div>
              </div>
            </div>
          </div>

          {/* 彈唱組 */}
          <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
            <h4 className="text-xs sm:text-sm font-bold mb-4 text-gray-700">
              <span className="text-blue-500">2.</span> 彈唱組上傳規則
            </h4>
            <div className="space-y-3">
              {/* YouTube */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold tracking-wide">▶ YouTube</span>
                  <span className="text-[10px] text-gray-400">必須上傳</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-1.5">影片標題命名：</p>
                <div className="font-mono text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 break-all border-l-4 border-red-400">
                  參賽曲名_姓名_彈唱組 <span className="text-red-500 font-bold">#2026Ayers靈魂吉他手大賽</span>
                </div>
              </div>
              {/* IG / FB */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold tracking-wide">◆ IG / FB</span>
                  <span className="text-[10px] text-gray-400">擇一上傳</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-1.5">貼文須包含 Hashtag：</p>
                <div className="font-mono text-xs sm:text-sm text-red-500 font-bold bg-gray-50 rounded-lg px-3 py-2 break-all border-l-4 border-red-400">
                  #2026Ayers靈魂吉他手大賽
                </div>
              </div>
            </div>
          </div>

          {/* 開頭說明 */}
          <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
            <h4 className="text-xs sm:text-sm font-bold mb-3 text-gray-600 uppercase tracking-wider">
              <span style={{ color: GOLD }}>3.</span> 影片彈唱前需說明（必說）
            </h4>
            <div className="bg-white rounded-lg px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 leading-relaxed border-l-4" style={{ borderColor: GOLD }}>
              「大家好我是<b>（本名/藝名/團名）</b>，今天來參加2026Ayers靈魂吉他手大賽，報名<b>（演奏組/彈唱組）</b>，我的靈魂是<b>（xx）</b>吉他魂<b>（⚠️需與身上顏色相同）</b>，<b>（想帶給大家的一句話）</b>。比賽曲目是<b>（創作者）</b>的<b>（歌名）</b>。」
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 示範影片 ═══════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">示範影片</h3>
        <p className="text-center text-gray-400 text-sm mb-8">參考影片，了解如何參賽</p>

        {/* 桌機：等高並排，寬度比 = 16:9 vs 9:16 的自然比例（256:81）；手機：垂直堆疊 */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          {/* 規則影片 — 橫式 16:9 */}
          <div className="w-full sm:flex-[256] min-w-0">
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              <iframe
                src="https://www.youtube.com/embed/t_AKjJfAzGU"
                title="規則說明影片"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="px-1 pt-3">
              <p className="text-sm font-bold text-gray-800">規則說明影片</p>
              <p className="text-xs text-gray-400 mt-0.5">了解完整參賽規則與注意事項</p>
            </div>
          </div>

          {/* 口白示範 — 直式 9:16 */}
          <div className="w-full sm:flex-[81] min-w-0">
            <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-black">
              <iframe
                src="https://www.youtube.com/embed/P1IiYH3ePUU"
                title="口白示範影片"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="px-1 pt-3">
              <p className="text-sm font-bold text-gray-800">口白示範 ／ 人數示範</p>
              <p className="text-xs text-gray-400 mt-0.5">影片開頭口白說法與組別人數示範</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 規則 ═══════════ */}
      <section className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">參賽規則</h3>
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

          {/* 穿著顏色 — 靈魂 × 服裝對照 */}
          <div className="mt-8">
            <p className="text-sm font-bold text-gray-700 mb-1 text-center">測出靈魂後，請穿上對應的顏色參賽</p>
            <p className="text-[11px] text-gray-400 text-center mb-6">服裝顏色需與影片開頭自述的靈魂顏色一致</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  colors: [{ hex: '#ef4444', name: '紅色' }],
                  note: null,
                  souls: ['fire', 'fireworks'],
                  soulNames: ['火焰魂', '煙火魂'],
                  accent: '#ef4444',
                  bg: '#fef2f2',
                },
                {
                  colors: [{ hex: '#3b82f6', name: '藍色' }],
                  note: null,
                  souls: ['wave', 'deep-sea'],
                  soulNames: ['海浪魂', '深海魂'],
                  accent: '#3b82f6',
                  bg: '#eff6ff',
                },
                {
                  colors: [{ hex: '#f97316', name: '橘色' }, { hex: '#facc15', name: '黃色' }],
                  note: '橘或黃，自選其一',
                  souls: ['sun', 'glow'],
                  soulNames: ['太陽魂', '微光魂'],
                  accent: '#f97316',
                  bg: '#fff7ed',
                },
                {
                  colors: [{ hex: '#1a1a1a', name: '黑色' }, { hex: '#e5e5e5', name: '白色' }],
                  note: '黑或白，自選其一',
                  souls: ['moon', 'dream-moon'],
                  soulNames: ['月光魂', '夢月魂'],
                  accent: '#6B6B9E',
                  bg: '#f5f5f7',
                },
              ].map((group) => (
                <div key={group.souls[0]} className="rounded-2xl overflow-hidden border" style={{ borderColor: group.accent + '30', backgroundColor: group.bg }}>
                  {/* 色條 header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: group.accent + '12' }}>
                    <div className="flex items-center gap-2">
                      {group.colors.map((c) => (
                        <div key={c.hex} className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full border-2 border-white/60 shadow-sm" style={{ backgroundColor: c.hex }} />
                          <span className="text-xs font-bold" style={{ color: group.accent }}>{c.name}</span>
                        </div>
                      ))}
                      {group.note && (
                        <span className="text-[10px] text-gray-400 ml-1">（{group.note}）</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">↓ 對應靈魂</span>
                  </div>
                  {/* 兩張靈魂卡 */}
                  <div className="grid grid-cols-2 gap-3 p-3">
                    {group.souls.map((path, idx) => (
                      <a key={path} href="/e/soul-guitar" className="group block rounded-xl overflow-hidden shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <img
                          src={`/images/events/quiz/result/${path}/hero-card.webp`}
                          alt={group.soulNames[idx]}
                          className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-300 text-center mt-5">點擊卡片前往心理測驗，測出你的靈魂顏色</p>
          </div>
        </div>
      </section>

      {/* ═══════════ 注意事項 ═══════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-600">注意事項</h3>
        <div className="columns-1 md:columns-2 gap-6 text-xs sm:text-sm text-gray-400 leading-relaxed space-y-2">
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

      {/* ═══════════ 主辦 / 協辦 / 贊助 ═══════════ */}
      <section style={{ backgroundColor: DARK }}>
        <Strip />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-14">

          {/* edit 模式提示列 */}
          {isEdit && (
            <div className="flex items-center justify-between gap-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3">
              <p className="text-xs text-yellow-300 font-medium">✏️ 編輯模式 — 直接修改下方文字後點「儲存」</p>
              <div className="flex items-center gap-3 shrink-0">
                {saveMsg && <span className="text-xs text-yellow-200">{saveMsg}</span>}
                <button
                  type="button"
                  onClick={saveSponsors}
                  disabled={saving}
                  className="text-xs font-bold px-4 py-1.5 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? '儲存中…' : '儲存'}
                </button>
              </div>
            </div>
          )}

          {/* 主辦 */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-8 text-center">主辦單位</p>
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 sm:p-8">
              <img src="/images/events/sponsors/ayers.png" alt="Ayers Guitars" className="h-12 object-contain shrink-0" />
              <div className="text-center sm:text-left w-full">
                <p className="text-sm font-bold text-white mb-2">Ayers Guitars</p>
                {isEdit ? (
                  <textarea
                    className="w-full text-xs bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white/80 leading-relaxed resize-none focus:outline-none focus:border-yellow-500/50"
                    rows={3}
                    placeholder="Ayers 的介紹文字…"
                    value={sponsors.ayers}
                    onChange={e => setSponsors(p => ({ ...p, ayers: e.target.value }))}
                  />
                ) : (
                  <p className="text-xs text-white/40 leading-relaxed whitespace-pre-wrap">{sponsors.ayers || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 協辦 */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-8 text-center">協辦單位</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { img: '/images/events/sponsors/cohost-91pu.png',           alt: '91譜',       name: '91譜',                key: '91pu',           logoClass: 'h-10 scale-[1.3]' },
                { img: '/images/events/sponsors/cohost-soundtide.png',       alt: '聲潮',       name: '聲潮 SOUNDTIDE',       key: 'soundtide'       },
                { img: '/images/events/sponsors/cohost-born-for-guitar.png', alt: '生為吉他人', name: '生為吉他人 死為吉他魂', key: 'born-for-guitar' },
              ].map((u) => (
                <div key={u.alt} className="flex flex-col items-center text-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
                  <img src={u.img} alt={u.alt} className={`${(u as { logoClass?: string }).logoClass ?? 'h-10'} object-contain`} />
                  <p className="text-xs font-bold text-white">{u.name}</p>
                  {isEdit ? (
                    <textarea
                      className="w-full text-[11px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white/80 leading-relaxed resize-none focus:outline-none focus:border-yellow-500/50"
                      rows={3}
                      placeholder={`${u.name} 的介紹文字…`}
                      value={sponsors[u.key] ?? ''}
                      onChange={e => setSponsors(p => ({ ...p, [u.key]: e.target.value }))}
                    />
                  ) : (
                    <p className="text-[11px] text-white/35 leading-relaxed whitespace-pre-wrap">{sponsors[u.key] || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 贊助 */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-8 text-center">贊助單位</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { img: '/images/events/sponsors/sponsor-aosen.png',    alt: '奧昇裝置', name: '奧昇裝置 Awesome Device', key: 'aosen'    },
                { img: '/images/events/sponsors/sponsor-yunsound.png',  alt: '雲聲',     name: '雲聲 CLOUDVOCAL',           key: 'yunsound' },
              ].map((u) => (
                <div key={u.alt} className="flex flex-col items-center text-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
                  <img src={u.img} alt={u.alt} className="h-10 object-contain" />
                  <p className="text-xs font-bold text-white">{u.name}</p>
                  {isEdit ? (
                    <textarea
                      className="w-full text-[11px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white/80 leading-relaxed resize-none focus:outline-none focus:border-yellow-500/50"
                      rows={3}
                      placeholder={`${u.name} 的介紹文字…`}
                      value={sponsors[u.key] ?? ''}
                      onChange={e => setSponsors(p => ({ ...p, [u.key]: e.target.value }))}
                    />
                  ) : (
                    <p className="text-[11px] text-white/35 leading-relaxed whitespace-pre-wrap">{sponsors[u.key] || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
        <Strip />
      </section>

      {/* ═══════════ CTA Footer ═══════════ */}
      <section className="text-white text-center" style={{ backgroundColor: DARK }}>
        <Strip />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">準備好了嗎？</h3>
          <p className="text-white/40 mb-8">展現你的靈魂性格，成為 2026 Ayers 靈魂吉他手</p>
          <CTA className="justify-center" />
          <p className="text-sm font-bold text-orange-400 mt-6">報名上限 200 位 · 額滿為止</p>
          <p className="text-sm font-bold text-orange-400 mt-1">即日起報名就送 AYERS 吉他折價券！</p>

          {/* 官方連結 */}
          <div className="mt-10">
            <p className="text-[10px] text-white/20 tracking-widest uppercase mb-4">官方社群</p>
            <div className="flex justify-center gap-3">
              {[
                {
                  label: 'Facebook', url: 'https://www.facebook.com/AyersgtUluruuke',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
                },
                {
                  label: 'LINE', url: 'https://line.me/R/ti/p/@868lgkhc',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>,
                },
                {
                  label: 'Instagram', url: 'https://www.instagram.com/ayersguitartw/',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
                },
                {
                  label: 'YouTube', url: 'https://www.youtube.com/user/AyersGuitar',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
                },
              ].map((l) => (
                <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                  aria-label={l.label}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white/40 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-all duration-200"
                >
                  {l.icon}
                </a>
              ))}
            </div>
            <a href="https://ayersguitars.com" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[10px] text-white/15 hover:text-white/30 transition-colors">ayersguitars.com ↗</a>
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
