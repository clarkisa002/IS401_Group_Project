/**
 * Dinocamp Backend - Express API server
 * Connects to PostgreSQL and exposes REST endpoints.
 * Run: node server.js  (or npm run dev with nodemon)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { pool } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Routes ----------

/**
 * POST /api/auth/login - Authenticate user with email and password
 * Body: { email: string, password: string }
 * Returns: { user_id, email, first_name, last_name, name }
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userResult = await pool.query(
      "SELECT u.user_id, u.email, u.first_name, u.last_name, a.password_hash FROM users u JOIN authentication a ON u.user_id = a.user_id WHERE u.email = $1",
      [email.trim().toLowerCase()]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const response = {
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name} ${user.last_name}`.trim() || user.email,
    };
    res.json(response);
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Failed to sign in. Please try again." });
  }
});

/**
 * GET /api/users - Fetches all users from the database
 */
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, first_name, last_name, email, created_at FROM users ORDER BY user_id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * GET /api/goals - Fetches all goals for a user (defaults to user_id=1)
 */
app.get("/api/goals", async (req, res) => {
  try {
    const userId = req.query.user_id || 1;
    const result = await pool.query(
      "SELECT goal_id, goal_name, goal_type, target_amount, target_date, current_progress, is_active, created_at FROM goals WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching goals:", err.message);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

/**
 * POST /api/goals - Creates a new goal for a user
 */
app.post("/api/goals", async (req, res) => {
  try {
    const { user_id = 1, goal_name, goal_type, target_amount, target_date } = req.body;

    if (!goal_name || !target_amount) {
      return res.status(400).json({ error: "goal_name and target_amount are required" });
    }

    const result = await pool.query(
      `INSERT INTO goals (user_id, goal_name, goal_type, target_amount, target_date, current_progress, is_active)
       VALUES ($1, $2, $3, $4, $5, 0, true)
       RETURNING goal_id, goal_name, goal_type, target_amount, target_date, current_progress, is_active, created_at`,
      [user_id, goal_name, goal_type || "savings", target_amount, target_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    const msg = err && err.message ? String(err.message) : "";
    console.error("Error creating goal:", msg);

    if (msg.toLowerCase().includes("overflow")) {
      return res.status(400).json({ error: "Target amount is too large. Maximum is 999,999,999,999,999.99." });
    }
    if (msg.includes("invalid input") || msg.includes("invalid value")) {
      return res.status(400).json({ error: "Invalid target amount or date. Check the values and try again." });
    }
    if (msg.includes("connection") || msg.includes("ECONNREFUSED") || msg.includes("connect")) {
      return res.status(503).json({ error: "Cannot connect to the database. Make sure PostgreSQL is running." });
    }

    const reason = msg || "Something went wrong on the server.";
    res.status(500).json({ error: `Failed to create goal: ${reason}` });
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Dinocamp backend running on http://localhost:${PORT}`);
  console.log(`  GET /api/users - list all users`);
});
