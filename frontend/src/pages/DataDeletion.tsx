import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/services/users';
import toast from 'react-hot-toast';

const DataDeletion: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!isAuthenticated || !user) {
      toast.error('請先登入');
      navigate('/auth/login');
      return;
    }

    if (!confirm('確定要刪除您的帳戶嗎？此操作無法復原，所有資料將被永久刪除。')) {
      return;
    }

    try {
      await userApi.deleteUser(user.id);
      toast.success('帳戶已成功刪除');
      // 登出並重定向到首頁
      await logout();
      navigate('/');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '刪除帳戶失敗');
    }
  };

  return (
    <div className="container-apple py-12">
        <Card className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold mb-6">用戶資料刪除說明</h1>
            <p className="text-text-secondary mb-4">最後更新日期：{new Date().toLocaleDateString('zh-TW')}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">如何刪除您的資料</h2>
              <p className="text-text-secondary mb-4">
                如果您希望刪除您的帳戶和所有相關資料，您可以透過以下方式進行：
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">方法一：透過網站刪除</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <ol className="list-decimal list-inside space-y-3 text-text-secondary">
                  <li>登入您的帳戶</li>
                  <li>前往個人資料頁面</li>
                  <li>點擊「刪除帳戶」按鈕</li>
                  <li>確認刪除操作</li>
                </ol>
              </div>
              {isAuthenticated && user ? (
                <div className="mt-4">
                  <Button
                    onClick={handleDeleteAccount}
                    variant="primary"
                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  >
                    立即刪除我的帳戶
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-text-secondary mb-4">請先登入以刪除您的帳戶</p>
                  <Button
                    onClick={() => navigate('/auth/login')}
                    variant="primary"
                    className="w-full md:w-auto"
                  >
                    前往登入
                  </Button>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">方法二：透過電子郵件請求</h2>
              <p className="text-text-secondary mb-4">
                您也可以透過電子郵件向我們發送資料刪除請求。請發送郵件至：
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <p className="text-text-primary font-semibold mb-2">聯絡電子郵件：</p>
                <a 
                  href="mailto:anpenghuang@gmail.com?subject=資料刪除請求" 
                  className="text-brand-blue hover:underline"
                >
                  anpenghuang@gmail.com
                </a>
              </div>
              <p className="text-text-secondary mb-4">
                請在郵件中提供以下資訊：
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
                <li>您的帳戶電子郵件地址</li>
                <li>您的姓名</li>
                <li>明確說明您希望刪除所有資料</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">刪除的資料類型</h2>
              <p className="text-text-secondary mb-4">
                當您刪除帳戶時，我們將刪除以下資料：
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
                <li>個人資料（姓名、電子郵件、電話號碼）</li>
                <li>送貨地址和帳單地址</li>
                <li>訂單歷史記錄</li>
                <li>購物車內容</li>
                <li>帳戶偏好設定</li>
                <li>社交登入關聯資料</li>
              </ul>
              <p className="text-text-secondary mb-4">
                <strong>注意：</strong>根據法律要求，我們可能需要保留某些交易記錄一段時間。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">處理時間</h2>
              <p className="text-text-secondary mb-4">
                我們會在收到您的刪除請求後 30 天內完成資料刪除。您將收到確認郵件通知刪除已完成。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Facebook 登入用戶</h2>
              <p className="text-text-secondary mb-4">
                如果您使用 Facebook 登入，您也可以透過以下方式刪除與我們應用程式相關的資料：
              </p>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary mb-4">
                <li>前往 Facebook 設定</li>
                <li>選擇「應用程式和網站」</li>
                <li>找到我們的應用程式</li>
                <li>點擊「移除」以取消授權</li>
              </ol>
              <p className="text-text-secondary mb-4">
                這將移除 Facebook 與我們應用程式之間的資料分享，但不會刪除您在本網站上的帳戶資料。如需完全刪除帳戶，請使用上述方法。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">聯絡我們</h2>
              <p className="text-text-secondary mb-4">
                如果您對資料刪除有任何疑問，請聯絡我們：
              </p>
              <ul className="list-none space-y-2 text-text-secondary mb-4">
                <li>電子郵件：anpenghuang@gmail.com</li>
                <li>地址：台北市北投區知行路115號</li>
                <li>資料保護負責人：黃安鵬</li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
  );
};

export default DataDeletion;

