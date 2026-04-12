# Project Structure Guide

## Top Level

- `apps/web`: Next.js frontend for customers and administrators
- `apps/api`: Express backend with domain modules
- `database`: schema, migrations, and seed data
- `docs`: project documentation
- `shared`: shared constants and types
- `scripts`: project automation

## Frontend

`apps/web/src/app` should hold routes, layouts, and page-level files.

`apps/web/src/components` should hold reusable interface pieces.

`apps/web/src/features` should group feature logic by business module such as:

- auth
- products
- cart
- checkout
- orders
- admin

## Backend

`apps/api/src/modules` should group backend code by domain.

Each module can contain:

- `controllers`: request handlers
- `routes`: Express routes
- `services`: business logic
- `validators`: schema validation

## Database

Start with these assets in `database`:

- user schema
- category schema
- product schema
- order schema
- order item schema

## Recommended First Features

- project setup
- authentication
- products API
- products UI
- cart logic
- checkout flow
