-- =============================================
-- Sample Buildings & Rooms Data
-- =============================================
-- Run this in Supabase SQL Editor AFTER running supabase_schema.sql
-- This adds 3 buildings and 10 rooms so you can assign rooms to students
-- =============================================

-- Insert Buildings
INSERT INTO buildings (name, address, total_rooms) VALUES
  ('Block A - Main Campus', '123 University Road, Campus City, 560001', 50),
  ('Block B - North Wing', '124 University Road, Campus City, 560001', 40),
  ('Block C - Premium', '125 University Road, Campus City, 560001', 30);

-- Insert Rooms (using subqueries to reference building IDs)
-- Block A Rooms
INSERT INTO rooms (building_id, room_number, room_type, has_ac, capacity, monthly_rent, status)
VALUES
  ((SELECT id FROM buildings WHERE name = 'Block A - Main Campus'), '101', 'single', true, 1, 8000, 'available'),
  ((SELECT id FROM buildings WHERE name = 'Block A - Main Campus'), '102', 'double', true, 2, 12000, 'available'),
  ((SELECT id FROM buildings WHERE name = 'Block A - Main Campus'), '103', 'single', false, 1, 6000, 'available'),
  ((SELECT id FROM buildings WHERE name = 'Block A - Main Campus'), '104', 'double', false, 2, 9000, 'available');

-- Block B Rooms
INSERT INTO rooms (building_id, room_number, room_type, has_ac, capacity, monthly_rent, status)
VALUES
  ((SELECT id FROM buildings WHERE name = 'Block B - North Wing'), '201', 'single', true, 1, 7500, 'available'),
  ((SELECT id FROM buildings WHERE name = 'Block B - North Wing'), '202', 'double', true, 2, 11000, 'available'),
  ((SELECT id FROM buildings WHERE name = 'Block B - North Wing'), '203', 'single', false, 1, 5500, 'available');

-- Block C Rooms (Premium)
INSERT INTO rooms (building_id, room_number, room_type, has_ac, capacity, monthly_rent, status)
VALUES
  ((SELECT id FROM buildings WHERE name = 'Block C - Premium'), '301', 'single', true, 1, 10000, 'available'),
  ((SELECT id FROM buildings WHERE name = 'Block C - Premium'), '302', 'double', true, 2, 15000, 'available'),
  ((SELECT id FROM buildings WHERE name = 'Block C - Premium'), '303', 'single', true, 1, 10000, 'available');

-- =============================================
-- DONE! You now have 3 buildings and 10 rooms.
-- Go to Student Management > Add Student > Assignment tab
-- to assign rooms when adding students.
-- =============================================
