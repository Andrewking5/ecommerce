import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { initGA } from '@/src/lib/analytics';

export default function CookieConsent() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so the banner doesn't flash on first paint
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
    initGA();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-ayers-ink/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie size={24} className="text-ayers-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-ayers-ink mb-1">
                  {t('cookies.title', '我們使用 Cookie')}
                </p>
                <p className="text-xs text-ayers-ink/50 leading-relaxed">
                  {t('cookies.description', '我們使用 Cookie 和分析工具來改善您的瀏覽體驗。您可以選擇接受或拒絕。')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-ayers-ink/10 text-ayers-ink/60 hover:bg-ayers-cream transition-all"
              >
                {t('cookies.decline', '拒絕')}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-ayers-ink text-white hover:bg-ayers-gold transition-all"
              >
                {t('cookies.accept', '接受')}
              </button>
            </div>
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 sm:hidden text-ayers-ink/30 hover:text-ayers-ink/60"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
