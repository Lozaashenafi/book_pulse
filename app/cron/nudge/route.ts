import { processInactivityNudges } from "@/services/cron.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Security Check: Compare the header to your secret key
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized Entry to Archives', { status: 401 });
  }

  // 2. Run the Job
  const result = await processInactivityNudges();
  
  return NextResponse.json(result);
}