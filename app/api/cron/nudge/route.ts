import { processInactivityNudges } from "@/services/cron.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await processInactivityNudges();
  return NextResponse.json(result);
}
