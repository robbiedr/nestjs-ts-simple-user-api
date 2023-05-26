import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'maildev', // Use the service name defined in the docker-compose.yml file
      port: 1025, // The SMTP port exposed by MailDev
      ignoreTLS: true, // Disable TLS for MailDev
    });
  }

  async sendActivationEmail(
    email: string,
    activationLink: string,
  ): Promise<void> {
    console.log({ email, activationLink });
    try {
      const mailOptions = {
        from: 'no-reply@email.xyz',
        to: email,
        subject: 'Activate your account',
        html: `
        <h1>Welcome!</h1>
        <p>Thank you for signing up. Please click the button below to activate your account:</p>
        <p>
          <a href="${activationLink}" target="_blank" style="display: inline-block;
          padding: 12px 24px; background-color: #4CAF50; color: #fff; text-decoration: none;">Activate Account</a>
        </p>
        <p>If you did not sign up for an account, you can safely ignore this email.</p>
        <p>Best regards,</p>
        <p>Your App Team</p>
      `,
      };

      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.messageId);
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
      });
    } catch (error) {
      console.error('Error sending activation email:', error);
      throw new Error('Failed to send activation email');
    }
  }
}
