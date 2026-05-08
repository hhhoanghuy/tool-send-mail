import { NextResponse } from 'next/server';
import { sendMail, formatEmailBody, replacePlaceholders } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { recipient, subject, template, data, fileData, fileName, emailUser, emailPass } = await request.json();

    const personalize = (text: string | null | undefined) => {
      if (!text) return '';
      return text.replace(/{{([\s\S]*?)}}/g, (match, p1) => {
        const cleanP1 = p1.replace(/<[^>]*>?/gm, '').trim().toLowerCase().replace(/\s+/g, '');
        
        if (!data || typeof data !== 'object') return match;

        const key = Object.keys(data).find(k => {
          const cleanK = k.trim().toLowerCase().replace(/\s+/g, '');
          return cleanK === cleanP1;
        });

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
