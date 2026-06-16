-- Korganizer — Schema Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- ─── Tabelas ────────────────────────────────────────────────────────────────

create table if not exists public.habits (
  id          text    primary key,
  user_id     uuid    not null references auth.users(id) on delete cascade,
  name        text    not null,
  category    text    not null,
  history     text[]  not null default '{}',
  created_at  text    not null
);

create table if not exists public.calendar_events (
  id          text  primary key,
  user_id     uuid  not null references auth.users(id) on delete cascade,
  title       text  not null,
  date        text  not null,
  start_time  text  not null,
  end_time    text  not null,
  type        text  not null default 'personal',
  color       text  not null default '#111111',
  description text
);

create table if not exists public.training_logs (
  id          text  primary key,
  user_id     uuid  not null references auth.users(id) on delete cascade,
  date        text  not null,
  content     text  not null default '',
  updated_at  text  not null
);

create table if not exists public.day_notes (
  id          text  primary key,
  user_id     uuid  not null references auth.users(id) on delete cascade,
  date        text  not null,
  content     text  not null,
  updated_at  text  not null
);

create table if not exists public.goals (
  id          text    primary key,
  user_id     uuid    not null references auth.users(id) on delete cascade,
  title       text    not null,
  description text,
  month       text    not null,
  category    text    not null,
  completed   boolean not null default false,
  created_at  text    not null
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table public.habits          enable row level security;
alter table public.calendar_events enable row level security;
alter table public.training_logs   enable row level security;
alter table public.day_notes       enable row level security;
alter table public.goals           enable row level security;

create policy "habits_own"  on public.habits          for all using (auth.uid() = user_id);
create policy "events_own"  on public.calendar_events for all using (auth.uid() = user_id);
create policy "logs_own"    on public.training_logs   for all using (auth.uid() = user_id);
create policy "notes_own"   on public.day_notes       for all using (auth.uid() = user_id);
create policy "goals_own"   on public.goals           for all using (auth.uid() = user_id);
