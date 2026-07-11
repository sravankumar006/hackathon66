-- SQL Query 4: Create substitution_requests table and configure policies
-- Execute this query in your Supabase SQL Editor to resolve the missing relation error.

CREATE TABLE IF NOT EXISTS substitution_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    leave_request_id BIGINT REFERENCES leave_requests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period INT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    substitute_faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending'
);

-- Enable RLS and permissive policies for anonymous access
ALTER TABLE substitution_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read on substitution_requests" ON substitution_requests;
DROP POLICY IF EXISTS "Allow anonymous insert on substitution_requests" ON substitution_requests;
DROP POLICY IF EXISTS "Allow anonymous update on substitution_requests" ON substitution_requests;

CREATE POLICY "Allow anonymous read on substitution_requests" ON substitution_requests FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on substitution_requests" ON substitution_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on substitution_requests" ON substitution_requests FOR UPDATE USING (true);
