# Mock-Prep Backend Service

Backend service built with **Node.js**, **TypeScript**, **Express.js**, and **Drizzle ORM** for **PostgreSQL**.

## 🛠️ Stack Overview
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL + Drizzle ORM (`drizzle-kit`)
- **Dev Runner**: `tsx` (Hot reloading & ESM execution)

## 📁 Directory Structure
```
backend/
├── src/
│   ├── app.ts                 # Express application setup
│   ├── server.ts              # Server entry point
│   ├── db/
│   │   ├── index.ts           # Postgres + Drizzle instance
│   │   └── schema.ts          # Database tables schema definition
│   ├── middlewares/
│   │   └── errorHandler.ts    # Centralized error handler
│   └── routes/
│       └── index.ts           # Main router & health check
├── drizzle.config.ts          # Drizzle kit config file
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies & scripts
└── .env                       # Environment configuration
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Ensure `.env` exists with your local setup:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mock_prep_db
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Drizzle Database Commands
- **Generate Migrations**: `npm run db:generate`
- **Push Schema directly to DB**: `npm run db:push`
- **Open Drizzle Studio (DB UI)**: `npm run db:studio`
