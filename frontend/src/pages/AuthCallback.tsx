import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { GuitarSunLoader } from '../components/guitar';

/**
 * Handles OAuth callback redirect from social login (Google, Facebook).
 * Backend redirects here with ?token=xxx&success=true or ?success=false&error=xxx
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const errorMsg = searchParams.get('error');

    if (success === 'true' && token) {
      // Store the access token
      localStorage.setItem('accessToken', token);

      // Fetch user profile and update auth state
      api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(({ data }) => {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.data));
            updateUser(data.data);
            // Navigate to account page
            const lang = localStorage.getItem('i18nextLng') || 'zh-TW';
            navigate(`/${lang}/account`, { replace: true });
          } else {
            throw new Error('Failed to fetch profile');
          }
        })
        .catch(() => {
          setError('登入成功但無法取得用戶資料，請重新登入。');
          localStorage.removeItem('accessToken');
        });
    } else {
      // Login failed
      let msg = '社群登入失敗，請重試。';
      if (errorMsg === 'EMAIL_REQUIRED') {
        msg = '此社群帳號未提供電子郵件，無法登入。';
      } else if (errorMsg === 'EMAIL_ALREADY_REGISTERED' || errorMsg === 'EMAIL_ALREADY_EXISTS') {
        msg = '此電子郵件已被其他方式註冊，請使用原本的登入方式。';
      }
      setError(msg);
    }
  }, [searchParams, navigate, updateUser]);

  if (error) {
    const lang = localStorage.getItem('i18nextLng') || 'zh-TW';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ayers-cream px-4">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-2xl font-bold text-ayers-ink">登入失敗</h1>
          <p className="text-ayers-ink/70">{error}</p>
          <a
            href={`/${lang}/login`}
            className="inline-block px-8 py-3 bg-ayers-ink text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-ayers-ink/90 transition-colors"
          >
            返回登入
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ayers-cream">
      <GuitarSunLoader size={72} />
      <p className="mt-6 text-ayers-ink/60 text-sm">正在完成登入...</p>
    </div>
  );
}
