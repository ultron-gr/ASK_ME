-- QUICK FIX FOR ASK DSU DATABASE ACCESS
-- Copy this entire file and paste into Supabase SQL Editor, then click RUN

-- Fix Faculty Table Access
DROP POLICY IF EXISTS "Anyone can read faculty" ON faculty;
DROP POLICY IF EXISTS "Authenticated users can read faculty" ON faculty;
DROP POLICY IF EXISTS "Public can read faculty" ON faculty;

CREATE POLICY "Anyone can read faculty"
    ON faculty
    FOR SELECT
    USING (true);

-- Fix Classrooms Table Access
DROP POLICY IF EXISTS "Anyone can read classrooms" ON classrooms;
DROP POLICY IF EXISTS "Authenticated users can read classrooms" ON classrooms;
DROP POLICY IF EXISTS "Public can read classrooms" ON classrooms;

CREATE POLICY "Anyone can read classrooms"
    ON classrooms
    FOR SELECT
    USING (true);

-- Fix Schedules Table Access
DROP POLICY IF EXISTS "Anyone can read schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can read schedules" ON schedules;
DROP POLICY IF EXISTS "Public can read schedules" ON schedules;

CREATE POLICY "Anyone can read schedules"
    ON schedules
    FOR SELECT
    USING (true);

-- Fix Library Status Table Access
DROP POLICY IF EXISTS "Anyone can read library status" ON library_status;
DROP POLICY IF EXISTS "Authenticated users can read library status" ON library_status;
DROP POLICY IF EXISTS "Public can read library status" ON library_status;

CREATE POLICY "Anyone can read library status"
    ON library_status
    FOR SELECT
    USING (true);

-- Done! Close this and refresh your chatbot page.
