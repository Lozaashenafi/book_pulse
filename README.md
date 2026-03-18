# BookPulse: The Digital Reading Club

<div align="center">
  <img src="./public/image/home.png" alt="BookPulse Cover" width="800">
  
  <br />
  
  <p align="center">
    <strong>Turn the page, together.</strong>
    <br />
    A professional reading circle platform for curators of literature.
    <br />
    <a href="https://bookpulse.lozi.me"><strong>Explore the Archives »</strong></a>
  </p>
</div>

<div align="center">
  <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
    <div style="flex: 1 1 45%; min-width: 300px;">
      <img src="./public/image/home2.png" alt="The Reading Shelf (Dashboard)" width="100%">
      <p align="center"><em>The Reading Shelf (Dashboard)</em></p>
    </div>
    <div style="flex: 1 1 45%; min-width: 300px;">
      <img src="./public/image/post.png" alt="The Global Archives (Explore)" width="100%">
      <p align="center"><em>The Global Archives (Explore)</em></p>
    </div>
    <div style="flex: 1 1 45%; min-width: 300px;">
      <img src="./public/image/explor.png" alt="Discussion Archives (Chat)" width="100%">
      <p align="center"><em>Discussion Archives (Chat)</em></p>
    </div>
    <div style="flex: 1 1 45%; min-width: 300px;">
      <img src="./public/image/image.png" alt="The Scribe's Log (Feed)" width="100%">
      <p align="center"><em>The Scribe's Log (Feed)</em></p>
    </div>
  </div>
</div>

<div align="center">
  
  ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
  ![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.30-blueviolet?style=for-the-badge)
  ![Neon DB](https://img.shields.io/badge/Neon_DB-PostgreSQL-green?style=for-the-badge)
  ![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Storage-3EC78D?style=for-the-badge&logo=supabase)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
  
</div>

## About the Project

BookPulse is a digital sanctuary built for readers who believe the best stories are shared. Unlike traditional review sites, BookPulse is designed for the act of reading. It allows users to form reading circles, sync their live progress, and discuss manuscripts in real-time without the risk of spoilers.

## The Curator's Experience

- **Inaugurate a Reading Circle**: Found public reading groups or private nooks for your inner circle.
- **Anti-Spoiler Protocol**: Chapter-specific chat rooms unlock dynamically only when you reach the required page number.
- **Integrated Manuscript Reader**: Read PDFs directly within the app.
- **Daily Scribbles**: A community board for pinning thoughts, featuring high-resolution "Archive Card" exports for social sharing.
- **Postmaster Dispatches**: Automated reminders via Resend SMTP if your quill stays dry for more than 3 days.

##  Technical Architecture

BookPulse utilizes a "Best-of-Breed" multi-cloud strategy to ensure 100% stability and zero connection timeouts:

- **Logic**: Next.js 15 (App Router) with standalone Server Actions
- **Database**: Neon (PostgreSQL) using the high-speed HTTP driver
- **ORM**: Drizzle for type-safe relational mapping and complex SQL subqueries
- **Security**: Supabase Auth with real-time profile synchronization to Neon
- **Storage**: Supabase Storage for secure manuscript and avatar hosting
- **Emails**: Resend for professional dispatch delivery

## Getting Started

### 1. Setup Environment

Create a `.env` file in the root directory:

```env
# Neon Database (Transaction Mode)
DATABASE_URL="postgres://user:pass@host.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Resend API
RESEND_API_KEY="re_12345"

# Analytics & Secrets
NEXT_PUBLIC_GA_ID="G-XXXXXXXX"
CRON_SECRET="your-random-string"


```

# Clone the ledger
```

git clone https://github.com/lozaashenafi/book_pulse.git

# Navigate to project directory

cd book-pulse

# Install dependencies

npm install

# Push the schema to Neon

npx drizzle-kit push

# Begin the session

npm run dev
```

# Folder structure

```

book-pulse
├── 📁 app/ # Route Handlers & Server Components
├── 📁 components/ # Atomic UI Design System
├── 📁 drizzle
├── 📁 hooks/ # Stateful logic (useChat, usePosts)
├── 📁 lib/  
│ ├── 📁 db/ # Drizzle Schema & Neon Config
│ └── 📁 supabase/ # Auth & Storage Clients
├── 📁 services/ # Drizzle-powered Server Actions
├── 📁 store/  
└── 📁 public/ # Branded assets & textures

```
