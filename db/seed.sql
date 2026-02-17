-- =============================================
-- Dinocamp Database Seed Data
-- Run after schema.sql to insert sample users.
-- Example: psql -d dinocamp -f db/seed.sql
-- =============================================

INSERT INTO users (first_name, last_name, email) VALUES
  ('Alice', 'Anderson', 'alice.anderson@example.com'),
  ('Bob', 'Brown', 'bob.brown@example.com'),
  ('Carol', 'Clark', 'carol.clark@example.com'),
  ('David', 'Davis', 'david.davis@example.com');
