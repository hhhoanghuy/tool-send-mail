import { google } from 'googleapis';
import nodemailer from 'nodemailer';

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

/**
 * Hàm chuẩn hóa nội dung Email (Dùng chung cho cả Thủ công & Tự động)
 */
export function formatEmailBody(template: string, data: Record<string, any>) {
  // 1. Thay thế biến {{biến}}
  let body = template.replace(/{{(.*?)}}/g, (_, key) => {
    return data[key.trim()] !== undefined ? String(data[key.trim()]) : `{{${key.trim()}}}`;
  });

  // 2. Xử lý xuống dòng: Chỉ thêm <br> nếu nội dung không phải là HTML (không có thẻ <div> hoặc <p>)
  if (!body.includes('<div') && !body.includes('<p') && !body.includes('<br')) {
    body = body.replace(/\n/g, '<br>');
  }

  return body;
}

export function replacePlaceholders(template: string, data: Record<string, any>) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return data[key.trim()] !== undefined ? String(data[key.trim()]) : `{{${key.trim()}}}`;
  });
}
