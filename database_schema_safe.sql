-- Safe Database Schema for Job Journey Log
-- Run this in your Supabase SQL Editor
-- This script handles existing tables and policies safely

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    college TEXT,
    course TEXT,
    graduation_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create placements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.placements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    s_no INTEGER,
    company_name TEXT NOT NULL,
    eligibility TEXT,
    registration_deadline DATE,
    registration_deadline_time TIME,
    registration_link TEXT,
    
    -- Test rounds (up to 5)
    test_1 TEXT,
    test_1_date DATE,
    test_1_time TIME,
    result_1 TEXT,
    test_2 TEXT,
    test_2_date DATE,
    test_2_time TIME,
    result_2 TEXT,
    test_3 TEXT,
    test_3_date DATE,
    test_3_time TIME,
    result_3 TEXT,
    test_4 TEXT,
    test_4_date DATE,
    test_4_time TIME,
    result_4 TEXT,
    test_5 TEXT,
    test_5_date DATE,
    test_5_time TIME,
    result_5 TEXT,
    
    -- Interview rounds (up to 3)
    interview_1 TEXT,
    interview_1_date DATE,
    interview_1_time TIME,
    interview_result_1 TEXT,
    interview_2 TEXT,
    interview_2_date DATE,
    interview_2_time TIME,
    interview_result_2 TEXT,
    interview_3 TEXT,
    interview_3_date DATE,
    interview_3_time TIME,
    interview_result_3 TEXT,
    
    are_you_eligible BOOLEAN DEFAULT true,
    ctc NUMERIC,
    role TEXT,
    location TEXT,
    status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'In Progress', 'Selected', 'Rejected', 'Withdrawn', 'Not Eligible')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe approach)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own placements" ON public.placements;
DROP POLICY IF EXISTS "Users can insert own placements" ON public.placements;
DROP POLICY IF EXISTS "Users can update own placements" ON public.placements;
DROP POLICY IF EXISTS "Users can delete own placements" ON public.placements;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for placements
CREATE POLICY "Users can view own placements" ON public.placements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own placements" ON public.placements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own placements" ON public.placements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own placements" ON public.placements
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_placements_user_id ON public.placements(user_id);
CREATE INDEX IF NOT EXISTS idx_placements_company_name ON public.placements(company_name);
CREATE INDEX IF NOT EXISTS idx_placements_status ON public.placements(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_placements_updated_at ON public.placements;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON public.placements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add any missing columns from the original database_update.sql
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_1_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_1_time TIME;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_2_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_2_time TIME;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_3_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_3_time TIME;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_4_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_4_time TIME;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_5_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS test_5_time TIME;

ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS interview_1_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS interview_1_time TIME;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS interview_2_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS interview_2_time TIME;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS interview_3_date DATE;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS interview_3_time TIME;

ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS registration_deadline_time TIME;

-- Update the status check constraint
ALTER TABLE public.placements DROP CONSTRAINT IF EXISTS placements_status_check;
ALTER TABLE public.placements ADD CONSTRAINT placements_status_check 
CHECK (status IN ('Applied', 'In Progress', 'Selected', 'Rejected', 'Withdrawn', 'Not Eligible'));
