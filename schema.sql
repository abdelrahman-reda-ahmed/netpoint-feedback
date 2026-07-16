-- NetPoint Feedback Platform - Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the feedback table
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

-- 2. Enable RLS (default deny all)
alter table feedback enable row level security;

-- 3. SECURITY DEFINER function for inserting feedback
--    RLS policies with `to anon` don't work with PostgREST's role switching,
--    so we use a security definer function that bypasses RLS.
create or replace function submit_feedback(
  p_session_number int,
  p_clarity smallint,
  p_pace smallint,
  p_relevance smallint,
  p_theory_practice_balance smallint,
  p_instructor_clarity smallint,
  p_materials_quality smallint,
  p_hands_on_usefulness smallint,
  p_quiz_app_usefulness smallint,
  p_overall_satisfaction smallint,
  p_confidence smallint,
  p_comments text default null
)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  insert into feedback (
    session_number, clarity, pace, relevance, theory_practice_balance,
    instructor_clarity, materials_quality, hands_on_usefulness,
    quiz_app_usefulness, overall_satisfaction, confidence, comments
  ) values (
    p_session_number, p_clarity, p_pace, p_relevance, p_theory_practice_balance,
    p_instructor_clarity, p_materials_quality, p_hands_on_usefulness,
    p_quiz_app_usefulness, p_overall_satisfaction, p_confidence, p_comments
  ) returning to_json(feedback.*) into result;
  return result;
end;
$$;

-- 4. Allow anon role to execute the function
grant execute on function submit_feedback(
  int, smallint, smallint, smallint, smallint, smallint, smallint, smallint, smallint, smallint, smallint, text
) to anon;

-- 5. Also grant insert to anon as fallback
grant insert on feedback to anon;
