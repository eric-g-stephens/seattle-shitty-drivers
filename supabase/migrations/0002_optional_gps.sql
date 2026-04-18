-- Allow reports without GPS coordinates (cross-streets only).
-- We still keep Seattle enforcement when GPS is present.

alter table public.reports
  alter column lat drop not null,
  alter column lng drop not null;

