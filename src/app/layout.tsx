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
      <body className="min-h-screen flex flex-col">
        {/* Satirical disclaimer banner — visible on every page */}
        <div className="bg-yellow-50 border-b border-yellow-200 py-1.5 px-4 text-center text-xs text-yellow-800">
          🎭 <strong>Satire & entertainment only.</strong> All reports are unverified user opinions. This site is not affiliated with any government or law enforcement agency and is not intended to be punitive.{" "}
          <Link href="/about" className="underline hover:text-yellow-900">Full disclaimer</Link>
        </div>

        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-5xl">
            <Link href="/" className="font-bold text-red-600">
              Seattle Shitty Drivers
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/leaderboard" className="text-gray-500 hover:text-gray-900 transition-colors">
                Leaderboard
              </Link>
              <Link href="/report" className="text-gray-500 hover:text-gray-900 transition-colors">
                Report
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900 transition-colors">
                About
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex-1">{children}</div>

        <footer className="border-t mt-16 py-8 text-center text-xs text-gray-400 space-y-2 px-4">
          <p className="font-medium text-gray-500">
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
