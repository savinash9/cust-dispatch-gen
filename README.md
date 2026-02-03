# Customer Dispatch Generator

A production-ready Next.js app that creates weekly Solutions Engineering customer dispatch reports from Aircover meeting data.

## Features
- Date range + timezone dispatch generation
- Aircover API integration (server-side only)
- Executive summary and focus customer narratives with inline editing
- Dashboard analytics (meetings + minutes by account)
- Export to PDF and Markdown
- Shareable read-only report links
- Local persistence with SQLite + Prisma

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file (do **not** commit it) and add credentials:

```bash
cp .env.example .env.local
```

Fill in:

```
AIRCOVER_BASE_URL=...
AIRCOVER_USERNAME=...
AIRCOVER_PASSWORD=...
DATABASE_URL="file:./dev.db"
```

3. Run database migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the app:

```bash
npm run dev
```

## Tests

```bash
npm run test
```

## Routes
- `/` Generate a new report
- `/report/[id]` Review/edit a report
- `/accounts` Manage account profiles

## Notes
- Aircover credentials are **only** used server-side.
- Optional AI polish uses `OPENAI_API_KEY` if set.
