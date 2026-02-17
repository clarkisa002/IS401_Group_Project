-- =============================================
-- Dinocamp Database Schema
-- Run this file to create the users table.
-- Example: psql -d dinocamp -f db/schema.sql
-- =============================================

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
