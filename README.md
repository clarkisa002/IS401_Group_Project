**App Summary** - 
The Home Readiness Planner helps aspiring homeowners move from financial uncertainty to a clear, personalized plan for buying a home. Many first-time buyers do not know what they can realistically afford or how long it will take to become buy-ready, and existing tools focus on listings or one-time affordability snapshots rather than long-term preparation. Our primary users are renters and early planners who are months or years away from purchasing and need guidance, not sales pressure. The application allows users to enter financial details, explore real-time affordability scenarios, and generate a step-by-step readiness timeline based on their goals. It highlights key gaps—such as down payment, debt, or income—and provides actionable recommendations to help users improve their position over time. Interactive rent-versus-buy comparisons and multi-scenario planning help users understand the tradeoffs behind each decision. By turning complex financial data into simple, personalized insights, the platform empowers users to make confident and informed housing decisions long before they begin the home-buying process.

**Tech Stack** - 

**Frontend**

* React (TypeScript) — UI library for building component-based interfaces
* Vite — development server and build tool
* Tailwind CSS — utility-first CSS framework for styling
* shadcn/ui — accessible, reusable component library built on Radix UI

**Backend**

* Node.js — JavaScript runtime environment
* Express — web framework for handling API routes and server logic
* Netlify Functions — serverless function deployment for backend endpoints

**Database**

* PostgreSQL — relational database
* Custom SQL scripts — used to create and initialize the database schema 

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

1. **Clone the repository** and navigate into the project folder:
   ```bash
   git clone <repository-url>
   cd IS401_Group_Project
   ```

2. **Install dependencies** from the project root (this installs both frontend and shared packages):
   ```bash
   npm install
   ```

3. **Install backend dependencies** separately:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Create the PostgreSQL database**. Open a terminal with `psql` available and run:
   ```bash
   psql -U postgres
   ```
   Then inside the psql prompt:
   ```sql
   CREATE DATABASE dinocamp;
   \q
   ```

5. **Run the schema and seed scripts** to create tables and populate sample data:
   ```bash
   psql -U postgres -d dinocamp -f db/schema.sql
   psql -U postgres -d dinocamp -f db/seed.sql
   ```
   Replace `postgres` with your PostgreSQL username if it differs.

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

You need two terminals — one for the frontend and one for the backend.

1. **Start the frontend** (Vite dev server with the in-process Express API):
   ```bash
   npm run dev
   ```
   This starts the React frontend at **http://localhost:8080**.

2. **Start the backend** (Express + PostgreSQL API) in a second terminal from the project root:
   ```bash
   npm run backend:dev
   ```
   This starts the database-connected API server at **http://localhost:3000**.

3. Open **http://localhost:8080** in your browser to use the application.

**Verifying the Vertical Slice**

The vertical slice demonstrates a full round-trip: a button in the UI triggers server logic that updates the PostgreSQL database, the server returns the new data, and the UI displays it — persisting after a page refresh.

1. **Ensure both servers are running.** You need two terminals:
   - Terminal 1 (frontend): `npm run dev` → http://localhost:8080
   - Terminal 2 (backend): `npm run backend:dev` → http://localhost:3000

2. **Navigate to the Goals page.** Open http://localhost:8080/goals in your browser. The page loads existing goals from the database via `GET /api/goals`. The seed data includes goals like "Down Payment," "Emergency Fund," and "Closing Costs."

3. **Click "Set Up New Goal" or "Add New Goal."** Either the button in the page header or the dashed card at the end of the goal list opens a dialog form.

4. **Fill out and submit the form.** Enter a goal name (e.g., "Vacation Home Fund"), a target amount (e.g., 25000), optionally a target date, and click **Create Goal**. The frontend sends a `POST /api/goals` request to the backend, which inserts a new row into the `goals` table and returns the created record.

5. **Verify the new goal appears in the UI.** After submission, the dialog closes and the goal list refreshes automatically. The new goal card appears with a progress bar showing 0% complete.

6. **Confirm persistence after refresh.** Reload the page (F5 or Ctrl+R). The new goal still appears because it is fetched from PostgreSQL on every page load — not stored in localStorage.

7. **Confirm directly in the database (optional).** Run:
   ```bash
   psql -U postgres -d dinocamp -c "SELECT goal_id, goal_name, target_amount, current_progress FROM goals ORDER BY goal_id;"
   ```
   The newly created goal appears as a row in the `goals` table.

