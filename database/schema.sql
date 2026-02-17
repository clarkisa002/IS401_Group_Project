-- IS 401 Group Project - Database Schema
-- Generated from 401 ERD.drawio
-- PostgreSQL

-- Drop tables in reverse dependency order (for clean re-runs)
DROP TABLE IF EXISTS daily_tips;
DROP TABLE IF EXISTS spending_habits;
DROP TABLE IF EXISTS monthly_progress;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS income;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS personal_readiness_score;
DROP TABLE IF EXISTS authentication;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------------
-- Users (core entity)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  user_id   SERIAL PRIMARY KEY,
  email     VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Authentication (1:1 with users)
-- ---------------------------------------------------------------------------
CREATE TABLE authentication (
  auth_id       SERIAL PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL
);

-- ---------------------------------------------------------------------------
-- Personal Readiness Score (1:many with users)
-- ---------------------------------------------------------------------------
CREATE TABLE personal_readiness_score (
  readiness_id     SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score            INT,
  status           VARCHAR(50),
  downpayment_goal DECIMAL(10, 2),
  home_price_min   DECIMAL(10, 2),
  total_saved      DECIMAL(10, 2),
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Goals (1:many with users)
-- ---------------------------------------------------------------------------
CREATE TABLE goals (
  goal_id         SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  goal_name       VARCHAR(255) NOT NULL,
  goal_type       VARCHAR(50),
  target_amount   DECIMAL(10, 2),
  target_date     DATE,
  current_progress DECIMAL(10, 2) DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Budgets (1:many with users)
-- ---------------------------------------------------------------------------
CREATE TABLE budgets (
  budget_id           SERIAL PRIMARY KEY,
  user_id             INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  month               INT NOT NULL,
  year                INT NOT NULL,
  total_amount        DECIMAL(10, 2),
  percentage_of_goal   DECIMAL(5, 2),
  UNIQUE (user_id, month, year)
);

-- ---------------------------------------------------------------------------
-- Expenses (1:many with users, many:1 with budgets)
-- ---------------------------------------------------------------------------
CREATE TABLE expenses (
  expense_id   SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  budget_id    INT REFERENCES budgets(budget_id) ON DELETE SET NULL,
  category     VARCHAR(50) NOT NULL,
  amount       DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description  TEXT
);

-- ---------------------------------------------------------------------------
-- Income (1:many with users)
-- ---------------------------------------------------------------------------
CREATE TABLE income (
  income_id    SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  amount       DECIMAL(10, 2) NOT NULL,
  income_date  DATE NOT NULL,
  source       VARCHAR(100),
  description  TEXT
);

-- ---------------------------------------------------------------------------
-- Monthly Progress (1:many with users)
-- ---------------------------------------------------------------------------
CREATE TABLE monthly_progress (
  progress_id     SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  month           INT NOT NULL,
  year            INT NOT NULL,
  total_income    DECIMAL(10, 2),
  total_expenses  DECIMAL(10, 2),
  net_savings     DECIMAL(10, 2),
  UNIQUE (user_id, month, year)
);

-- ---------------------------------------------------------------------------
-- Spending Habits (1:many with users)
-- ---------------------------------------------------------------------------
CREATE TABLE spending_habits (
  habit_id    SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  category    VARCHAR(50) NOT NULL,
  percentage  DECIMAL(5, 2),
  total_amount DECIMAL(10, 2),
  month       INT NOT NULL,
  year        INT NOT NULL
);

-- ---------------------------------------------------------------------------
-- Daily Tips (1:many with users)
-- ---------------------------------------------------------------------------
CREATE TABLE daily_tips (
  tip_id      SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tip_content TEXT NOT NULL,
  tip_date    DATE NOT NULL
);

-- ---------------------------------------------------------------------------
-- Indexes for common lookups
-- ---------------------------------------------------------------------------
CREATE INDEX idx_auth_user_id ON authentication(user_id);
CREATE INDEX idx_readiness_user_id ON personal_readiness_score(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_user_month_year ON budgets(user_id, month, year);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_income_date ON income(income_date);
CREATE INDEX idx_monthly_progress_user_id ON monthly_progress(user_id);
CREATE INDEX idx_spending_habits_user_id ON spending_habits(user_id);
CREATE INDEX idx_daily_tips_user_id ON daily_tips(user_id);
CREATE INDEX idx_daily_tips_date ON daily_tips(tip_date);
