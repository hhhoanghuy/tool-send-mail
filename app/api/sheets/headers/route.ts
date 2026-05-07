import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, range: inputRange, googleCredentials } = await request.json();
    
    if (!spreadsheetId || !inputRange) {
      return NextResponse.json({ error: 'Thiếu Spreadsheet ID hoặc Tab Name' }, { status: 400 });
    }

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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${exactSheetName}!A1:Z10`,
    });

    const allRows = response.data.values || [];
    const headerRow = allRows.find(row => 
      row.some(cell => String(cell).toLowerCase().trim().includes('email'))
    ) || allRows[0] || [];

    const headers = headerRow.map(h => String(h).trim());

    return NextResponse.json({ headers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
