# WHMS Web

Next.js frontend for the Warehouse Management System (WHMS). It talks to the Laravel API in [`../api`](../api) for authentication, master data, inventory, and administration.

## Prerequisites

- Node.js 20+
- WHMS API running locally (default `http://localhost:8000`)
- Seeded demo user (see API README)

## Environment

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_SESSION_COOKIE_NAME=laravel-session
```

The browser must use `localhost` (not `127.0.0.1`) so CORS matches the API allowlist. The session cookie name must match the API `SESSION_COOKIE` value (default `laravel-session` when `APP_NAME=Laravel`).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

After seeding the API database:

| Email | Password | Role |
|-------|----------|------|
| `test@example.com` | `password` | owner |
| `test-second@example.com` | `password` | viewer |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | Biome lint + format check |
| `npm run generate:api` | Regenerate OpenAPI types from running API |
| `npm run test:e2e` | Playwright smoke tests (requires API + seeded DB) |

## E2E tests

With the API and web dev servers running:

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e
```

Optional overrides:

- `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` — login credentials (default: seeded owner)
- `PLAYWRIGHT_BASE_URL` — web app URL (default: `http://localhost:3000`)

## Permissions

Navigation and actions are gated by permissions from `GET /api/v1/me`:

| Permission | Access |
|------------|--------|
| `warehouses.view` / `warehouses.manage` | Warehouses list / CRUD |
| `locations.view` / `locations.manage` | Locations list / CRUD |
| `products.view` / `products.manage` | Products list / CRUD |
| `inventory.view` / `inventory.manage` | Balances, movements, CSV export / record movements |
| `roles.view` / `roles.manage` | Admin roles catalog / user create & role assignment |
| `tenant.manage` | Edit workspace name and slug |

Roles (`owner`, `manager`, `operator`, `viewer`) are seeded on the API. Owners and managers have full access including `tenant.manage`.

## MCP (Cursor)

The WHMS MCP server runs from the API project. Cursor config is in [`.cursor/mcp.json`](.cursor/mcp.json) with `cwd` set to `../api`.

## Project layout

```
app/           Next.js App Router (dashboard, CRUD, settings, admin)
components/    UI and domain components
lib/api/       Typed HTTP clients
lib/queries/   TanStack Query options
e2e/           Playwright smoke tests
```
