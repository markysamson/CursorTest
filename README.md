# Monopoly Run — London

A GPS-verified team activity inspired by the London Monopoly board. Managers create teams and monitor the run from an admin console; team leaders use their phones to check in at real locations, upload selfies to purchase properties, and pay rent when visiting rivals' squares.

## Features

- **Manager console** (`/admin`): create teams with PINs, start/end the run, live leaderboard, property ownership with selfies, activity feed
- **Team app** (`/team`): mobile-friendly board list, **interactive map** (your team + all properties), continuous GPS tracking, geofenced check-in, selfie capture to buy unowned properties, automatic rent payments
- **Live maps**: OpenStreetMap via Leaflet — managers see every team’s last reported position; teams see themselves and all property squares
- **Three boards:** Full London (22 stops), **City of London** (14 stops around Liverpool Street), or **Saffron Walden** (14 stops in Essex) — manager picks in SETUP before starting the run

## Quick start

```bash
npm install
cp .env.example .env   # set AUTH_SECRET and ADMIN_PASSWORD
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default admin password (override with `ADMIN_PASSWORD` in `.env`): `monopoly-admin`

For local testing, prefer **`npm run dev`** (not `npm start`). If you use a production build over **http://** and login loops back to the sign-in page, set `COOKIE_SECURE=false` in `.env` or serve over HTTPS.

## How it works

1. Manager logs in, creates teams (name, leader, numeric PIN), and clicks **Start run**.
2. Team leader logs in on a phone with location enabled.
3. Within the configured geofence (default 120m), unowned properties require a **selfie upload** to purchase; owned properties charge **rent** to the visiting team and credit the owner.
4. GPS coordinates are sent with every check-in and verified server-side (Haversine distance).

## Tech stack

Next.js (App Router), SQLite + Prisma, JWT session cookies, Tailwind CSS.

## Production (AWS EC2)

For a small **EC2** instance with **persistent SQLite and selfies** on EBS, set `MONOPOLY_DATA_DIR` (e.g. `/var/lib/monopoly-run`). The app stores `data.db` and `uploads/` there and listens on `0.0.0.0` for Caddy/nginx.

Step-by-step: **[deploy/aws/README.md](deploy/aws/README.md)** (free-tier micro instance, systemd, HTTPS).
