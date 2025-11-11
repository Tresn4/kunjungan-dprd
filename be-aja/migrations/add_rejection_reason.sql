-- Migration: Add rejection_reason column to kunjungan table
-- File: be-aja/migrations/add_rejection_reason.sql
-- Run this SQL in your PostgreSQL database

-- Add rejection_reason column
ALTER TABLE kunjungan 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment to column
COMMENT ON COLUMN kunjungan.rejection_reason IS 'Alasan penolakan kunjungan yang akan dikirim via email';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'kunjungan' 
AND column_name = 'rejection_reason';