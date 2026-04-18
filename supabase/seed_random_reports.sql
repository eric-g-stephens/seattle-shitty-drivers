-- DANGER: This wipes ALL existing data in these tables.
-- Use for local/dev/demo environments only.

begin;

truncate table public.report_flags restart identity cascade;
truncate table public.reports restart identity cascade;
truncate table public.vehicles restart identity cascade;

-- Generate a pool of vehicles (unique state+plate).
with
letters as (
  select chr(65 + (random() * 26)::int) as c
  from generate_series(1, 1000)
),
plates as (
  select
    'WA'::text as state,
    (
      (select string_agg(c, '') from (select c from letters order by random() limit 3) t) ||
      lpad(((random() * 9999)::int)::text, 4, '0')
    ) as plate
  from generate_series(1, 800)
),
unique_plates as (
  select distinct on (state, plate) state, plate
  from plates
)
insert into public.vehicles (state, plate, make, model, color)
select
  state,
  plate,
  (array['Toyota','Honda','Subaru','Ford','Chevrolet','Tesla','Rivian','Kia','Hyundai','BMW','Audi','Mazda','Nissan'])[1 + (random()*11)::int],
  (array['Civic','Accord','Camry','Corolla','Outback','Forester','F-150','Model 3','Model Y','R1T','R1S','CX-5','Altima','Prius'])[1 + (random()*13)::int],
  (array['Black','White','Silver','Gray','Blue','Red','Green','Brown'])[1 + (random()*7)::int]
from unique_plates
limit 220;

-- Insert 500 reports, each tied to a random vehicle.
with
codes as (
  select array[
    'red_light','stop_sign','tailgating','unsafe_pass','speeding','no_yield_ped','block_crosswalk','block_box',
    'phone','no_signal','bike_lane_drive','bike_lane_block','road_rage','cutoff','illegal_uturn','wrong_way',
    'no_emergency','merge_fail','no_headlights','parking_violation'
  ]::text[] as all_codes
),
vehicles as (
  select id from public.vehicles
),
raw as (
  select
    (select id from vehicles order by random() limit 1) as vehicle_id,
    -- Seattle-ish bbox + extra privacy fuzz
    (47.40 + random() * 0.40) + ((random() - 0.5) * 0.006) as lat,
    (-122.50 + random() * 0.30) + ((random() - 0.5) * 0.008) as lng,
    (array[
      'Ballard','Capitol Hill','Fremont','Green Lake','Downtown','U-District','SoDo','Queen Anne','Beacon Hill','West Seattle'
    ])[1 + (random()*9)::int] as location_text,
    (array[
      null,
      'Cut me off hard.',
      'Blew the light.',
      'Nearly hit a pedestrian.',
      'Aggressive lane changes.',
      'Would not zipper merge.',
      'Texting at the wheel.'
    ])[1 + (random()*6)::int] as notes,
    md5(gen_random_uuid()::text) as reporter_hash,
    now() - ((random() * 30)::int || ' days')::interval - ((random() * 86400)::int || ' seconds')::interval as created_at,
    (1 + (random()*3)::int) as behavior_count
  from generate_series(1, 500)
)
insert into public.reports (vehicle_id, behaviors, lat, lng, location_text, notes, reporter_hash, created_at)
select
  r.vehicle_id,
  (
    select array_agg(code)
    from (
      select unnest(c.all_codes) as code
      order by random()
      limit r.behavior_count
    ) x
  ) as behaviors,
  r.lat,
  r.lng,
  r.location_text,
  r.notes,
  r.reporter_hash,
  r.created_at
from raw r
cross join codes c;

commit;

