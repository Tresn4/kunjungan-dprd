ALTER TABLE kunjungan 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add index for email for faster queries
CREATE INDEX IF NOT EXISTS idx_kunjungan_email ON kunjungan(email);

-- Add comment
COMMENT ON COLUMN kunjungan.email IS 'Email address for notification';

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'kunjungan' AND column_name = 'email';