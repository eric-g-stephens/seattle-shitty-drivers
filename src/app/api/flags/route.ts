import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { hashReporter } from "@/lib/hash";

const FlagSchema = z.object({
  report_id: z.string().uuid(),
  reason:    z.string().max(200).optional(),
});

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = FlagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ip = getIp(req);
  const flaggerHash = await hashReporter(ip);
  const db = createServiceClient();

  const { error } = await db.from("report_flags").insert({
    report_id:    parsed.data.report_id,
    flagger_hash: flaggerHash,
    reason:       parsed.data.reason ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already flagged" }, { status: 409 });
    }
    console.error("flag insert error:", error);
    return NextResponse.json({ error: "Failed to flag report" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
