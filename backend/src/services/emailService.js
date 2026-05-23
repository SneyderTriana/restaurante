const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email service for sending notifications
 * Supports welcome emails, confirmations, and password reset
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      logger.warn('SMTP not configured, email service will log instead of send');
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      logger.info(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Restaurant System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
    } catch (error) {
      logger.error('Failed to send email:', error);
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to Our Restaurant!';
    const html = `
      <h1>Welcome ${firstName}!</h1>
      <p>Thank you for registering with our restaurant management system.</p>
      <p>You can now make reservations and place orders online.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>
    `;
    await this.sendEmail(email, subject, html);
  }

  async sendReservationConfirmation(email, reservation) {
    const subject = 'Reservation Confirmation';
    const html = `
      <h1>Reservation Confirmed</h1>
      <p>Your reservation has been confirmed for:</p>
      <ul>
        <li>Date: ${reservation.reservationDate}</li>
        <li>Time: ${reservation.reservationTime}</li>
        <li>Party Size: ${reservation.partySize}</li>
      </ul>
      <p>Reservation ID: ${reservation.id}</p>
      <a href="${process.env.FRONTEND_URL}/reservations">View Details</a>
    `;
    await this.sendEmail(email, subject, html);
  }

  async sendOrderConfirmation(email, order) {
    const subject = 'Order Confirmation';
    const itemsList = order.items.map(item => 
      `<li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`
    ).join('');
    
    const html = `
      <h1>Order Confirmed</h1>
      <p>Your order has been received and is being prepared.</p>
      <h2>Order Items:</h2>
      <ul>${itemsList}</ul>
      <p><strong>Total: $${parseFloat(order.totalAmount).toFixed(2)}</strong></p>
      <p>Estimated preparation time: ${order.estimatedTime} minutes</p>
      <a href="${process.env.FRONTEND_URL}/orders">Track Order</a>
    `;
    await this.sendEmail(email, subject, html);
  }

  async sendOrderStatusUpdate(email, order) {
    const subject = `Order Status Update: ${order.status}`;
    const statusMessages = {
      preparing: 'Your order is now being prepared by our chefs.',
      ready: 'Your order is ready for pickup!',
      delivered: 'Your order has been delivered. Enjoy your meal!'
    };
    
    const html = `
      <h1>Order Status Update</h1>
      <p>${statusMessages[order.status] || `Your order status is now: ${order.status}`}</p>
      <p>Order ID: ${order.id}</p>
      <a href="${process.env.FRONTEND_URL}/orders">Track Order</a>
    `;
    await this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();