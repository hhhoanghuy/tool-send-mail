import { google } from 'googleapis';
import { NextResponse } from 'next/server';

function columnToLetter(column: number): string {
  let temp, letter = '';
  while (column >= 0) {
    temp = column % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = Math.floor(column / 26) - 1;
  }
  return letter;
}

export async function POST(request: Request) {
  try {
    const { spreadsheetId, range, row, column, status, googleCredentials } = await request.json();
    
    const credentials = googleCredentials ? JSON.parse(googleCredentials) : JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Sử dụng hàm columnToLetter để xác định chính xác cột (hỗ trợ cả AA, AB...)
    const colLetter = columnToLetter(column);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${range}'!${colLetter}${row}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Sheet Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
