import { NextResponse } from 'next/server';
import { runAutomatedCampaign } from '@/lib/automation';

export async function GET(request: Request) {
  // Kiểm tra Secret Key để bảo mật (chỉ cho phép Vercel gọi vào)
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  // Bạn có thể đổi 'my-secret-key' thành bất kỳ chuỗi nào bạn muốn trong .env
  if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runAutomatedCampaign();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
