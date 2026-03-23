-- Run this only if you created the database before target_amount was increased to DECIMAL(18,2).
-- Allows goal amounts up to 999,999,999,999,999.99 (was 99,999,999.99 with DECIMAL(10,2)).
ALTER TABLE goals ALTER COLUMN target_amount TYPE DECIMAL(18, 2);
ALTER TABLE goals ALTER COLUMN current_progress TYPE DECIMAL(18, 2);
