/**
 * Dinocamp Backend - Express API server
 * Connects to PostgreSQL and exposes REST endpoints.
 * Run: node server.js  (or npm run dev with nodemon)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Routes ----------

/**
 * GET /api/users - Fetches all users from the database
 */
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, created_at FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Dinocamp backend running on http://localhost:${PORT}`);
  console.log(`  GET /api/users - list all users`);
});
