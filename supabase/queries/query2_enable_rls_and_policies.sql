-- SQL Query 2: Enable Row-Level Security (RLS) and configure permissive policies
-- Run this in the Supabase SQL Editor to enable RLS while creating policies that allow anonymous read/write operations.

-- Enable RLS on all tables
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitute_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitution_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow anonymous read on faculty" ON faculty;
DROP POLICY IF EXISTS "Allow anonymous insert on faculty" ON faculty;
DROP POLICY IF EXISTS "Allow anonymous update on faculty" ON faculty;

DROP POLICY IF EXISTS "Allow anonymous read on timetable" ON class_timetable;
DROP POLICY IF EXISTS "Allow anonymous insert on timetable" ON class_timetable;

DROP POLICY IF EXISTS "Allow anonymous read on leave_requests" ON leave_requests;
DROP POLICY IF EXISTS "Allow anonymous insert on leave_requests" ON leave_requests;
DROP POLICY IF EXISTS "Allow anonymous update on leave_requests" ON leave_requests;
DROP POLICY IF EXISTS "Allow anonymous delete on leave_requests" ON leave_requests;

DROP POLICY IF EXISTS "Allow anonymous read on substitute_allocations" ON substitute_allocations;
DROP POLICY IF EXISTS "Allow anonymous insert on substitute_allocations" ON substitute_allocations;
DROP POLICY IF EXISTS "Allow anonymous update on substitute_allocations" ON substitute_allocations;

DROP POLICY IF EXISTS "Allow anonymous read on hour_swaps" ON hour_swaps;
DROP POLICY IF EXISTS "Allow anonymous insert on hour_swaps" ON hour_swaps;
DROP POLICY IF EXISTS "Allow anonymous update on hour_swaps" ON hour_swaps;

DROP POLICY IF EXISTS "Allow anonymous read on substitution_requests" ON substitution_requests;
DROP POLICY IF EXISTS "Allow anonymous insert on substitution_requests" ON substitution_requests;
DROP POLICY IF EXISTS "Allow anonymous update on substitution_requests" ON substitution_requests;

-- 1. Faculty policies
CREATE POLICY "Allow anonymous read on faculty" ON faculty FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on faculty" ON faculty FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on faculty" ON faculty FOR UPDATE USING (true);

-- 2. Class Timetable policies
CREATE POLICY "Allow anonymous read on timetable" ON class_timetable FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on timetable" ON class_timetable FOR INSERT WITH CHECK (true);

-- 3. Leave Requests policies
CREATE POLICY "Allow anonymous read on leave_requests" ON leave_requests FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on leave_requests" ON leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on leave_requests" ON leave_requests FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on leave_requests" ON leave_requests FOR DELETE USING (true);

-- 4. Substitute Allocations policies
CREATE POLICY "Allow anonymous read on substitute_allocations" ON substitute_allocations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on substitute_allocations" ON substitute_allocations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on substitute_allocations" ON substitute_allocations FOR UPDATE USING (true);

-- 5. Hour Swaps policies
CREATE POLICY "Allow anonymous read on hour_swaps" ON hour_swaps FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on hour_swaps" ON hour_swaps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on hour_swaps" ON hour_swaps FOR UPDATE USING (true);

-- 6. Substitution Requests policies
CREATE POLICY "Allow anonymous read on substitution_requests" ON substitution_requests FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on substitution_requests" ON substitution_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on substitution_requests" ON substitution_requests FOR UPDATE USING (true);
