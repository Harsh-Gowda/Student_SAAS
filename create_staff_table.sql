-- =============================================
-- Create Staff Table
-- Run this in your Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Allow full access for now (consistent with other tables in your schema)
CREATE POLICY "Allow full access to staff" ON staff FOR ALL USING (true) WITH CHECK (true);

-- Insert you as the primary admin if not already there
-- INSERT INTO staff (first_name, last_name, email, role) 
-- VALUES ('YourName', 'YourLastName', 'your@email.com', 'admin');
