# Seattle Shitty Drivers

A satirical, community-humor website where Seattle residents can vent about bad driving by reporting license plates, vehicle details, and bad-behavior categories. Reports feed a public leaderboard of the most-reported plates. This site is for **entertainment purposes only** — see the disclaimer below.

## Live URLs

| Environment | URL |
|---|---|
| GitHub | https://github.com/eric-g-stephens/seattle-shitty-drivers |
| Supabase dashboard | https://supabase.com/dashboard/project/vwcjpbgufxmipmelahme |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + hand-written shadcn/Radix UI components |
| Database | Supabase (Postgres + PostGIS + RLS) |
| Hosting | Vercel |
| Package manager | npm |

## Project Structure

```
seattle-shitty-drivers/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Homepage (hero + top-5 leaderboard)
│   │   ├── layout.tsx                      # Root layout: nav, footer, disclaimer banner
│   │   ├── about/page.tsx                  # About, disclaimer, takedown process
│   │   ├── leaderboard/page.tsx            # Full leaderboard, all-time/30d/7d tabs
│   │   ├── report/page.tsx                 # Report submission page
│   │   ├── plate/[state]/[plate]/page.tsx  # Vehicle detail: reports, behavior breakdown
│   │   └── api/
│   │       ├── reports/route.ts            # POST — submit a report
│   │       └── flags/route.ts              # POST — flag a report as inaccurate
│   ├── components/
│   │   ├── ReportForm.tsx                  # Full report submission form
│   │   ├── BehaviorPicker.tsx              # Multi-select chip picker for bad behaviors
│   │   ├── GpsCapture.tsx                  # Browser geolocation with Seattle bbox check
│   │   ├── FlagButton.tsx                  # Flag a report as inaccurate
│   │   ├── LeaderboardTable.tsx            # Reusable leaderboard table
│   │   └── ui/                             # shadcn-style primitives (button, input, etc.)
│   └── lib/
│       ├── behaviors.ts                    # Catalog of 20 bad-driving behaviors
│       ├── plate.ts                        # Plate normalization and validation
│       ├── seattle.ts                      # GPS bounding-box check for Seattle area
│       ├── hash.ts                         # sha256(ip + daily_salt) for anonymous rate limiting
│       ├── utils.ts                        # cn() Tailwind merge helper
│       └── supabase/
│           ├── server.ts                   # Server-side Supabase client (anon key, no session)
│           ├── client.ts                   # Browser Supabase client
│           └── types.ts                    # Generated DB types (run: see "Regenerate types" below)
├── supabase/
│   └── migrations/
│       └── 0001_init.sql                   # Full schema: tables, triggers, view, RLS policies
├── docs/
│   ├── PLAN.md                             # Original architecture plan
│   └── STATE.md                            # Environment state (project refs, URLs, blockers)
└── PROGRESS.md                             # Build checklist — resume from first unchecked item
```

## Database Schema

### Tables

**`vehicles`** — one row per unique (state, plate) pair
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| state | text | Default `WA` |
| plate | text | Normalized: uppercase, no spaces/dashes |
| make, model, color | text \| null | Optional vehicle details |
| first_reported_at | timestamptz | Set on insert |
| last_reported_at | timestamptz | Bumped by trigger on each new report |

**`reports`** — individual incident reports
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| vehicle_id | uuid | FK → vehicles |
| behaviors | text[] | 1–20 codes from `src/lib/behaviors.ts` |
| lat, lng | double precision | GPS coords (validated to Seattle bbox server-side) |
| location_text | text \| null | Optional human-readable label |
| notes | text \| null | Max 500 chars |
| reporter_hash | text | sha256(ip + daily_salt) — anonymous, rotates daily |
| flag_count | int | Auto-incremented by trigger |
| hidden | bool | Auto-set to true when flag_count ≥ 3 |
| created_at | timestamptz | |

**`report_flags`** — one per (report, flagger) pair
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| report_id | uuid | FK → reports |
| flagger_hash | text | Same hashing as reporter_hash |
| reason | text \| null | Optional reason |
| UNIQUE(report_id, flagger_hash) | | Prevents double-flagging |

### View

**`vehicle_leaderboard`** — aggregates report_count per vehicle, excludes hidden reports. Used by homepage and leaderboard page. Has `security_invoker = true` so RLS on underlying tables is respected.

### Triggers

- `reports_bump_vehicle` — after INSERT on reports → updates `vehicles.last_reported_at`
- `flag_autohide` — after INSERT on report_flags → increments `flag_count`, sets `hidden = true` when count ≥ 3

### RLS Policies

All tables have RLS enabled. Public policies:
- `SELECT` allowed on vehicles, reports (where `hidden = false`), report_flags
- `INSERT` allowed on all three tables (validation enforced server-side in API routes)
- No `UPDATE` or `DELETE` policies — data is immutable once written (takedowns handled manually)

## API Routes

### `POST /api/reports`

Submits a new report. All validation happens server-side before the Supabase insert.

**Body:**
```json
{
  "state": "WA",
  "plate": "ABC1234",
  "make": "Toyota",
  "model": "Camry",
  "color": "Silver",
  "behaviors": ["red_light", "tailgating"],
  "lat": 47.6062,
  "lng": -122.3321,
  "location_text": "Pike St & 3rd Ave",
  "notes": "Ran the red at Pike and 3rd"
}
```

**Validation:**
- Plate normalized to uppercase, stripped of spaces/dashes, max 8 chars, alphanumeric only
- Behaviors must be valid codes from `src/lib/behaviors.ts`
- GPS must be within Seattle bbox: `lat 47.40–47.80, lng -122.50 – -122.20`
- Rate limit: 5 reports per IP per hour (checked via `reporter_hash` in the DB)

**Returns:** `201 { id, vehicle_id }` on success, or 4xx/5xx with `{ error }`.

### `POST /api/flags`

Flags a report as inaccurate. Reports auto-hide after 3 unique flags.

**Body:** `{ "report_id": "<uuid>", "reason": "optional reason" }`

**Returns:** `200 { ok: true }` or `409` if already flagged from this IP today.

## Bad Driving Behaviors

Defined in `src/lib/behaviors.ts`. 20 behaviors:

| Code | Label |
|---|---|
| `red_light` | Ran a red light |
| `stop_sign` | Blew through a stop sign |
| `tailgating` | Tailgating |
| `unsafe_pass` | Unsafe passing / lane change |
| `speeding` | Speeding |
| `no_yield_ped` | Didn't yield to pedestrians |
| `block_crosswalk` | Blocked the crosswalk |
| `block_box` | Blocked the intersection |
| `phone` | On their phone / distracted |
| `no_signal` | No turn signal |
| `bike_lane_drive` | Driving in the bike lane |
| `bike_lane_block` | Blocked the bike lane |
| `road_rage` | Aggressive driving / road rage |
| `cutoff` | Cut someone off |
| `illegal_uturn` | Illegal U-turn |
| `wrong_way` | Wrong-way driving |
| `no_emergency` | Didn't yield to emergency vehicle |
| `merge_fail` | Wouldn't zipper merge |
| `no_headlights` | Driving without headlights |
| `parking_violation` | Parked illegally (hydrant, crosswalk, bike lane) |

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/eric-g-stephens/seattle-shitty-drivers
cd seattle-shitty-drivers
npm install
```

The `.env.local` file is not committed (it contains the Supabase anon key). Create it:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://vwcjpbgufxmipmelahme.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard API settings>
EOF
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Key commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build + type check
npm run lint     # ESLint
```

### Regenerate Supabase types

If you change the database schema, regenerate `src/lib/supabase/types.ts` via the Supabase MCP or CLI:

```bash
npx supabase gen types typescript --project-id vwcjpbgufxmipmelahme > src/lib/supabase/types.ts
```

## Deployment

### Vercel

This project is designed for Vercel. Connect the GitHub repo in the Vercel dashboard and set these environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vwcjpbgufxmipmelahme.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard → Settings → API |

No other env vars required.

### Supabase

The Supabase project is already provisioned. If you ever need to re-apply the schema from scratch:

```bash
# Apply migration via Supabase CLI
npx supabase db push --project-ref vwcjpbgufxmipmelahme
```

Or copy the contents of `supabase/migrations/0001_init.sql` into the Supabase SQL editor.

## Resuming Development

If picking this up fresh in a new session:

1. Read `docs/PLAN.md` — original architecture decisions
2. Read `PROGRESS.md` — build checklist, find first unchecked item
3. Read `docs/STATE.md` — current env state (project refs, URLs, blockers)
4. Run `git log --oneline -10` — see recent commits

## Disclaimer

Seattle Shitty Drivers is a **satirical, community-humor website created for entertainment purposes only**. It is not affiliated with any law enforcement agency, government body, or vehicle licensing authority. All reports are user-submitted opinions and are not verified, investigated, or validated by the site operators. Nothing on this site is intended to be punitive. See `/about` for the full disclaimer and takedown process.
