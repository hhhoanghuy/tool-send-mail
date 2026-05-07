import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { sendMail } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { emailUser, emailPass, googleCredentials } = await request.json();

    // 1. Kiểm tra JSON Google
    if (googleCredentials) {
      try {
        const credentials = JSON.parse(googleCredentials);
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        // Thử gọi một hàm đơn giản để check quyền
        await sheets.spreadsheets.get({ spreadsheetId: '1_dummy_id_to_check_auth' }).catch(err => {
           // Nếu là 404 thì nghĩa là Auth OK nhưng ID sai (bình thường), nếu 401/403 là Auth lỗi
           if (err.status === 401 || err.status === 403) throw err;
        });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: 'Lỗi Google JSON: ' + e.message }, { status: 400 });
      }
    }

    // 2. Kiểm tra Email (Gửi thử 1 mail test nếu có đủ thông tin)
    if (emailUser && emailPass) {
      try {
        await sendMail({
          to: emailUser,
          subject: '🔔 Mail Automator: Kiểm tra kết nối thành công',
          html: '<p>Chúc mừng! Cấu hình email của bạn đã hoạt động chuẩn xác.</p>',
          emailUser,
          emailPass
        });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: 'Lỗi Email/App Password: ' + e.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Cấu hình hoàn toàn chính xác!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
