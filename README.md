<p align="center">
  <img src="public/images/dashboard-preview.png" alt="HabitQuest Dashboard" width="100%" />
</p>

<h1 align="center">🎯 HabitQuest</h1>

<p align="center">
  <strong>Level up your life, one habit at a time.</strong>
</p>

<p align="center">
  A gamified habit tracking application that transforms your daily routines into an engaging RPG-like experience. Build streaks, earn XP, unlock achievements, and climb the ranks as you develop better habits.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-7.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
</p>

---

## ✨ Features

### 🎮 Gamification System
- **XP & Leveling** — Earn experience points for completing habits and level up
- **Rank Progression** — Climb from Unranked to Legend with 9 unique ranks
- **Achievement System** — Unlock badges and trophies for milestones
- **Resources** — Collect Gold, Elixir, and Dark Matter for special abilities
- **Streak Protection** — Use resources to repair broken streaks

### 📊 Comprehensive Habit Tracking
- **Flexible Frequencies** — Daily, weekly, specific days, or custom schedules
- **Multiple Target Types** — Boolean, quantity, duration, or distance-based goals
- **Visual Progress** — Beautiful charts and completion calendars
- **Smart Reminders** — Customizable notification schedules

### 🏋️ Life Management Modules
- **Fitness Tracking** — Log workouts, track progress, monitor health metrics
- **Finance Management** — Budget tracking, expense categories, savings goals
- **Journal** — Daily reflections, mood tracking, gratitude entries
- **Developer Tools** — Coding streaks, project tracking, learning goals

### 🎨 Modern User Experience
- **Beautiful UI** — Clean, modern interface with smooth animations
- **Dark/Light Mode** — Automatic theme switching based on system preference
- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Real-time Updates** — Instant feedback with optimistic UI updates

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, Radix UI, Framer Motion |
| **Database** | PostgreSQL, Prisma 7 ORM |
| **Authentication** | Clerk |
| **API Layer** | tRPC (End-to-end type safety) |
| **State Management** | Zustand with Immer |
| **Forms** | React Hook Form, Zod validation |
| **UI Components** | shadcn/ui |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **pnpm**, **npm**, or **yarn**
- **PostgreSQL** database (local or hosted)
- **Clerk** account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anbu-Malligarjun-Sri/Habit-Tracker.git
   cd habitquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/habitquest"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```

4. **Initialize the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📸 Screenshots

<p align="center">
  <img src="public/images/dashboard-preview.png" alt="Dashboard Overview" width="80%" />
  <br />
  <em>Dashboard Overview — Track your progress at a glance</em>
</p>

<p align="center">
  <img src="public/images/habits-view.png" alt="Habits Management" width="80%" />
  <br />
  <em>Habits Management — Create and manage your daily habits</em>
</p>

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                   # Authentication pages (sign-in, sign-up)
│   ├── api/                      # API routes (tRPC, webhooks)
│   └── dashboard/                # Dashboard pages
│       ├── achievements/
│       ├── developer/
│       ├── finance/
│       ├── fitness/
│       ├── habits/
│       ├── journal/
│       └── settings/
│
├── core/                         # Core Application Foundation
│   ├── config/                   # App configuration (env, trpc client)
│   ├── constants/                # Application constants
│   └── types/                    # Global TypeScript types
│
├── shared/                       # Shared/Reusable Code
│   ├── components/               # Reusable components
│   │   ├── ui/                   # shadcn/ui primitives (20+ components)
│   │   ├── layout/               # Layout components (sidebar, headers)
│   │   ├── feedback/             # Feedback components (loading, empty states)
│   │   ├── forms/                # Form components
│   │   └── data-display/         # Data display components
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   └── providers/                # React context providers
│
├── features/                     # Feature Modules (Domain Logic)
│   ├── auth/                     # Authentication feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── habits/                   # Habit tracking feature
│   │   ├── components/           # HabitCard, CreateHabitDialog
│   │   ├── hooks/
│   │   └── types/
│   ├── gamification/             # Gamification system
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── dashboard/                # Dashboard feature
│   └── settings/                 # Settings feature
│
├── state/                        # Global State Management
│   ├── stores/                   # Zustand stores
│   │   ├── habit-store.ts        # Habits state
│   │   ├── user-store.ts         # User & gamification state
│   │   └── ui-store.ts           # UI state (modals, theme)
│   └── selectors/                # State selectors
│
├── server/                       # Server-Side Code
│   ├── api/                      # tRPC API layer
│   │   ├── routers/              # API routers (user, habits, gamification)
│   │   ├── trpc.ts               # tRPC initialization
│   │   └── root.ts               # Root router
│   ├── db/                       # Database layer
│   │   └── index.ts              # Prisma client singleton
│   └── services/                 # Business logic services
│
└── assets/                       # Static Assets
    ├── icons/
    └── images/
```

---

## 🗺 Roadmap

### Phase 1 ✅ Foundation & Authentication
- [x] Project structure and architecture
- [x] Prisma schema with gamification models
- [x] tRPC API layer setup
- [x] Clerk authentication integration
- [x] Core UI components
- [x] Dashboard overview page
- [x] Settings page

### Phase 2 🔄 Habits Module (In Progress)
- [ ] Full CRUD operations with tRPC
- [ ] Advanced habit scheduling
- [ ] Habit analytics and insights
- [ ] Import/export functionality

### Phase 3 📅 Upcoming
- [ ] Fitness tracking module
- [ ] Finance management module
- [ ] Journal and reflection features
- [ ] Social features and leaderboards

### Future Phases
- [ ] Mobile app (React Native)
- [ ] AI-powered insights
- [ ] Team/family features
- [ ] Integrations (Apple Health, Google Fit, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Clerk](https://clerk.com/) for authentication
- [Vercel](https://vercel.com/) for hosting
- [Prisma](https://prisma.io/) for the amazing ORM

---

<p align="center">
  Made with ❤️ by the HabitQuest Team
</p>

<p align="center">
  <a href="https://github.com/yourusername/habitquest">
    <img src="https://img.shields.io/github/stars/yourusername/habitquest?style=social" alt="GitHub Stars" />
  </a>
</p>
