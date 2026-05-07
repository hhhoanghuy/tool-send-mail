import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, range: inputRange, startRow, googleCredentials } = await request.json();
    
    let credentials;
    try {
      credentials = googleCredentials ? JSON.parse(googleCredentials) : (process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : null);
    } catch (e) {
      return NextResponse.json({ error: 'Định dạng JSON của Google Credentials không hợp lệ' }, { status: 400 });
    }

    if (!credentials) {
      return NextResponse.json({ error: 'Chưa cung cấp Google Credentials (JSON)' }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetNames = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];
    const exactSheetName = sheetNames.find(name => name?.trim().toLowerCase() === inputRange.trim().toLowerCase()) || inputRange;

    // 1. Lấy Header (luôn bắt đầu từ cột A)
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${exactSheetName}'!A1:Z10`, // Quét 10 hàng đầu để tìm tiêu đề
    });
    const allRows = headerRes.data.values || [];
    const headerRow = allRows.find(row => row.map(c => String(c).toLowerCase()).includes('email')) || [];

    // 2. Lấy Dữ liệu (luôn bắt đầu từ cột A)
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${exactSheetName}'!A${startRow}:Z1000`,
    });
    const rows = dataRes.data.values || [];

    // 3. MAPPING CẨN THẬN: Xóa khoảng trắng (Trim) cả tiêu đề và dữ liệu
    const mappedRows = rows.map(row => {
      const obj: any = {};
      headerRow.forEach((header, index) => {
        if (header) {
          const cleanHeader = String(header).trim();
          const cleanValue = row[index] ? String(row[index]).trim() : '';
          obj[cleanHeader] = cleanValue;
        }
      });
      return obj;
    });

    console.log('Dữ liệu hàng đầu tiên sau khi map:', mappedRows[0]); // Để debug xem Họ và tên có chưa
    return NextResponse.json({ rows: mappedRows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
