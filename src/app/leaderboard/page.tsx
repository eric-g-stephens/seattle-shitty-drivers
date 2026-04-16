import { createServiceClient } from "@/lib/supabase/server";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Leaderboard — Seattle Shitty Drivers" };
export const revalidate = 60;

type Window = "all" | "30d" | "7d";

async function getLeaderboard(window: Window) {
  const db = createServiceClient();
  let query = db
    .from("vehicle_leaderboard")
    .select("*")
    .order("report_count", { ascending: false })
    .limit(50);

  if (window === "30d") {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    // We filter by last_report_at as a proxy — good enough for display
    query = query.gte("last_report_at", since);
  } else if (window === "7d") {
    const since = new Date(Date.now() - 7 * 86400_000).toISOString();
    query = query.gte("last_report_at", since);
  }

  const { data } = await query;
  return data ?? [];
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const params = await searchParams;
  const window = (["all", "30d", "7d"].includes(params.window ?? "") ? params.window : "all") as Window;
  const rows = await getLeaderboard(window);

  const windows: { label: string; value: Window }[] = [
    { label: "All time", value: "all" },
    { label: "30 days", value: "30d" },
    { label: "7 days", value: "7d" },
  ];

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Worst Drivers</h1>
        <Button asChild>
          <Link href="/report">Report a driver</Link>
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {windows.map((w) => (
          <Link
            key={w.value}
            href={`/leaderboard?window=${w.value}`}
            className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${
              window === w.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input bg-background hover:bg-accent"
            }`}
          >
            {w.label}
          </Link>
        ))}
      </div>

      <LeaderboardTable rows={rows} />
    </main>
  );
}
