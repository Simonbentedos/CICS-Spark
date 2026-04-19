-- =============================================================================
-- SPARK — password_reset_requests table
-- =============================================================================
-- HOW TO RUN:
--   1. Open the Supabase project dashboard → SQL Editor
--   2. Paste this entire file and run it.
-- =============================================================================

create table if not exists public.password_reset_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  email          text not null,
  first_name     text not null,
  last_name      text not null,
  role           text not null check (role in ('student', 'admin')),
  status         text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  requested_at   timestamptz not null default now(),
  resolved_at    timestamptz
);

-- Index for the super admin list view (ordered by requested_at)
create index if not exists idx_password_reset_requests_status
  on public.password_reset_requests (status, requested_at desc);

-- Only one pending request per user at a time
create unique index if not exists idx_password_reset_requests_user_pending
  on public.password_reset_requests (user_id)
  where status = 'pending';
