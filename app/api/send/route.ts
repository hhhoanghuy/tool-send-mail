import { NextResponse } from 'next/server';
import { sendMail, personalizeContent } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { recipient, subject, template, data, headers, fileData, fileName, emailUser, emailPass } = await request.json();

    // Nếu đã có data và headers truyền vào, ta sẽ cá nhân hóa một lần nữa (phòng trường hợp page.tsx chưa làm)
    // Nếu subject/template đã được cá nhân hóa rồi (không còn {{}}), hàm này sẽ trả về nguyên bản.
    const finalSubject = data && headers ? personalizeContent(subject, data, headers) : subject;
    const finalHtml = data && headers ? personalizeContent(template, data, headers) : template;

    await sendMail({
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
