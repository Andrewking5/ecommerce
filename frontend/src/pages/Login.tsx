import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

const Login: React.FC = () => {
  const { t } = useTranslation(['auth', 'validation', 'common']);
  
  const loginSchema = z.object({
    email: z.string().email(t('validation:email')),
    password: z.string().min(1, t('validation:required', { field: t('auth:form.password') })),
  });

  type LoginForm = z.infer<typeof loginSchema>;
  
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-text-primary">
            {t('auth:title.login')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {t('auth:links.alreadyHaveAccount')}{' '}
            <Link
              to="/auth/register"
              className="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors duration-200"
            >
              {t('auth:links.createAccount')}
            </Link>
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label={t('auth:form.email')}
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label={t('auth:form.password')}
              type="password"
              autoComplete="current-password"
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                  {t('common:rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors duration-200"
                >
                  {t('auth:messages.forgotPassword')}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              {t('common:buttons.login')}
            </Button>

            <SocialLoginButtons />
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-text-tertiary">
            {t('common:demoCredentials')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


