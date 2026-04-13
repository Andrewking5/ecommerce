import { motion } from 'motion/react';
import { useState } from 'react';
import { Guitar, Music, Trophy, Users, Clock, Star, ChevronDown, ExternalLink, FileText } from 'lucide-react';
import SEO from '../components/SEO';

const THEME_COLORS = [
  { name: '藍', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', hex: '#3b82f6' },
  { name: '紅', bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', hex: '#ef4444' },
  { name: '黃', bg: 'bg-yellow-400', text: 'text-yellow-500', border: 'border-yellow-400', hex: '#facc15' },
  { name: '橘', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', hex: '#f97316' },
  { name: '黑', bg: 'bg-black', text: 'text-black', border: 'border-black', hex: '#000000' },
  { name: '白', bg: 'bg-white', text: 'text-gray-700', border: 'border-gray-300', hex: '#ffffff' },
];

const JUDGES = [
  { name: '四分衛-虎神', role: '評審' },
  { name: 'Pia 吳蓓雅', role: '評審' },
  { name: 'Joyce', role: '評審' },
  { name: '林小歐', role: '評審' },
  { name: '張仲麟', role: '評審' },
];

const AWARDS = [
  {
    title: '最佳彈唱獎',
    prize: 'AYERS 全單吉他 A07c-30th Anniversary',
    value: 'NT$48,800 + 獎金 NT$5,000',
    color: 'from-yellow-400 to-orange-500',
    icon: '🏆',
  },
  {
    title: '最佳演奏獎',
    prize: 'AYERS 全單吉他 A07c-30th-Engelmann Anniversary（英格曼雲衫版）',
    value: 'NT$48,800 + 獎金 NT$5,000',
    color: 'from-orange-500 to-red-500',
    icon: '🎸',
  },
  {
    title: '最佳吉他手',
    prize: 'AYERS 全單吉他 A07c Sun + 雲聲錄音電容麥克風一隻',
    value: '市價 NT$42,000',
    color: 'from-red-500 to-pink-500',
    icon: '🌟',
  },
  {
    title: '最佳 Vocal',
    prize: 'AYERS 全單吉他 A02c Sun + 聲潮麥克風一隻',
    value: '市價 NT$26,000',
    color: 'from-blue-500 to-indigo-500',
    icon: '🎤',
  },
  {
    title: '最佳人氣獎',
    prize: 'AYERS 面單彩色吉他 ST2-Color Light',
    value: '市價 NT$15,500',
    color: 'from-pink-500 to-purple-500',
    icon: '❤️',
  },
  {
    title: '評審團優選',
    prize: 'AYERS 與評審獎牌、AYERS 吉他架與奧昇弦釘',
    value: '五位',
    color: 'from-indigo-500 to-blue-500',
    icon: '🏅',
  },
  {
    title: '海馬特別獎',
    prize: '一年海馬91PU會員',
    value: '五位（由海馬執行長王翰選出）',
    color: 'from-teal-500 to-cyan-500',
    icon: '🐴',
  },
];

const TIMELINE = [
  { label: '初賽收件', date: '2026/4/22 – 6/7', sub: '台灣時間 23:59 截止', icon: FileText },
  { label: '比賽評審', date: '2026/6/8 – 6/17', sub: '', icon: Users },
  { label: '得獎公佈', date: '2026/6/29', sub: '台灣時間 21:00', icon: Trophy },
];

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <motion.h2
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-bold text-center mb-12 text-white"
    >
      {children}
    </motion.h2>
  );
}

function ColorBar() {
  return (
    <div className="flex h-1.5 w-full">
      {THEME_COLORS.map((c) => (
        <div key={c.name} className="flex-1" style={{ backgroundColor: c.hex }} />
      ))}
    </div>
  );
}

export default function SoulGuitarInfo() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <SEO
        title="2026 Ayers 靈魂吉他手大賽 | 活動簡章"
        description="拿起手中那一把吉他，展現你的靈魂性格。2026 Ayers Soul Guitar 靈魂吉他手大賽，獎項總價值超過 NT$200,000！"
      />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-[#0a0a0a] to-red-900/30" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Color dots decoration */}
        <div className="absolute top-8 left-0 right-0 flex justify-center gap-3">
          {THEME_COLORS.map((c) => (
            <div
              key={c.name}
              className="w-3 h-3 rounded-full opacity-60"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/40 mb-6">
              2026 Ayers Guitar Competition
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-blue-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">
                靈魂吉他手
              </span>
              <br />
              <span className="text-white/90">大賽</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              拿起手中那一把吉他，展現你的靈魂性格
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://forms.gle/Wat3juxXdQ6vXbAi9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-red-500/25"
              >
                <FileText size={20} />
                立即報名
                <ExternalLink size={14} className="opacity-60" />
              </a>
              <a
                href="/e/soul-guitar/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-colors"
              >
                活動報名頁
              </a>
              <a
                href="/e/soul-guitar"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-yellow-400/30 text-yellow-400 font-bold text-lg hover:bg-yellow-400/5 transition-colors"
              >
                <Guitar size={20} />
                心理測驗
              </a>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown size={24} className="text-white/30" />
          </motion.div>
        </div>
      </section>

      <ColorBar />

      {/* ─── Mission ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <SectionTitle>大賽宗旨</SectionTitle>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl mx-auto"
          >
            在網路上有各式吉他彈唱演奏的短影音，音樂製作及推廣已經不像以往需要高成本、人力，現今吉他手除了練習琴藝、歌藝、練團，還需要網路社群平台推廣。怎麼樣在短影音吸引目光？Ayers 特此辦比賽號召世界各地琴友，讓各位靈魂吉他手們在網路相聚，展現你最獨特的風格。
          </motion.p>
        </div>
      </section>

      {/* ─── Platform ─── */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>比賽平台</SectionTitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
          >
            <p className="text-lg text-white/70 mb-6">
              將你的彈唱（限中文或英文）或演奏影片上傳至
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['YouTube', 'Instagram', 'Facebook'].map((platform) => (
                <span
                  key={platform}
                  className="px-6 py-3 rounded-full bg-white/10 text-white font-bold text-lg border border-white/10"
                >
                  {platform}
                </span>
              ))}
            </div>
            <p className="text-sm text-white/40 mt-6">
              報名上限 200 位，依 Google 表單收件時間，額滿為止
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>重要時程</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center group hover:border-white/20 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-5">
                  <item.icon size={24} className="text-white/70" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.label}</h3>
                <p className="text-2xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mb-1">
                  {item.date}
                </p>
                {item.sub && <p className="text-sm text-white/40">{item.sub}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ColorBar />

      {/* ─── Judges ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>評審陣容</SectionTitle>
          <p className="text-center text-white/40 text-sm mb-10">5 名評審</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {JUDGES.map((judge, i) => (
              <motion.div
                key={judge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center hover:border-white/20 transition-colors"
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: THEME_COLORS[i % THEME_COLORS.length].hex + '20' }}
                >
                  <Star size={24} style={{ color: THEME_COLORS[i % THEME_COLORS.length].hex }} />
                </div>
                <h3 className="font-bold text-white text-sm md:text-base">{judge.name}</h3>
                <p className="text-xs text-white/40 mt-1">{judge.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Scoring ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionTitle>評分標準</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Singing */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Music size={20} className="text-blue-400" />
                </span>
                彈唱組
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Vocal', pct: 35, desc: '音準、動態、聲音表現', color: '#3b82f6' },
                  { label: '吉他', pct: 30, desc: '內聲部編排、節奏感', color: '#f97316' },
                  { label: '融合度', pct: 10, desc: 'Vocal 和吉他搭配協調性', color: '#facc15' },
                  { label: '影音呈現', pct: 15, desc: '錄音品質、影像品質', color: '#ef4444' },
                  { label: '風格特色', pct: 10, desc: '畫面、服裝、場景', color: '#a855f7' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-bold text-white">{item.label}</span>
                      <span className="text-sm font-mono font-bold" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Instrumental */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Guitar size={20} className="text-orange-400" />
                </span>
                演奏組
              </h3>
              <div className="space-y-5">
                {[
                  { label: '技巧', pct: 40, desc: '音色、精準度', color: '#f97316' },
                  { label: '音樂性', pct: 35, desc: '旋律、和聲、節奏呈現', color: '#3b82f6' },
                  { label: '影音呈現', pct: 15, desc: '錄音品質、影像品質', color: '#ef4444' },
                  { label: '風格特色', pct: 10, desc: '畫面、服裝、場景', color: '#a855f7' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-bold text-white">{item.label}</span>
                      <span className="text-sm font-mono font-bold" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <p className="text-center text-sm text-white/30 mt-6">
            最佳彈唱獎、最佳演奏獎、最佳吉他手、最佳 Vocal 由五位評審共同評分選出
            <br />
            最佳人氣獎：Facebook、Instagram 讚數最高獲得 ｜ 評審團優選：五位評審各自選出
          </p>
        </div>
      </section>

      <ColorBar />

      {/* ─── Awards ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <SectionTitle>獎項</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AWARDS.map((award, i) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${award.color}`} />
                <div className="text-3xl mb-4">{award.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{award.title}</h3>
                <p className="text-sm text-white/60 mb-3 leading-relaxed">{award.prize}</p>
                <p className="text-xs font-mono font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  {award.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Rules ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>參賽規則</SectionTitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 divide-y divide-white/5"
          >
            {rules.map((rule, i) => (
              <div
                key={i}
                className="px-6 py-5 flex gap-4 items-start hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-red-500/20 flex items-center justify-center text-sm font-bold text-white/60">
                  {i + 1}
                </span>
                <p className={`text-sm leading-relaxed ${openFaq === i ? 'text-white/80' : 'text-white/50'} transition-colors`}>
                  {rule}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Dress code colors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-4 text-center">指定穿著顏色</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {THEME_COLORS.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-xl border-2 shadow-lg"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: c.name === '白' ? '#d1d5db' : c.hex,
                    }}
                  />
                  <span className="text-xs text-white/50">{c.name}色</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <ColorBar />

      {/* ─── Notes ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>注意事項</SectionTitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {notes.map((note, i) => (
              <div
                key={i}
                className="flex gap-4 items-start bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs font-bold text-yellow-400">
                  {i + 1}
                </span>
                <p className="text-sm text-white/60 leading-relaxed">{note}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Footer ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">
                準備好了嗎？
              </span>
            </h2>
            <p className="text-lg text-white/50 mb-10">
              展現你的靈魂性格，成為 2026 Ayers 靈魂吉他手
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://forms.gle/Wat3juxXdQ6vXbAi9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xl hover:scale-105 transition-transform shadow-lg shadow-red-500/25"
              >
                <FileText size={22} />
                Google 表單報名
                <ExternalLink size={14} className="opacity-60" />
              </a>
              <a
                href="/e/soul-guitar/register"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full border-2 border-white/20 text-white font-bold text-xl hover:bg-white/5 transition-colors"
              >
                活動報名頁
              </a>
            </div>
            <p className="text-xs text-white/30 mt-8">
              報名上限 200 位，依 Google 表單收件時間，額滿為止
            </p>
          </motion.div>
        </div>
      </section>

      <ColorBar />

      {/* Bottom spacing for footer */}
      <div className="h-4 bg-[#0a0a0a]" />
    </div>
  );
}
