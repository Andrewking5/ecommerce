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

const Register: React.FC = () => {
  const { t } = useTranslation(['auth', 'validation', 'common']);
  
  const registerSchema = z.object({
    firstName: z.string().min(2, t('validation:minLength', { field: t('auth:form.firstName'), min: 2 })),
    lastName: z.string().min(2, t('validation:minLength', { field: t('auth:form.lastName'), min: 2 })),
    email: z.string().email(t('validation:email')),
    password: z.string()
      .min(8, t('validation:password'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('validation:password')),
    phone: z.string().optional(),
  });

  type RegisterForm = z.infer<typeof registerSchema>;
  
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data);
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
            {t('auth:title.register')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {t('auth:links.alreadyHaveAccount')}{' '}
            <Link
              to="/auth/login"
              className="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors duration-200"
            >
              {t('auth:links.signIn')}
            </Link>
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth:form.firstName')}
                autoComplete="given-name"
                {...register('firstName')}
                error={errors.firstName?.message}
              />

              <Input
                label={t('auth:form.lastName')}
                autoComplete="family-name"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </div>

            <Input
              label={t('auth:form.email')}
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label={t('auth:form.phone')}
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              error={errors.phone?.message}
              helperText={t('common:buttons.optional', { defaultValue: 'Optional' })}
            />

            <Input
              label={t('auth:form.password')}
              type="password"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
              helperText={t('validation:password')}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              {t('common:buttons.register')}
            </Button>

            <SocialLoginButtons />
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-text-tertiary">
            {t('common:termsAgreement')}{' '}
            <Link to="/terms" className="text-brand-blue hover:text-brand-blue/80">
              {t('common:footer.termsOfService')}
            </Link>{' '}
            {t('common:and', { defaultValue: 'and' })}{' '}
            <Link to="/privacy" className="text-brand-blue hover:text-brand-blue/80">
              {t('common:footer.privacyPolicy')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


