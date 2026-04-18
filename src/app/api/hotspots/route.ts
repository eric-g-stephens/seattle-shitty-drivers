import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

export const revalidate = 60;

const QuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

type Bucket = { lat: number; lng: number; count: number };

function bucketKey(lat: number, lng: number, precision: number) {
  const f = Math.pow(10, precision);
  const bl = Math.round(lat * f) / f;
  const bn = Math.round(lng * f) / f;
  return `${bl.toFixed(precision)},${bn.toFixed(precision)}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const since = new Date(Date.now() - parsed.data.days * 86400_000).toISOString();
  const db = createServiceClient();

  const { data, error } = await db
    .from("reports")
    .select("lat,lng,created_at")
    .eq("hidden", false)
    .gte("created_at", since)
    .not("lat", "is", null)
    .not("lng", "is", null)
    .limit(5000);

  if (error) {
    console.error("hotspots query error:", error);
    return NextResponse.json({ error: "Failed to load hotspots" }, { status: 500 });
  }

  // Privacy: grid-bucket and suppress low-count buckets.
  const precision = 3; // ~110m lat grid; plus stored jitter makes it less precise
  const counts = new Map<string, number>();
  const centers = new Map<string, { lat: number; lng: number }>();

  for (const r of data ?? []) {
    if (typeof r.lat !== "number" || typeof r.lng !== "number") continue;
    const key = bucketKey(r.lat, r.lng, precision);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!centers.has(key)) centers.set(key, { lat: Number(key.split(",")[0]), lng: Number(key.split(",")[1]) });
  }

  const minCount = 3;
  const buckets: Bucket[] = [];
  for (const [key, count] of counts.entries()) {
    if (count < minCount) continue;
    const c = centers.get(key);
    if (!c) continue;
    buckets.push({ lat: c.lat, lng: c.lng, count });
  }

  buckets.sort((a, b) => b.count - a.count);
  return NextResponse.json({ days: parsed.data.days, buckets });
}

