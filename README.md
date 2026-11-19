# MUSKAN — Student–Teacher Management System

**Learn Together. Grow Together.**

MUSKAN is an education-management platform foundation for connecting campus administrators, teachers, and students through one workspace.

## Project structure

- `client/` — React 18 + Vite interface, Recharts, Lucide icons, responsive styling
- `server/` — Express API, JWT authentication, request validation and Prisma client
- `server/prisma/schema.prisma` — PostgreSQL data model

## Current implementation status

- [x] Development branch created
- [x] React/Vite application shell and responsive dashboard styling
- [x] Public MUSKAN landing page with feature and role sections
- [x] Login and student/teacher self-registration screens
- [x] Registration creates the matching student or teacher profile
- [x] Responsive dashboard shell with role-specific navigation and theme toggle
- [x] Express server, health endpoint and security middleware
- [x] JWT login and registration endpoints with bcrypt password hashing
- [x] Prisma relational schema for users, students, teachers, departments, semesters, courses, enrollments, attendance, assignments, submissions, materials, exams, results, notifications and messages
- [x] Role-checked, database-backed dashboard summary endpoint
- [x] Authenticated, role-aware list/create APIs for students, teachers and courses (admin-only creation)
- [x] GitHub Actions workflow for Prisma schema validation and frontend build
- [ ] Full CRUD screens and APIs for every management module
- [ ] Assignment file storage, messaging UI, notification UI and reporting screens
- [ ] Automated integration/permission tests and production deployment

**Important:** This repository is an in-progress foundation, not a finished production system. The public homepage includes an illustrative chart; the signed-in dashboard also labels its chart as sample preview data. Summary cards request API data. No real campus records are seeded. A PostgreSQL database and secrets are required before authentication and database-backed screens can run.

## Requirements

- Node.js 20+
- PostgreSQL 15+
- npm 10+

## Local setup

1. Clone the repository and switch to the development branch:

   ```bash
   git clone https://github.com/muskanaslam6969/Muskan-Aslam.git
   cd Muskan-Aslam
   git checkout development
   ```

2. Install workspace dependencies:

   ```bash
   npm install
   ```

3. Configure the server environment:

   ```bash
   cp server/.env.example server/.env
   ```

   Set a valid PostgreSQL `DATABASE_URL`, a unique random `JWT_SECRET` (at least 32 characters), and the client origin. Never commit `.env`.

4. Generate Prisma Client and create the database schema:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start both applications:

   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - API health: http://localhost:4000/api/health

6. Set `VITE_API_URL` in `client/.env` if your API is hosted somewhere other than `http://localhost:4000/api`.

## API foundation

- `POST /api/auth/register` — create a student or teacher account
- `POST /api/auth/login` — authenticate and receive an eight-hour JWT
- `GET /api/auth/me` — return the authenticated account
- `GET /api/dashboard/summary` — role-aware summary based on PostgreSQL records
- `GET /api/students`, `POST /api/students` — student listing and admin provisioning
- `GET /api/teachers`, `POST /api/teachers` — teacher listing and admin provisioning
- `GET /api/courses`, `POST /api/courses` — course listing and admin provisioning
- `GET /api/health` — API health check

Registration does not allow public administrator creation. Create an administrator through a controlled database/admin provisioning process before using admin-only operations.

## Database model

The Prisma schema defines role-based users and linked academic records. Apply migrations against your own PostgreSQL database before starting authenticated API workflows.

## Security notes

- Passwords are hashed with bcrypt.
- JWTs are signed using `JWT_SECRET`.
- Authenticated endpoints validate bearer tokens.
- Role checks are enforced on the server.
- Helmet, CORS, request-size limits and login rate limiting are enabled.
- Uploaded files and production object storage are not implemented yet.
- Use HTTPS, managed secrets, backups, monitoring and a production review before real student data is entered.

## Deployment

Deploy the frontend and API as separate services, provision PostgreSQL, configure environment variables in the hosting provider, run Prisma migrations as a release step, and set the frontend's `VITE_API_URL` to the deployed API URL. GitHub Pages alone cannot host the Express API or PostgreSQL database.

## Branding

**MUSKAN** · Learn Together. Grow Together.
