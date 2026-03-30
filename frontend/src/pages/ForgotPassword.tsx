import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useTranslation } from 'react-i18next';
import api from '@/src/services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('forgotPassword.error', 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ayers-cream min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-4xl font-serif italic font-bold text-ayers-ink mb-3">
            {t('forgotPassword.title', 'Reset Password')}
          </h1>
          <p className="text-sm text-ayers-ink/50">
            {t('forgotPassword.description', "Enter your email address and we'll send you a reset link.")}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-ayers-ink/5 p-8 sm:p-10">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <p className="text-sm text-ayers-ink/70 leading-relaxed mb-6">
                {t('forgotPassword.success', 'If an account exists with that email, a reset link has been sent. Please check your inbox.')}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-bold text-ayers-gold hover:text-ayers-ink transition-colors"
              >
                <ArrowLeft size={14} className="mr-2" />
                {t('forgotPassword.backToLogin', 'Back to Sign In')}
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs text-center bg-red-50 rounded-xl p-3"
                >
                  {error}
                </motion.p>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ayers-ink/40 mb-2">
                  {t('login.emailAddress', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-ayers-ink/8 bg-ayers-cream/30 text-sm focus:outline-none focus:border-ayers-gold/40 transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ayers-ink text-white py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-[13px] hover:bg-ayers-gold transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <GuitarSunLoader size={18} />
                ) : (
                  t('forgotPassword.submit', 'Send Reset Link')
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-bold text-ayers-ink/40 hover:text-ayers-gold transition-colors"
                >
                  <ArrowLeft size={12} className="mr-1" />
                  {t('forgotPassword.backToLogin', 'Back to Sign In')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
