import { processInactivityNudges } from "@/services/cron.service";
import { processBookReminders } from "@/services/schedule.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Security Handshake
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("🚫 Unauthorized cron attempt blocked.");
    return new NextResponse('Unauthorized Entry to Archives', { status: 401 });
  }

  try {
    console.log("🚀 Starting Daily Master Cron: Processing Archives...");

    // 2. Run Both Jobs sequentially
    // We wrap them in their own try/catches so if one fails, the other still runs
    
    let nudgeResult;
    try {
      nudgeResult = await processInactivityNudges();
    } catch (err: any) {
      console.error("❌ Inactivity Nudges failed:", err.message);
      nudgeResult = { error: err.message };
    }

    let reminderResult;
    try {
      reminderResult = await processBookReminders();
    } catch (err: any) {
      console.error("❌ Book Reminders failed:", err.message);
      reminderResult = { error: err.message };
    }

    // 3. Return Combined Status Report
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: "Archive Sync Complete",
      nudges: nudgeResult,
      reminders: reminderResult,
    });

  } catch (globalError: any) {
    console.error("🔥 CRITICAL Master Cron failure:", globalError);
    return NextResponse.json({ 
      success: false, 
      error: "Master dispatch failed" 
    }, { status: 500 });
  }
}