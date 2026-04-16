create extension if not exists postgis;

create table vehicles (
  id                uuid primary key default gen_random_uuid(),
  state             text not null default 'WA',
  plate             text not null,
  make              text,
  model             text,
  color             text,
  first_reported_at timestamptz not null default now(),
  last_reported_at  timestamptz not null default now(),
  unique (state, plate)
);
create index on vehicles (last_reported_at desc);

create table reports (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references vehicles(id) on delete cascade,
  behaviors     text[] not null check (array_length(behaviors, 1) between 1 and 20),
  lat           double precision not null,
  lng           double precision not null,
  location_text text,
  notes         text check (char_length(notes) <= 500),
  reporter_hash text not null,
  flag_count    int  not null default 0,
  hidden        bool not null default false,
  created_at    timestamptz not null default now()
);
create index on reports (vehicle_id, created_at desc);
create index on reports (reporter_hash, created_at desc);

create table report_flags (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references reports(id) on delete cascade,
  flagger_hash  text not null,
  reason        text,
  created_at    timestamptz not null default now(),
  unique (report_id, flagger_hash)
);

create or replace function bump_vehicle_last_reported() returns trigger as $$
begin
  update vehicles set last_reported_at = now() where id = new.vehicle_id;
  return new;
end $$ language plpgsql;

create trigger reports_bump_vehicle
  after insert on reports
  for each row execute function bump_vehicle_last_reported();

create or replace function autohide_on_flag_threshold() returns trigger as $$
begin
  update reports
    set flag_count = flag_count + 1,
        hidden     = (flag_count + 1) >= 3
    where id = new.report_id;
  return new;
end $$ language plpgsql;

create trigger flag_autohide
  after insert on report_flags
  for each row execute function autohide_on_flag_threshold();

create or replace view vehicle_leaderboard as
select
  v.id, v.state, v.plate, v.make, v.model, v.color,
  count(r.id) filter (where r.hidden = false) as report_count,
  max(r.created_at) filter (where r.hidden = false) as last_report_at
from vehicles v
left join reports r on r.vehicle_id = v.id
group by v.id;

alter table vehicles enable row level security;
alter table reports enable row level security;
alter table report_flags enable row level security;

create policy "public read vehicles" on vehicles for select using (true);
create policy "public read reports" on reports for select using (hidden = false);
create policy "public read flags" on report_flags for select using (true);
