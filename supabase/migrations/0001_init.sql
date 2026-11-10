-- ---------------------------------------------------------------------------
-- Construction & Carpentry website — database schema
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
--
-- All tables have Row Level Security enabled with NO public policies:
-- the website reads and writes exclusively from the server using the
-- service-role key, so browsers can never read or modify data directly.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Quote requests ------------------------------------------------------------
create table if not exists public.quote_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  full_name       text not null check (char_length(full_name) between 2 and 120),
  email           text not null check (char_length(email) <= 254),
  phone           text check (char_length(phone) <= 40),
  location        text check (char_length(location) <= 200),
  project_type    text check (char_length(project_type) <= 100),
  budget          text check (char_length(budget) <= 100),
  start_date      date,
  description     text not null check (char_length(description) between 10 and 5000),
  contact_method  text check (char_length(contact_method) <= 50),
  photos          text[] not null default '{}',
  status          text not null default 'new'
                  check (status in ('new', 'contacted', 'in_progress', 'completed')),
  admin_notes     text not null default '',
  email_sent      boolean not null default false,
  ip_hash         text
);
create index if not exists quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index if not exists quote_requests_status_idx on public.quote_requests (status);

-- Reviews -------------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 2 and 80),
  rating       smallint not null check (rating between 1 and 5),
  body         text not null check (char_length(body) between 10 and 2000),
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  approved_at  timestamptz,
  ip_hash      text
);
create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);

-- Contact form messages -----------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (char_length(email) <= 254),
  phone       text check (char_length(phone) <= 40),
  subject     text check (char_length(subject) <= 200),
  message     text not null check (char_length(message) between 10 and 5000),
  is_read     boolean not null default false,
  email_sent  boolean not null default false,
  ip_hash     text
);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- Editable company information (single row) -------------------------------
create table if not exists public.site_settings (
  id          smallint primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
insert into public.site_settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- Spam / abuse rate limiting ------------------------------------------------
create table if not exists public.rate_limits (
  id          bigint generated always as identity primary key,
  bucket      text not null,
  key         text not null,
  created_at  timestamptz not null default now()
);
create index if not exists rate_limits_lookup_idx on public.rate_limits (bucket, key, created_at desc);

-- Lock everything down: no anonymous / authenticated access via the API.
alter table public.quote_requests   enable row level security;
alter table public.reviews          enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings    enable row level security;
alter table public.rate_limits      enable row level security;

-- Private bucket for customer-uploaded project photos.
-- Files are only reachable through short-lived signed URLs created server-side.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-photos', 'quote-photos', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif']
)
on conflict (id) do nothing;

-- Optional housekeeping: remove rate-limit rows older than 2 days.
-- (Run manually, or schedule with pg_cron: select cron.schedule('purge-rate-limits', '0 3 * * *', $$ ... $$);)
-- delete from public.rate_limits where created_at < now() - interval '2 days';
