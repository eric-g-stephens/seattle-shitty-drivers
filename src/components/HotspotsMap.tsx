"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

type Bucket = { lat: number; lng: number; count: number };

export function HotspotsMap() {
  const [days, setDays] = useState(30);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/hotspots?days=${days}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(typeof j?.error === "string" ? j.error : "Failed to load hotspots");
        return j as { buckets: Bucket[] };
      })
      .then((j) => {
        if (cancelled) return;
        setBuckets(Array.isArray(j.buckets) ? j.buckets : []);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load hotspots");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const center = useMemo<LatLngExpression>(() => [47.6062, -122.3321], []);
  const maxCount = useMemo(() => Math.max(1, ...buckets.map((b) => b.count)), [buckets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((d) => (
          <Button
            key={d}
            type="button"
            variant={days === d ? "default" : "outline"}
            onClick={() => setDays(d)}
          >
            Last {d} days
          </Button>
        ))}
        {loading && <span className="text-sm text-muted-foreground ml-2">Loading…</span>}
        {error && <span className="text-sm text-destructive ml-2">{error}</span>}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="h-[65vh] min-h-[420px]">
          <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {buckets.map((b) => {
              const intensity = b.count / maxCount;
              const radius = 6 + Math.round(intensity * 14);
              const fillOpacity = 0.25 + intensity * 0.45;
              return (
                <CircleMarker
                  key={`${b.lat},${b.lng}`}
                  center={[b.lat, b.lng]}
                  radius={radius}
                  pathOptions={{ color: "hsl(var(--destructive))", fillColor: "hsl(var(--destructive))", fillOpacity }}
                >
                  <Tooltip direction="top">
                    {b.count} report{b.count === 1 ? "" : "s"} (bucket)
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

