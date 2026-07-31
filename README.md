# WAYO

WAYO is a mobile-first urban exploration application that encourages users to discover places through walking quests, accessibility information and gamified progress.

The project was developed as part of an MSc Web Development project at the University of Roehampton. It is a full-stack application with a React frontend, a Node.js and Express.js backend, and a MySQL database.

## Live Application

**Deployed application:**  
https://wayo-frontend-production.up.railway.app/explore

WAYO is designed primarily for mobile devices. For the intended layout, open it on a mobile phone or use a mobile viewport such as `375 × 812` pixels in browser developer tools.

No registration or login is required because the current MVP uses a single demonstration user.

## Main Features

- Browse available urban exploration quests
- View quest difficulty, duration and distance
- Read quest descriptions and route-stop information
- View accessibility information before starting a route
- Save and remove quests
- Record completed quests
- View collected and locked badges in the Passport section
- View quest locations on an interactive map
- Switch between English and Ukrainian
- Store quest content, translations and user progress in MySQL

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Leaflet
- React Leaflet

### Backend

- Node.js
- Express.js
- MySQL
- REST API

### Deployment

- Railway
- Railway MySQL
- Environment variables for frontend, backend and database configuration

## Project Structure

```text
wayo-app/
├── frontend/                React, Vite and Tailwind application
├── backend/                 Express API and MySQL connection
│   ├── db/
│   │   ├── migrations/      Database migration files
│   │   ├── schema.sql       Local database structure
│   │   └── seed.sql         Local demonstration data
│   ├── routes/              API route handlers
│   └── server.js            Backend entry point
└── README.md
```

## Local Installation

### Requirements

Install the following before running the project locally:

- Node.js
- npm
- MySQL
- Git

MySQL can be managed through MySQL Workbench or another MySQL client.

### 1. Clone the Repository

```bash
git clone https://github.com/sagaidachnaaa-star/wayo-app.git
cd wayo-app
```

### 2. Configure the Backend

Open the backend directory and install its dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5050
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Velukobrutania23
DB_NAME=wayo_db
```

Replace `Velukobrutania23` with the password used by your local MySQL installation.

The `.env` file is excluded from Git and must not be committed.

### 3. Create the Local Database

Make sure MySQL is running.

From the project root, create the database structure and insert the demonstration data:

```bash
mysql -u root -p < backend/db/schema.sql
mysql -u root -p < backend/db/seed.sql
```

These commands are intended for a new local database. They should not be run against the deployed production database because the schema file may recreate existing tables.

### 4. Run the Backend

From the `backend` folder:

```bash
npm run dev
```

The backend API will normally run at:

```text
http://localhost:5050
```

The project uses port `5050` because port `5000` may already be used by AirPlay Receiver on macOS.

### 5. Configure the Frontend

Open a second terminal and move to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5050
```

The frontend uses this environment variable to connect to the backend API.

### 6. Run the Frontend

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

Both the frontend and backend must be running at the same time for database content to appear in the application.

The Explore page can be opened directly at:

```text
http://localhost:5173/explore
```

## API Endpoints

Main API endpoints include:

```text
GET /api/health
GET /api/test-db
GET /api/quests
GET /api/quests/:slug
GET /api/saved
GET /api/completed
```

Additional POST and DELETE routes are used to save, remove and complete quests.

Example local checks:

```text
http://localhost:5050/api/health
http://localhost:5050/api/test-db
http://localhost:5050/api/quests
http://localhost:5050/api/quests/greenwich-stroll
```

`/api/health` confirms that the backend is running.

`/api/test-db` confirms whether the backend is connected to MySQL.

`/api/quests` returns the available quests as JSON.

`/api/quests/greenwich-stroll` returns one quest with its route stops, accessibility information and related badge data.

If `/api/test-db` returns an error, check the database values in `backend/.env`, including `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME`.

## Database

The MySQL database stores:

- users
- quests
- quest stops
- accessibility notes
- saved quests
- completed quests
- badges
- interface translations
- quest content translations
- translated route-stop content
- translated accessibility notes
- translated badge content

The `backend/db/migrations` folder contains migration files used to add language support and translated quest content.

A separate research dataset was not created for this project. Application data is stored directly in MySQL, and the database structure is documented through the schema, seed and migration files.

Production database credentials are stored securely as hosting environment variables and are not included in this repository.

## Build and Code Quality

### Build the Frontend

```bash
cd frontend
npm run build
```

### Run Frontend Linting

```bash
cd frontend
npm run lint
```

### Run Backend Linting

```bash
cd backend
npm run lint
```

## Current MVP Limitations

WAYO is an MSc MVP rather than a finished commercial application.

The current version:

- uses one demonstration user
- does not include registration or authentication
- contains a limited number of quests
- does not provide full turn-by-turn navigation
- does not synchronise progress across personal user accounts
- has not been tested across every mobile device and browser
- requires further accessibility testing with users who have different access needs

## Security

Sensitive files and values are excluded from Git, including:

- database passwords
- Railway credentials
- environment variables
- private API configuration

No `.env` or `.env.local` files should be committed to the repository.

## Author

Developed by **Irena Sahajdaczna** as part of the MSc Web Development project at the University of Roehampton.