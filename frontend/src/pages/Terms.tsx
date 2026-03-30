import { motion } from 'motion/react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import {
  FileText,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: FileText,
      title: t('terms.acceptance.title', 'Acceptance of Terms'),
      paragraphs: [
        t('terms.acceptance.p1', 'By accessing, browsing, or using the Ayers Guitars website (www.ayersguitars.com), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws and regulations.'),
        t('terms.acceptance.p2', 'If you do not agree with any part of these terms, you must discontinue use of our website immediately. We reserve the right to modify these terms at any time, and your continued use of the website constitutes acceptance of any changes.'),
        t('terms.acceptance.p3', 'These terms apply to all visitors, users, and customers of the Ayers Guitars website and online store. Additional terms may apply to specific services, promotions, or features, which will be presented at the time of use.'),
      ],
    },
    {
      icon: ShoppingBag,
      title: t('terms.products.title', 'Products & Pricing'),
      paragraphs: [
        t('terms.products.p1', 'All products displayed on our website are subject to availability. We make every effort to display accurate product descriptions, images, and specifications. However, we do not guarantee that product descriptions or other content is accurate, complete, or error-free.'),
        t('terms.products.p2', 'Prices for our instruments are listed in New Taiwan Dollars (NT$) unless otherwise specified. All prices are subject to change without prior notice. Prices do not include applicable taxes, duties, or shipping fees, which will be calculated during the checkout process.'),
        t('terms.products.p3', 'We reserve the right to limit quantities of any products or services offered. Product images are for illustrative purposes; due to the handcrafted nature of our instruments, minor variations in wood grain, color, and finish are normal and reflect the unique character of each guitar.'),
        t('terms.products.p4', 'In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price and will notify you promptly with the option to reorder at the correct price.'),
      ],
    },
    {
      icon: CreditCard,
      title: t('terms.orders.title', 'Orders & Payment'),
      paragraphs: [
        t('terms.orders.p1', 'By placing an order through our website, you are making an offer to purchase products subject to these terms. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.'),
        t('terms.orders.p2', 'Payment must be made in full at the time of order placement. We accept major credit cards, bank transfers, and other payment methods as displayed during checkout. All payment information is processed securely through encrypted channels.'),
        t('terms.orders.p3', 'Upon successful order placement, you will receive an email confirmation with your order details. This confirmation does not constitute acceptance of your order; acceptance occurs when we ship your product and send a shipping confirmation email.'),
        t('terms.orders.p4', 'For custom or made-to-order instruments, a non-refundable deposit may be required. The remaining balance will be due upon completion and before shipping. Custom order timelines will be communicated during the ordering process.'),
      ],
    },
    {
      icon: Truck,
      title: t('terms.shipping.title', 'Shipping & Delivery'),
      paragraphs: [
        t('terms.shipping.p1', 'We ship to destinations within Taiwan and internationally. Shipping costs and estimated delivery times are calculated at checkout based on your location and selected shipping method.'),
        t('terms.shipping.p2', 'Risk of loss and title for items purchased pass to you upon delivery to the carrier. We are not responsible for delays caused by customs processing, weather conditions, or carrier-related issues beyond our control.'),
        t('terms.shipping.p3', 'For international orders, the recipient is responsible for all import duties, taxes, and customs fees imposed by the destination country. These charges are not included in the product price or shipping cost.'),
        t('terms.shipping.p4', 'Please ensure your shipping address is accurate and complete. We are not responsible for orders shipped to incorrect addresses provided by the customer. Address changes after order submission may not be possible once the item has been dispatched.'),
      ],
    },
    {
      icon: RotateCcw,
      title: t('terms.returns.title', 'Returns & Warranty'),
      paragraphs: [
        t('terms.returns.p1', 'We offer a 30-day return policy for unused, undamaged products in their original packaging. To initiate a return, please contact our customer service team within 30 days of delivery.'),
        t('terms.returns.p2', 'Custom-built and personalized instruments are non-refundable and non-exchangeable, except in cases of manufacturing defects covered under our warranty.'),
        t('terms.returns.p3', 'All Ayers guitars come with a Limited Lifetime Warranty covering defects in materials and workmanship. This warranty is valid for the original purchaser and is non-transferable. For complete warranty details, please visit our Warranty page.'),
        t('terms.returns.p4', 'Return shipping costs are the responsibility of the customer unless the return is due to a defect or error on our part. Refunds will be processed to the original payment method within 10-14 business days of receiving the returned item.'),
      ],
    },
    {
      icon: Scale,
      title: t('terms.intellectualProperty.title', 'Intellectual Property'),
      paragraphs: [
        t('terms.intellectualProperty.p1', 'All content on this website, including but not limited to text, graphics, logos, images, audio clips, video, product designs, and software, is the property of Ayers Guitars Co., Ltd. and is protected by international copyright, trademark, and other intellectual property laws.'),
        t('terms.intellectualProperty.p2', 'The Ayers Guitars name, logo, and all related product names, design marks, and slogans are trademarks of Ayers Guitars Co., Ltd. Use of any Ayers trademarks without prior written permission is strictly prohibited.'),
        t('terms.intellectualProperty.p3', 'You may view, download, and print content from this website for personal, non-commercial use only. Any other use, including reproduction, modification, distribution, or republication, without prior written consent from Ayers Guitars, is strictly prohibited.'),
      ],
    },
    {
      icon: AlertTriangle,
      title: t('terms.liability.title', 'Limitation of Liability'),
      paragraphs: [
        t('terms.liability.p1', 'To the fullest extent permitted by applicable law, Ayers Guitars Co., Ltd., its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our website or purchase of our products.'),
        t('terms.liability.p2', 'Our total liability for any claim arising from these terms or your use of our website shall not exceed the amount you paid for the specific product giving rise to the claim.'),
        t('terms.liability.p3', 'We do not guarantee that our website will be uninterrupted, error-free, or free of viruses or other harmful components. You use the website at your own risk.'),
        t('terms.liability.p4', 'These terms are governed by and construed in accordance with the laws of Taiwan, R.O.C. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Taipei, Taiwan.'),
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
              {t('terms.heroLabel', 'Legal')}
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif italic font-bold text-white mb-6">
              {t('terms.heroTitle', 'Terms of Service')}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('terms.heroDescription', 'Please read these terms carefully before using our website or purchasing our products. By using our services, you agree to these terms.')}
            </p>
            <p className="text-sm text-white/30 mt-6">
              {t('terms.effectiveDate', 'Effective: March 1, 2026')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-sm border border-ayers-ink/5 mb-16"
          >
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-ayers-gold mb-6">
              {t('terms.tableOfContents', 'Table of Contents')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section, i) => (
                <a
                  key={section.title}
                  href={`#section-${i}`}
                  className="flex items-center space-x-3 text-sm text-ayers-ink/60 hover:text-ayers-gold transition-colors group"
                >
                  <span className="w-6 h-6 rounded-full bg-ayers-gold/10 text-ayers-gold text-[10px] font-bold flex items-center justify-center group-hover:bg-ayers-gold group-hover:text-white transition-all">
                    {i + 1}
                  </span>
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                id={`section-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-sm border border-ayers-ink/5"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-ayers-gold/10 flex items-center justify-center">
                    <section.icon className="text-ayers-gold" size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold">
                      {t('terms.sectionLabel', 'Section')} {i + 1}
                    </p>
                    <h2 className="text-2xl font-serif italic font-bold">{section.title}</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, j) => (
                    <p key={j} className="text-sm text-ayers-ink/60 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-ayers-gold/30 to-transparent mb-8" />
            <p className="text-sm text-ayers-ink/40 mb-8">
              {t('terms.footerNote', 'If you have any questions about these Terms of Service, please contact us at')}{' '}
              <a href="mailto:service@ayersguitars.com" className="text-ayers-gold hover:underline">
                service@ayersguitars.com
              </a>
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                to="/privacy"
                className="text-xs font-bold uppercase tracking-widest text-ayers-gold hover:opacity-70 transition-opacity"
              >
                {t('terms.privacyLink', 'Privacy Policy')}
              </Link>
              <Link
                to="/contact"
                className="text-xs font-bold uppercase tracking-widest text-ayers-gold hover:opacity-70 transition-opacity"
              >
                {t('terms.contactLink', 'Contact Us')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
