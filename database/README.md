# Database Scripts

SQL scripts for the IS 401 project, generated from the **401 ERD.drawio** diagram. Target: **PostgreSQL**.

## Files

| File        | Purpose |
|------------|---------|
| `schema.sql` | Creates all tables, indexes, and constraints. Safe to re-run (drops tables first). |
| `seed.sql`   | Inserts sample users, goals, budgets, expenses, income, and related data for development. |

## Prerequisites

- PostgreSQL installed and running
- A database created (e.g. `is401_project`)

## Create the database (one-time)

```bash
# Using psql
createdb is401_project

# Or from inside psql
psql -U postgres -c "CREATE DATABASE is401_project;"
```

## Run the scripts

Run in this order:

```bash
psql -U postgres -d is401_project -f database/schema.sql
psql -U postgres -d is401_project -f database/seed.sql
```

Or from the project root with a connection string:

```bash
psql "postgresql://user:password@localhost:5432/is401_project" -f database/schema.sql
psql "postgresql://user:password@localhost:5432/is401_project" -f database/seed.sql
```

## Schema overview

- **users** – Core user (email, first_name, last_name)
- **authentication** – Password hashes (1:1 with users)
- **personal_readiness_score** – Readiness score and home-buying targets
- **goals** – Savings goals (down payment, emergency fund, etc.)
- **budgets** – Monthly budgets per user
- **expenses** – Transactions linked to user and optional budget
- **income** – Income entries per user
- **monthly_progress** – Aggregated income/expenses/savings per month
- **spending_habits** – Category breakdown by month
- **daily_tips** – Per-user tips by date
