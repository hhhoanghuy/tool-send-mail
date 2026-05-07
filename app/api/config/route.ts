import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'project_config.json');

export async function GET() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tải cấu hình' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const config = await request.json();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể lưu cấu hình' }, { status: 500 });
  }
}
