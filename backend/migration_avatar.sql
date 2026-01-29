-- Migration script to add avatar column to users table
-- Run this SQL in your PostgreSQL database

-- Add avatar column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
        RAISE NOTICE 'Column avatar added to users table';
    ELSE
        RAISE NOTICE 'Column avatar already exists';
    END IF;
END $$;

SELECT 'Avatar migration completed successfully!' AS status;
