# Home Readiness Planner

The Home Readiness Planner helps aspiring homeowners move from financial uncertainty to a clear, personalized plan for buying a home. Users can enter financial details, explore affordability scenarios, and track goals toward home ownership.

## Tech Stack

- **Frontend:** React (TypeScript), Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth + PostgreSQL)
- **Deployment:** Vercel

---

## Prerequisites

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/en/download)
- **Git** — [Download](https://git-scm.com/downloads)

That's it. No PostgreSQL or pnpm required for the Supabase setup.

---

## Quick Start (Supabase)

### 1. Clone and install

```bash
git clone <repository-url>
cd IS401_Group_Project
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the contents of `db/supabase_schema.sql`
3. In **Authentication → Providers → Email**, turn **off** "Confirm email" so users can sign in immediately after signup (no email verification)
4. In **Settings → API**, copy your **Project URL** and **anon public** key

### 3. Configure environment

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the app

```bash
npm run dev
```

Open **http://localhost:8080**. Sign up at `/signup` or sign in at `/login`.

---

## Using the App

- **Sign up:** Go to http://localhost:8080/signup to create an account
- **Sign in:** Go to http://localhost:8080/login
- **Goals:** After signing in, visit `/goals` to create and track savings goals (stored in Supabase)

---

## Alternative: npm vs pnpm

This project works with **npm** (comes with Node.js) or **pnpm**:

```bash
# Using npm (recommended if pnpm isn't installed)
npm install
npm run dev

# Using pnpm (if you have it installed)
pnpm install
pnpm run dev
```

---

## Essential Info

- **Frontend:** React SPA on port **8080**
- **Supabase:** Auth and goals use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **No backend server needed** when using Supabase

---

## Architecture Diagram

![System Architecture Diagram](docs/architecture.png)
