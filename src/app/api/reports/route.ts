import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizePlate, validatePlate } from "@/lib/plate";
import { isInSeattle } from "@/lib/seattle";
import { hashReporter } from "@/lib/hash";
import { BEHAVIORS } from "@/lib/behaviors";

const VALID_CODES = new Set(BEHAVIORS.map((b) => b.code));

const ReportSchema = z.object({
  state:         z.string().default("WA"),
  plate:         z.string().min(1),
  make:          z.string().max(50).optional(),
  model:         z.string().max(50).optional(),
  color:         z.string().max(30).optional(),
  behaviors:     z.array(z.string()).min(1).max(20),
  lat:           z.number(),
  lng:           z.number(),
  location_text: z.string().max(200).optional(),
  notes:         z.string().max(500).optional(),
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

  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const plateError = validatePlate(data.plate);
  if (plateError) return NextResponse.json({ error: plateError }, { status: 400 });

  const plate = normalizePlate(data.plate);

  const invalidBehaviors = data.behaviors.filter((b) => !VALID_CODES.has(b as never));
  if (invalidBehaviors.length > 0) {
    return NextResponse.json({ error: `Unknown behaviors: ${invalidBehaviors.join(", ")}` }, { status: 400 });
  }

  if (!isInSeattle(data.lat, data.lng)) {
    return NextResponse.json({ error: "Location must be within Seattle area" }, { status: 400 });
  }

  const ip = getIp(req);
  const reporterHash = await hashReporter(ip);

  const db = createServiceClient();

  // Rate limit: 5 reports per IP per hour
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_hash", reporterHash)
    .gte("created_at", hourAgo);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  // Upsert vehicle
  const { data: vehicle, error: vehicleErr } = await db
    .from("vehicles")
    .upsert(
      { state: data.state, plate, make: data.make ?? null, model: data.model ?? null, color: data.color ?? null },
      { onConflict: "state,plate", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (vehicleErr || !vehicle) {
    console.error("vehicle upsert error:", vehicleErr);
    return NextResponse.json({ error: "Failed to save vehicle" }, { status: 500 });
  }

  // Insert report
  const { data: report, error: reportErr } = await db
    .from("reports")
    .insert({
      vehicle_id:    vehicle.id,
      behaviors:     data.behaviors,
      lat:           data.lat,
      lng:           data.lng,
      location_text: data.location_text ?? null,
      notes:         data.notes ?? null,
      reporter_hash: reporterHash,
    })
    .select("id")
    .single();

  if (reportErr || !report) {
    console.error("report insert error:", reportErr);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }

  return NextResponse.json({ id: report.id, vehicle_id: vehicle.id }, { status: 201 });
}
