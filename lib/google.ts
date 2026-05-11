import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { slugify, personalizeContent } from './utils';

export { slugify, personalizeContent };

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/gmail.send'
];

export async function getGoogleAuth(customCredentials?: string) {
  const credentials = customCredentials ? JSON.parse(customCredentials) : JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return auth;
}

export async function sendMail({ to, subject, html, attachments, emailUser, emailPass }: { to: string, subject: string, html: string, attachments?: any[], emailUser?: string, emailPass?: string }) {
  const user = emailUser || process.env.EMAIL_USER;
  const pass = emailPass || process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Thiếu cấu hình Email gửi (User hoặc Pass)');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });

  const info = await transporter.sendMail({
    from: user,
    to,
    subject,
    html,
    attachments,
  });

  return info;
}
