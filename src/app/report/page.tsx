import { ReportForm } from "@/components/ReportForm";

export const metadata = { title: "Report a Driver — Seattle Shitty Drivers" };

export default function ReportPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Report a bad driver</h1>
      <p className="text-muted-foreground mb-8">
        All reports are anonymous. GPS must be within the Seattle area.
      </p>
      <ReportForm />
    </main>
  );
}
