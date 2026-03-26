import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalizedNavigate as useNavigate } from '@/src/lib/i18nRouting';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome, Facebook } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/src/lib/utils';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useTranslation } from 'react-i18next';

type Mode = 'login' | 'register';

export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useTranslation();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError(t('login.passwordsMismatch'));
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ firstName, lastName, email, password });
      }
      navigate('/account');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t('login.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div className="bg-ayers-cream min-h-screen flex items-center justify-center py-24 px-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-ayers-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-ayers-gold/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Brand header */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl font-serif italic font-bold text-ayers-ink"
          >
            Ayers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.4em] text-ayers-ink/50 mt-1"
          >
            Guitars
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          layout
          className="bg-white rounded-3xl shadow-xl shadow-ayers-ink/5 border border-ayers-ink/5 overflow-hidden"
        >
          {/* Mode toggle tabs */}
          <div className="flex border-b border-ayers-ink/5">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  'flex-1 py-5 text-[11px] font-bold uppercase tracking-[0.25em] transition-all relative',
                  mode === m
                    ? 'text-ayers-ink'
                    : 'text-ayers-ink/30 hover:text-ayers-ink/60'
                )}
              >
                {m === 'login' ? t('login.signIn') : t('login.createAccount')}
                {mode === m && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ayers-gold"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="p-8 sm:p-10">
            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Register: name fields */}
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40 mb-2">
                        {t('login.firstName')}
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          placeholder="John"
                          className="w-full bg-ayers-cream/50 border border-ayers-ink/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-ayers-ink placeholder:text-ayers-ink/20 focus:outline-none focus:border-ayers-gold focus:ring-1 focus:ring-ayers-gold/20 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40 mb-2">
                        {t('login.lastName')}
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          placeholder="Doe"
                          className="w-full bg-ayers-cream/50 border border-ayers-ink/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-ayers-ink placeholder:text-ayers-ink/20 focus:outline-none focus:border-ayers-gold focus:ring-1 focus:ring-ayers-gold/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40 mb-2">
                    {t('login.emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-ayers-cream/50 border border-ayers-ink/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-ayers-ink placeholder:text-ayers-ink/20 focus:outline-none focus:border-ayers-gold focus:ring-1 focus:ring-ayers-gold/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40">
                      {t('login.password')}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold hover:text-ayers-gold/80 transition-colors"
                      >
                        {t('login.forgotPassword')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-ayers-cream/50 border border-ayers-ink/10 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-ayers-ink placeholder:text-ayers-ink/20 focus:outline-none focus:border-ayers-gold focus:ring-1 focus:ring-ayers-gold/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ayers-ink/20 hover:text-ayers-ink/50 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40 mb-2">
                      {t('login.confirmPassword')}
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ayers-ink/20" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-ayers-cream/50 border border-ayers-ink/10 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-ayers-ink placeholder:text-ayers-ink/20 focus:outline-none focus:border-ayers-gold focus:ring-1 focus:ring-ayers-gold/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ayers-ink/20 hover:text-ayers-ink/50 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.25em] transition-all',
                    loading
                      ? 'bg-ayers-gold/60 text-white cursor-not-allowed'
                      : 'bg-ayers-gold text-white hover:bg-ayers-gold/90 shadow-lg shadow-ayers-gold/20'
                  )}
                >
                  {loading ? (
                    <GuitarSunLoader size={16} />
                  ) : (
                    <>
                      {mode === 'login' ? t('login.signIn') : t('login.createAccount')}
                      <ArrowRight size={14} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-ayers-ink/10" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-ayers-ink/25">
                {t('login.orContinueWith')}
              </span>
              <div className="flex-1 h-px bg-ayers-ink/10" />
            </div>

            {/* Social login buttons */}
            <div className="space-y-3">
              <motion.a
                href={`${API_URL}/auth/google`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-ayers-ink/10 bg-ayers-cream/30 text-ayers-ink text-xs font-bold uppercase tracking-widest hover:border-ayers-ink/20 hover:bg-ayers-cream/60 transition-all"
              >
                <Chrome size={16} />
                {t('login.continueWithGoogle')}
              </motion.a>
              <motion.a
                href={`${API_URL}/auth/facebook`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-ayers-ink/10 bg-ayers-cream/30 text-ayers-ink text-xs font-bold uppercase tracking-widest hover:border-ayers-ink/20 hover:bg-ayers-cream/60 transition-all"
              >
                <Facebook size={16} />
                {t('login.continueWithFacebook')}
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-[10px] text-ayers-ink/30 uppercase tracking-widest"
        >
          {mode === 'login'
            ? `${t('login.noAccount')} `
            : `${t('login.hasAccount')} `}
          <button
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="text-ayers-gold hover:text-ayers-gold/80 font-bold transition-colors"
          >
            {mode === 'login' ? t('login.createOne') : t('login.signInLink')}
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
