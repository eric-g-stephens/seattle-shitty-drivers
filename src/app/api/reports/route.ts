import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizePlate, validatePlate } from "@/lib/plate";
import { isInSeattle } from "@/lib/seattle";
import { hashReporter } from "@/lib/hash";
import { BEHAVIORS } from "@/lib/behaviors";
import { jitterLatLng } from "@/lib/geo-privacy";

const VALID_CODES = new Set(BEHAVIORS.map((b) => b.code));

const ReportSchema = z
  .object({
    state:         z.string().default("WA"),
    plate:         z.string().min(1),
    make:          z.string().max(50).optional(),
    model:         z.string().max(50).optional(),
    color:         z.string().max(30).optional(),
    behaviors:     z.array(z.string()).min(1).max(20),
    lat:           z.number().optional(),
    lng:           z.number().optional(),
    location_text: z.string().max(200).optional(),
    notes:         z.string().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    const hasGps = typeof v.lat === "number" && typeof v.lng === "number";
    const hasText = typeof v.location_text === "string" && v.location_text.trim().length > 0;
    if (!hasGps && !hasText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either GPS location or nearby cross streets.",
        path: ["location_text"],
      });
    }
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

  const hasGps = typeof data.lat === "number" && typeof data.lng === "number";
  if (hasGps && !isInSeattle(data.lat!, data.lng!)) {
    return NextResponse.json({ error: "GPS location must be within Seattle area" }, { status: 400 });
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

  // Vehicle rows are immutable (no UPDATE policy), so avoid upsert (which can hit UPDATE on conflict).
  const state = data.state.toUpperCase().trim() || "WA";
  const { data: existingVehicle, error: existingErr } = await db
    .from("vehicles")
    .select("id")
    .eq("state", state)
    .eq("plate", plate)
    .maybeSingle();

  if (existingErr) {
    console.error("vehicle lookup error:", existingErr);
    return NextResponse.json({ error: "Failed to save vehicle" }, { status: 500 });
  }

  const { data: vehicle, error: vehicleErr } = existingVehicle
    ? { data: existingVehicle, error: null }
    : await db
        .from("vehicles")
        .insert({
          state,
          plate,
          make: data.make ?? null,
          model: data.model ?? null,
          color: data.color ?? null,
        })
        .select("id")
        .single();

  if (vehicleErr || !vehicle) {
    console.error("vehicle insert error:", vehicleErr);
    return NextResponse.json({ error: "Failed to save vehicle" }, { status: 500 });
  }

  // Insert report
  const jittered = hasGps ? jitterLatLng(data.lat!, data.lng!, { maxMeters: 350 }) : null;
  const { data: report, error: reportErr } = await db
    .from("reports")
    .insert({
      vehicle_id:    vehicle.id,
      behaviors:     data.behaviors,
      ...(jittered ? { lat: jittered.lat, lng: jittered.lng } : {}),
      location_text: data.location_text?.trim() ? data.location_text.trim() : null,
      notes:         data.notes ?? null,
      reporter_hash: reporterHash,
    })
    .select("id")
    .single();

  if (reportErr || !report) {
    // If the DB schema hasn't been migrated yet to allow null GPS,
    // Supabase will throw a NOT NULL violation.
    // 23502 = not_null_violation (Postgres).
    if (reportErr && typeof reportErr === "object" && "code" in reportErr && (reportErr as { code?: string }).code === "23502") {
      return NextResponse.json(
        { error: "Server upgrade required: apply migration 0002_optional_gps.sql to allow cross-streets-only reports." },
        { status: 503 }
      );
    }
    console.error("report insert error:", reportErr);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }

  return NextResponse.json({ id: report.id, vehicle_id: vehicle.id }, { status: 201 });
}
