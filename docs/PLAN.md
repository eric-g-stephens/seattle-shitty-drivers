# Seattle Shitty Drivers — Implementation Plan

## Context

Build a public-facing website where Seattle residents can report bad driving behavior tied to specific vehicles (license plate + make/model + GPS location + behavior categories), and surface a leaderboard of the most-reported vehicles. The point is part civic-venting outlet, part informal accountability tool.

Decisions locked in from clarifying questions:
- **Anonymous reporting + IP-based rate limiting** (no accounts in v1)
- **No photo uploads** in v1 (text/structured data only)
- **Seattle-scoped** (GPS validated against a Seattle-area bounding box)
- **Community flagging** (reports auto-hide after a flag threshold)

Stack: **Next.js 16 (App Router) on Vercel** + **Supabase** (Postgres + PostGIS + RLS) + **Tailwind/shadcn-ui**. New GitHub repo.

---

## Repo & Project Setup

1. Create new GitHub repo `seattle-shitty-drivers` (public) under Eric's account via `gh repo create`.
2. Bootstrap Next.js 16 + TypeScript + Tailwind + App Router:
   ```
   pnpm create next-app@latest seattle-shitty-drivers --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
   ```
3. Install: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`, shadcn-ui components (button, form, input, select, card, badge, table, dialog, toast).
4. Provision Supabase project (`seattle-shitty-drivers`) via the `supabase` skill / MCP. Enable PostGIS extension.
5. Link to Vercel via `vercel:bootstrap` skill — auto-wires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## Database Schema (Supabase / Postgres)

```sql
create extension if not exists postgis;

-- Canonical vehicle (one row per unique plate). Aggregations roll up here.
create table vehicles (
  id           uuid primary key default gen_random_uuid(),
  state        text not null default 'WA',
  plate        text not null,                      -- normalized: uppercase, no spaces/dashes
  make         text,
  model        text,
  color        text,
  first_reported_at timestamptz not null default now(),
  last_reported_at  timestamptz not null default now(),
  unique (state, plate)
);
create index on vehicles (last_reported_at desc);

-- Individual incident reports.
create table reports (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references vehicles(id) on delete cascade,
  behaviors     text[] not null check (array_length(behaviors, 1) between 1 and 10),
  location      geography(point, 4326) not null,
  location_text text,                              -- optional reverse-geocoded label
  notes         text check (char_length(notes) <= 500),
  reporter_hash text not null,                     -- sha256(ip + daily_salt) — for rate limiting
  flag_count    int  not null default 0,
  hidden        bool not null default false,
  created_at    timestamptz not null default now()
);
create index on reports (vehicle_id, created_at desc);
create index on reports using gist (location);
create index on reports (reporter_hash, created_at desc);

-- Flag records (one per user per report).
create table report_flags (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references reports(id) on delete cascade,
  flagger_hash text not null,
  reason      text,
  created_at  timestamptz not null default now(),
  unique (report_id, flagger_hash)
);

-- Trigger: bump vehicles.last_reported_at on insert; auto-hide reports at flag threshold.
create or replace function bump_vehicle_last_reported() returns trigger as $$
begin
  update vehicles set last_reported_at = now() where id = new.vehicle_id;
  return new;
end $$ language plpgsql;
create trigger reports_bump_vehicle after insert on reports
  for each row execute function bump_vehicle_last_reported();

create or replace function autohide_on_flag_threshold() returns trigger as $$
begin
  update reports
    set flag_count = flag_count + 1,
        hidden = (flag_count + 1) >= 3
    where id = new.report_id;
  return new;
end $$ language plpgsql;
create trigger flag_autohide after insert on report_flags
  for each row execute function autohide_on_flag_threshold();

-- Leaderboard view (excludes hidden reports).
create or replace view vehicle_leaderboard as
select v.id, v.state, v.plate, v.make, v.model, v.color,
       count(r.id) filter (where r.hidden = false) as report_count,
       max(r.created_at) filter (where r.hidden = false) as last_report_at
from vehicles v
left join reports r on r.vehicle_id = v.id
group by v.id;
```

**RLS:** enable on all tables. Public read on `vehicles`, `reports` (where `hidden = false`), and `vehicle_leaderboard`. All writes go through server-side API routes using the service-role key — no direct client writes. This lets us enforce rate limiting and IP hashing server-side.

---

## Bad-Behavior Catalog

Stored as an enum-style constant in `src/lib/behaviors.ts` (not a DB table — keeps deploys simple). Stored on reports as `text[]`.

```ts
export const BEHAVIORS = [
  { code: "red_light",       label: "Ran a red light" },
  { code: "stop_sign",       label: "Blew through a stop sign" },
  { code: "tailgating",      label: "Tailgating" },
  { code: "unsafe_pass",     label: "Unsafe passing / lane change" },
  { code: "speeding",        label: "Speeding" },
  { code: "no_yield_ped",    label: "Didn't yield to pedestrians" },
  { code: "block_crosswalk", label: "Blocked the crosswalk" },
  { code: "block_box",       label: "Blocked the intersection" },
  { code: "phone",           label: "On their phone / distracted" },
  { code: "no_signal",       label: "No turn signal" },
  { code: "bike_lane_drive", label: "Driving in the bike lane" },
  { code: "bike_lane_block", label: "Blocked the bike lane" },
  { code: "road_rage",       label: "Aggressive driving / road rage" },
  { code: "cutoff",          label: "Cut someone off" },
  { code: "illegal_uturn",   label: "Illegal U-turn" },
  { code: "wrong_way",       label: "Wrong-way driving" },
  { code: "no_emergency",    label: "Didn't yield to emergency vehicle" },
  { code: "merge_fail",      label: "Wouldn't zipper merge" },
  { code: "no_headlights",   label: "Driving without headlights" },
  { code: "parking_violation", label: "Parked illegally (hydrant, crosswalk, bike lane, etc.)" },
] as const;
```

---

## Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Hero + "Report a driver" CTA + top 5 worst plates preview |
| `/report` | Full submission form |
| `/leaderboard` | Paginated leaderboard, sortable by all-time / 30-day / 7-day |
| `/plate/[state]/[plate]` | Vehicle detail: make/model, all visible reports, behavior breakdown, mini-map |
| `/about` | What this is, privacy/disclaimer, takedown contact |

API (server actions or `app/api/*/route.ts`):
- `POST /api/reports` — validates Zod schema, hashes IP, rate-limits, upserts vehicle, inserts report.
- `POST /api/flags` — hashes IP, inserts flag (UNIQUE prevents double-flagging).
- `GET /api/leaderboard?window=all|30d|7d` — queries `vehicle_leaderboard` view.

---

## Key Implementation Details

**Plate normalization** (`src/lib/plate.ts`): uppercase, strip whitespace and `-` and `·`. Reject empty / >8 chars / non-alphanumeric.

**Geolocation** (`src/components/GpsCapture.tsx`): use `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`. Validate coords inside Seattle bounding box (`lat 47.40–47.80, lng -122.50 – -122.20`); reject outside. Fall back to a manual "use approximate location" button that drops a pin via Mapbox geocoder.

**Rate limiting** (`src/lib/rateLimit.ts`): Use Vercel KV (Upstash Redis via marketplace) — `5 reports / IP / hour`, `30 / IP / day`. IP from `x-forwarded-for`. If KV adds friction, fall back to a Postgres-based limiter using `reports.reporter_hash + created_at`.

**IP hashing**: `sha256(ip + DAILY_SALT)` where `DAILY_SALT` rotates daily — keeps reporters pseudonymous while still allowing rate limiting and flag dedup within a day.

**Form** (`src/app/report/page.tsx`): react-hook-form + zod. Fields: state (default WA), plate, make (autocomplete from a static list), model (free text), color (optional), behaviors (multiselect chips, min 1), GPS (auto-captured + edit), notes (optional, 500 char). Submit via server action → `/api/reports`.

**Leaderboard**: shadcn `Table` with rank, plate, make/model, count, last seen. Each row links to `/plate/[state]/[plate]`. Window selector toggles a query param.

**Map** (vehicle detail page): `react-map-gl` + Mapbox free tier, or Leaflet + OSM tiles to avoid the Mapbox token requirement. Recommend Leaflet for v1 — zero-config, no key.

---

## Privacy / Legal Disclaimer (must ship in v1)

`/about` and a footer disclaimer must state:
- Reports are user-submitted opinions, not verified facts.
- Submitting false reports may violate WA defamation law.
- Provide a takedown email (`takedown@<domain>`) — manual removal honored within 7 days.
- No collection of reporter PII beyond hashed IP for abuse prevention.

This isn't lawyering, it's CYA. Worth flagging that publicly shaming plates carries real legal exposure — Eric should consider getting a 30-min consult with a WA attorney before launch.

---

## Critical Files to Create

| Path | Role |
|---|---|
| `src/lib/supabase/server.ts` | Server-side Supabase client (service-role) |
| `src/lib/supabase/client.ts` | Browser Supabase client (anon, read-only) |
| `src/lib/behaviors.ts` | Behavior catalog |
| `src/lib/plate.ts` | Plate normalization + validation |
| `src/lib/rateLimit.ts` | KV-backed rate limiter |
| `src/lib/seattle.ts` | Bounding-box check |
| `src/app/api/reports/route.ts` | Report submission endpoint |
| `src/app/api/flags/route.ts` | Flag endpoint |
| `src/app/page.tsx` | Homepage |
| `src/app/report/page.tsx` | Report form |
| `src/app/leaderboard/page.tsx` | Leaderboard table |
| `src/app/plate/[state]/[plate]/page.tsx` | Vehicle detail |
| `src/app/about/page.tsx` | About + disclaimer |
| `src/components/ReportForm.tsx` | Form UI |
| `src/components/GpsCapture.tsx` | Geolocation + map pin |
| `src/components/BehaviorPicker.tsx` | Multi-select chip picker |
| `src/components/LeaderboardTable.tsx` | Reusable table |
| `supabase/migrations/0001_init.sql` | Schema above |
| `README.md` | Setup + deploy instructions |

---

## Build Order

1. Repo + Next.js scaffold + Tailwind + shadcn init.
2. Supabase project + `0001_init.sql` migration applied via `mcp__supabase__apply_migration`.
3. Lib files (`supabase/*`, `behaviors`, `plate`, `seattle`).
4. `/api/reports` route + Zod schema, no rate limiting yet.
5. `/report` form end-to-end, manually test a submit.
6. `/leaderboard` page reading from view.
7. `/plate/[state]/[plate]` detail page + Leaflet map.
8. `/api/flags` + flag UI on report cards.
9. Rate limiting (Vercel KV).
10. `/about` + disclaimer footer.
11. Deploy to Vercel preview, smoke test, promote to production.

---

## Progress Tracking & Resumption

To survive interruption, maintain two living docs in the repo from commit #1:

- **`PROGRESS.md`** (repo root) — running checklist mirroring the Build Order section. Each step has `[ ]` / `[x]` and a one-line note when complete (e.g. commit SHA, gotcha, or "skipped — see X"). Update *before* moving to the next step, not at the end.
- **`docs/STATE.md`** (repo) — current environment state: Supabase project ref + URL, Vercel project name, deployed URL, KV instance name, any secrets already wired (names only, never values), pending TODOs that don't fit a code comment.

Also keep a copy of this plan at `docs/PLAN.md` in the repo so a fresh session can read it without needing `~/.claude/plans/`.

Resumption recipe for a future session: read `docs/PLAN.md` → `PROGRESS.md` → `docs/STATE.md` → `git log --oneline -20` → continue from the first unchecked item.

---

## Verification

End-to-end:
1. `pnpm dev` locally with Supabase env vars.
2. Open `/report` in browser → fill form → submit → confirm row in `reports` and (if new plate) `vehicles` via `mcp__supabase__execute_sql`.
3. Open `/leaderboard` → confirm new vehicle appears with count = 1.
4. Submit 6 reports rapidly from same IP → confirm 6th returns 429.
5. Flag a report 3× from 3 different `flagger_hash` values → confirm `hidden = true` and report disappears from `/leaderboard` and detail page.
6. Try submitting GPS coords outside Seattle bbox → confirm rejection.
7. `vercel:deploy` to preview URL → re-run smoke test on the preview.
8. Lighthouse: aim for ≥90 perf / ≥95 a11y on `/` and `/leaderboard`.
