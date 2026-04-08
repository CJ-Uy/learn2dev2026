# Project Setup Guide

Full setup walkthrough from a blank GitHub repo to a running Next.js + Cloudflare Workers app with Drizzle ORM and D1.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- A [Cloudflare account](https://dash.cloudflare.com/)
- Wrangler authenticated: `npx wrangler login`

---

## 1. Create & Clone the GitHub Repository

1. Go to [github.com/new](https://github.com/new) and create a new **empty** repository (no README, no .gitignore).
2. Clone it locally:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```

---

## 2. Scaffold the Project

Run the Cloudflare + Next.js scaffolder inside the cloned directory:

```bash
npm create cloudflare@latest -- . --framework=next
```

When prompted:
- Select **Next.js** as the framework
- Choose **Yes** for TypeScript
- Choose **Yes** for Tailwind CSS
- Deploy? — **No** (we'll do that manually later)

This creates the full project structure with `wrangler.jsonc`, `open-next.config.ts`, and `next.config.ts` already wired up for Cloudflare Workers.

---

## 3. Install Drizzle

```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

- `drizzle-orm` goes in **`dependencies`** — it runs in the Worker at request time
- `drizzle-kit` goes in **`devDependencies`** — it only runs locally for migrations

---

## 4. Add D1 and R2 Bindings to wrangler.jsonc

Add these sections to your `wrangler.jsonc`:

```jsonc
{
  // ... existing config ...
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "learn2dev-2026",
      "database_id": "566309d4-c7be-4264-973b-79bd9bb13d3e"
    }
  ],
  "r2_buckets": [
    {
      "binding": "OBJECT_STORAGE",
      "bucket_name": "learn2dev-2026"
    }
  ]
}
```

The `binding` value (e.g., `"DB"`) is how you access the resource inside Worker code via `env.DB`.

**`nodejs_compat` is required** in `compatibility_flags` (the scaffold adds this). Without it, `drizzle-orm` crashes in the Worker because it uses `node:crypto` internally.

---

## 5. Create the DB Client

Create `src/lib/db.ts`. This uses a lazy `Proxy` so the DB client is never initialized at module scope — only on the first query at request time.

### Why a Proxy?

Cloudflare Workers bindings (like `env.DB`) only exist per-request. If you call `drizzle(env.DB)` at module scope, the binding doesn't exist yet and the Worker crashes. The Proxy defers initialization to when a property is first accessed.

### Two environments, two drivers

| Context | Driver |
|---|---|
| `npm run dev` (Node.js) | D1 HTTP REST API — hits remote D1 via `CLOUDFLARE_D1_TOKEN` |
| Production Worker | Native D1 binding via `getCloudflareContext()` |

See `src/lib/db.ts` for the full implementation.

---

## 6. Create the Drizzle Config

Create `drizzle.config.ts` in the project root:

```ts
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit is a standalone CLI — it doesn't use Next.js's env loading.
// Explicitly load .env.local so CLOUDFLARE_* vars are available.
config({ path: ".env.local" });

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
```

The `d1-http` driver makes `drizzle-kit` use the same Cloudflare REST API as dev mode, so migrations run against the real remote D1 database.

---

## 7. Add DB Scripts to package.json

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

| Script | Purpose |
|---|---|
| `db:generate` | Generate SQL migration files from schema changes |
| `db:push` | Push schema changes directly to D1 (no migration file) |
| `db:studio` | Open Drizzle Studio to browse/edit data |

---

## 8. Set Up Local Environment Variables

Create `.env.local` in the project root (this file is gitignored by `.env*`):

```bash
# Get your Account ID from: https://dash.cloudflare.com/ → right sidebar
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# D1 database ID (from wrangler.jsonc or Cloudflare dashboard)
CLOUDFLARE_D1_DATABASE_ID=566309d4-c7be-4264-973b-79bd9bb13d3e

# API token with D1:Edit permission
# Create at: https://dash.cloudflare.com/profile/api-tokens
CLOUDFLARE_D1_TOKEN=your_api_token_here
```

### Creating the D1 API Token

1. Go to [Cloudflare Dashboard → Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Create custom token**
4. Add permission: **Account → D1 → Edit**
5. Set account scope to your account
6. Create and copy the token into `.env.local`

This is what powers `npm run dev` — your local Next.js server calls the D1 REST API directly, so you're always working with the real remote database. No local SQLite file, no sync issues.

---

## 9. Verify next.config.ts

The scaffold should have added this already, but confirm `next.config.ts` includes:

```ts
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
```

This enables `getCloudflareContext()` to work during `next dev` (it's a no-op in production Workers).

---

## 10. Run Migrations

After defining your schema in `src/lib/schema.ts`, push it to D1:

```bash
# Option A: push directly (good for development)
npm run db:push

# Option B: generate migration files first, then apply
npm run db:generate
wrangler d1 migrations apply learn2dev-2026
```

For local wrangler dev:
```bash
wrangler d1 migrations apply learn2dev-2026 --local
```

---

## 11. Start Development

```bash
npm run dev
```

The app runs on `http://localhost:3000`. All database queries go through the D1 HTTP API to the remote database — identical to production data.

---

## 12. Deploy

```bash
npm run deploy
```

This builds with `opennextjs-cloudflare` and deploys to your Cloudflare Worker. In production, the Worker uses the native D1 binding (no env vars needed).

---

## File Structure Reference

```
├── src/
│   └── lib/
│       ├── db.ts          # Lazy Proxy DB client
│       └── schema.ts      # Drizzle table definitions
├── drizzle/               # Generated migration files (after db:generate)
├── drizzle.config.ts      # Drizzle Kit config
├── wrangler.jsonc         # Worker config with D1 + R2 bindings
├── .env.local             # Local dev credentials (gitignored)
└── docs/
    └── setup-guide.md     # This file
```

---

## What to Avoid

| Don't | Why |
|---|---|
| Commit `.env.local` | Contains your API token — already gitignored |
| `drizzle-orm` in `devDependencies` | Bundler may not include it in the Worker |
| `export const runtime = 'edge'` in routes | Conflicts with opennextjs Workers target |
| `drizzle(env.DB)` at module scope | Workers context only exists per-request |
| Remove `nodejs_compat` flag | `drizzle-orm` needs `node:crypto` internally |
