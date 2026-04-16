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

        <footer className="border-t mt-16 py-8 text-center text-xs text-gray-400 space-y-1">
          <p>Reports are user-submitted opinions, not verified facts.</p>
          <p>
            <Link href="/about" className="hover:underline">About & Takedowns</Link>
            {" · "}
            <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
