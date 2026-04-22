import nodemailer from 'nodemailer';
import path from 'path';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}

export class EmailService {
  private static fromEmail = process.env.GMAIL_USER || 'noreply@example.com';

  /**
   * 发送订单确认邮件
   */
  static async sendOrderConfirmation(
    to: string,
    orderData: {
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
      }>;
      shippingAddress: any;
    }
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1d1d1f; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f5f5f7; }
          .order-details { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e7; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed</h1>
          </div>
          <div class="content">
            <p>Thank you for your order!</p>
            <div class="order-details">
              <h2>Order #${orderData.orderNumber}</h2>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <h3>Items:</h3>
              ${orderData.items
                .map(
                  (item) => `
                <div class="item">
                  <span>${item.name} × ${item.quantity}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `
                )
                .join('')}
              <div class="total">Total: $${orderData.totalAmount.toFixed(2)}</div>
            </div>
            <p>We'll send you another email when your order ships.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      html,
    });
  }

  /**
   * 发送订单状态更新邮件
   */
  static async sendOrderStatusUpdate(
    to: string,
    orderData: {
      orderId: string;
      orderNumber: string;
      status: string;
      trackingNumber?: string;
    }
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'Your order has been confirmed and is being processed.',
      PROCESSING: 'Your order is being prepared for shipment.',
      SHIPPED: 'Your order has been shipped!',
      DELIVERED: 'Your order has been delivered.',
      CANCELLED: 'Your order has been cancelled.',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1d1d1f; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f5f5f7; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update</h1>
          </div>
          <div class="content">
            <p>Your order #${orderData.orderNumber} status has been updated:</p>
            <p><strong>Status:</strong> ${orderData.status}</p>
            <p>${statusMessages[orderData.status] || 'Your order status has been updated.'}</p>
            ${orderData.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: `Order Update - #${orderData.orderNumber}`,
      html,
    });
  }

  /**
   * 发送欢迎邮件
   */
  static async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1d1d1f; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f5f5f7; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome!</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Welcome to our store! We're excited to have you as a member.</p>
            <p>Start shopping now and discover amazing products.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Welcome to Our Store!',
      html,
    });
  }

  /**
   * 发送密码重置邮件
   */
  static async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    resetUrl: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1d1d1f; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f5f5f7; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>You requested to reset your password.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html,
    });
  }

  /**
   * 發送郵箱驗證信
   */
  static async sendVerificationEmail(
    to: string,
    firstName: string,
    verificationUrl: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1d1d1f; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1714; color: #C8A96E; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; }
          .content { padding: 30px; background: #faf8f5; }
          .button { display: inline-block; padding: 14px 32px; background: #1a1714; color: #fff; text-decoration: none; border-radius: 12px; margin: 20px 0; font-weight: bold; letter-spacing: 1px; }
          .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AYERS GUITARS</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Welcome to Ayers Guitars! Please verify your email address to complete your registration.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p style="font-size: 13px; color: #666;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; word-break: break-all; color: #999;">${verificationUrl}</p>
            <p style="font-size: 13px; color: #666;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; Ayers Guitars. Handcrafted since 1996.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Verify Your Email - Ayers Guitars',
      html,
    });
  }

  /**
   * 發送電子報確認信（Double Opt-in）
   */
  static async sendNewsletterConfirmation(
    to: string,
    confirmUrl: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1d1d1f; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1714; color: #C8A96E; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; }
          .content { padding: 30px; background: #faf8f5; }
          .button { display: inline-block; padding: 14px 32px; background: #1a1714; color: #fff; text-decoration: none; border-radius: 12px; margin: 20px 0; font-weight: bold; }
          .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AYERS GUITARS</h1>
          </div>
          <div class="content">
            <p>Thank you for subscribing to the Ayers Guitars newsletter!</p>
            <p>Please confirm your subscription by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${confirmUrl}" class="button">Confirm Subscription</a>
            </p>
            <p style="font-size: 13px; color: #666;">If you didn't subscribe, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; Ayers Guitars. Handcrafted since 1996.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Confirm Your Newsletter Subscription - Ayers Guitars',
      html,
    });
  }

  /**
   * Send contact form notification to admin
   */
  static async sendContactNotification(
    to: string,
    data: { name: string; email: string; subject: string; message: string }
  ): Promise<void> {
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr />
      <p>${data.message.replace(/\n/g, '<br />')}</p>
    `;
    await this.sendEmail({ to, subject: `[Ayers Guitars] Contact: ${data.subject}`, html, text: data.message });
  }

  /**
   * Send auto-reply to contact form submitter
   */
  static async sendContactAutoReply(
    to: string,
    data: { name: string }
  ): Promise<void> {
    const html = `
      <h2>Thank you for contacting Ayers Guitars</h2>
      <p>Dear ${data.name},</p>
      <p>We have received your message and will get back to you within 1-2 business days.</p>
      <p>If your inquiry is urgent, please call us at +886 5 123 4567.</p>
      <br />
      <p>Best regards,<br />Ayers Guitars Customer Support</p>
    `;
    await this.sendEmail({ to, subject: 'We received your message — Ayers Guitars', html });
  }

  /** 靈魂吉他手大賽報名確認信 */
  static async sendSoulGuitarRegistration(to: string): Promise<void> {
    const couponPath = path.join(__dirname, '../assets/soul-guitar-coupon.png');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #1a1714; background: #fff; margin: 0; padding: 0; }
          .container { max-width: 620px; margin: 0 auto; padding: 0; }
          .header { background: #1a1714; padding: 32px 40px; text-align: center; }
          .header img { width: 140px; }
          .header h1 { color: #C8A96E; font-size: 20px; letter-spacing: 3px; margin: 12px 0 0; font-weight: 400; }
          .content { padding: 36px 40px; background: #faf8f5; }
          .divider { border: none; border-top: 1px solid #ddd; margin: 28px 0; }
          .section-title { font-size: 13px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
          .schedule { background: #fff; border-radius: 8px; padding: 20px 24px; margin: 16px 0; }
          .schedule p { margin: 6px 0; }
          .coupon-section { margin: 20px 0; text-align: center; }
          .coupon-section img { max-width: 100%; border-radius: 8px; }
          .footer { padding: 24px 40px; background: #1a1714; color: #aaa; font-size: 12px; }
          .footer a { color: #C8A96E; text-decoration: none; }
          .footer p { margin: 4px 0; }
          .lang-divider { border: none; border-top: 2px solid #C8A96E; margin: 36px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AYERS GUITARS</h1>
          </div>
          <div class="content">

            <!-- 中文 -->
            <p>親愛的參賽者 您好：</p>
            <p>感謝您報名參加【靈魂吉他手大賽】<br>我們已成功收到您的報名資料，期待欣賞您的精彩演出！</p>
            <p>以下為本次賽事的重要時程與資訊，請務必留意：</p>
            <div class="schedule">
              <p>▸ <strong>評審時間：</strong>6/08 – 6/17</p>
              <p>▸ <strong>得獎公布：</strong>6/29</p>
            </div>
            <p>請確認您的參賽影片是否符合相關規範。<br>若提交後發現內容需要修改，請於收件期間（4/22 – 6/07）聯繫我們協助處理。</p>
            <p>另外，也請您於提交後三個工作天內，確認您的影片是否已加入 Ayers 官方 YouTube「靈魂吉他手大賽」播放清單：<br>
            <a href="https://www.youtube.com/playlist?list=PLw6S60T2GSOx13l5eFQOME5Hd9TVzfRuw" style="color:#C8A96E;">https://www.youtube.com/playlist?list=PLw6S60T2GSOx13l5eFQOME5Hd9TVzfRuw</a></p>

            <hr class="divider">

            <p class="section-title">參賽專屬優惠</p>
            <p>感謝您的參與，我們特別隨信附上專屬折價券，歡迎於指定期間內使用。</p>
            <div class="coupon-section">
              <img src="cid:soul-guitar-coupon" alt="專屬折價券" />
            </div>

            <hr class="divider">

            <p>再次感謝您的支持，祝您比賽順利！</p>
            <p><strong>Ayers Guitars 敬上</strong></p>

            <hr class="lang-divider">

            <!-- English -->
            <p>Dear Participant,</p>
            <p>Thank you for registering for the Soul Guitar Competition.<br>We have successfully received your submission and look forward to your performance!</p>
            <p>Please take note of the following important dates:</p>
            <div class="schedule">
              <p>▸ <strong>Judging Period:</strong> June 8 – June 17</p>
              <p>▸ <strong>Results Announcement:</strong> June 29</p>
            </div>
            <p>Kindly ensure that your submitted video complies with all competition guidelines.<br>If you need to make any changes after submission, please contact us within the submission period (April 22 – June 7).</p>
            <p>Additionally, please check within three working days whether your video has been added to the official Ayers YouTube playlist:<br>
            <a href="https://www.youtube.com/playlist?list=PLw6S60T2GSOx13l5eFQOME5Hd9TVzfRuw" style="color:#C8A96E;">Soul Guitar Competition Playlist</a></p>

            <hr class="divider">

            <p class="section-title">Participant Exclusive Offer</p>
            <p>As a token of appreciation, we have included a special discount voucher in this email. Feel free to use it within the designated period.</p>

            <hr class="divider">

            <p>Thank you again for your participation, and we wish you the best of luck!</p>
            <p><strong>Sincerely,<br>Ayers Guitars</strong></p>

          </div>
          <div class="footer">
            <p>LINE：<a href="https://lin.ee/sEzBRSW">https://lin.ee/sEzBRSW</a></p>
            <p>Instagram：<a href="https://www.instagram.com/ayersguitartw/">@ayersguitartw</a></p>
            <p>Facebook：<a href="https://www.facebook.com/AyersgtUluruuke">AyersgtUluruuke</a></p>
            <p>Email：<a href="mailto:ayers@ayersguitars.com">ayers@ayersguitars.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmailWithAttachments({
      to,
      subject: '【靈魂吉他手大賽】報名確認 / Soul Guitarist Competition – Registration Confirmed',
      html,
      attachments: [
        {
          filename: 'coupon.png',
          path: couponPath,
          cid: 'soul-guitar-coupon',
        },
      ],
    });
  }

  /**
   * 发送邮件的基础方法
   */
  private static async sendEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    return this.sendEmailWithAttachments({ to, subject, html, text });
  }

  private static async sendEmailWithAttachments({
    to,
    subject,
    html,
    text,
    attachments,
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{ filename: string; path: string; cid: string }>;
  }): Promise<void> {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
      console.warn('Gmail OAuth2 credentials not configured. Email not sent.');
      return;
    }

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Ayers Guitars" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || subject,
        attachments,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Send email error:', error);
      throw new Error('Failed to send email');
    }
  }
}
