# Tiny Links – A minimal URL shortener with stats

Tiny Links is a small, production-ready URL shortener similar to bit.ly. Users can create short links with custom slugs, track clicks, and view a simple dashboard and per-link stats.

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- DB: Postgres (Neon recommended)
- ORM: Prisma
- Deploy: Vercel (recommended) or Render/Railway

---

## Features
- Create short links with optional custom slugs
- Automatic unique slug generation (nanoid)
- Redirect handler that logs clicks (IP, User-Agent, Referer)
- Simple dashboard listing all links with click counts
- Per-link stats page showing recent clicks
- REST API endpoints to create, list, delete links and fetch stats
- Resilient logging: redirect is never blocked by logging errors

---

## Project structure
```
.
├─ app/
│  ├─ page.tsx                 # Create short URLs
│  ├─ layout.tsx               # App shell
│  ├─ globals.css              # Tailwind styles
│  ├─ [slug]/route.ts          # Redirect + click logging
│  ├─ dashboard/page.tsx       # Dashboard with counts
│  └─ stats/[slug]/page.tsx    # Per-link recent clicks
├─ app/api/
│  ├─ links/route.ts           # POST (create), GET (list)
│  ├─ links/[id]/route.ts      # DELETE link
│  └─ stats/[slug]/route.ts    # GET per-link stats JSON
├─ prisma/
│  └─ schema.prisma            # Prisma models
├─ src/server/
│  ├─ db.ts                    # Prisma client
│  └─ request.ts               # Request helpers (ip/ua/referer)
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ tsconfig.json
├─ next.config.js
├─ .env.example
└─ README.md
```

---

## Data model (Prisma)
```
model Link {
  id        String   @id @default(cuid())
  slug      String   @unique
  url       String
  createdAt DateTime @default(now())
  clicks    Click[]
}

model Click {
  id        String   @id @default(cuid())
  link      Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
  linkId    String
  createdAt DateTime @default(now())
  ip        String?
  userAgent String?
  referer   String?
}
```

---

## API
Base URL: your deployment origin (or http://localhost:3000 in dev)

- POST /api/links
  - Body: `{ "url": string, "slug"?: string }`
  - Response: `{ id: string, slug: string, shortUrl: string }`

- GET /api/links
  - Response: `Array<{ id, slug, url, createdAt, _count: { clicks } }>`

- DELETE /api/links/:id
  - Response: `{ ok: true }`

- GET /api/stats/:slug
  - Response: `{ slug, url, createdAt, total, recent: Click[] }`

Notes
- Slugs must match `^[a-zA-Z0-9-_]+$` and be <= 64 chars. If omitted, a 7-char slug is generated.
- Click logging happens in `GET /[slug]` route and is wrapped in a try/catch to avoid blocking redirects.

---

## Local development
1) Copy env and fill vars
- `cp .env.example .env`
- Set `DATABASE_URL` to a local Postgres or a Neon dev database
- Set `NEXT_PUBLIC_BASE_URL` to `http://localhost:3000`

2) Install dependencies
- `npm i`

3) Prisma client + initialize schema
- Generate client: `npm run prisma:generate`
- First time schema init: `npm run prisma:push` (creates tables)
  - Alternatively, if you prefer migrations, see Prisma workflows below

4) Start dev server
- `npm run dev`
- Open http://localhost:3000

---

## Database (Neon) setup
1) Create a Neon account and a new Postgres project
2) Create a database (optional, the default is fine)
3) Copy the connection string (Serverless / pooled connection recommended)
4) Use `sslmode=require`
5) Put the connection string in `.env` as `DATABASE_URL`

Neon connection string example:
```
postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require
```

---

## Prisma workflows
You have two common workflows:

- Quick start (no migrations yet):
  - `npm run prisma:push` – applies the current `schema.prisma` to your DB (creates/updates tables)

- Migration-driven (recommended for teams):
  - Create migration locally: `npx prisma migrate dev --name init`
  - Deploy migrations (CI/deploy): `npm run prisma:migrate`

Other useful commands:
- Generate client after schema change: `npm run prisma:generate`
- Inspect DB: `npx prisma studio`

---

## Deployment
You can deploy to Vercel, Render, or Railway. Vercel is the simplest for Next.js.

### Vercel (recommended)
1) Push this repository to GitHub/GitLab/Bitbucket
2) Import project in Vercel
3) Project Settings → Environment Variables
   - `DATABASE_URL` = your Neon connection string
   - `NEXT_PUBLIC_BASE_URL` = your Vercel domain, e.g. `https://your-app.vercel.app`
4) Build/Install commands (defaults are fine):
   - Install: `npm i`
   - Build: `npm run build`
5) Initialize schema (first deployment):
   - Option A: Run `npm run prisma:push` locally against your Neon DB before first deploy
   - Option B: After Vercel deploy, run a one-off `prisma migrate deploy`/`prisma db push` job (via Vercel CLI or a temporary API route)
6) Open your app and create your first short link

### Render
1) Create a Web Service (Node) and point it to your repo
2) Set environment variables:
   - `NODE_VERSION` (optional), `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`
3) Build command: `npm run build`
4) Start command: `npm start`
5) Initialize schema using `prisma db push` locally or via a one-off job

### Railway
1) Create a new Railway project
2) Add a Postgres plugin (or use Neon) and copy the connection string
3) Set environment variables `DATABASE_URL` and `NEXT_PUBLIC_BASE_URL`
4) Build: `npm run build`
5) Start: `npm start`
6) Initialize schema using `prisma db push`

---

## Environment variables
- `DATABASE_URL` (required): Postgres connection string (Neon recommended)
- `NEXT_PUBLIC_BASE_URL` (required for correct link display): Your site origin, e.g. `https://your-app.vercel.app`

---

## Architecture notes
- Next.js App Router with file-based routes
- Server components for dashboard/stats pages; server actions for deletes
- API routes for CRUD and stats
- Prisma Client instantiated once per environment using a global var to avoid hot-reload duplication in dev
- Click logging uses `x-forwarded-for`, `user-agent`, and `referer` headers. In serverless, IPs often come from proxies/CDNs.

---

## Security and hardening (recommended)
- Authentication: gate create/manage routes behind auth (NextAuth) and add user ownership to links
- Rate limiting: add per-IP rate limiting on `POST /api/links`
- Validation: keep strict schema checks for `url` and `slug`
- Abuse prevention: restrict certain slugs ("admin", reserved paths, etc.)
- Observability: log errors and add monitoring/alerts
- PII: IPs and UAs may be treated as personal data in some jurisdictions; add retention/obfuscation controls for production use

---

## Troubleshooting
- Prisma client error in serverless: ensure you’re using pooled connections (Neon serverless works well)
- Timeouts on logging: we swallow logging errors so redirects continue; check logs for `Failed to record click`
- `DATABASE_URL` wrong/SSL: include `sslmode=require` for Neon
- No tables after deploy: run `npm run prisma:push` once against the production DB

---

## Scripts
- `npm run dev` – Start Next dev server
- `npm run build` – Build
- `npm start` – Start production server
- `npm run prisma:generate` – Generate Prisma client
- `npm run prisma:push` – Apply schema without migrations (quick start)
- `npm run prisma:migrate` – Deploy migrations (if using migrations)

---

## Roadmap ideas
- Auth and per-user link management
- Rate limiting & API keys
- Custom domains and domain verification
- Click analytics charts and geography
- CSV export and QR code generation
- Soft delete/restore links

---

## License
MIT
