# Build Progress

## Step 1 — Repo + Next.js scaffold + Tailwind + shadcn init
[x] Next.js 16.2.4 scaffolded, GitHub repo created and pushed
[x] shadcn configured manually (components.json + CSS vars) — interactive CLI skipped
[x] All deps installed: supabase-js, zod, react-hook-form, Radix UI, lucide-react

## Step 2 — Supabase project + migration
[x] Migration applied to existing project (vwcjpbgufxmipmelahme)
[x] Tables: vehicles, reports, report_flags — all with RLS
[x] View: vehicle_leaderboard (security_invoker = true)
[x] Triggers: bump_vehicle_last_reported, flag_autohide (hides at 3 flags)
[x] .env.local written — **SUPABASE_SERVICE_ROLE_KEY still needs to be filled in**

## Step 3 — Lib files
[x] src/lib/supabase/server.ts — service-role client
[x] src/lib/supabase/client.ts — anon browser client
[x] src/lib/supabase/types.ts — generated types (correct __InternalSupabase field)
[x] src/lib/behaviors.ts — 20-behavior catalog
[x] src/lib/plate.ts — normalization + validation
[x] src/lib/seattle.ts — bounding box check
[x] src/lib/hash.ts — IP hashing with daily salt

## Step 4 — /api/reports endpoint
[x] POST /api/reports — Zod validation, plate normalize, Seattle bbox check, IP rate limit (5/hr), vehicle upsert, report insert

## Step 5 — /report form
[x] ReportForm.tsx + GpsCapture.tsx + BehaviorPicker.tsx
[x] /report page

## Step 6 — /leaderboard page
[x] LeaderboardTable.tsx component
[x] /leaderboard page with all-time/30d/7d window selector

## Step 7 — /plate/[state]/[plate] vehicle detail
[x] Vehicle detail page with report cards, behavior breakdown, FlagButton

## Step 8 — /api/flags + flag UI
[x] POST /api/flags route
[x] FlagButton.tsx client component

## Step 9 — Rate limiting
[x] DB-based rate limiting in /api/reports (5 reports/IP/hour via reporter_hash)
[ ] Vercel KV upgrade for cross-region rate limiting (optional v2 improvement)

## Step 10 — Homepage + /about + footer
[x] Homepage with hero + top 5 leaderboard preview + feature callouts
[x] /about page with disclaimer + takedown contact
[x] Footer with disclaimer + links

## Step 11 — Deploy to Vercel
[ ] vercel:bootstrap or vercel link + env var setup
[ ] Preview deploy + smoke test
[ ] Production promote
