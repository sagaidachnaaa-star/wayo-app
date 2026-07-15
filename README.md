# WAYO

A mobile-first walking-quest app. React + Vite frontend, Node/Express + MySQL backend.

```
wayo-app/
  frontend/   React + Vite + Tailwind app
  backend/    Express API + MySQL connection
```

## 1. Start MySQL

Make sure MySQL is running locally (e.g. via MySQL Workbench or `mysqld`), and that the
`wayo_db` database exists. If you need to (re)create it from scratch:

```bash
mysql -u root -p < backend/db/schema.sql
mysql -u root -p < backend/db/seed.sql
```

## 2. Run the backend

```bash
cd backend
npm install
npm run dev
```

This starts the API on `http://localhost:5050` (change `PORT` in `.env` if that port is
taken — on Mac, AirPlay Receiver commonly uses 5000, which is why this project defaults
to 5050 instead).

## 3. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the app on `http://localhost:5173`.

## 4. Test the API endpoints

With the backend running, open these directly in your browser (or `curl` them):

- `http://localhost:5050/api/health` → `{"status":"OK","message":"WAYO backend is running"}`
- `http://localhost:5050/api/test-db` → `{"status":"OK","database":"connected"}`
- `http://localhost:5050/api/quests` → a JSON array of quests from MySQL
- `http://localhost:5050/api/quests/greenwich-stroll` → one quest with its stops, accessibility notes, and badge

If `/api/test-db` shows an error instead of `"connected"`, double-check `DB_PASSWORD` (and
`DB_HOST`/`DB_PORT`) in `backend/.env`.

## 5. Open the frontend in your browser

Go to `http://localhost:5173/explore` — the quest list there is fetched live from the
backend (`GET /api/quests`), so both servers need to be running at the same time for it
to show real data.

## Linting

Each side has its own independent ESLint setup:

```bash
cd frontend && npm run lint
cd backend && npm run lint
```
