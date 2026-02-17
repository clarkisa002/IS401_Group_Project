/**
 * PostgreSQL connection pool for Dinocamp backend.
 * Uses environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT.
 * See .env.example in this folder.
 */

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "dinocamp",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err.message);
});

module.exports = { pool };
