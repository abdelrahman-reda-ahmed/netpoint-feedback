-- NetPoint Feedback Platform - Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Add student_name column to feedback table
alter table feedback add column if not exists student_name text not null default '';

-- 2. Update the submit_feedback function to include student_name
create or replace function submit_feedback(
  p_student_name text,
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
    student_name, session_number, clarity, pace, relevance, theory_practice_balance,
    instructor_clarity, materials_quality, hands_on_usefulness,
    quiz_app_usefulness, overall_satisfaction, confidence, comments
  ) values (
    p_student_name, p_session_number, p_clarity, p_pace, p_relevance, p_theory_practice_balance,
    p_instructor_clarity, p_materials_quality, p_hands_on_usefulness,
    p_quiz_app_usefulness, p_overall_satisfaction, p_confidence, p_comments
  ) returning to_json(feedback.*) into result;
  return result;
end;
$$;

-- 3. Re-grant execute with updated signature
grant execute on function submit_feedback(
  text, int, smallint, smallint, smallint, smallint, smallint, smallint, smallint, smallint, smallint, smallint, text
) to anon;
