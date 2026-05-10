# The Car Lounge CRM - Setup Guide

## Quick Start

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE car_lounge_db;
```

### 2. Environment Configuration

The `.env` file is already created. Update the DATABASE_URL if needed:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/car_lounge_db"
AUTH_SECRET="your-secret-key-change-this-in-production-2024"
```

### 3. Push Database Schema

```bash
cd car-lounge
pnpm db:push
```

### 4. Seed Demo Data

```bash
pnpm db:seed
```

This creates:
- Admin user (admin@thecarlounge.ae / admin123)
- 8 demo customers with vehicles
- 10 service types
- 15 sample jobs across all statuses
- 5 employees
- 8 inventory products
- Sample invoices and payments

### 5. Start Development Server

```bash
pnpm dev
```

Open http://localhost:3000

---

## Demo Credentials

- **Email:** admin@thecarlounge.ae
- **Password:** admin123

---

## Project Structure

```
car-lounge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login page
│   │   ├── (dashboard)/        # Main app with sidebar
│   │   │   ├── dashboard/      # KPIs, charts, recent jobs
│   │   │   ├── jobs/           # Vehicle service jobs
│   │   │   ├── customers/      # Customer management
│   │   │   ├── invoices/       # Billing & payments
│   │   │   ├── employees/      # HR & documents
│   │   │   ├── inventory/      # Products & stock
│   │   │   └── services/       # Service catalog
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # Shadcn components
│   │   ├── business/           # Business components
│   │   └── layout/             # Sidebar, header
│   └── lib/
│       ├── db/schema/          # Drizzle tables
│       ├── trpc/routers/       # API routers
│       └── auth/               # NextAuth config
├── scripts/
│   └── seed.ts                 # Demo data seeder
└── drizzle.config.ts           # Database config
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Features Included in MVP

### Dashboard
- Revenue tracking with charts
- Active jobs count
- Customer count
- Pending invoices
- Low stock alerts
- Recent jobs list

### Jobs
- Job creation and tracking
- Status workflow (booked → delivered)
- Bay assignment
- Service line items
- Customer & vehicle linking

### Customers
- Customer database
- VIP flagging
- Contact information
- Multiple vehicles per customer

### Invoices
- Auto-generated from jobs
- Payment tracking
- Partial payments
- Overdue alerts

### Employees
- Staff database
- UAE document tracking (Emirates ID, Visa, Passport)
- Document expiry reminders
- Salary information

### Inventory
- Product catalog
- Stock levels
- Low stock alerts
- Cost & selling price

### Services
- Service catalog
- Category grouping
- Default pricing
- Estimated time

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4 + Shadcn/ui
- **API:** tRPC v11
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth v5
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
