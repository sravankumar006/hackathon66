-- Create extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing tables if they exist
DROP TABLE IF EXISTS hour_swaps CASCADE;
DROP TABLE IF EXISTS substitute_allocations CASCADE;
DROP TABLE IF EXISTS substitution_requests CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS class_timetable CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;

-- 1. faculty Table
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    specialization TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- 2. class_timetable Table
CREATE TABLE class_timetable (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    day_of_week TEXT NOT NULL,
    period INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    CONSTRAINT check_period CHECK (period >= 1 AND period <= 6)
);

-- 3. leave_requests Table
CREATE TABLE leave_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    CONSTRAINT check_leave_status CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);

-- 4. substitution_requests Table
CREATE TABLE substitution_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    leave_request_id BIGINT REFERENCES leave_requests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    substitute_faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending',
    CONSTRAINT check_sub_request_status CHECK (status IN ('Pending', 'Accepted', 'Declined'))
);

-- 5. substitute_allocations Table
CREATE TABLE substitute_allocations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    leave_request_id BIGINT REFERENCES leave_requests(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    period INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    original_faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    substitute_faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE
);

-- 6. hour_swaps Table
CREATE TABLE hour_swaps (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    requester_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    target_faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    request_date DATE NOT NULL,
    request_period INTEGER NOT NULL,
    swap_date DATE NOT NULL,
    swap_period INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending'
);

-- =========================================================================
-- SEED DATA MANDATE
-- =========================================================================

-- Seed Faculty Profiles (including 1 admin/HOD, and 3 distinct departments: 'AI&ML', 'CSE', 'ECE')
INSERT INTO faculty (id, name, email, department, specialization, is_admin) VALUES
('b19d5e30-61d0-4d89-9a22-3c8b411d9a01', 'Dr. Alice Vance', 'alice@university.edu', 'AI&ML', 'Neural Networks', false),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a02', 'Prof. Bob Connor', 'bob@university.edu', 'CSE', 'Algorithms', false),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a03', 'Dr. Charlie Miller', 'charlie@university.edu', 'ECE', 'Signal Processing', false),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a04', 'Bruce Wayne', 'bruce@university.edu', 'Computer Science', 'Data Structures', false),
('b19d5e30-61d0-4d89-9a22-3c8b411d9a06', 'Admin Coordinator', 'admin@university.edu', 'Academic Administration', 'Operations', true);

-- Seed Class Timetable (Complete base templates Monday to Friday, Periods 1 through 4, and Bruce Wayne's Monday periods 1 to 5)
INSERT INTO class_timetable (day_of_week, period, class_name, subject, faculty_id) VALUES
-- Monday
('Monday', 1, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Monday', 2, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
('Monday', 3, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Monday', 4, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
-- Bruce Wayne Monday Schedule
('Monday', 1, '3rd Year CSE', 'Data Structures', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
('Monday', 2, '3rd Year CSE', 'Operating Systems', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
('Monday', 3, '4th Year IT', 'Cloud Computing', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
('Monday', 4, '2nd Year CSE', 'Object Oriented Programming', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
('Monday', 5, '3rd Year CSE', 'Design & Analysis of Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a04'),
-- Tuesday
('Tuesday', 1, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Tuesday', 2, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
('Tuesday', 3, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Tuesday', 4, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
-- Wednesday
('Wednesday', 1, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Wednesday', 2, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
('Wednesday', 3, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Wednesday', 4, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
-- Thursday
('Thursday', 1, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Thursday', 2, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
('Thursday', 3, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Thursday', 4, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
-- Friday
('Friday', 1, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Friday', 2, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02'),
('Friday', 3, '2nd Year AI&ML', 'Neural Networks', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a01'),
('Friday', 4, '3rd Year CSE', 'Algorithms', 'b19d5e30-61d0-4d89-9a22-3c8b411d9a02');
