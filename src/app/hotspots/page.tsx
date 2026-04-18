export default function HotspotsPage() {
  // Leaflet references window; load map client-only.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dynamic = require("next/dynamic").default as typeof import("next/dynamic").default;
  const HotspotsMap = dynamic(() => import("@/components/HotspotsMap").then((m) => m.HotspotsMap), {
    ssr: false,
    loading: () => <div className="text-sm text-muted-foreground">Loading map…</div>,
  });

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Hotspots</h1>
        <p className="text-sm text-muted-foreground">
          This map shows <span className="font-medium">privacy-preserving</span> hotspots based on reports.
          GPS points are stored with randomized jitter and displayed only as aggregated grid buckets.
        </p>
      </div>

      <HotspotsMap />
    </main>
  );
}

