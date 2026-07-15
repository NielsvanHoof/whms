# WHMS API

Laravel REST API for the Warehouse Management System (WHMS). Multi-tenant warehouse operations: warehouses, locations, products, inventory balances, and movements. Includes a WHMS MCP server for AI agents in Cursor.

## Prerequisites

- PHP 8.4+
- Composer
- SQLite (default) or MySQL

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API base URL: [http://localhost:8000](http://localhost:8000)  
OpenAPI docs: [http://localhost:8000/docs/api](http://localhost:8000/docs/api)

### Environment

Key variables in `.env`:

| Variable | Purpose |
|----------|---------|
| `APP_URL` | API public URL |
| `FRONTEND_URL` | Web app URL for password-reset emails (default `http://localhost:3000`) |
| `DB_*` | Database connection |

## Seeded data

`php artisan migrate --seed` creates:

| Tenant | User | Password | Role |
|--------|------|----------|------|
| Demo Tenant (`demo`) | `test@example.com` | `password` | owner |
| Second Demo Tenant (`demo-second`) | `test-second@example.com` | `password` | viewer |

Each tenant also gets sample warehouses.

## Permissions

Permissions use Spatie Laravel Permission (`web` guard):

| Permission | Description |
|------------|-------------|
| `warehouses.view` / `warehouses.manage` | Read / CRUD warehouses |
| `locations.view` / `locations.manage` | Read / CRUD locations |
| `products.view` / `products.manage` | Read / CRUD products |
| `inventory.view` / `inventory.manage` | Read balances & movements / record movements |
| `roles.view` / `roles.manage` | Inspect RBAC / create users & assign roles |
| `tenant.manage` | Update workspace name and slug |

### Roles

| Role | Typical use |
|------|-------------|
| `owner` | Full tenant access |
| `manager` | Full tenant access |
| `operator` | Day-to-day inventory and master data |
| `viewer` | Read-only |

## API overview (`/api/v1`)

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/login`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Account | `GET /me`, `PATCH /account/profile`, `PUT /account/password`, sessions |
| Workspace | `PATCH /tenant` |
| Master data | `apiResource` warehouses, products, locations |
| Inventory | balances (index/show + export), movements (index/show/store + export) |
| Admin | `GET /access/roles`, `permissions`, `users`; `POST /access/users`; `PUT /access/users/{id}/roles` |
| Health | `GET /health` |

All authenticated routes require a Sanctum bearer token and resolve the tenant from the authenticated user.

## MCP server

WHMS exposes an MCP server for warehouse operations (read/write tools, resources, prompts).

### Cursor

From the [`web`](../web) project, `.cursor/mcp.json` runs:

```bash
php artisan mcp:start whms
```

with working directory `api/`.

### HTTP

`POST /mcp/whms` (Sanctum + tenant middleware, 60 req/min).

## Tests

```bash
composer test
# or
php artisan test
```

Includes feature tests for inventory, RBAC, tenant settings, password reset, MCP tools, and CSV export.

## Regenerating web types

With the API running:

```bash
cd ../web && npm run generate:api
```
