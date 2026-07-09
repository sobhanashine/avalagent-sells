-- AvalAgent Sales — Supabase schema
-- Run this once in the Supabase SQL editor.

-- ───────────────────────────────────────────────────────────────────────────
-- Types
-- ───────────────────────────────────────────────────────────────────────────
do $$ begin
  create type service_type as enum ('ai', 'website', 'ai+website');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_type as enum ('not_contacted', 'pending', 'accepted', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_type as enum (
    'created',
    'status_changed',
    'note_added',
    'updated',
    'deleted'
  );
exception when duplicate_object then null; end $$;

-- ───────────────────────────────────────────────────────────────────────────
-- customers
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  instagram_username text not null,
  phone text,
  service service_type not null,
  status status_type not null default 'not_contacted',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_status_idx on public.customers (status);
create index if not exists customers_service_idx on public.customers (service);
create index if not exists customers_created_idx on public.customers (created_at desc);
create index if not exists customers_instagram_idx on public.customers (instagram_username);
create index if not exists customers_user_idx on public.customers (user_id);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- activities (timeline)
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type activity_type not null,
  from_status status_type,
  to_status status_type,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists activities_customer_idx
  on public.activities (customer_id, created_at desc);

-- ───────────────────────────────────────────────────────────────────────────
-- Row Level Security (all authenticated operators can view/edit/delete all customers)
-- ───────────────────────────────────────────────────────────────────────────
alter table public.customers enable row level security;
alter table public.activities enable row level security;

-- Drop any previous restricted owner-based policies
drop policy if exists "auth_own_customers" on public.customers;
drop policy if exists "auth_own_activities" on public.activities;
drop policy if exists "auth_full_access" on public.customers;
drop policy if exists "auth_full_access" on public.activities;

-- Create collaborative full access policies for authenticated users
create policy "auth_full_access_customers" on public.customers
  for all to authenticated using (true) with check (true);

create policy "auth_full_access_activities" on public.activities
  for all to authenticated using (true) with check (true);

-- ───────────────────────────────────────────────────────────────────────────
-- Auto-create a profile row on sign-up
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "auth_own_profile" on public.profiles;

create policy "auth_own_profile" on public.profiles
  for all to authenticated using (true) with check (true);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();