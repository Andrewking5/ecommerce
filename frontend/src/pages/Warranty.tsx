import { motion } from 'motion/react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  CheckCircle,
  XCircle,
  ClipboardList,
  Droplets,
  Thermometer,
  Music,
  Heart,
} from 'lucide-react';

export default function Warranty() {
  const { t } = useTranslation();

  const covered = [
    t('warranty.covered1', 'Defects in materials and workmanship for the lifetime of the original owner'),
    t('warranty.covered2', 'Structural integrity of the neck joint and heel connection'),
    t('warranty.covered3', 'Bridge lifting or separation under normal string tension'),
    t('warranty.covered4', 'Finish defects present at the time of purchase'),
    t('warranty.covered5', 'Tuning machine and electronic component failures (1-year coverage)'),
    t('warranty.covered6', 'Fret lifting or buzzing caused by manufacturing defects'),
    t('warranty.covered7', 'Binding separation not caused by environmental factors'),
    t('warranty.covered8', 'Saddle and nut defects present at time of purchase'),
  ];

  const notCovered = [
    t('warranty.notCovered1', 'Normal wear and tear, including fret wear, pick scratches, and finish checking'),
    t('warranty.notCovered2', 'Damage caused by accidents, drops, impacts, or mishandling'),
    t('warranty.notCovered3', 'Damage from improper storage, including extreme temperature or humidity exposure'),
    t('warranty.notCovered4', 'Unauthorized modifications, repairs, or alterations by third parties'),
    t('warranty.notCovered5', 'Cosmetic changes due to aging, including wood darkening and finish patina'),
    t('warranty.notCovered6', 'String breakage and normal consumable part replacement'),
    t('warranty.notCovered7', 'Damage resulting from use of improper strings or tuning beyond specifications'),
    t('warranty.notCovered8', 'Damage caused during shipping (covered by shipping insurance separately)'),
  ];

  const claimSteps = [
    {
      step: 1,
      title: t('warranty.claimStep1Title', 'Contact Us'),
      desc: t('warranty.claimStep1Desc', 'Email service@ayersguitars.com with your order number, serial number, and a detailed description of the issue.'),
    },
    {
      step: 2,
      title: t('warranty.claimStep2Title', 'Provide Documentation'),
      desc: t('warranty.claimStep2Desc', 'Include clear photographs of the defect from multiple angles. Our team will review your claim within 3-5 business days.'),
    },
    {
      step: 3,
      title: t('warranty.claimStep3Title', 'Assessment'),
      desc: t('warranty.claimStep3Desc', 'We may request that you ship the instrument to our service center in Taiwan for professional inspection at our expense.'),
    },
    {
      step: 4,
      title: t('warranty.claimStep4Title', 'Resolution'),
      desc: t('warranty.claimStep4Desc', 'Approved claims will be repaired or replaced at our discretion. Repairs are typically completed within 2-4 weeks.'),
    },
  ];

  const careTips = [
    {
      icon: Droplets,
      title: t('warranty.careHumidityTitle', 'Humidity Control'),
      tips: [
        t('warranty.careHumidity1', 'Maintain humidity between 45-55% relative humidity at all times.'),
        t('warranty.careHumidity2', 'Use a guitar humidifier in dry climates or during winter months.'),
        t('warranty.careHumidity3', 'Avoid leaving your guitar near air conditioning vents, heaters, or dehumidifiers.'),
        t('warranty.careHumidity4', 'Consider a hygrometer in your guitar case to monitor humidity levels.'),
      ],
    },
    {
      icon: Thermometer,
      title: t('warranty.careTempTitle', 'Temperature'),
      tips: [
        t('warranty.careTemp1', 'Store your guitar at room temperature (18-24°C / 65-75°F).'),
        t('warranty.careTemp2', 'Never leave your guitar in a car, especially during summer or winter extremes.'),
        t('warranty.careTemp3', 'Allow your guitar to acclimate gradually when moving between environments.'),
        t('warranty.careTemp4', 'Avoid placing near windows with direct sunlight exposure.'),
      ],
    },
    {
      icon: Music,
      title: t('warranty.carePlayingTitle', 'Playing & Storage'),
      tips: [
        t('warranty.carePlaying1', 'Always store your guitar in its case when not in use.'),
        t('warranty.carePlaying2', 'Wipe down strings and body with a soft cloth after each playing session.'),
        t('warranty.carePlaying3', 'Loosen strings slightly if storing for extended periods (more than a month).'),
        t('warranty.carePlaying4', 'Use a quality guitar stand for short-term display; avoid wall hangers in humid areas.'),
      ],
    },
    {
      icon: Heart,
      title: t('warranty.careCleaningTitle', 'Cleaning & Maintenance'),
      tips: [
        t('warranty.careCleaning1', 'Use only guitar-specific cleaning products on the finish.'),
        t('warranty.careCleaning2', 'Clean the fretboard with lemon oil or fretboard conditioner during string changes.'),
        t('warranty.careCleaning3', 'Have your guitar professionally set up at least once a year.'),
        t('warranty.careCleaning4', 'Check tuning machine screws periodically and tighten gently if loose.'),
      ],
    },
  ];

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
              {t('warranty.ourPromise', 'Our Promise')}
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif italic font-bold text-white mb-6">
              {t('warranty.title', 'Lifetime Warranty')}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('warranty.heroDesc', 'Every Ayers guitar is built to last a lifetime. Our Limited Lifetime Warranty reflects the confidence we have in our craftsmanship and materials.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Warranty Badge */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-sm border border-ayers-ink/5 flex flex-col md:flex-row items-center gap-8"
          >
            <div className="w-24 h-24 rounded-full bg-ayers-gold/10 flex items-center justify-center flex-shrink-0">
              <Shield className="text-ayers-gold" size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic font-bold mb-3">
                {t('warranty.badgeTitle', 'Ayers Limited Lifetime Warranty')}
              </h2>
              <p className="text-sm text-ayers-ink/60 leading-relaxed">
                {t('warranty.badgeDesc', 'We warrant that every Ayers guitar is free from defects in materials and workmanship for the lifetime of the original purchaser. This warranty is non-transferable and applies only to instruments purchased through authorized Ayers dealers or directly from ayersguitars.com. Proof of purchase is required for all warranty claims.')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Coverage */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Covered */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-sm border border-ayers-ink/5"
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <h2 className="text-xl font-serif italic font-bold">{t('warranty.covered', 'What Is Covered')}</h2>
              </div>
              <ul className="space-y-4">
                {covered.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle
                      size={16}
                      className="text-green-500 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-ayers-ink/60 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Not Covered */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-sm border border-ayers-ink/5"
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle className="text-red-400" size={20} />
                </div>
                <h2 className="text-xl font-serif italic font-bold">{t('warranty.notCovered', 'What Is Not Covered')}</h2>
              </div>
              <ul className="space-y-4">
                {notCovered.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <XCircle
                      size={16}
                      className="text-red-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-ayers-ink/60 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Claim */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <ClipboardList className="text-ayers-gold" size={24} />
              <h2 className="text-3xl font-serif italic font-bold">{t('warranty.claimTitle', 'How to File a Claim')}</h2>
            </div>
            <p className="text-sm text-ayers-ink/50 max-w-lg mx-auto">
              {t('warranty.claimDesc', 'Our warranty process is designed to be straightforward and hassle-free.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {claimSteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-ayers-cream rounded-2xl p-5 sm:p-8 relative"
              >
                <span className="text-6xl font-serif italic font-bold text-ayers-gold/10 absolute top-4 right-6">
                  {item.step}
                </span>
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold mb-2">
                    {t('warranty.step', 'Step')} {item.step}
                  </p>
                  <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-ayers-ink/60 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Care & Maintenance */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-ayers-gold mb-4">
              {t('warranty.careLabel', 'Preserve Your Investment')}
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif italic font-bold mb-4">{t('warranty.careTitle', 'Care & Maintenance')}</h2>
            <p className="text-sm text-ayers-ink/50 max-w-lg mx-auto">
              {t('warranty.careDesc', 'Proper care will ensure your Ayers guitar sounds and looks beautiful for generations. Follow these guidelines to protect your instrument.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {careTips.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm border border-ayers-ink/5"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-ayers-gold/10 flex items-center justify-center">
                    <category.icon className="text-ayers-gold" size={20} />
                  </div>
                  <h3 className="text-lg font-serif italic font-bold">{category.title}</h3>
                </div>
                <ul className="space-y-3">
                  {category.tips.map((tip, j) => (
                    <li
                      key={j}
                      className="text-sm text-ayers-ink/60 leading-relaxed pl-4 border-l-2 border-ayers-gold/20"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-ayers-dark rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-16 text-center"
          >
            <Shield className="text-ayers-gold mx-auto mb-6" size={40} strokeWidth={1.5} />
            <h2 className="text-3xl md:text-4xl font-serif italic font-bold text-white mb-4">
              {t('warranty.ctaTitle', 'Questions About Your Warranty?')}
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              {t('warranty.ctaDesc', 'Our customer care team is here to help with any warranty questions or claims. We stand behind every instrument we craft.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center bg-ayers-gold text-white px-6 sm:px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-ayers-dark transition-all"
              >
                {t('warranty.ctaContact', 'Contact Support')}
              </Link>
              <a
                href="mailto:service@ayersguitars.com"
                className="inline-flex items-center bg-transparent border-2 border-white/30 text-white px-6 sm:px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:border-ayers-gold hover:text-ayers-gold transition-all"
              >
                service@ayersguitars.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
