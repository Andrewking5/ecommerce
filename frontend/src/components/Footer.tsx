import { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, MessageCircle, CheckCircle } from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/src/lib/i18nRouting';
import { AyersLogo } from './AyersLogo';
import GuitarTuner from './GuitarTuner';
import api from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Footer() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Auto-fill email when user is logged in
  useEffect(() => {
    if (user?.email && !nlEmail) {
      setNlEmail(user.email);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlStatus('loading');
    try {
      await api.post('/newsletter/subscribe', { email: nlEmail });
      setNlStatus('success');
      setNlEmail('');
    } catch {
      setNlStatus('error');
    }
  };
  return (
    <footer className="bg-ayers-espresso text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <LocalizedLink to="/" className="inline-block mb-6">
              <AyersLogo className="w-32 text-white" animate={false} />
            </LocalizedLink>
            <p className="text-sm text-white/50 max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4 text-sm">
              <li><LocalizedLink to="/collections" className="hover:text-ayers-gold transition-colors">{t('nav.series')}</LocalizedLink></li>
              <li><LocalizedLink to="/customizer" className="hover:text-ayers-gold transition-colors">{t('nav.customLab')}</LocalizedLink></li>
              <li><LocalizedLink to="/community" className="hover:text-ayers-gold transition-colors">{t('nav.artists')}</LocalizedLink></li>
              <li><LocalizedLink to="/store-locator" className="hover:text-ayers-gold transition-colors">{t('nav.storeLocator')}</LocalizedLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">{t('footer.support')}</h4>
            <ul className="space-y-4 text-sm">
              <li><LocalizedLink to="/support" className="hover:text-ayers-gold transition-colors">{t('footer.customerCare')}</LocalizedLink></li>
              <li><LocalizedLink to="/warranty" className="hover:text-ayers-gold transition-colors">{t('footer.warranty')}</LocalizedLink></li>
              <li><LocalizedLink to="/shipping" className="hover:text-ayers-gold transition-colors">{t('footer.shippingReturns')}</LocalizedLink></li>
              <li><LocalizedLink to="/contact" className="hover:text-ayers-gold transition-colors">{t('footer.contactUs')}</LocalizedLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">{t('footer.newsletter')}</h4>
            <p className="text-sm text-white/50 mb-4">{t('footer.newsletterDesc')}</p>
            {nlStatus === 'success' ? (
              <div className="flex items-center space-x-2 text-green-400 text-sm">
                <CheckCircle size={16} />
                <span>{t('footer.subscribed')}</span>
              </div>
            ) : (
              <form className="flex" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className="bg-white/10 border border-white/20 px-4 py-2.5 text-sm flex-grow rounded-l-lg focus:outline-none focus:border-ayers-gold focus:bg-white/15 transition-all placeholder:text-white/30"
                  required
                />
                <button
                  type="submit"
                  disabled={nlStatus === 'loading'}
                  className="bg-ayers-gold text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-r-lg hover:bg-ayers-gold/80 active:scale-95 transition-all whitespace-nowrap disabled:opacity-60"
                >
                  {nlStatus === 'loading' ? <GuitarSunLoader size={14} /> : t('footer.signUp')}
                </button>
              </form>
            )}
            {nlStatus === 'error' && <p className="text-red-400 text-xs mt-2">{t('footer.subscribeFailed')}</p>}
            <div className="flex space-x-6 mt-8">
              <a href="https://www.facebook.com/AyersgtUluruuke" target="_blank" rel="noopener noreferrer" className="hover:text-ayers-gold transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://line.me/R/ti/p/@868lgkhc" target="_blank" rel="noopener noreferrer" className="hover:text-ayers-gold transition-colors" aria-label="LINE">
                <MessageCircle size={20} />
              </a>
              <a href="https://www.instagram.com/ayersguitar/" target="_blank" rel="noopener noreferrer" className="hover:text-ayers-gold transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/user/AyersGuitar" target="_blank" rel="noopener noreferrer" className="hover:text-ayers-gold transition-colors" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest opacity-50">
          <div className="flex items-center gap-2">
            <p>&copy; {new Date().getFullYear()} 愛樂詩音樂企業有限公司 Ayers Music Enterprise Co., Ltd. {t('footer.allRightsReserved')}</p>
            <GuitarTuner />
          </div>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <LocalizedLink to="/privacy" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</LocalizedLink>
            <LocalizedLink to="/terms" className="hover:text-white transition-colors">{t('footer.termsOfService')}</LocalizedLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
