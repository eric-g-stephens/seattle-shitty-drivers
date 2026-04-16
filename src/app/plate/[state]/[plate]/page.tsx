import { createServiceClient } from "@/lib/supabase/server";
import { BEHAVIOR_MAP } from "@/lib/behaviors";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlagButton } from "@/components/FlagButton";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ state: string; plate: string }>;
  searchParams: Promise<{ reported?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { state, plate } = await params;
  return { title: `${state} ${plate} — Seattle Shitty Drivers` };
}

export default async function PlatePage({ params, searchParams }: PageProps) {
  const { state, plate } = await params;
  const sp = await searchParams;
  const db = createServiceClient();

  const { data: vehicle } = await db
    .from("vehicles")
    .select("*")
    .eq("state", state.toUpperCase())
    .eq("plate", plate.toUpperCase())
    .single();

  if (!vehicle) notFound();

  const { data: reports } = await db
    .from("reports")
    .select("*")
    .eq("vehicle_id", vehicle.id)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(50);

  const allBehaviors = (reports ?? []).flatMap((r) => r.behaviors);
  const behaviorCounts = allBehaviors.reduce<Record<string, number>>((acc, code) => {
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});
  const sortedBehaviors = Object.entries(behaviorCounts).sort(([, a], [, b]) => b - a);

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      {sp.reported && (
        <div className="mb-6 rounded-md border border-green-500 bg-green-50 p-4 text-green-800">
          Report submitted. Thanks for keeping Seattle safer.
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold font-mono">
          {vehicle.state} {vehicle.plate}
        </h1>
        <p className="text-muted-foreground mt-1">
          {[vehicle.color, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Vehicle details unknown"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-lg">Total reports</CardTitle></CardHeader>
          <CardContent>
            <span className="text-4xl font-bold text-destructive">{reports?.length ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Most common offense</CardTitle></CardHeader>
          <CardContent>
            <span className="text-sm font-medium">
              {sortedBehaviors[0]
                ? BEHAVIOR_MAP[sortedBehaviors[0][0] as keyof typeof BEHAVIOR_MAP] ?? sortedBehaviors[0][0]
                : "—"}
            </span>
          </CardContent>
        </Card>
      </div>

      {sortedBehaviors.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold mb-3">Offenses</h2>
          <div className="flex flex-wrap gap-2">
            {sortedBehaviors.map(([code, count]) => (
              <Badge key={code} variant="outline" className="gap-1">
                {BEHAVIOR_MAP[code as keyof typeof BEHAVIOR_MAP] ?? code}
                <span className="font-bold text-destructive ml-1">×{count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold">Reports</h2>
        {(reports ?? []).map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap gap-1">
                  {report.behaviors.map((code) => (
                    <Badge key={code} variant="secondary" className="text-xs">
                      {BEHAVIOR_MAP[code as keyof typeof BEHAVIOR_MAP] ?? code}
                    </Badge>
                  ))}
                </div>
                <FlagButton reportId={report.id} />
              </div>
              {report.notes && (
                <p className="text-sm text-muted-foreground mt-2">{report.notes}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(report.created_at).toLocaleString()}
                {report.location_text && ` · ${report.location_text}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Leaderboard
        </Link>
        <Link href="/report" className="text-sm text-muted-foreground hover:text-foreground">
          Report another driver
        </Link>
      </div>
    </main>
  );
}
