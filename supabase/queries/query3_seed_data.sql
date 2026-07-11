-- SQL Query 3: Clear and Re-Seed Database Default Records
-- Run this in the Supabase SQL Editor to wipe and re-seed all tables with initial data.

-- 1. Truncate existing data to prevent primary/foreign key constraint errors
TRUNCATE TABLE substitution_requests CASCADE;
TRUNCATE TABLE substitute_allocations CASCADE;
TRUNCATE TABLE leave_requests CASCADE;
TRUNCATE TABLE hour_swaps CASCADE;
TRUNCATE TABLE class_timetable CASCADE;
TRUNCATE TABLE faculty CASCADE;

-- 2. Seed Faculty
--    UUID b19d5e30-...-9a04 = Bruce Wayne (Computer Science)
--    UUID b19d5e30-...-9a06 = Admin Coordinator / HOD (is_admin = true)
INSERT INTO faculty (id, name, department, specialization, is_admin, email) VALUES
('b19d5e30-61d0-4d89-9a22-3c8b411d9a01', 'Dr. Aris Vance',       'Computer Science',          'Operating Systems',  false, 'aris@university.edu'),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a02', 'Prof. Sarah Connor',   'Computer Science',          'Algorithms',         false, 'sarah@university.edu'),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a03', 'Dr. Bob Miller',       'Electrical Engineering',    'Signal Processing',  false, 'bob@university.edu'),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a04', 'Bruce Wayne',          'Computer Science',          'Data Structures',    false, 'bruce@university.edu'),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a05', 'Dr. Emma Watson',      'Mechanical Engineering',    'Thermodynamics',     false, 'emma@university.edu'),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a06', 'Admin Coordinator',    'Academic Administration',   'Operations',         true,  'admin@university.edu');

-- 3. Seed Class Timetable
--    Includes a full Mon–Tue base schedule for existing faculty
--    AND Bruce Wayne's full Monday schedule across periods 1 to 5
INSERT INTO class_timetable (id, day_of_week, period, class_name, subject, faculty_id) OVERRIDING SYSTEM VALUE VALUES
-- Existing Monday slots (other faculty)
(1,  'Monday',    1, 'CSE-A',          'Operating Systems',               'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
(2,  'Monday',    2, 'CSE-B',          'Algorithms',                      'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
(3,  'Monday',    3, 'ECE-A',          'Signal Processing',               'b19d5e30-61d0-4d89-9a22-3c8b411d9a03'),
(4,  'Monday',    4, 'CSE-A',          'Operating Systems',               'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
-- Bruce Wayne: Full Monday schedule (Periods 1–5)
(5,  'Monday',    1, '3rd Year CSE',   'Data Structures',                 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
(6,  'Monday',    2, '3rd Year CSE',   'Operating Systems',               'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
(7,  'Monday',    3, '4th Year IT',    'Cloud Computing',                 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
(8,  'Monday',    4, '2nd Year CSE',   'Object Oriented Programming',     'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
(9,  'Monday',    5, '3rd Year CSE',   'Design & Analysis of Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
-- Tuesday slots
(10, 'Tuesday',   1, 'CSE-B',          'Algorithms',                      'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
(11, 'Tuesday',   2, 'CSE-A',          'Operating Systems',               'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
(12, 'Tuesday',   3, 'MECH-A',         'Thermodynamics',                  'b19d5e30-61d0-4d89-9a22-3c8b411d9a05'),
(13, 'Tuesday',   4, 'ECE-A',          'Signal Processing',               'b19d5e30-61d0-4d89-9a22-3c8b411d9a03'),
(14, 'Tuesday',   5, 'CSE-B',          'Algorithms',                      'b19d5e30-61d0-4d89-9a22-3c8b411d9a02');

-- 4. Re-align identity sequence to prevent duplicate key conflicts on subsequent inserts
SELECT setval(pg_get_serial_sequence('class_timetable', 'id'), COALESCE(MAX(id), 1)) FROM class_timetable;

-- ============================================================================
-- IMPORTANT: After running this script, you must also ensure that the
-- Supabase Auth user account for Bruce Wayne has its faculty record linked.
-- When Bruce Wayne registers via the app (bruce@university.edu), the auth
-- trigger or post-signup insert will use their auth UUID, NOT the seed UUID.
--
-- To link an existing auth user to the seed row, run this UPDATE:
--   UPDATE faculty
--   SET id = '<AUTH_UUID_FROM_SUPABASE_DASHBOARD>'
--   WHERE email = 'bruce@university.edu';
--
-- Then update class_timetable to match:
--   UPDATE class_timetable
--   SET faculty_id = '<AUTH_UUID_FROM_SUPABASE_DASHBOARD>'
--   WHERE faculty_id = 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04';
-- ============================================================================
