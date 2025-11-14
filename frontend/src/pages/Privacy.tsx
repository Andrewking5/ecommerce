import React from 'react';
import Card from '@/components/ui/Card';

const Privacy: React.FC = () => {

  return (
    <div className="container-apple py-12">
        <Card className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold mb-6">隱私政策</h1>
            <p className="text-text-secondary mb-4">最後更新日期：{new Date().toLocaleDateString('zh-TW')}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. 資料收集</h2>
              <p className="text-text-secondary mb-4">
                我們收集以下類型的個人資料：
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
                <li>姓名、電子郵件地址、電話號碼</li>
                <li>送貨地址和帳單地址</li>
                <li>付款資訊（透過安全的第三方支付處理器）</li>
                <li>訂單歷史和購買記錄</li>
                <li>透過 Facebook 登入時提供的個人資料</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. 資料使用</h2>
              <p className="text-text-secondary mb-4">
                我們使用收集的資料用於：
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
                <li>處理和完成您的訂單</li>
                <li>提供客戶服務和支持</li>
                <li>發送訂單確認和更新</li>
                <li>改善我們的服務和用戶體驗</li>
                <li>遵守法律義務</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. 資料分享</h2>
              <p className="text-text-secondary mb-4">
                我們不會出售您的個人資料。我們可能與以下第三方分享資料：
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
                <li>支付處理器（如 Stripe）以處理付款</li>
                <li>物流服務提供商以完成訂單配送</li>
                <li>社交媒體平台（如 Facebook）當您使用社交登入時</li>
                <li>法律要求時向執法機構提供</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. 資料安全</h2>
              <p className="text-text-secondary mb-4">
                我們採用業界標準的安全措施來保護您的個人資料，包括加密、安全伺服器和存取控制。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. 您的權利</h2>
              <p className="text-text-secondary mb-4">
                您有權：
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
                <li>存取您的個人資料</li>
                <li>更正不準確的資料</li>
                <li>要求刪除您的資料（請參閱<a href="/data-deletion" className="text-brand-blue hover:underline">資料刪除說明</a>）</li>
                <li>反對某些資料處理活動</li>
                <li>資料可攜權</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Cookie 使用</h2>
              <p className="text-text-secondary mb-4">
                我們使用 Cookie 來改善您的瀏覽體驗、記住您的偏好並分析網站流量。您可以透過瀏覽器設定管理 Cookie。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. 聯絡我們</h2>
              <p className="text-text-secondary mb-4">
                如果您對本隱私政策有任何疑問，請透過以下方式聯絡我們：
              </p>
              <ul className="list-none space-y-2 text-text-secondary mb-4">
                <li>電子郵件：anpenghuang@gmail.com</li>
                <li>地址：台北市北投區知行路115號</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. 政策變更</h2>
              <p className="text-text-secondary mb-4">
                我們可能會不時更新本隱私政策。重大變更將透過電子郵件或網站公告通知您。
              </p>
            </section>
          </div>
        </Card>
      </div>
  );
};

export default Privacy;

