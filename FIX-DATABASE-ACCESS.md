# 🔧 Fix Database Access Issue

## The Problem
Your chatbot can't fetch data from Supabase because **Row Level Security (RLS) policies** are blocking the queries.

## The Solution
You need to update the RLS policies in your Supabase dashboard to allow authenticated users to read data.

---

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### 2. Select Your Project
Click on your "ASK DSU" project

### 3. Go to SQL Editor
- Look for "SQL Editor" in the left sidebar
- Or go directly to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

### 4. Create a New Query
- Click "New query" button
- Or use the "+ New query" option

### 5. Copy & Paste This SQL Script

Open the file `backend/fix-rls-policies.sql` and copy ALL the contents, then paste it into the SQL Editor.

**OR** copy this directly:

```sql
-- Drop and recreate policies for classrooms
DROP POLICY IF EXISTS "Authenticated users can read classrooms" ON classrooms;
DROP POLICY IF EXISTS "Public can read classrooms" ON classrooms;
DROP POLICY IF EXISTS "Anyone can read classrooms" ON classrooms;

CREATE POLICY "Anyone can read classrooms"
    ON classrooms
    FOR SELECT
    USING (true);

-- Drop and recreate policies for schedules
DROP POLICY IF EXISTS "Authenticated users can read schedules" ON schedules;
DROP POLICY IF EXISTS "Public can read schedules" ON schedules;
DROP POLICY IF EXISTS "Anyone can read schedules" ON schedules;

CREATE POLICY "Anyone can read schedules"
    ON schedules
    FOR SELECT
    USING (true);

-- Drop and recreate policies for library_status
DROP POLICY IF EXISTS "Authenticated users can read library status" ON library_status;
DROP POLICY IF EXISTS "Public can read library status" ON library_status;
DROP POLICY IF EXISTS "Anyone can read library status" ON library_status;

CREATE POLICY "Anyone can read library status"
    ON library_status
    FOR SELECT
    USING (true);

-- Drop and recreate policies for faculty
DROP POLICY IF EXISTS "Authenticated users can read faculty" ON faculty;
DROP POLICY IF EXISTS "Public can read faculty" ON faculty;
DROP POLICY IF EXISTS "Anyone can read faculty" ON faculty;

CREATE POLICY "Anyone can read faculty"
    ON faculty
    FOR SELECT
    USING (true);
```

### 6. Run the Query
- Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
- You should see: "Success. No rows returned"

### 7. Verify Data Exists
Run this query to check if faculty data exists:

```sql
SELECT * FROM faculty;
```

You should see 10 faculty members including:
- Dr. Rajesh Sharma
- Dr. Priya Patel
- Dr. Amit Kumar
- etc.

**If you see NO DATA**, run the `backend/database-setup.sql` script first to insert sample data.

---

## After Running the Script

1. **Refresh your browser** at http://localhost:3000
2. **Open the browser console** (Press F12)
3. **Login again** with your DSU account
4. **Check the console logs** - you should see:
   - ✅ Session restored successfully
   - ✅ Faculty table accessible
   - ✅ Classrooms table accessible
   - ✅ Library table accessible

5. **Test the chatbot** with:
   - "Where is Sharma?"
   - "Find Dr. Patel"
   - "Show free classrooms"

---

## Still Having Issues?

### Check Browser Console (F12)
Look for error messages that say:
- ❌ Faculty table error
- ❌ RLS policies are blocking access

### Common Issues:

1. **"new row violates row-level security policy"**
   → RLS policies not updated correctly
   → Re-run the fix-rls-policies.sql script

2. **"relation 'faculty' does not exist"**
   → Tables not created
   → Run backend/database-setup.sql first

3. **"No rows returned"**
   → No data in the database
   → Run the INSERT statements from database-setup.sql

---

## Need More Help?
Check the browser console logs and share the error messages!
