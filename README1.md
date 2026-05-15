# 📚 BookPulse

**A high‑performance, social reading ecosystem built with Next.js.**
Real‑time synchronized reading, discussion threads, and community‑driven literary exploration.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![Drizzle](https://img.shields.io/badge/ORM-Drizzle-ff69b4?logo=drizzle)](https://orm.drizzle.team/)
[![Neon](https://img.shields.io/badge/DB-Neon-00e599?logo=neon)](https://neon.tech/)
[![Supabase](https://img.shields.io/badge/Auth-Supabase-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/CSS-Tailwind-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443e38)](https://zustand-demo.pmnd.rs/)

---

## ✨ Features

- **Club Ecosystem** – Create and manage reading groups with specialised metadata, member roles, and progress dashboards.
- **Real‑time Interaction** – In‑club chat and notifications keep readers connected as they progress.
- **Service‑Oriented Logic** – Decoupled business layer (`services/`) ready for reuse in mobile and other clients.
- **Granular Progress Auditing** – Track every chapter, highlight, and reader activity log.
- **Automated Workflows** – Scheduled reminders, reading goals, and club deadline checks via `cron.service.ts`.

---

## 🛠 Tech Stack

| Layer               | Technology                                | Rationale |
| :------------------ | :---------------------------------------- | :-------- |
| **Framework**       | Next.js 14+ (App Router)                  | Server‑side rendering, server actions, file‑based routing |
| **Database**        | Neon (Serverless PostgreSQL)              | Edge‑ready, instant branching, auto‑scaling |
| **ORM**             | Drizzle ORM                               | Type‑safe, lightweight, headless migrations |
| **Authentication**  | Supabase Auth                             | JWT‑based, social logins, row‑level security ready |
| **Styling**         | Tailwind CSS                              | Utility‑first, rapid UI development |
| **State Management**| Zustand                                   | Minimal global state for UI and user session |

---

## 📂 Project Structure Analysis

```text
BOOK_PULSE/
├── app/                # Next.js App Router (Pages, Layouts, Server Actions)
├── components/         # Atomic & Feature-based UI components
├── drizzle/            # Database migrations and schema snapshots
├── hooks/              # Custom React hooks
├── lib/                # Shared utilities & configurations
│   ├── db/             # Drizzle client & Neon connection
│   ├── supabase/       # Supabase client (Client/Server/Admin)
│   └── emails/         # Email templates and logic
├── services/           # CORE BUSINESS LOGIC (Service Layer)
│   ├── club.service.ts # Club management & logic
│   ├── chat.service.ts # Real-time messaging logic
│   ├── post.service.ts # Social feed & posts
│   └── ...             # Admin, Cron, Feedback, etc.
├── store/              # Global state management (Zustand)
└── public/             # Static assets (images, icons)

1. Project Overview
BookPulse is a high-performance social reading platform built with a modern serverless architecture. It enables users to join book clubs, participate in real-time discussions, and track reading progress across various literary categories.
Core Features
Club Ecosystem: Create and manage reading groups with specialized metadata.
Service-Oriented Logic: Decoupled business logic for chat, notifications, and profile management.
Real-time Interaction: Integrated chat and notification systems.
Progress Auditing: Granular tracking of reader chapters and activity logs.
2. Tech Stack Analysis
Layer	Technology	Rational Selection
Framework	Next.js 14+	App Router architecture for optimized SEO and server-side performance.
Database	Neon (PostgreSQL)	Serverless Postgres designed for the edge, offering instant branching and scaling.
ORM	Drizzle ORM	Lightweight, Type-safe TypeScript ORM with headless migrations and peak performance.
Authentication	Supabase Auth	Robust GoTrue-based auth providing JWT management and secure social logins.
Business Logic	Services Layer	Decoupled .service.ts pattern to ensure logic can be reused in mobile environments.
State Management	Zustand (Store)	Lightweight client-side state for global UI and user session persistence.
3. Folder Structure Analysis
Core Directories
app/: Next.js App Router. Contains the routing logic, layouts, and Server Actions.
drizzle/: Management of SQL migrations and schema snapshots.
services/: The Engine. Contains standalone business logic (Admin, Chat, Club, etc.). This is the most critical folder for mobile migration.
lib/:
db/: Database connection pooling via Drizzle/Neon.
supabase/: Supabase client configuration for server and client-side auth.
emails/: Email template logic and SMTP integration.
store/: Global client-side state management.
hooks/: Custom React logic (e.g., useAuth, useNotification).
components/: Reusable UI components and feature-specific blocks.
4. Architecture & Data Flow
The system operates on a Service-Based Architecture within Next.js:
Authentication Flow: Supabase handles the session. The middleware.ts intercepts requests to protect private club routes.
Data Access Layer: Components/Actions call services/ functions. These services interact with Neon via Drizzle ORM.
Real-Time Layer: Utilizes Supabase Realtime or custom Socket logic for the chat.service.ts.
Automation: cron.service.ts handles scheduled tasks (like reading reminders or club deadlines).
5. Database Schema & Relationships (Drizzle + Neon)
The schema is defined in TypeScript and migrated to Neon.
Core Collections/Tables:
Profiles: Linked to Supabase auth.users via UUID.
Clubs: Primary entity containing book metadata, creator IDs, and settings.
Posts/Notes: User-generated content within clubs (post.service.ts & note.service.ts).
Notifications: System-wide event tracking (notification.service.ts).
Feedback/Admin: Governance and user reporting data.
6. Service Layer (The Migration Blueprint)
These files contain the logic that the Mobile App will need to replicate or call via API:
club.service.ts: Logic for joining/leaving clubs and calculating progress.
chat.service.ts: Handling message persistence and retrieval.
notification.service.ts: Dispatching push and in-app alerts.
profile.service.ts: Managing user metadata and preferences.
7. Mobile App Migration Strategy (Web → React Native)
What is Reusable?
Drizzle Schemas: Can be shared if using a monorepo or copied for type definitions.
Services logic: The logic inside services/*.ts can be converted into API endpoints that the mobile app calls.
Supabase Config: The lib/supabase setup remains largely the same, swapping ssr for the React Native client.
Key Refactor Requirements:
Authentication: Mobile must use supabase.auth.getSession() with a secure storage adapter (Expo SecureStore).
Routing: Migrate from Next.js app/ file-based routing to React Navigation or Expo Router.
UI Layer: Tailwind classes move to NativeWind, and HTML elements (div, p) become <View> and <Text>.
8. Developer Setup
Environment Variables
code
Bash
# Database (Neon)
DATABASE_URL=postgresql://user:pass@neon-host/db

# Auth (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Drizzle
DRIZZLE_POLLING=true
Deployment Workflow
Schema Change: Edit schema.ts.
Migration: npx drizzle-kit generate:pg followed by npx drizzle-kit push:pg.
Service Update: Update relevant .service.ts to reflect schema changes.
Deploy: Vercel (Frontend/API) + Neon (Database).
9. Future Scaling Improvements
Caching: Implement Redis for the club.service.ts to cache popular club metadata.
Edge Functions: Move notification.service.ts logic to Supabase Edge Functions for lower latency.
Offline First: On mobile, use Drizzle with SQLite (via Expo) to allow users to read/comment offline and sync later.