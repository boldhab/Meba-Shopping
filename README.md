# Meba Supermarket System

Meba Supermarket is a full-stack e-commerce platform for online grocery ordering and supermarket operations.

## Project Structure

```text
client/       Next.js frontend
server/       Node.js + Express backend
database/     PostgreSQL schema, migrations, and seeders
docs/         Architecture, API, and workflow documentation
shared/       Shared types and constants
scripts/      Project automation scripts
```

## Main Modules

- Authentication
- Products
- Categories
- Cart
- Checkout
- Orders
- Inventory
- Admin dashboard
- Analytics

## Notes

- `client` is the customer and admin frontend.
- `server` exposes REST APIs and business logic.
- `database` contains PostgreSQL-related assets.
- `shared` is reserved for code shared between frontend and backend.

## Auto Git Sync

- Start auto-sync: `npm run git:auto-sync`
- Health check: `npm run git:auto-sync:health`
