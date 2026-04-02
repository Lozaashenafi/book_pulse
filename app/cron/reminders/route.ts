import { processBookReminders } from "@/services/schedule.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // OPTIONAL: Verify a secret header so random people can't trigger your emails
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await processBookReminders();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Cron failed" }, { status: 500 });
  }
}