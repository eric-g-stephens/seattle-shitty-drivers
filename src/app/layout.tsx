import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seattle Shitty Drivers",
  description: "Report bad drivers in Seattle. Community leaderboard of the worst plates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        {/* Satirical disclaimer banner — visible on every page */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-xs text-yellow-900">
          <span className="font-semibold">Satire & entertainment only.</span>{" "}
          <span className="hidden sm:inline">
            Reports are unverified user opinions and not intended to be punitive.
          </span>{" "}
          <Link href="/about" className="underline underline-offset-2 hover:text-yellow-950">
            Disclaimer
          </Link>
        </div>

        <nav className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-40">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-5xl">
            <Link href="/" className="font-bold text-red-600">
              Seattle Shitty Drivers
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
              <Link
                href="/hotspots"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Hotspots
              </Link>
              <Link href="/report" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Report
              </Link>
              <Link href="/about" className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex-1">{children}</div>

        <footer className="border-t mt-16 py-10 text-center text-xs text-muted-foreground space-y-2 px-4">
          <p className="font-medium text-foreground/70">
            Seattle Shitty Drivers is a satirical website created for entertainment purposes only.
          </p>
          <p>
            All reports are user-submitted opinions and should not be taken as fact. This site does not verify, investigate,
            or validate any report. Not affiliated with any law enforcement or government agency.
            Not intended to be punitive.
          </p>
          <p>
            <Link href="/about" className="hover:underline">Full Disclaimer & Takedowns</Link>
            {" · "}
            <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
            {" · "}
            <Link href="/report" className="hover:underline">Report a Driver</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
