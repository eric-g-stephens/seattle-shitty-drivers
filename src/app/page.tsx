import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

async function getTop5() {
  const db = createServiceClient();
  const { data } = await db
    .from("vehicle_leaderboard")
    .select("*")
    .order("report_count", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function HomePage() {
  const top5 = await getTop5();

  return (
    <main>
      <section className="bg-red-600 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-4">Seattle Shitty Drivers</h1>
        <p className="text-xl mb-8 opacity-90 max-w-xl mx-auto">
          Saw someone blow through a red light, buzz a cyclist, or just drive like an absolute menace?
          Report them. Name and shame.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/report">Report a driver</Link>
        </Button>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Hall of Shame</h2>
          <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-gray-900">
            Full leaderboard →
          </Link>
        </div>
        <LeaderboardTable rows={top5} compact />
      </section>

      <section className="bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: "📍", title: "GPS-verified", body: "Every report is tied to a real Seattle location" },
            { icon: "👤", title: "Anonymous", body: "No account needed. Your IP is hashed and never stored." },
            { icon: "🚩", title: "Community flagged", body: "False reports get flagged out by the crowd" },
          ].map((f) => (
            <div key={f.title} className="space-y-2">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
