import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useLocalizedNavigate as useNavigate, LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useTranslation } from 'react-i18next';
import api from '@/src/services/api';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError(t('verifyEmail.error', 'Verification link is invalid.'));
      return;
    }

    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/account'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setError(err?.response?.data?.message || t('verifyEmail.error', 'Verification failed. The link may be invalid.'));
      });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-ayers-cream min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {status === 'loading' && (
          <div className="py-20">
            <GuitarSunLoader size={48} />
            <p className="mt-6 text-sm text-ayers-ink/50">
              {t('verifyEmail.verifying', 'Verifying your email...')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h1 className="text-3xl font-serif italic font-bold text-ayers-ink mb-3">
              {t('verifyEmail.success', 'Email Verified!')}
            </h1>
            <p className="text-sm text-ayers-ink/50 mb-6">
              {t('verifyEmail.successDesc', 'Your email has been verified successfully. Redirecting to your account...')}
            </p>
            <Link
              to="/account"
              className="inline-flex items-center text-sm font-bold text-ayers-gold hover:text-ayers-ink transition-colors"
            >
              {t('verifyEmail.goToAccount', 'Go to My Account')}
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <h1 className="text-3xl font-serif italic font-bold text-ayers-ink mb-3">
              {t('verifyEmail.errorTitle', 'Verification Failed')}
            </h1>
            <p className="text-sm text-ayers-ink/50 mb-6">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-bold text-ayers-gold hover:text-ayers-ink transition-colors"
            >
              {t('verifyEmail.goToLogin', 'Go to Login')}
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
