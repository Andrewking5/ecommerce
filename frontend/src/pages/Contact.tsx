import { useState } from 'react';
import { motion } from 'motion/react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Building2,
  Globe,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import api from '@/src/services/api';

export default function Contact() {
  const { t } = useTranslation();
  const location = useLocation();
  const stateSubject = (location.state as any)?.subject || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: stateSubject,
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/contact', formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('contact.sendError', 'Failed to send message. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-ayers-cream min-h-screen">
      {/* Hero */}
      <section className="bg-ayers-dark py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-ayers-gold mb-6">
              {t('contact.getInTouch')}
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif italic font-bold text-white mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mail,
                title: t('contact.email'),
                primary: 'service@ayersguitars.com',
                secondary: t('contact.replyTime', '我們將在 24 小時內回覆'),
              },
              {
                icon: Phone,
                title: t('contact.phone'),
                primary: '(02) 2505-8856',
                secondary: t('contact.phoneHours', '週一至週五 10:00-12:00, 14:00-19:00'),
              },
              {
                icon: MapPin,
                title: t('contact.location'),
                primary: t('contact.locationCity', '台北市中山區'),
                secondary: t('contact.locationAddress', '建國北路二段139號13樓之1'),
              },
              {
                icon: Clock,
                title: t('contact.businessHours'),
                primary: t('contact.businessHoursValue', '週一至週五 10:00-19:00'),
                secondary: t('contact.businessHoursNote', '中午休息 12:00-14:00 (GMT+8)'),
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-ayers-ink/5"
              >
                <div className="w-12 h-12 rounded-full bg-ayers-gold/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-ayers-gold" size={22} />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm font-bold mb-1">{item.primary}</p>
                <p className="text-xs text-ayers-ink/50">{item.secondary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-sm border border-ayers-ink/5">
                <h2 className="text-2xl font-serif italic font-bold mb-2">{t('contact.sendMessage')}</h2>
                <p className="text-sm text-ayers-ink/50 mb-8">
                  {t('contact.formSubtitle', 'Fill out the form below and our team will get back to you promptly.')}
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-green-500" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif italic font-bold mb-3">
                      {t('contact.successTitle')}
                    </h3>
                    <p className="text-sm text-ayers-ink/60 mb-8 max-w-md mx-auto">
                      {t('contact.successMessage')}
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                      className="text-sm font-bold uppercase tracking-widest text-ayers-gold hover:opacity-70 transition-opacity"
                    >
                      {t('contact.sendAnother')}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                          {t('contact.fullName')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t('contact.namePlaceholder', 'Your name')}
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="w-full bg-ayers-cream border-none rounded-xl py-3 px-4 sm:py-4 sm:px-6 text-sm focus:ring-2 focus:ring-ayers-gold transition-all placeholder:text-ayers-ink/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                          {t('login.emailAddress')}
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@email.com"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full bg-ayers-cream border-none rounded-xl py-3 px-4 sm:py-4 sm:px-6 text-sm focus:ring-2 focus:ring-ayers-gold transition-all placeholder:text-ayers-ink/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        {t('contact.subject')}
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        className="w-full bg-ayers-cream border-none rounded-xl py-3 px-4 sm:py-4 sm:px-6 text-sm focus:ring-2 focus:ring-ayers-gold transition-all appearance-none"
                      >
                        <option value="">{t('contact.selectSubject')}</option>
                        <option value="general">{t('contact.generalInquiry')}</option>
                        <option value="product">{t('contact.productQuestion')}</option>
                        <option value="order">{t('contact.orderStatus')}</option>
                        <option value="warranty">{t('contact.warrantyClaim')}</option>
                        <option value="return">{t('contact.returnExchange')}</option>
                        <option value="custom">{t('contact.customOrder')}</option>
                        <option value="dealer">{t('contact.dealerInquiry')}</option>
                        <option value="other">{t('contact.other')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        {t('contact.message')}
                      </label>
                      <textarea
                        required
                        rows={6}
                        placeholder={t('contact.messagePlaceholder')}
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        className="w-full bg-ayers-cream border-none rounded-xl py-3 px-4 sm:py-4 sm:px-6 text-sm focus:ring-2 focus:ring-ayers-gold transition-all placeholder:text-ayers-ink/20 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-ayers-gold text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all flex items-center justify-center group"
                    >
                      {t('contact.send')}
                      <Send
                        size={16}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4 sm:space-y-8"
            >
              {/* Dealer Inquiries */}
              <div className="bg-ayers-dark rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-white">
                <div className="w-10 h-10 rounded-xl bg-ayers-gold/20 flex items-center justify-center mb-4">
                  <Building2 className="text-ayers-gold" size={20} />
                </div>
                <h3 className="text-lg font-serif italic font-bold mb-3">
                  {t('contact.becomeDealer')}
                </h3>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">
                  {t('contact.dealerDesc')}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Mail size={14} className="text-ayers-gold" />
                    <span className="text-white/70">service@ayersguitars.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle size={14} className="text-ayers-gold" />
                    <span className="text-white/70">LINE: @868lgkhc</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe size={14} className="text-ayers-gold" />
                    <span className="text-white/70">{t('contact.globalPartnerships', 'Global partnerships welcome')}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm border border-ayers-ink/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-ayers-gold mb-6">
                  {t('contact.helpfulLinks', 'Helpful Links')}
                </h3>
                <div className="space-y-3">
                  {[
                    { label: t('contact.warrantyInfo', 'Warranty Information'), to: '/warranty' },
                    { label: t('contact.shippingReturns', 'Shipping & Returns'), to: '/shipping' },
                    { label: t('contact.storeLocator', 'Store Locator'), to: '/store-locator' },
                    { label: t('contact.faqSupport', 'FAQ & Support'), to: '/support' },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="flex items-center justify-between text-sm text-ayers-ink/60 hover:text-ayers-gold transition-colors group"
                    >
                      <span>{link.label}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-ayers-gold">
                        &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm border border-ayers-ink/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-ayers-gold mb-6">
                  {t('contact.businessHoursGmt', 'Business Hours (GMT+8)')}
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { day: t('contact.monFri', 'Monday - Friday'), hours: '10:00 - 12:00, 14:00 - 19:00' },
                    { day: t('contact.saturday', 'Saturday'), hours: t('contact.closed', 'Closed') },
                    { day: t('contact.sunHolidays', 'Sunday & Holidays'), hours: t('contact.closed', 'Closed') },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between"
                    >
                      <span className="text-ayers-ink/60">{item.day}</span>
                      <span className="font-bold text-ayers-ink/80">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-ayers-dark rounded-2xl sm:rounded-[2rem] overflow-hidden relative"
          >
            <div className="aspect-[21/9] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ayers-gold/5 via-transparent to-transparent" />
              <div className="text-center relative z-10">
                <MapPin className="text-ayers-gold mx-auto mb-4" size={40} strokeWidth={1.5} />
                <h3 className="text-2xl font-serif italic font-bold text-white mb-2">
                  Ayers Guitars
                </h3>
                <p className="text-sm text-white/50 mb-1">{t('contact.mapCity', 'Taipei, Taiwan')}</p>
                <p className="text-xs text-white/30">
                  {t('contact.mapAddress', 'Ayers 旗艦店｜建國北路二段139號13樓之1')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
