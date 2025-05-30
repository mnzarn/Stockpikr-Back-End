import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USERNAME, 
    pass: config.EMAIL_PASSWORD, 
  },
});

export const EmailService = {
  async sendAlertEmail(to: string, symbol: string, current: number, target: number) {
    const mailOptions = {
      from: `"StockPikr Alerts" <${config.EMAIL_USERNAME}>`,
      to,
      subject: `📈 ${symbol} hit your alert price!`,
      html: `
        <h2>${symbol} Alert Triggered</h2>
        <p><strong>Current Price:</strong> $${current.toFixed(2)}</p>
        <p><strong>Your Alert Price:</strong> $${target.toFixed(2)}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  },

  async sendSellAlertEmail(to: string, symbol: string, current: number, target: number) {
    const mailOptions = {
      from: `"StockPikr Alerts" <${config.EMAIL_USERNAME}>`,
      to,
      subject: `📈 ${symbol} hit your alert price!`,
      html: `
        <h2>${symbol} Sell Now!</h2>
        <p><strong>Current Price:</strong> $${current.toFixed(2)}</p>
        <p><strong>Your Sell Price:</strong> $${target.toFixed(2)}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  },
};
