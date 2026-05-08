import { NextResponse } from 'next/server';
import { sendMail, formatEmailBody, replacePlaceholders } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { recipient, subject, template, data, fileData, fileName, emailUser, emailPass } = await request.json();

    const personalize = (text: string | null | undefined) => {
      if (!text) return '';
      
      // Hàm loại bỏ dấu tiếng Việt và ký tự đặc biệt để so khớp chuẩn xác
      const slugify = (str: string) => {
        return str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
          .replace(/[^a-z0-9]/g, '');
      };

      return text.replace(/{{([\s\S]*?)}}/g, (match, p1) => {
        const cleanP1 = p1.replace(/<[^>]*>?/gm, '')
                          .replace(/&nbsp;/g, ' ')
                          .replace(/&amp;/g, '&')
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>');
        const target = slugify(cleanP1);
        
        if (!data || typeof data !== 'object') return match;

        const key = Object.keys(data).find(k => slugify(k) === target);

        if (key && data[key] !== undefined && data[key] !== null) {
          return String(data[key]);
        }
        return match;
      });
    };

    const finalSubject = personalize(subject);
    const finalHtml = personalize(template);

    const success = await sendMail({
      to: recipient,
      subject: finalSubject,
      html: finalHtml,
      attachments: fileData ? [{ filename: fileName, content: fileData.split(',')[1], encoding: 'base64' }] : [],
      emailUser,
      emailPass
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Send Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
