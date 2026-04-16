import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface LeaderboardRow {
  id: string | null;
  state: string | null;
  plate: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  report_count: number | null;
  last_report_at: string | null;
}

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  compact?: boolean;
}

export function LeaderboardTable({ rows, compact = false }: LeaderboardTableProps) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground">No reports yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Rank</th>
            <th className="pb-2 pr-4 font-medium">Plate</th>
            {!compact && <th className="pb-2 pr-4 font-medium">Vehicle</th>}
            <th className="pb-2 pr-4 font-medium">Reports</th>
            {!compact && <th className="pb-2 font-medium">Last seen</th>}
          </tr>
        </thead>
        <tbody>
          {rows.filter((r) => r.id && r.plate && r.state).map((row, i) => (
            <tr key={row.id!} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
              <td className="py-3 pr-4 text-muted-foreground">#{i + 1}</td>
              <td className="py-3 pr-4">
                <Link
                  href={`/plate/${row.state}/${row.plate}`}
                  className="font-mono font-bold hover:text-primary transition-colors"
                >
                  {row.state} {row.plate}
                </Link>
              </td>
              {!compact && (
                <td className="py-3 pr-4 text-muted-foreground">
                  {[row.color, row.make, row.model].filter(Boolean).join(" ") || "—"}
                </td>
              )}
              <td className="py-3 pr-4">
                <Badge variant="destructive">{row.report_count ?? 0}</Badge>
              </td>
              {!compact && (
                <td className="py-3 text-muted-foreground">
                  {row.last_report_at
                    ? new Date(row.last_report_at).toLocaleDateString()
                    : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
