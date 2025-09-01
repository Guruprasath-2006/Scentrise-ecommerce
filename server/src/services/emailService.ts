import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Scentrise" <${env.SMTP_FROM || env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log('Email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <h1>Welcome to Scentrise, ${userName}!</h1>
      <p>Thank you for joining our luxury fragrance community.</p>
      <p>Start exploring our premium collections today!</p>
    `;
    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Scentrise!',
      html,
      text: `Welcome to Scentrise, ${userName}! Thank you for joining our luxury fragrance community.`
    });
  }

  async sendLowStockAlert(product: any, currentStock: number): Promise<boolean> {
    const adminEmail = env.ADMIN_EMAIL || 'admin@scentrise.com';
    const html = `
      <h1>Low Stock Alert</h1>
      <p>Product: ${product.title}</p>
      <p>Current Stock: ${currentStock} units</p>
      <p>Please restock immediately.</p>
    `;
    return this.sendEmail({
      to: adminEmail,
      subject: `Low Stock Alert: ${product.title}`,
      html,
      text: `Low Stock Alert: ${product.title} is running low with only ${currentStock} units remaining.`
    });
  }

  async sendOrderConfirmationEmail(userEmail: string, userName: string, orderData: any): Promise<boolean> {
    const html = `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order, ${userName}!</p>
      <p>Order ID: ${orderData._id}</p>
      <p>Total: ₹${orderData.total}</p>
      <p>We'll process your order and send you tracking information soon.</p>
    `;
    return this.sendEmail({
      to: userEmail,
      subject: `Order Confirmation - Scentrise`,
      html,
      text: `Thank you for your order, ${userName}! Order ID: ${orderData._id}. Total: ₹${orderData.total}`
    });
  }
}

export const emailService = new EmailService();
