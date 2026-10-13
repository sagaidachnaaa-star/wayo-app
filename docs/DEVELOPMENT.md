# WAYO Development Workflow

This document records how WAYO is developed after the MSc prototype: which
branch is stable, where new work happens, how branches are named, how changes
are tested and how they are merged.

**Summary**

| Branch / tag | Role |
|---|---|
| `msc-final` (tag) | Permanent snapshot of the completed MSc version. Never moved. |
| `main` | Stable, production-ready code only. |
| `develop` | Integration branch for post-MSc V1 work. |
| `KAN-XX-short-description` | Short-lived task branch, created from `develop`. |

```
KAN-XX-task ──► develop ──► (tested, stable release) ──► main ──► production
     ▲             │
     └── created ──┘
```

Unfinished work is never merged directly into `main`.

For V1 feature boundaries and launch scope, see [V1_SCOPE.md](V1_SCOPE.md).

---

## 1. Branch roles

### `main` (stable / production)

- Represents the stable, production-ready version of WAYO.
- Is the branch production is deployed from (see [Deployment](#6-deployment)).
- Only receives changes from `develop` (or an urgent fix, see
  [Urgent production fixes](#urgent-production-fixes)) after they have been tested.
- Nobody develops directly on `main`.

### `develop` (V1 integration)

- Created from `main` at the `msc-final` commit.
- Collects finished, locally tested task branches for V1.
- Is where integrated changes are tested together before a release to `main`.
- Should always be in a working state: if something merged into `develop`
  breaks it, fix it on a new task branch straight away.

### Task / feature branches

- Short-lived branches for one Jira ticket or one piece of work.
- Always created from the latest `develop`.
- Merged back into `develop` when the work is complete and tested.
- Deleted after merging.

### `msc-final` (tag, MSc archive)

`msc-final` is an annotated tag that preserves the final MSc prototype exactly
as it was before V1 development began (commit `ad0a118`, message "Final
preserved MSc WAYO prototype before V1 development").

It must **never be moved, deleted or overwritten**. To look at the MSc version
without changing anything:

```bash
git switch --detach msc-final   # read-only look at the MSc version
git switch develop              # go back
```

## 2. Branch naming convention

Task branches use the Jira ticket key followed by a short, lowercase,
hyphen-separated description:

```
KAN-<number>-<short-description>
```

Examples:

- `KAN-19-branch-strategy`
- `KAN-20-authentication`
- `KAN-21-real-gps`
- `KAN-22-accessibility-filters`

Rules:

- Keep the Jira key in capitals (`KAN-21`, not `kan-21`) so Jira can link the
  branch, commits and pull requests to the ticket.
- Keep the description to two to four words.
- One ticket per branch. Unrelated changes go on a separate branch.
- For small work without a Jira ticket, use a type prefix instead:
  `fix/<short-description>` or `chore/<short-description>`.
  Create a ticket where reasonable.

Commit messages should mention the ticket key too, for example
`KAN-21 Add GPS permission prompt to QuestActive`.

## 3. Typical development workflow

### Start a task

```bash
git checkout develop
git pull origin develop
git checkout -b KAN-XX-short-description
```

Check `git status` first. If there are uncommitted changes, commit them on the
branch they belong to, or stash them (`git stash push -m "<description>"`).
Never discard changes you have not looked at.

### Work on the task

- Make small, descriptive commits.
- Push the branch regularly so it is backed up on GitHub:
  ```bash
  git push -u origin KAN-XX-short-description
  ```
- Review every change with `git diff` before committing, including
  AI-assisted changes.

### Finish the task: merge into `develop`

1. Test the branch locally (see [Testing approach](#4-testing-approach)).
2. Bring in the latest `develop` and re-test if anything changed:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout KAN-XX-short-description
   git merge develop
   ```
3. Merge into `develop`, either through a **Pull Request on GitHub**
   (base: `develop`, compare: `KAN-XX-short-description`), which gives a clear
   review page, or locally:
   ```bash
   git checkout develop
   git merge --no-ff KAN-XX-short-description
   git push origin develop
   ```
4. Delete the task branch:
   ```bash
   git branch -d KAN-XX-short-description
   git push origin --delete KAN-XX-short-description
   ```

### Release: merge `develop` into `main`

When a set of V1 changes on `develop` is complete, tested together and stable:

```bash
git checkout develop
git pull origin develop
# run the release checks in section 4
git checkout main
git pull origin main
git merge --no-ff develop -m "Release: <short summary of what is included>"
git push origin main
```

Alternatively, open a Pull Request from `develop` into `main` and merge it on
GitHub.

Optionally, tag the release so it can be found again later:

```bash
git tag -a v1.0.0 -m "WAYO V1.0.0"
git push origin v1.0.0
```

After the push, verify production (section 6).

### Urgent production fixes

If production is broken and the fix cannot wait for the next release:

```bash
git checkout main
git pull origin main
git checkout -b fix/<short-description>      # or KAN-XX-<description>
# fix, test locally, commit
git checkout main
git merge --no-ff fix/<short-description>
git push origin main
git checkout develop
git merge main                                # keep develop up to date
git push origin develop
```

Then delete the fix branch.

## 4. Testing approach

WAYO currently has **no automated test suite and no CI** (no
`.github/workflows`). Testing is manual, plus the existing build and lint scripts.

| Stage | What to test |
|---|---|
| Task branch, before merging into `develop` | The changed functionality, tested locally |
| `develop`, after each merge | The integrated changes, tested again together |
| Before merging `develop` into `main` | A full check of the main user journey |
| `main`, after deployment | A production smoke test |

### Task branch (before merging into `develop`)

- Run the backend and frontend locally together (see the README:
  backend on port 5050, frontend via Vite).
- Test the changed functionality in a mobile viewport (e.g. 375 × 812).
- Run the checks:
  ```bash
  cd frontend && npm run lint && npm run build
  cd ../backend && npm run lint
  ```
- If the task adds a database migration, apply it to the local database
  and test it there first.

### `develop` (integration)

- After merging, pull `develop`, run the app locally and re-test the merged
  feature together with features merged earlier.
- Before a release, walk through the core journey: Explore → Quest Detail →
  start quest → completion → Passport → Profile, plus anything changed.

### Only stable, reviewed and tested changes reach `main`

- Every change on `main` has been reviewed (`git diff` or a Pull Request) and
  tested on both its task branch and `develop`.
- If `develop` has unfinished work that should not be released yet, wait,
  or finish or revert that work on `develop` first. Never release partly
  finished features.

### Environments

At the moment only a **production** deployment exists on Railway, deployed
from `main`. Testing before production therefore happens locally.

If a staging environment is added later, deploy it from `develop`. That way
integrated changes can be tested online before they reach `main` and production.

## 5. Production safety rules

- Never commit directly to `main`, except for merges from `develop`
  or urgent fixes as described above.
- Never force-push `main` or `develop`, and never rewrite their history
  (no rebase, reset or amend of commits already pushed).
- Never move, delete or overwrite the `msc-final` tag.
- Never commit `.env` files, API keys, database credentials or tokens.
- Inspect unexpected Git changes before committing them.
- Create a backup branch or tag before any destructive Git operation.

## 6. Deployment

WAYO is deployed on Railway. Railway's deploy settings live in the Railway
dashboard, not in this repository.

### Confirmed from the repository

- No Railway config files (`railway.json`, `railway.toml`, `nixpacks.toml`,
  `Procfile`, `Dockerfile`) and no CI workflows.
- Monorepo with two deployable apps:
  - **frontend/**: React + Vite. Build with `npm run build`, run with
    `npm start` (`serve --single --listen $PORT dist`).
  - **backend/**: Express. Run with `npm start` (`node server.js`).
- Live frontend: `https://wayo-frontend-production.up.railway.app`.
- The database is Railway MySQL. The backend reads `DB_HOST`, `DB_PORT`,
  `DB_USER`, `DB_PASSWORD` and `DB_NAME`.
- The frontend reads `VITE_*` variables at **build time**, so changing them
  in Railway requires a redeploy.
- Migrations in `backend/db/migrations/` are applied manually, not on deploy.
  `schema.sql` and `seed.sql` are for new local databases only.

### To verify in the Railway dashboard

For the frontend and backend services, open **Settings** and check:

1. **Branch**: production should deploy from `main` only. `develop` and
   task branches must not deploy to production.
2. **Root Directory**: `frontend` / `backend`.
3. **Automatic deploys**: if enabled, every merge to `main` goes live,
   which is why only tested work is merged into `main`.

| Setting | Frontend | Backend |
|---|---|---|
| Deploy branch | _to check_ | _to check_ |
| Root directory | _to check_ | _to check_ |
| Auto-deploy on push | _to check_ | _to check_ |

### After a release to `main`

Open the live app on a phone or mobile viewport, check the released features,
and check the backend health endpoint `/api/test-db`.

## Why this workflow

WAYO is a small, early-stage project, so this is a deliberately light version
of a `main` + `develop` workflow. It does not use release branches or a
permanent hotfix branch. `develop` keeps unfinished V1 work away from the
stable version on `main`, and short-lived ticket branches keep each change
isolated and easy to review.
