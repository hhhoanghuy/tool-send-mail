import { NextResponse } from 'next/server';
import { sendMail, formatEmailBody, replacePlaceholders } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { recipient, subject, template, data, fileData, fileName, emailUser, emailPass } = await request.json();

    const htmlBody = formatEmailBody(template, data);
    const mailSubject = replacePlaceholders(subject, data);

    const attachments = fileData ? [
      {
        filename: fileName,
        content: fileData.split("base64,")[1],
        encoding: 'base64'
      }
    ] : [];

    await sendMail({
      to: recipient,
      subject: mailSubject,
      html: htmlBody,
      attachments,
      emailUser,
      emailPass
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Send Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
