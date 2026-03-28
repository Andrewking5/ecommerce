import sgMail from '@sendgrid/mail';

// 初始化SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export class EmailService {
  private static fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';

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
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email not sent.');
      return;
    }

    try {
      await sgMail.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || subject,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Send email error:', error);
      throw new Error('Failed to send email');
    }
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
}

