import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocalizedNavigate as useNavigate, LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useTranslation } from 'react-i18next';
import api from '@/src/services/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(t('login.passwordsMismatch', 'Passwords do not match.'));
      return;
    }

    if (password.length < 8) {
      setError(t('resetPassword.minLength', 'Password must be at least 8 characters.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('resetPassword.invalidToken', 'This reset link is invalid or has expired.'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-ayers-cream min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-serif italic font-bold mb-3">
            {t('resetPassword.invalidToken', 'Invalid Reset Link')}
          </h1>
          <p className="text-sm text-ayers-ink/50 mb-6">
            {t('resetPassword.invalidTokenDesc', 'This reset link is invalid or has expired. Please request a new one.')}
          </p>
          <Link to="/forgot-password" className="text-sm font-bold text-ayers-gold hover:text-ayers-ink transition-colors">
            {t('resetPassword.requestNew', 'Request New Link')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ayers-cream min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif italic font-bold text-ayers-ink mb-3">
            {t('resetPassword.title', 'Set New Password')}
          </h1>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-ayers-ink/5 p-8 sm:p-10">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <p className="text-sm text-ayers-ink/70 leading-relaxed">
                {t('resetPassword.success', 'Password reset successfully. Redirecting to login...')}
              </p>
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
                  {t('resetPassword.newPassword', 'New Password')}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-ayers-ink/8 bg-ayers-cream/30 text-sm focus:outline-none focus:border-ayers-gold/40 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ayers-ink/20 hover:text-ayers-ink/40"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ayers-ink/40 mb-2">
                  {t('resetPassword.confirmPassword', 'Confirm New Password')}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-ayers-ink/8 bg-ayers-cream/30 text-sm focus:outline-none focus:border-ayers-gold/40 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ayers-ink text-white py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-[13px] hover:bg-ayers-gold transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <GuitarSunLoader size={18} /> : t('resetPassword.submit', 'Reset Password')}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
