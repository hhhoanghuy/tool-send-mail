import { NextResponse } from 'next/server';
import { sendMail, formatEmailBody, replacePlaceholders } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { recipient, subject, template, data, fileData, fileName, emailUser, emailPass } = await request.json();

    const personalize = (text: string) => {
      return text.replace(/{{(.*?)}}/g, (match, p1) => {
        const target = p1.trim().toLowerCase();
        const key = Object.keys(data).find(k => k.trim().toLowerCase() === target);
        return key ? data[key] : match;
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
