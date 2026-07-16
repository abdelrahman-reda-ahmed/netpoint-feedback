-- NetPoint Feedback Platform - Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  session_number int not null,
  clarity smallint not null,
  pace smallint not null,
  relevance smallint not null,
  theory_practice_balance smallint not null,
  instructor_clarity smallint not null,
  materials_quality smallint not null,
  hands_on_usefulness smallint not null,
  quiz_app_usefulness smallint not null,
  overall_satisfaction smallint not null,
  confidence smallint not null,
  comments text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table feedback enable row level security;

-- Allow public INSERT (anyone can submit feedback)
create policy "Allow public insert"
  on feedback
  for insert
  to anon
  with check (true);

-- Deny public SELECT (students cannot read others' feedback)
create policy "Deny public select"
  on feedback
  for select
  to anon
  using (false);

-- Deny public UPDATE
create policy "Deny public update"
  on feedback
  for update
  to anon
  using (false);

-- Deny public DELETE
create policy "Deny public delete"
  on feedback
  for delete
  to anon
  using (false);
