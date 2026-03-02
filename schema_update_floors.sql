-- =============================================
-- Schema Update: Add floor and room_category to rooms
-- =============================================
-- Run this in Supabase SQL Editor AFTER the initial schema
-- =============================================

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor INTEGER NOT NULL DEFAULT 1;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_category TEXT NOT NULL DEFAULT 'standard';
