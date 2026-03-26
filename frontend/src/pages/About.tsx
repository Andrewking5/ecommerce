import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Heart, Music, Award, Globe } from 'lucide-react';

const MILESTONES = [
  { year: '1989', title: 'milestones.founded', fallback: '創辦人黃振發於越南胡志明市設立工廠，最初以「Emotion」品牌從事 OEM 代工與古典吉他製作。' },
  { year: '1996', title: 'milestones.ayersBrand', fallback: '正式於越南同奈省邊和市建廠，邀請澳洲製琴師 Gerard Gilet 擔任技術顧問，創立「Ayers」品牌。' },
  { year: '2000', title: 'milestones.vintage', fallback: 'Gerard Gilet 擔任技術顧問，Vintage 系列問世。' },
  { year: '2005', title: 'milestones.andyMckee', fallback: '知名演奏家 Andy McKee 使用 Ayers 吉他。' },
  { year: '2014', title: 'milestones.balazs', fallback: '英國製琴師 Balazs Prohaszka（曾任職 Lakewood 與 Lowden）加入擔任駐廠顧問。' },
  { year: '2019', title: 'milestones.awesome', fallback: '技術創新突破——推出 Awesome 弦釘系統與 T-LINE 技術。' },
  { year: '2025', title: 'milestones.sunwave', fallback: 'Ayers 2.0 聲學新紀元：發表 SUNWAVE 系統技術。' },
];

const VALUES = [
  { icon: Heart, title: '韌性', desc: '1996 年創立，靈感源自澳洲，紮根台灣，堅持全手工製琴。' },
  { icon: Music, title: '穩定', desc: '追求如磐石般穩定的音色，注入自然的溫暖。' },
  { icon: Award, title: '文化', desc: '透過社群建設，推廣在地吉他文化。' },
  { icon: Globe, title: '匠心工藝', desc: '吉他的靈魂由人手賦予，每道工序皆為匠人心血。' },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="bg-ayers-cream min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-ayers-dark text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="/images/products/wave/a05c-wave-detail.jpg"
            alt="Ayers Workshop"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ayers-dark via-ayers-dark/50 to-transparent" />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono uppercase tracking-[0.4em] text-ayers-gold mb-6"
          >
            {t('home.heroSubtitle', 'Handcrafted Since 1996')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif italic font-bold mb-6"
          >
            {t('about.heroTitle', '關於 Ayers Guitars')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed"
          >
            {t('about.heroSubtitle', '以匠心致敬每一個音符，用手工吉他連結世界各地的音樂靈魂。')}
          </motion.p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-serif italic font-bold mb-8">
                {t('about.storyTitle', '我們的故事')}
              </h2>
              <div className="space-y-6 text-ayers-ink/70 leading-relaxed">
                <p>
                  {t('about.storyP1', 'Ayers 是世界知名的高端手工吉他品牌，由擁有數十年經驗的匠人打造。從選材、結構設計、音色調校到細緻的鑲嵌工藝，每道工序皆體現大師功力，結合國際製琴標準與在地手工技術，在品質與客製化之間達到理想平衡。')}
                </p>
                <p>
                  {t('about.storyP2', '品牌命名源自澳洲艾爾斯岩（Uluru），這座矗立六億年的世界最大單體巨石，象徵著韌性、穩定與文化——正是 Ayers 品牌的核心精神。')}
                </p>
                <p>
                  {t('about.storyP3', '創辦人黃振發於 1989 年在越南設立工廠，1996 年正式創立 Ayers 品牌。越南製琴師皆出身木工與貝殼鑲嵌世家，平均資歷超過十年，許多更具二十年以上經驗。每一把 Ayers 吉他都是全手工製作。')}
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-[4/5] rounded-3xl overflow-hidden"
            >
              <img
                src="/images/products/sun/sj07c-passion-front.png"
                alt={t('about.craftAlt', 'Ayers Guitar Craftsmanship')}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif italic font-bold mb-6">
              {t('about.valuesTitle', '品牌理念')}
            </h2>
            <p className="text-lg text-ayers-ink/60">
              {t('about.valuesSubtitle', '四個核心價值，定義 Ayers 的每一把吉他。')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-ayers-cream rounded-3xl border border-ayers-ink/5 hover:border-ayers-gold transition-colors group text-center"
              >
                <div className="w-14 h-14 bg-ayers-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-ayers-gold/20 transition-colors">
                  <value.icon className="text-ayers-gold" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">{t(`about.value${i}Title`, value.title)}</h3>
                <p className="text-sm text-ayers-ink/60 leading-relaxed">{t(`about.value${i}Desc`, value.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-ayers-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif italic font-bold mb-6">
              {t('about.timelineTitle', '品牌歷程')}
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />
            {MILESTONES.map((ms, i) => (
              <motion.div
                key={ms.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-start mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-ayers-gold rounded-full border-4 border-ayers-dark z-10" />
                <div className="ml-16 md:ml-0 md:w-1/2 md:px-12">
                  <span className="text-3xl font-serif italic font-bold text-ayers-gold">{ms.year}</span>
                  <p className="text-white/60 mt-2 leading-relaxed">{t(ms.title, ms.fallback)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Luthier Profiles */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif italic font-bold mb-6">
              {t('about.luthiersTitle', '製琴大師團隊')}
            </h2>
            <p className="text-lg text-ayers-ink/60">
              {t('about.luthiersSubtitle', '來自世界各地的頂尖製琴師，為 Ayers 注入卓越的技術基因。')}
            </p>
          </div>
          {/* Lead - Kuan-Yu Lu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-ayers-dark text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 mb-10"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-ayers-gold/30 flex-shrink-0">
              <img src="/images/luthiers/kuan-yu-lu.png" alt="盧冠宇" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold mb-2">{t('about.luthier1Role', '技術總監（2019-至今，台灣）')}</p>
              <h3 className="text-2xl font-serif italic font-bold mb-3">盧冠宇 Kuan-Yu Lu</h3>
              <p className="text-white/60 text-sm leading-relaxed">{t('about.luthier1Desc', '現任技術領導人，開發了 Awesome 弦釘系統、T-Line 技術，以及 2025 年發表的 SUNWAVE 系統。持續推動 Ayers 的聲學創新。')}</p>
            </div>
          </motion.div>

          {/* Other Consultants - 2x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Gerard Gilet', role: t('about.luthier2Role', '創始技術顧問（2001，澳洲）'), desc: t('about.luthier2Desc', '澳洲製琴大師，設計了 Vintage 系列，為 Ayers 奠定了選材與工藝的基礎標準，影響深遠。'), img: '/images/luthiers/gerard-gilet.png', flag: '🇦🇺' },
              { name: 'Balazs Prohaszka', role: t('about.luthier3Role', '駐廠技術顧問（2013-2014，英國）'), desc: t('about.luthier3Desc', '曾任職 Lakewood 與 Lowden 的英國製琴師，為 Ayers 開發了 X 型力木技術。'), img: '/images/luthiers/balazs.png', flag: '🇬🇧' },
              { name: '鹿川 Shikagawa', role: t('about.luthier4Role', '技術顧問（2020，日本）'), desc: t('about.luthier4Desc', 'ESP Guitar Craft Academy 畢業，精通指板精修與 NC 漆面噴塗技術。'), img: '/images/luthiers/shikagawa.png', flag: '🇯🇵' },
              { name: 'Mr. Nguyễn', role: t('about.luthier5Role', '資深製琴師（1998，越南）'), desc: t('about.luthier5Desc', '曾於德國 Warwick 工廠受訓，精通指板調整、琴衍精修與 EQ 安裝，並曾參訪 Lakewood 工廠。'), img: '/images/luthiers/mr-nguyen.png', flag: '🇻🇳' },
            ].map((luthier, i) => (
              <motion.div
                key={luthier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-ayers-cream rounded-2xl p-6 flex items-start gap-5 border border-ayers-ink/5 hover:border-ayers-gold/30 transition-colors"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-ayers-gold/20 flex-shrink-0">
                  <img src={luthier.img} alt={luthier.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm">{luthier.name}</h3>
                    <span className="text-sm">{luthier.flag}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold mb-2">{luthier.role}</p>
                  <p className="text-xs text-ayers-ink/50 leading-relaxed">{luthier.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-serif italic font-bold mb-6">
            {t('about.ctaTitle', '探索 Ayers 的世界')}
          </h2>
          <p className="text-lg text-ayers-ink/60 mb-10">
            {t('about.ctaDesc', '從經典系列到 3D 客製工坊，找到屬於你的聲音。')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="../collections"
              className="bg-ayers-gold text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
            >
              {t('about.ctaCollections', '瀏覽系列')}
            </a>
            <a
              href="../customizer"
              className="border border-ayers-ink/20 text-ayers-ink px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:border-ayers-gold hover:text-ayers-gold transition-all"
            >
              {t('about.ctaCustomizer', '3D 客製工坊')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
