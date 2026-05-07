import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, range: inputRange, googleCredentials } = await request.json();
    
    const credentials = googleCredentials ? JSON.parse(googleCredentials) : JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
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
      range: `'${exactSheetName}'!A1:Z10`,
    });

    const allRows = response.data.values || [];
    const headerRow = allRows.find(row => row.map(c => String(c).toLowerCase()).includes('email')) || [];

    // Làm sạch tiêu đề (Trim)
    const processedHeaders = headerRow.map((h: string) => h ? String(h).trim() : '');

    return NextResponse.json({ headers: processedHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
