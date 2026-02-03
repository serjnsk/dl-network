# DL-Network: Project Dashboard

Масштабируемый дашборд для управления 100+ статическими сайтами с публикацией через Cloudflare Pages.

## Tech Stack

- **Dashboard**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Static Sites**: Astro
- **Deploy**: Cloudflare Pages (Direct Upload)
- **UI**: Tailwind CSS + shadcn/ui

## Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase CLI
- Wrangler CLI

## Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Fill in your credentials

# Start development
pnpm dev
```

## Project Structure

```
dl-network/
├── apps/
│   ├── dashboard/         # Next.js admin panel
│   └── site-generator/    # Astro site builder
├── packages/
│   ├── shared/            # Shared types & utils
│   └── supabase/          # DB client & types
└── supabase/
    └── migrations/        # Database migrations
```

## Documentation

- [Implementation Plan](./docs/implementation_plan.md)
- [Architecture](./docs/architecture.md)
