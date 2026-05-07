import { google } from 'googleapis';
import { sendMail, formatEmailBody, replacePlaceholders } from './google';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'project_config.json');

function columnToLetter(column: number): string {
  let temp, letter = '';
  while (column >= 0) {
    temp = column % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = Math.floor(column / 26) - 1;
  }
  return letter;
}

export async function runAutomatedCampaign() {
  if (!fs.existsSync(CONFIG_PATH)) return { message: 'Chưa có cấu hình' };
  
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  if (!config.autoPilot) return { message: 'Chế độ tự động đang tắt' };

  const { spreadsheetId, sheetName, emailColumn, statusColumn, subject, template, startRow, fileInfo, emailUser, emailPass, googleCredentials } = config;
  const credentials = googleCredentials ? JSON.parse(googleCredentials) : JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${sheetName}'!A1:Z10` });
  const allRows = headerRes.data.values || [];
  const headerRow = allRows.find(row => row.map(c => String(c).toLowerCase().trim()).includes('email')) || [];
  const cleanHeaders = headerRow.map(h => String(h).trim());

  const emailIdx = cleanHeaders.indexOf(emailColumn);
  const statusIdx = cleanHeaders.indexOf(statusColumn);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A${startRow}:Z1000`,
  });
  const rows = res.data.values || [];

  let sentCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = row[emailIdx] ? String(row[emailIdx]).trim() : '';
    const status = row[statusIdx] ? String(row[statusIdx]).trim() : '';

    if (email && email.includes('@') && !status.includes('SENT')) {
      const personalize = (text: string) => {
        return text.replace(/{{(.*?)}}/g, (match, p1) => {
          const target = p1.trim().toLowerCase();
          const colIndex = cleanHeaders.findIndex(h => h.trim().toLowerCase() === target);
          return colIndex !== -1 ? row[colIndex] : match;
        });
      };

      const finalSubject = personalize(subject);
      const finalHtml = personalize(template);

      const attachments = fileInfo ? [
        {
          filename: fileInfo.name,
          content: fileInfo.data.split("base64,")[1],
          encoding: 'base64'
        }
      ] : [];

      try {
        await sendMail({
          to: email,
          subject: finalSubject,
          html: finalHtml,
          attachments,
          emailUser: emailUser || undefined,
          emailPass: emailPass || undefined
        });

        const colLetter = columnToLetter(statusIdx);
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'${sheetName}'!${colLetter}${Number(startRow) + i}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['✅ SENT (AUTO)']] }
        });
        sentCount++;
      } catch (err) {
        console.error(`Lỗi gửi tự động cho ${email}:`, err);
      }
    }
  }

  return { message: `Hoàn tất quét ngầm. Đã gửi thêm: ${sentCount} mail.` };
}
