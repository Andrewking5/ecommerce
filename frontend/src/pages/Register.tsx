import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Or{' '}
            <Link
              to="/auth/login"
              className="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors duration-200"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                autoComplete="given-name"
                {...register('firstName')}
                error={errors.firstName?.message}
              />

              <Input
                label="Last name"
                autoComplete="family-name"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Phone number"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              error={errors.phone?.message}
              helperText="Optional"
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
              helperText="Must be at least 8 characters with uppercase, lowercase, and number"
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Create account
            </Button>

            <SocialLoginButtons />
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-text-tertiary">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-brand-blue hover:text-brand-blue/80">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-brand-blue hover:text-brand-blue/80">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


