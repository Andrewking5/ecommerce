import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Zap, Wind, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

export default function Technology() {
  const { t } = useTranslation();
  return (
    <div className="bg-ayers-cream min-h-screen">
      <SEO
        title={t('tech.heroTitle', 'AYERS 2.0 — 重新定義聲學卓越')}
        description={t('tech.feature1Desc', 'SUNWAVE 系統、T-Line 無縫延音技術、Awesome 弦釘系統 — Ayers 三大核心聲學技術。')}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: t('tech.heroTitle', 'Technology'), url: '/technology' },
        ]}
      />
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-ayers-dark text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          <OptimizedImage
            src="/images/products/ayers-tech-1.png"
            alt="Ayers Sunwave Technology"
            className="w-full h-full object-contain"
            priority
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-7xl font-serif italic font-bold mb-6"
          >
            AYERS 2.0: <br />
            {t('tech.heroTitle', '重新定義聲學卓越')}
          </motion.h1>
          <p className="text-xl text-white/70 font-light tracking-widest uppercase">{t('tech.heroSubtitle', 'SUNWAVE System ∙ T-Line ∙ Awesome Bridge Pin')}</p>
        </div>
      </section>

      {/* Bracing System */}
      <section className="py-24 bg-gradient-to-b from-ayers-dark to-[#0a0b0d] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative w-full h-full"
              >
                <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-8 border border-white/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <OptimizedImage
                  src="/images/products/ayers-tech-2.png"
                  alt={t('tech.bracingAlt', 'Ayers 力木結構')}
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                {/* Hotspots */}
                <Hotspot x="30%" y="40%" label={t('tech.hotspot1Label', 'SUNWAVE 力木結構')} desc={t('tech.hotspot1Desc', '重塑聲波傳遞路徑，打造更明亮、延展、立體的音色')} />
                <Hotspot x="70%" y="30%" label={t('tech.hotspot2Label', '扇形 X 型力木')} desc={t('tech.hotspot2Desc', '兼顧共鳴效能與結構穩定性')} />
                <Hotspot x="50%" y="70%" label={t('tech.hotspot3Label', '指板幾何優化')} desc={t('tech.hotspot3Desc', 'SUNWAVE 系統雙核心之一，優化振動傳導')} />
              </motion.div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-4xl font-serif italic font-bold mb-8">{t('tech.bracingTitle', 'The Ayers 2.0 Bracing System')}</h2>
              <div className="space-y-8">
                <FeatureItem
                  icon={<Zap className="text-ayers-gold" />}
                  title={t('tech.feature1Title', 'SUNWAVE 系統 (SWS)')}
                  desc={t('tech.feature1Desc', '2025 年創新突破。雙系統設計——力木結構與指板幾何優化，重塑聲波傳遞，打造更明亮、延展、立體的三維音色。')}
                />
                <FeatureItem
                  icon={<Wind className="text-ayers-gold" />}
                  title={t('tech.feature2Title', 'T-Line 無縫延音技術')}
                  desc={t('tech.feature2Desc', '精密研磨弦枕與下弦枕，使琴弦接觸更平滑。泛音更清晰、延音穩定性提升、聲學能量增加。')}
                />
                <FeatureItem
                  icon={<Layers className="text-ayers-gold" />}
                  title={t('tech.feature3Title', 'Awesome 弦釘系統')}
                  desc={t('tech.feature3Desc', '特製弦釘搭配半導體複合材料環，針對不同弦的特性匹配材質：骨質（清亮中高頻）、烏木（厚實中低頻）、楓木（均衡透明）、可可波羅（圓潤中頻）。')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Torrefaction Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-serif italic font-bold mb-6">{t('tech.lacquerTitle', '七層 PU 漆工藝')}</h2>
            <p className="text-lg text-ayers-ink/60">{t('tech.lacquerDesc', '手工噴塗七層 PU 漆，堅持傳統 Dovetail 榫接工法，賦予每把琴獨特的光澤與保護。')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessStep number="01" title={t('tech.step1Title', 'PU 漆面處理')} desc={t('tech.step1Desc', '採用 PU 漆經七道工序手工噴塗，不同於常見的 PE/UV 漆面，呈現更溫潤的光澤與觸感。')} />
            <ProcessStep number="02" title={t('tech.step2Title', 'Dovetail 榫接')} desc={t('tech.step2Desc', '傳統鳩尾榫接合方式連接琴頸與琴身，確保振動傳導的完整性與結構穩定性。')} />
            <ProcessStep number="03" title={t('tech.step3Title', 'TFT 認證木材')} desc={t('tech.step3Desc', '所有木材均通過 TFT（The Forest Trust）認證，確保永續來源。琴身七層 PU 漆、琴頸 NC 軟漆分開處理。')} />
          </div>

          <div className="mt-16 aspect-[21/9] rounded-2xl sm:rounded-[3rem] overflow-hidden">
            <OptimizedImage
              src="/images/products/wave/a05c-wave-detail.jpg"
              alt={t('tech.workshopAlt', 'Ayers 工坊')}
              className="w-full h-full object-cover"
              sizes="100vw"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Hotspot({ x, y, label, desc }: { x: string, y: string, label: string, desc: string }) {
  return (
    <div className="absolute z-20 group" style={{ left: x, top: y }}>
      <div className="w-4 h-4 bg-ayers-gold rounded-full animate-ping absolute inset-0" />
      <div className="w-4 h-4 bg-ayers-gold rounded-full relative z-10 cursor-pointer" />
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold mb-1">{label}</p>
          <p className="text-[10px] text-white/70">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex space-x-6">
      <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="p-6 sm:p-10 bg-ayers-cream rounded-2xl sm:rounded-3xl border border-ayers-ink/5 hover:border-ayers-gold transition-colors group">
      <span className="text-2xl sm:text-4xl font-serif italic font-bold text-ayers-gold/20 group-hover:text-ayers-gold transition-colors mb-6 block">{number}</span>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-sm text-ayers-ink/60 leading-relaxed">{desc}</p>
    </div>
  );
}
