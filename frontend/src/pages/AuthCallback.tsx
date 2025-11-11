import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (success === 'true' && token && refreshToken) {
      // 保存 token（setToken 会同步更新 apiClient）
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      toast.success('登录成功！');
      
      // 延迟跳转以确保 toast 显示
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else if (error) {
      // 根据错误类型显示友好的错误消息
      let toastMessage = '登录失败';
      
      if (error === 'EMAIL_REQUIRED') {
        toastMessage = '无法获取邮箱信息';
      } else if (error === 'EMAIL_ALREADY_REGISTERED') {
        toastMessage = '该邮箱已被注册，请使用邮箱登录';
      } else if (error === 'EMAIL_ALREADY_EXISTS') {
        toastMessage = '该邮箱已被使用';
      } else {
        toastMessage = error;
      }
      
      toast.error(toastMessage);
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } else {
      toast.error('无效的回调参数');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    }
  }, [searchParams, navigate, setToken]);

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {success === 'true' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">登录成功</h2>
            <p className="text-text-secondary mb-6">正在跳转...</p>
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto" />
          </>
        ) : error ? (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">登录失败</h2>
            <p className="text-text-secondary mb-6">
              {error === 'EMAIL_REQUIRED' 
                ? '无法获取邮箱信息，请确保已授权邮箱访问权限'
                : error === 'EMAIL_ALREADY_REGISTERED'
                ? '该邮箱已被注册，请使用邮箱和密码登录'
                : error === 'EMAIL_ALREADY_EXISTS'
                ? '该邮箱已被其他账号使用，请使用其他邮箱或登录方式'
                : error}
            </p>
            {error === 'EMAIL_ALREADY_REGISTERED' && (
              <p className="text-sm text-brand-blue mb-4">
                提示：如果您已使用该邮箱注册，请使用邮箱和密码登录
              </p>
            )}
            <p className="text-sm text-text-tertiary">正在返回登录页面...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto mb-4" />
            <p className="text-text-secondary">处理中...</p>
          </>
        )}
      </Card>
    </div>
  );
};

export default AuthCallback;

