-- IS 401 Group Project - Seed Data
-- Sample data for development and testing (aligns with ERD and app demo user "Isaac")

-- Clear existing data (respect FK order)
TRUNCATE TABLE daily_tips, spending_habits, monthly_progress, expenses, income, budgets, goals, personal_readiness_score, authentication, users RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
INSERT INTO users (email, first_name, last_name) VALUES
  ('isaac@example.com', 'Isaac', 'Smith'),
  ('jane@example.com', 'Jane', 'Doe');

-- ---------------------------------------------------------------------------
-- Authentication (password_hash is bcrypt for "password123" - change in production)
-- ---------------------------------------------------------------------------
INSERT INTO authentication (user_id, password_hash) VALUES
  (1, '$2a$10$placeholder.hash.replace.with.real.bcrypt'),
  (2, '$2a$10$placeholder.hash.replace.with.real.bcrypt');

-- ---------------------------------------------------------------------------
-- Personal Readiness Score (matches demo readiness score 68, savings 45000)
-- ---------------------------------------------------------------------------
INSERT INTO personal_readiness_score (user_id, score, status, downpayment_goal, home_price_min, total_saved, updated_at) VALUES
  (1, 68, 'On Track', 60000.00, 320000.00, 45000.00, CURRENT_TIMESTAMP),
  (2, 45, 'Getting Started', 50000.00, 280000.00, 12000.00, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------------------
-- Goals (Down Payment, Emergency Fund, Closing Costs from demo)
-- ---------------------------------------------------------------------------
INSERT INTO goals (user_id, goal_name, goal_type, target_amount, target_date, current_progress, is_active) VALUES
  (1, 'Down Payment', 'savings', 60000.00, '2025-12-31', 35000.00, true),
  (1, 'Emergency Fund', 'savings', 10000.00, '2024-06-30', 7000.00, true),
  (1, 'Closing Costs', 'savings', 10000.00, '2025-12-31', 3000.00, true),
  (2, 'Down Payment', 'savings', 50000.00, '2026-06-30', 12000.00, true);

-- ---------------------------------------------------------------------------
-- Budgets (current month example)
-- ---------------------------------------------------------------------------
INSERT INTO budgets (user_id, month, year, total_amount, percentage_of_goal) VALUES
  (1, 2, 2026, 3500.00, 85.00),
  (1, 1, 2026, 3400.00, 82.00),
  (2, 2, 2026, 2800.00, 70.00);

-- ---------------------------------------------------------------------------
-- Expenses (sample categories from demo: Rent, Food, Transport, etc.)
-- ---------------------------------------------------------------------------
INSERT INTO expenses (user_id, budget_id, category, amount, expense_date, description) VALUES
  (1, 1, 'Rent/Housing', 1800.00, '2026-02-01', 'Monthly rent'),
  (1, 1, 'Food & Dining', 600.00, '2026-02-05', 'Groceries and dining'),
  (1, 1, 'Transportation', 400.00, '2026-02-10', 'Gas and transit'),
  (1, 1, 'Entertainment/Fun', 300.00, '2026-02-12', 'Streaming and recreation'),
  (1, 1, 'Utilities', 200.00, '2026-02-15', 'Electric, internet'),
  (1, 1, 'Other', 150.00, '2026-02-16', 'Miscellaneous'),
  (2, 3, 'Rent/Housing', 1200.00, '2026-02-01', 'Rent'),
  (2, 3, 'Food & Dining', 400.00, '2026-02-08', 'Groceries');

-- ---------------------------------------------------------------------------
-- Income (demo income ~85000/yr => ~7083/month)
-- ---------------------------------------------------------------------------
INSERT INTO income (user_id, amount, income_date, source, description) VALUES
  (1, 7083.33, '2026-02-01', 'Salary', 'Monthly salary'),
  (1, 200.00, '2026-02-14', 'Side gig', 'Freelance'),
  (2, 5500.00, '2026-02-01', 'Salary', 'Monthly salary');

-- ---------------------------------------------------------------------------
-- Monthly Progress (aggregate view data for charts)
-- ---------------------------------------------------------------------------
INSERT INTO monthly_progress (user_id, month, year, total_income, total_expenses, net_savings) VALUES
  (1, 1, 2026, 7200.00, 3450.00, 3750.00),
  (1, 2, 2026, 7283.33, 3450.00, 3833.33),
  (1, 6, 2025, 7000.00, 3200.00, 3800.00),
  (1, 5, 2025, 7000.00, 3100.00, 3900.00),
  (1, 4, 2025, 7000.00, 3000.00, 4000.00),
  (2, 2, 2026, 5500.00, 2800.00, 2700.00);

-- ---------------------------------------------------------------------------
-- Spending Habits (category breakdown by month)
-- ---------------------------------------------------------------------------
INSERT INTO spending_habits (user_id, category, percentage, total_amount, month, year) VALUES
  (1, 'Rent/Housing', 52.17, 1800.00, 2, 2026),
  (1, 'Food & Dining', 17.39, 600.00, 2, 2026),
  (1, 'Transportation', 11.59, 400.00, 2, 2026),
  (1, 'Entertainment/Fun', 8.70, 300.00, 2, 2026),
  (1, 'Utilities', 5.80, 200.00, 2, 2026),
  (1, 'Other', 4.35, 150.00, 2, 2026);

-- ---------------------------------------------------------------------------
-- Daily Tips (personalized tips per user/date)
-- ---------------------------------------------------------------------------
INSERT INTO daily_tips (user_id, tip_content, tip_date) VALUES
  (1, 'You''re 58% to your down payment goal. Consider increasing savings by 5% this month.', CURRENT_DATE),
  (1, 'Your emergency fund is strong. Keep 3–6 months of expenses in a high-yield account.', CURRENT_DATE - INTERVAL '1 day'),
  (2, 'Start by building a $1,000 starter emergency fund, then focus on down payment.', CURRENT_DATE);
