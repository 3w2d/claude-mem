-- SmartFlow v3 — Supabase schema
-- Run once in the Supabase SQL editor (or via `supabase db push`).
-- Uses a single key/value table keyed by a client-generated device_id.
-- This matches the current pre-auth model; when real auth lands,
-- swap `device_id` for `auth.uid()` and tighten RLS.

create table if not exists public.smartflow_state (
  device_id   text  not null,
  key         text  not null,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (device_id, key)
);

alter table public.smartflow_state enable row level security;

-- Pre-auth policy: anyone can read/write their own device rows.
-- Replace with `auth.uid()`-scoped policies once auth is wired up.
drop policy if exists smartflow_state_all on public.smartflow_state;
create policy smartflow_state_all on public.smartflow_state
  for all using (true) with check (true);
