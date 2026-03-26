import { motion } from 'motion/react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { Shield, Eye, Lock, Cookie, Globe, UserCheck, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: Eye,
      title: t('privacy.informationWeCollect.title', 'Information We Collect'),
      content: [
        t('privacy.informationWeCollect.intro', 'When you visit our website, place an order, or interact with our services, we may collect the following types of information:'),
        t('privacy.informationWeCollect.personalInfo', 'Personal identification information: name, email address, phone number, shipping and billing addresses.'),
        t('privacy.informationWeCollect.paymentInfo', 'Payment information: credit card details are processed securely through our third-party payment processors and are never stored on our servers.'),
        t('privacy.informationWeCollect.technicalData', 'Technical data: IP address, browser type, device information, pages visited, and browsing patterns on our website.'),
        t('privacy.informationWeCollect.communicationRecords', 'Communication records: any correspondence you have with our customer service team, including emails and support tickets.'),
        t('privacy.informationWeCollect.accountInfo', 'Account information: if you create an account, we store your login credentials (password is encrypted), order history, and preferences.'),
      ],
    },
    {
      icon: Shield,
      title: t('privacy.howWeUse.title', 'How We Use Your Information'),
      content: [
        t('privacy.howWeUse.intro', 'We use the information we collect for the following purposes:'),
        t('privacy.howWeUse.orderFulfillment', 'Order fulfillment: processing and shipping your purchases, sending order confirmations and tracking information.'),
        t('privacy.howWeUse.customerService', 'Customer service: responding to your inquiries, providing technical support, and handling warranty claims for your Ayers instruments.'),
        t('privacy.howWeUse.productImprovement', 'Product improvement: analyzing usage patterns to improve our website, products, and services.'),
        t('privacy.howWeUse.marketing', 'Marketing communications: with your consent, sending newsletters, product announcements, and promotional offers. You can opt out at any time.'),
        t('privacy.howWeUse.legalCompliance', 'Legal compliance: meeting our legal obligations, resolving disputes, and enforcing our agreements.'),
      ],
    },
    {
      icon: Lock,
      title: t('privacy.security.title', 'Data Protection & Security'),
      content: [
        t('privacy.security.intro', 'We implement industry-standard security measures to protect your personal information:'),
        t('privacy.security.encryption', 'All data transmissions are encrypted using SSL/TLS technology (256-bit encryption).'),
        t('privacy.security.pciCompliant', 'Payment processing is handled by PCI DSS compliant third-party providers.'),
        t('privacy.security.accessRestricted', 'Access to personal data is restricted to authorized personnel only, on a need-to-know basis.'),
        t('privacy.security.assessments', 'We conduct regular security assessments and vulnerability testing of our systems.'),
        t('privacy.security.storage', 'Personal data is stored on secure servers with enterprise-grade firewall protection.'),
        t('privacy.security.breachNotification', 'In the event of a data breach, we will notify affected users and relevant authorities in accordance with applicable laws.'),
      ],
    },
    {
      icon: Cookie,
      title: t('privacy.cookies.title', 'Cookies & Tracking'),
      content: [
        t('privacy.cookies.intro', 'Our website uses cookies and similar technologies to enhance your browsing experience:'),
        t('privacy.cookies.essential', 'Essential cookies: required for the website to function properly, including shopping cart functionality and secure checkout.'),
        t('privacy.cookies.analytics', 'Analytics cookies: help us understand how visitors interact with our website, allowing us to improve site performance and user experience.'),
        t('privacy.cookies.marketing', 'Marketing cookies: used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.'),
        t('privacy.cookies.manage', 'You can manage your cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.'),
        t('privacy.cookies.googleAnalytics', 'We use Google Analytics for website analytics. You can opt out by installing the Google Analytics Opt-out Browser Add-on.'),
      ],
    },
    {
      icon: Globe,
      title: t('privacy.thirdParty.title', 'Third-Party Services'),
      content: [
        t('privacy.thirdParty.intro', 'We work with trusted third-party service providers to operate our business:'),
        t('privacy.thirdParty.payment', 'Payment processors: for secure transaction processing (e.g., Stripe, PayPal).'),
        t('privacy.thirdParty.shipping', 'Shipping carriers: to deliver your orders and provide tracking information.'),
        t('privacy.thirdParty.email', 'Email service providers: for transactional and marketing email communications.'),
        t('privacy.thirdParty.analyticsProviders', 'Analytics providers: for website analytics and performance monitoring.'),
        t('privacy.thirdParty.cloudHosting', 'Cloud hosting: our website and data are hosted on secure cloud infrastructure.'),
        t('privacy.thirdParty.obligation', 'These third parties are contractually obligated to protect your information and may only use it for the specific services they provide to us.'),
      ],
    },
    {
      icon: UserCheck,
      title: t('privacy.yourRights.title', 'Your Rights'),
      content: [
        t('privacy.yourRights.intro', 'You have the following rights regarding your personal information:'),
        t('privacy.yourRights.access', 'Right of access: request a copy of the personal data we hold about you.'),
        t('privacy.yourRights.rectification', 'Right to rectification: request correction of inaccurate or incomplete personal data.'),
        t('privacy.yourRights.erasure', 'Right to erasure: request deletion of your personal data, subject to legal retention requirements.'),
        t('privacy.yourRights.restrict', 'Right to restrict processing: request that we limit how we use your data.'),
        t('privacy.yourRights.portability', 'Right to data portability: receive your data in a structured, machine-readable format.'),
        t('privacy.yourRights.object', 'Right to object: object to the processing of your personal data for marketing purposes.'),
        t('privacy.yourRights.contact', 'To exercise any of these rights, please contact us at service@ayersguitars.com. We will respond to your request within 30 days.'),
      ],
    },
    {
      icon: Mail,
      title: t('privacy.contactUs.title', 'Contact Us'),
      content: [
        t('privacy.contactUs.intro', 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:'),
        t('privacy.contactUs.company', 'Ayers Guitars Co., Ltd.'),
        t('privacy.contactUs.email', 'Email: service@ayersguitars.com'),
        t('privacy.contactUs.website', 'Website: www.ayersguitars.com'),
        t('privacy.contactUs.commitment', 'We are committed to resolving any concerns you may have about our collection and use of your personal information.'),
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
              {t('privacy.heroLabel', 'Legal')}
            </p>
            <h1 className="text-5xl md:text-7xl font-serif italic font-bold text-white mb-6">
              {t('privacy.heroTitle', 'Privacy Policy')}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('privacy.heroDescription', 'Your privacy matters to us. This policy outlines how Ayers Guitars collects, uses, and protects your personal information.')}
            </p>
            <p className="text-sm text-white/30 mt-6">
              {t('privacy.lastUpdated', 'Last updated: March 1, 2026')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-ayers-ink/5"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-ayers-gold/10 flex items-center justify-center">
                    <section.icon className="text-ayers-gold" size={22} />
                  </div>
                  <h2 className="text-2xl font-serif italic font-bold">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.content.map((paragraph, j) => (
                    <p
                      key={j}
                      className={`text-sm leading-relaxed ${
                        j === 0
                          ? 'text-ayers-ink/80 font-medium'
                          : 'text-ayers-ink/60 pl-4 border-l-2 border-ayers-gold/20'
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-ayers-gold/30 to-transparent mb-8" />
            <p className="text-sm text-ayers-ink/40">
              {t('privacy.footerNote', 'This privacy policy is effective as of March 1, 2026 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.')}
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link
                to="/terms"
                className="text-xs font-bold uppercase tracking-widest text-ayers-gold hover:opacity-70 transition-opacity"
              >
                {t('privacy.termsLink', 'Terms of Service')}
              </Link>
              <Link
                to="/contact"
                className="text-xs font-bold uppercase tracking-widest text-ayers-gold hover:opacity-70 transition-opacity"
              >
                {t('privacy.contactLink', 'Contact Us')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
