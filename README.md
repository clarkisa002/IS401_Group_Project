**App Summary** - 
The Home Readiness Planner helps aspiring homeowners move from financial uncertainty to a clear, personalized plan for buying a home. Many first-time buyers do not know what they can realistically afford or how long it will take to become buy-ready, and existing tools focus on listings or one-time affordability snapshots rather than long-term preparation. Our primary users are renters and early planners who are months or years away from purchasing and need guidance, not sales pressure. The application allows users to enter financial details, explore real-time affordability scenarios, and generate a step-by-step readiness timeline based on their goals. It highlights key gaps—such as down payment, debt, or income—and provides actionable recommendations to help users improve their position over time. Interactive rent-versus-buy comparisons and multi-scenario planning help users understand the tradeoffs behind each decision. By turning complex financial data into simple, personalized insights, the platform empowers users to make confident and informed housing decisions long before they begin the home-buying process.

**Tech Stack** - 

**Frontend**

* React (TypeScript) — UI library for building component-based interfaces
* Vite — development server and build tool
* Tailwind CSS — utility-first CSS framework for styling
* shadcn/ui — accessible, reusable component library built on Radix UI

**Backend**

* Supabase — hosted PostgreSQL, Auth, and REST API (primary)
* Node.js + Express — optional local backend (see legacy setup below)

**Database**

* Supabase (PostgreSQL) — auth, profiles, goals with Row Level Security
* Custom SQL scripts — `db/supabase_schema.sql` for Supabase; `db/schema.sql` for local PostgreSQL 

**Tooling & DevOps**

* TypeScript — static typing across the full stack
* pnpm — fast, efficient package manager
* Prettier — code formatting
* Docker — containerization for consistent environments
* Netlify — deployment and hosting platform



**Architecture Diagram** - Include a system architecture diagram showing the user, frontend, backend, database, and any external services, with labeled arrows indicating how the components communicate.
![System Architecture Diagram](docs/architecture.png)

**Prerequisites** -  
Ensure the following software is installed before running the project locally. This project has been tested on macOS, Linux, and Windows.
* Node.js (v18 or higher)
Install via the official site: https://nodejs.org/en/download
bashnode -v
npm -v
* pnpm
Install via the official site: https://pnpm.io/installation
bashpnpm -v
* PostgreSQL (v14 or higher)
Install via the official site: https://www.postgresql.org/download

⚠️ After installation, ensure that psql is available in your system PATH. On Windows this is a common issue — you may need to add the PostgreSQL bin directory manually to your PATH environment variable. You can verify by running:

* bashpsql --version
* Docker (optional — only needed if running the project in a container)
Install via the official site: https://docs.docker.com/get-docker
bashdocker -v
* Git
Install via the official site: https://git-scm.com/downloads
bashgit --version

Feel free to let me know if you'd like to adjust the supported OS list or PostgreSQL version requirement to match what you've actually tested on.

**Installation and Setup**

### Option A: Supabase (recommended)

1. **Clone the repository** and navigate into the project folder:
   ```bash
   git clone <repository-url>
   cd IS401_Group_Project
   ```

2. **Install dependencies** from the project root:
   ```bash
   pnpm install
   ```

3. **Create a Supabase project** at [supabase.com](https://supabase.com). In the dashboard:
   - Go to **SQL Editor** and run the contents of `db/supabase_schema.sql`
   - Go to **Settings → API** and copy your **Project URL** and **anon public** key

4. **Create a `.env` file** in the project root with:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Start the frontend** (no backend needed):
   ```bash
   pnpm run dev
   ```
   Open **http://localhost:8080**. Sign up at `/signup` or sign in at `/login`.

### Option B: Local PostgreSQL + Express (legacy)

1. **Clone the repository** and navigate into the project folder:
   ```bash
   git clone <repository-url>
   cd IS401_Group_Project
   ```

2. **Install dependencies** from the project root and backend:
   ```bash
   pnpm install
   cd backend && pnpm install && cd ..
   ```

3. **Create the PostgreSQL database**. Open a terminal with `psql` available and run:
   ```bash
   psql -U postgres
   ```
   Then inside the psql prompt:
   ```sql
   CREATE DATABASE dinocamp;
   \q
   ```

5. **Run the schema and seed scripts** to create tables and populate sample data (including test users with login credentials):
   ```bash
   psql -U postgres -d dinocamp -f db/schema.sql
   psql -U postgres -d dinocamp -f db/seed.sql
   ```
   Replace `postgres` with your PostgreSQL username if it differs. If you've run an older seed with placeholder hashes, re-run the seed script to get working logins.

6. **Configure environment variables** for the backend. Copy the example file and fill in your credentials:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your PostgreSQL connection details:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_postgres_username
   DB_PASSWORD=your_password
   DB_NAME=dinocamp
   DB_PORT=5432
   ```

**Running the Application**

**With Supabase:** Run only the frontend:
```bash
pnpm run dev
```
Open **http://localhost:8080**. Sign up or sign in; goals are stored in Supabase.

**With local backend:** You need two terminals:
1. **Frontend:** `pnpm run dev` → http://localhost:8080
2. **Backend:** `pnpm run backend:dev` → http://localhost:3000

---

## Login & Test Accounts

**Supabase:** Create an account at `/signup`. No seed data needed.

**Local backend:** After running the seed script, you can sign in with these test accounts.

| Email             | Password   | User   |
|-------------------|------------|--------|
| `isaac@example.com` | `password123` | Isaac Smith |
| `jane@example.com`  | `password123` | Jane Doe    |

**Quick start (Supabase):** Run `pnpm run dev`, go to http://localhost:8080/signup to create an account, then sign in.

2. Go to **http://localhost:8080/login**.
3. Enter `isaac@example.com` / `password123` and sign in.
4. You’ll be redirected to the Dashboard. Goals and other data are scoped to the logged-in user.

**Changing passwords**

Passwords are bcrypt-hashed in the database. To generate a new hash for seed data:
```bash
cd backend && node scripts/generate-hash.js
```
Replace the `password_hash` values in `db/seed.sql` with the output, then re-run the seed script.

---

## Essential Info

- **Frontend**: React SPA on port **8080** (Vite dev server).
- **Supabase**: Auth and goals use Supabase. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **Local backend** (optional): Express + PostgreSQL on port **3000**. Uses `backend/.env` for DB credentials.

---

**Verifying the Vertical Slice**

The vertical slice demonstrates a full round-trip: a button in the UI triggers server logic that updates the PostgreSQL database, the server returns the new data, and the UI displays it — persisting after a page refresh.

1. **Ensure both servers are running.** You need two terminals:
   - Terminal 1 (frontend): `npm run dev` → http://localhost:8080
   - Terminal 2 (backend): `npm run backend:dev` → http://localhost:3000

2. **Sign in** (recommended). Go to http://localhost:8080/login and sign in with `isaac@example.com` / `password123`. Goals and other data are user-scoped.

3. **Navigate to the Goals page.** Open http://localhost:8080/goals in your browser. The page loads existing goals from the database via `GET /api/goals`. The seed data includes goals like "Down Payment," "Emergency Fund," and "Closing Costs."

4. **Click "Set Up New Goal" or "Add New Goal."** Either the button in the page header or the dashed card at the end of the goal list opens a dialog form.

5. **Fill out and submit the form.** Enter a goal name (e.g., "Vacation Home Fund"), a target amount (e.g., 25000), optionally a target date, and click **Create Goal**. The frontend sends a `POST /api/goals` request to the backend, which inserts a new row into the `goals` table and returns the created record.

6. **Verify the new goal appears in the UI.** After submission, the dialog closes and the goal list refreshes automatically. The new goal card appears with a progress bar showing 0% complete.

7. **Confirm persistence after refresh.** Reload the page (F5 or Ctrl+R). The new goal still appears because it is fetched from PostgreSQL on every page load — not stored in localStorage.

8. **Confirm directly in the database (optional).** Run:
   ```bash
   psql -U postgres -d dinocamp -c "SELECT goal_id, goal_name, target_amount, current_progress FROM goals ORDER BY goal_id;"
   ```
   The newly created goal appears as a row in the `goals` table.

