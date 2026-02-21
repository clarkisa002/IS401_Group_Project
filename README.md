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

**Installation and Setup** - Provide clear step-by-step instructions for installing dependencies, creating the database, running schema.sql and seed.sql, and configuring environment variables if required.

**Running the Application** - Explain how to start the backend and frontend and specify the URL to open in the browser.

**Verifying the Vertical Slice** - Provide specific steps demonstrating how to trigger the feature, confirm that the database was updated, and verify that the change persists after refreshing the page.

