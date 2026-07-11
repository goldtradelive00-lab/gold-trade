# GoldTrade

Private wealth management platform — investor dashboard + admin back office.

## Stack

- **Frontend** (`frontend/`) — Next.js 16 (App Router, TypeScript), Tailwind v4, shadcn/ui, deployed to Vercel
- **Backend** (`backend/`) — Spring Boot 3.5 (Maven), deployed to Railway
- **Database / Auth** — Supabase (Postgres + Auth)
- **Email** — Resend (verification, approval, password reset)

## Getting Started

1. Copy `frontend/.env.example` to `frontend/.env.local` and fill in the values.
2. Copy `backend/.env.example` to `backend/.env` and fill in the values.
3. Run both apps:
   ```
   start-dev.bat
   ```
   or individually:
   ```
   cd backend && ./mvnw.cmd spring-boot:run
   cd frontend && npm run dev
   ```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
