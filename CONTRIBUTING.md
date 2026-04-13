# Contributing to Meba Supermarket

This project uses a simple, professional Git workflow to keep development organized as the system grows.

The stack for this project is:

- Next.js
- Node.js
- Express
- PostgreSQL

## Branch Strategy

Do not work directly on `main`.

Use these branches instead:

- `main`: production-ready code only
- `develop`: integration and testing branch
- `feature/*`: new features and planned improvements
- `hotfix/*`: urgent production fixes

`release/*` can be added later if deployments become more formal.

## Branch Rules

### `main`

- Must always stay stable
- Should contain only tested, deployable code
- Receives changes from `develop` after validation

### `develop`

- Main working integration branch
- Completed features merge here first
- Used for system testing before release

### `feature/*`

Create one branch per feature.

Examples:

- `feature/products-api`
- `feature/products-ui`
- `feature/cart-logic`
- `feature/cart-ui`
- `feature/order-api`
- `feature/checkout-system`
- `feature/auth-jwt`
- `feature/login-ui`
- `feature/admin-dashboard`

Rules:

- Branch from `develop`
- Keep the scope focused
- Do not mix unrelated work in one branch

### `hotfix/*`

Use these only for urgent production issues.

Examples:

- `hotfix/cart-calculation-bug`
- `hotfix/order-double-submit`

## Recommended Workflow

### 1. Update `develop`

```bash
git checkout develop
git pull origin develop
```

### 2. Create a feature branch

```bash
git checkout -b feature/products-api
```

### 3. Work locally

- Build the feature
- Test locally
- Commit in small, clear steps

Example commit messages:

- `feat: add product create endpoint`
- `fix: correct cart subtotal calculation`
- `refactor: separate order service logic`

### 4. Push the branch

```bash
git push -u origin feature/products-api
```

### 5. Open a pull request to `develop`

Even when working solo, use pull requests to:

- review your own changes
- keep history clean
- reduce accidental mistakes

### 6. Merge into `develop`

Only merge after:

- local testing passes
- the feature works as expected
- the branch contains only related changes

### 7. Promote to `main`

When `develop` is stable and tested:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

## Hotfix Workflow

For urgent production bugs:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/order-double-submit
```

After the fix is tested:

1. Merge the hotfix into `main`
2. Merge the same hotfix into `develop`

This prevents `develop` from falling behind production.

## Best Practices

- Never code directly on `main`
- Start normal feature branches from `develop`
- Keep branches small and focused
- Merge only tested code
- Prefer pull requests for every merge
- Use descriptive branch names
- Write clear commit messages

## Optional Local Auto Sync

If you want fully automatic local staging, commit, and push whenever changes appear, you can run:

```bash
npm run git:auto-sync
```

It is also configured to auto-start on project open in VS Code through `.vscode/tasks.json`.
The startup task runs automatically on project open, and the default script is branch-filtered so it only runs on `feature/*`, `hotfix/*`, and `bugfix/*` branches.

Notes:

- This runs continuously until you stop it with `Ctrl+C`
- Default commit message format is descriptive, generated from staged actions and touched areas (example: `auto: add 2, update 3 in client, server`)
- It pushes to `origin` on your current branch
- By default, it only runs on `feature/*`, `hotfix/*`, and `bugfix/*` branches
- It waits for a quiet period before committing (debounce)
- It skips files matching generated-artifact patterns unless you override the ignore regex
- Startup logs show active branch, branch pattern, debounce settings, and ignore regex
- You can tune behavior with environment variables: `AUTO_GIT_SYNC_INTERVAL` (seconds, default `3`), `AUTO_GIT_SYNC_QUIET_PERIOD` (seconds, default `3`), `AUTO_GIT_SYNC_MESSAGE_PREFIX` (default `auto:`), `AUTO_GIT_SYNC_BRANCH_REGEX` (only run on matching branch names), and `AUTO_GIT_SYNC_IGNORE_REGEX` (skip matching files from commit)

Example:

```bash
AUTO_GIT_SYNC_INTERVAL=5 AUTO_GIT_SYNC_MESSAGE_PREFIX="chore: autosave" npm run git:auto-sync
```

Feature branches only:

```bash
AUTO_GIT_SYNC_BRANCH_REGEX='^feature/' npm run git:auto-sync
```

Require an explicit activation flag:

```bash
AUTO_GIT_SYNC_REQUIRE_FLAG=1 AUTO_GIT_SYNC_ENABLE=1 npm run git:auto-sync
```

Use this mode carefully, since it can create many small commits quickly.

## Example Branch Map

```text
main
└── develop
    ├── feature/products-api
    ├── feature/products-ui
    ├── feature/cart-logic
    ├── feature/order-api
    ├── feature/auth-jwt
    └── feature/admin-dashboard
```

## Team Guideline

One feature should live in one branch.

Good:

- cart UI changes in `feature/cart-ui`
- auth backend changes in `feature/auth-jwt`

Avoid:

- mixing cart, orders, and auth in one branch

## Future Expansion

As the project grows, we can add:

- `release/*` branches
- branch protection rules on GitHub
- required pull request reviews
- CI checks before merge
- deployment rules for `main`

For now, this workflow is the default standard for Meba Supermarket.
