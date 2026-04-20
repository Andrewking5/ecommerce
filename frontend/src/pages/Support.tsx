import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Search, MessageCircle, Mail, Phone, ChevronRight, HelpCircle, Truck, Shield, Wrench, Play } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import SEO from '../components/SEO';

export default function Support() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { icon: <Wrench size={24} />, title: t('support.customizationGuide', 'Customization Guide'), desc: t('support.customizationGuideDesc', 'Learn how to use our 3D Custom Lab.') },
    { icon: <Truck size={24} />, title: t('support.shippingReturns', 'Shipping & Returns'), desc: t('support.shippingReturnsDesc', 'Tracking, delivery times, and return policy.') },
    { icon: <HelpCircle size={24} />, title: t('support.instrumentCareGuide', '樂器保養指南'), desc: t('support.instrumentCareGuideDesc', '如何保養您的 Ayers 吉他。') },
    { icon: <Shield size={24} />, title: t('support.warranty', 'Warranty'), desc: t('support.warrantyDesc', 'Register your instrument and check coverage.') },
  ];

  const GUIDES = [
    { title: t('support.humidityGuide', '了解濕度對全單板吉他的影響'), img: '/images/products/light/l05-light-detail.png' },
    { title: t('support.seasonalCareGuide', '換季保養指南：春夏篇'), img: '/images/products/wave/a05c-wave-detail.jpg' },
  ];

  return (
    <div className="bg-ayers-cream min-h-screen py-12">
      <SEO
        title={t('support.title', '客戶支援中心')}
        description={t('support.desc', 'Ayers Guitars 客戶支援 — 樂器保養、保固、運送退換貨與客製化指南。')}
        breadcrumbs={[
          { name: 'Ayers Guitars', url: '/zh-TW' },
          { name: t('support.title', '客戶支援'), url: '/zh-TW/support' },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Ayers 吉他的保固期限是多久？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ayers Guitars 提供吉他本體有限終身保固（製造工藝缺陷），電子零件與配件則依產品類別另有規定。詳情請參閱保固頁面。',
              },
            },
            {
              '@type': 'Question',
              name: '如何保養 Ayers 全單板吉他？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '建議將濕度控制在 45–55%，避免陽光直射與劇烈溫差。定期使用吉他專用保養油擦拭指板，並在乾燥季節使用吉他加濕器保護琴身。',
              },
            },
            {
              '@type': 'Question',
              name: 'Ayers 吉他可以退換貨嗎？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '購買後 14 天內，若商品未受損且包裝完整，可申請退換貨。客製化商品及特賣商品不在退換貨範圍。詳情請參閱退換貨政策頁面。',
              },
            },
            {
              '@type': 'Question',
              name: 'Ayers 吉他的運送時間需要多久？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '台灣本島一般訂單約 3–5 個工作天，海外訂單視地區不同約 7–21 個工作天。訂單確認後將寄送追蹤號碼。',
              },
            },
            {
              '@type': 'Question',
              name: '如何使用 Ayers 3D Custom Lab 客製化吉他？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '進入官網 Customizer 頁面，選擇吉他型號後可依序調整面板木材、背側板、音孔裝飾環、弦釘、琴頸、外框鑲邊等細節，完成後提交訂單即可。',
              },
            },
          ],
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-16 bg-ayers-dark text-white p-8 sm:p-16 rounded-2xl sm:rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ayers-gold via-transparent to-transparent" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif italic font-bold mb-8">{t('support.title')}</h1>
            <div className="relative">
              <input
                type="text"
                placeholder={t('support.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-4 px-12 text-white focus:outline-none focus:border-ayers-gold focus:ring-1 focus:ring-ayers-gold transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-ayers-ink/5"
                >
                  <div className="w-16 h-16 bg-ayers-cream rounded-2xl flex items-center justify-center mb-6 group-hover:bg-ayers-gold group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{cat.title}</h3>
                  <p className="text-sm text-ayers-ink/60 leading-relaxed mb-6">{cat.desc}</p>
                  <button className="text-xs font-bold uppercase tracking-widest text-ayers-gold flex items-center">
                    {t('support.learnMore')} <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Instrument Care */}
            <section className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-[3rem] shadow-sm border border-ayers-ink/5">
              <div className="flex items-center space-x-4 mb-12">
                <div className="w-12 h-12 bg-ayers-gold/10 rounded-full flex items-center justify-center text-ayers-gold">
                  <Wrench size={24} />
                </div>
                <h2 className="text-3xl font-serif italic font-bold">{t('support.instrumentCare', 'Instrument Care')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {GUIDES.map((guide, i) => (
                  <div key={guide.title} className="group cursor-pointer">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-6 relative">
                      <img
                        src={guide.img}
                        alt={guide.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                          <Play className="text-white fill-current ml-1" size={18} />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-ayers-gold transition-colors">{guide.title}</h3>
                    <p className="text-sm text-ayers-ink/60 line-clamp-2">{t('support.humidityCareDesc', '全單板吉他對濕度變化特別敏感，了解如何正確控制濕度，延長愛琴的壽命。')}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8 pt-8 border-t border-ayers-ink/10">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">{t('support.stepByStepGuides', 'Step-by-Step Guides: Humidity Control')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { step: '1', title: t('support.humidityStep1', 'Monitor Humidity Levels (40-55%)') },
                    { step: '2', title: t('support.humidityStep2', 'Use a Case Humidifier') },
                    { step: '3', title: t('support.humidityStep3', 'Store in a Stable Environment') },
                    { step: '4', title: t('support.humidityStep4', 'Avoid Extreme Temperature Changes') },
                  ].map((step) => (
                    <div key={step.step} className="space-y-3">
                      <span className="text-2xl font-serif italic font-bold text-ayers-gold/30">{step.step}.</span>
                      <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">{step.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Contact */}
          <aside className="space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-ayers-ink/5 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">{t('support.needMoreHelp', 'Need more help?')}</h3>
              <a href="https://line.me/R/ti/p/@868lgkhc" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-4 bg-ayers-cream rounded-2xl hover:bg-ayers-gold hover:text-white transition-all group">
                <div className="flex items-center space-x-4">
                  <MessageCircle size={20} className="text-ayers-gold group-hover:text-white" />
                  <div className="text-left">
                    <p className="text-sm font-bold">{t('support.liveChat')}</p>
                    <p className="text-[10px] opacity-60">@868lgkhc</p>
                  </div>
                </div>
                <ChevronRight size={16} />
              </a>
              <a href="mailto:service@ayersguitars.com" className="w-full flex items-center justify-between p-4 bg-ayers-cream rounded-2xl hover:bg-ayers-gold hover:text-white transition-all group">
                <div className="flex items-center space-x-4">
                  <Mail size={20} className="text-ayers-gold group-hover:text-white" />
                  <div className="text-left">
                    <p className="text-sm font-bold">{t('support.emailSupport')}</p>
                    <p className="text-[10px] opacity-60">service@ayersguitars.com</p>
                  </div>
                </div>
                <ChevronRight size={16} />
              </a>
              <a href="tel:+886225058856" className="w-full flex items-center justify-between p-4 bg-ayers-cream rounded-2xl hover:bg-ayers-gold hover:text-white transition-all group">
                <div className="flex items-center space-x-4">
                  <Phone size={20} className="text-ayers-gold group-hover:text-white" />
                  <div className="text-left">
                    <p className="text-sm font-bold">(02) 2505-8856</p>
                    <p className="text-[10px] opacity-60">{t('support.phoneHours', 'Mon-Fri 10:00-12:00, 14:00-19:00')}</p>
                  </div>
                </div>
                <ChevronRight size={16} />
              </a>
            </div>

            <button className="w-full bg-ayers-gold text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all">
              {t('support.contactUs', 'Contact Us')}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
