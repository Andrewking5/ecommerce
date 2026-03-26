import { motion } from 'motion/react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  RotateCcw,
  Clock,
  Globe,
  Package,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export default function Shipping() {
  const { t } = useTranslation();

  const highlights = [
    {
      icon: Truck,
      title: t('shipping.highlightFreeTitle', 'Free Domestic Shipping'),
      desc: t('shipping.highlightFreeDesc', 'Complimentary shipping on all guitars and ukuleles within Taiwan.'),
    },
    {
      icon: Clock,
      title: t('shipping.highlightProcessingTitle', '1-3 Day Processing'),
      desc: t('shipping.highlightProcessingDesc', 'In-stock orders are processed and shipped within 1-3 business days.'),
    },
    {
      icon: RotateCcw,
      title: t('shipping.highlightReturnsTitle', '30-Day Returns'),
      desc: t('shipping.highlightReturnsDesc', 'Return unused items in original packaging within 30 days of delivery.'),
    },
    {
      icon: ShieldCheck,
      title: t('shipping.highlightInsuredTitle', 'Insured Shipping'),
      desc: t('shipping.highlightInsuredDesc', 'Every instrument is fully insured during transit for your peace of mind.'),
    },
  ];

  const domesticMethods = [
    {
      method: t('shipping.domesticStandard', 'Standard Shipping'),
      time: t('shipping.domesticStandardTime', '3-5 business days'),
      cost: t('shipping.domesticStandardCost', 'Free'),
      note: t('shipping.domesticStandardNote', 'Available for all orders within Taiwan'),
    },
    {
      method: t('shipping.domesticExpress', 'Express Shipping'),
      time: t('shipping.domesticExpressTime', '1-2 business days'),
      cost: t('shipping.domesticExpressCost', 'NT$350'),
      note: t('shipping.domesticExpressNote', 'Next-day delivery available for orders placed before 2:00 PM'),
    },
    {
      method: t('shipping.domesticPickup', 'In-Store Pickup'),
      time: t('shipping.domesticPickupTime', 'Same day'),
      cost: t('shipping.domesticPickupCost', 'Free'),
      note: t('shipping.domesticPickupNote', 'Collect from our authorized dealer locations'),
    },
  ];

  const internationalRegions = [
    {
      region: t('shipping.regionAsiaPacific', 'Asia Pacific'),
      countries: t('shipping.regionAsiaPacificCountries', 'Japan, South Korea, Hong Kong, Singapore, Malaysia, Thailand, Philippines'),
      time: t('shipping.regionAsiaPacificTime', '5-10 business days'),
      cost: t('shipping.regionAsiaPacificCost', 'From NT$2,500'),
    },
    {
      region: t('shipping.regionNorthAmerica', 'North America'),
      countries: t('shipping.regionNorthAmericaCountries', 'United States, Canada'),
      time: t('shipping.regionNorthAmericaTime', '7-14 business days'),
      cost: t('shipping.regionNorthAmericaCost', 'From NT$4,500'),
    },
    {
      region: t('shipping.regionEurope', 'Europe'),
      countries: t('shipping.regionEuropeCountries', 'UK, Germany, France, Netherlands, Spain, Italy'),
      time: t('shipping.regionEuropeTime', '10-18 business days'),
      cost: t('shipping.regionEuropeCost', 'From NT$5,000'),
    },
    {
      region: t('shipping.regionRestOfWorld', 'Rest of World'),
      countries: t('shipping.regionRestOfWorldCountries', 'Australia, New Zealand, South America, Middle East, Africa'),
      time: t('shipping.regionRestOfWorldTime', '14-21 business days'),
      cost: t('shipping.regionRestOfWorldCost', 'From NT$5,500'),
    },
  ];

  const returnSteps = [
    {
      step: 1,
      title: t('shipping.returnStep1Title', 'Initiate Your Return'),
      desc: t('shipping.returnStep1Desc', 'Contact our customer service team at service@ayersguitars.com with your order number and reason for return within 30 days of delivery.'),
    },
    {
      step: 2,
      title: t('shipping.returnStep2Title', 'Receive Return Authorization'),
      desc: t('shipping.returnStep2Desc', 'We will provide you with a Return Merchandise Authorization (RMA) number and detailed return shipping instructions within 1-2 business days.'),
    },
    {
      step: 3,
      title: t('shipping.returnStep3Title', 'Pack & Ship'),
      desc: t('shipping.returnStep3Desc', 'Carefully repack the instrument in its original packaging and case. Include all accessories, documentation, and the RMA number on the outer package.'),
    },
    {
      step: 4,
      title: t('shipping.returnStep4Title', 'Refund Processing'),
      desc: t('shipping.returnStep4Desc', 'Once we receive and inspect the returned item, your refund will be processed to the original payment method within 10-14 business days.'),
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
              {t('shipping.label', 'Delivery & Returns')}
            </p>
            <h1 className="text-5xl md:text-7xl font-serif italic font-bold text-white mb-6">
              {t('shipping.title', 'Shipping & Returns')}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('shipping.heroDesc', 'We ensure every Ayers instrument arrives safely at your door, anywhere in the world. Your satisfaction is guaranteed.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-ayers-ink/5"
              >
                <div className="w-12 h-12 rounded-full bg-ayers-gold/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-ayers-gold" size={22} />
                </div>
                <h3 className="text-sm font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-ayers-ink/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domestic Shipping */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-ayers-ink/5"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-ayers-gold/10 flex items-center justify-center">
                <MapPin className="text-ayers-gold" size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold">
                  {t('shipping.domesticRegion', 'Taiwan')}
                </p>
                <h2 className="text-2xl font-serif italic font-bold">{t('shipping.domesticTitle', 'Domestic Shipping')}</h2>
              </div>
            </div>

            <div className="space-y-4">
              {domesticMethods.map((method, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row md:items-center justify-between bg-ayers-cream rounded-xl p-5 gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">{method.method}</h3>
                    <p className="text-xs text-ayers-ink/50 mt-1">{method.note}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-ayers-ink/60">
                      <Clock size={14} className="inline mr-1" />
                      {method.time}
                    </span>
                    <span className="font-bold text-ayers-gold">{method.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-ayers-gold/5 rounded-xl border border-ayers-gold/20">
              <div className="flex items-start space-x-3">
                <Package className="text-ayers-gold flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold mb-1">{t('shipping.packagingTitle', 'Premium Packaging')}</p>
                  <p className="text-xs text-ayers-ink/60 leading-relaxed">
                    {t('shipping.packagingDesc', 'All guitars ship in a custom hardshell case with additional foam padding and a double-wall corrugated shipping box. Ukuleles include a padded gig bag and protective shipping carton. Tracking information is emailed once your order ships.')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* International Shipping */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-ayers-ink/5"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-ayers-gold/10 flex items-center justify-center">
                <Globe className="text-ayers-gold" size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold">
                  {t('shipping.internationalRegion', 'Worldwide')}
                </p>
                <h2 className="text-2xl font-serif italic font-bold">{t('shipping.internationalTitle', 'International Shipping')}</h2>
              </div>
            </div>

            <p className="text-sm text-ayers-ink/60 mb-8 leading-relaxed">
              {t('shipping.internationalDesc', 'We ship Ayers instruments worldwide through trusted carriers including DHL, FedEx, and EMS. International customers are responsible for any customs duties, import taxes, or fees imposed by the destination country. These charges vary by country and are not included in the product price or shipping cost.')}
            </p>

            <div className="space-y-4">
              {internationalRegions.map((region, i) => (
                <div
                  key={i}
                  className="bg-ayers-cream rounded-xl p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold">{region.region}</h3>
                      <p className="text-xs text-ayers-ink/40 mt-1">{region.countries}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-ayers-ink/60">
                        <Clock size={14} className="inline mr-1" />
                        {region.time}
                      </span>
                      <span className="font-bold text-ayers-gold min-w-[100px] text-right">
                        {region.cost}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold mb-1">{t('shipping.importantNoteTitle', 'Important Note for International Orders')}</p>
                  <p className="text-xs text-ayers-ink/60 leading-relaxed">
                    {t('shipping.importantNoteDesc', 'Delivery times are estimates and may vary due to customs processing. For countries not listed above, please contact us for a shipping quote. We recommend purchasing shipping insurance for international orders (included automatically for orders over NT$30,000).')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Returns */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-ayers-gold mb-4">
              {t('shipping.returnLabel', 'Satisfaction Guaranteed')}
            </p>
            <h2 className="text-4xl font-serif italic font-bold mb-4">{t('shipping.returnTitle', 'Return Policy')}</h2>
            <p className="text-sm text-ayers-ink/50 max-w-lg mx-auto">
              {t('shipping.returnDesc', 'We want you to be completely happy with your Ayers instrument. If you are not satisfied, we offer a straightforward 30-day return policy.')}
            </p>
          </motion.div>

          {/* Return Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-ayers-cream rounded-2xl p-8"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                {t('shipping.eligibleTitle', 'Eligible for Return')}
              </h3>
              <ul className="space-y-3">
                {[
                  t('shipping.eligible1', 'Unused instruments in original, undamaged condition'),
                  t('shipping.eligible2', 'Items in original packaging with all tags and accessories'),
                  t('shipping.eligible3', 'Returns initiated within 30 days of delivery'),
                  t('shipping.eligible4', 'Products purchased directly from ayersguitars.com'),
                  t('shipping.eligible5', 'Accessories and merchandise in unopened packaging'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-ayers-ink/60">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-ayers-cream rounded-2xl p-8"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle className="text-red-400" size={16} />
                {t('shipping.notEligibleTitle', 'Not Eligible for Return')}
              </h3>
              <ul className="space-y-3">
                {[
                  t('shipping.notEligible1', 'Custom-built or personalized instruments'),
                  t('shipping.notEligible2', 'Items showing signs of use, wear, or damage'),
                  t('shipping.notEligible3', 'Products without original packaging or accessories'),
                  t('shipping.notEligible4', 'Returns requested after the 30-day window'),
                  t('shipping.notEligible5', 'Items purchased from third-party retailers (contact retailer directly)'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-ayers-ink/60">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Return Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-serif italic font-bold text-center mb-10">
              {t('shipping.returnStepsTitle', 'How to Initiate a Return')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {returnSteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-ayers-cream rounded-2xl p-8 relative"
                >
                  <span className="text-6xl font-serif italic font-bold text-ayers-gold/10 absolute top-4 right-6">
                    {item.step}
                  </span>
                  <div className="relative">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold mb-2">
                      {t('shipping.step', 'Step')} {item.step}
                    </p>
                    <h4 className="text-lg font-bold mb-3">{item.title}</h4>
                    <p className="text-sm text-ayers-ink/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-ayers-gold/30 to-transparent mb-12" />
            <h2 className="text-2xl font-serif italic font-bold mb-4">
              {t('shipping.ctaTitle', 'Need Help With Your Order?')}
            </h2>
            <p className="text-sm text-ayers-ink/50 mb-8 max-w-md mx-auto">
              {t('shipping.ctaDesc', 'Our customer care team is available to assist with shipping inquiries, tracking, or return requests.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center bg-ayers-gold text-white px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-ayers-dark transition-all"
              >
                {t('shipping.ctaContact', 'Contact Us')} <ArrowRight size={16} className="ml-2" />
              </Link>
              <a
                href="mailto:service@ayersguitars.com"
                className="inline-flex items-center bg-transparent border-2 border-ayers-ink/20 text-ayers-ink px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:border-ayers-gold hover:text-ayers-gold transition-all"
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
