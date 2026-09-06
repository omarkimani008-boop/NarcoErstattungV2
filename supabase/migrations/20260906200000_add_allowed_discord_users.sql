create table if not exists public.allowed_discord_users (
  discord_id text primary key,
  note text,
  added_at timestamptz not null default now()
);

alter table public.allowed_discord_users enable row level security;
