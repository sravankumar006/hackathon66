-- SQL Query 1: Disable Row-Level Security (RLS) on all tables for rapid prototyping
-- Execute this query in the Supabase SQL Editor to bypass client authorization checks.

ALTER TABLE faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_timetable DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE substitute_allocations DISABLE ROW LEVEL SECURITY;
ALTER TABLE hour_swaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE substitution_requests DISABLE ROW LEVEL SECURITY;
