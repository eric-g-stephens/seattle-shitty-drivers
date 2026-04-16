# Environment State

## Supabase
- **Project ref:** vwcjpbgufxmipmelahme
- **URL:** https://vwcjpbgufxmipmelahme.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/vwcjpbgufxmipmelahme
- **API keys page:** https://supabase.com/dashboard/project/vwcjpbgufxmipmelahme/settings/api
- **Tables:** vehicles, reports, report_flags (all with RLS)
- **View:** vehicle_leaderboard
- **Migration applied:** 0001_init ✓

## Env Vars
- `NEXT_PUBLIC_SUPABASE_URL` — in .env.local ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — in .env.local ✓
- `SUPABASE_SERVICE_ROLE_KEY` — **needs to be added manually** from dashboard above

## GitHub
- **Repo:** https://github.com/eric-g-stephens/seattle-shitty-drivers

## Vercel
- Not yet linked

## Blockers
- SUPABASE_SERVICE_ROLE_KEY missing from .env.local — get from Supabase dashboard before testing API routes
