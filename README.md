# LocalLoop Full Stack

## What you get
- React + Vite frontend
- Node.js + Express REST API
- SQLite database using better-sqlite3
- Persistent guides, guidance packages, bookings and reviews
- 10% advance calculation
- Guide registration endpoint and UI
- Booking lookup/status/review endpoints
- Admin statistics endpoint

## Run

Install Node.js LTS.

```bash
npm install
npm run dev
```

Frontend:
http://localhost:5173

Backend API:
http://localhost:4000/api/health

SQLite database is created automatically at:
server/localloop.db

## API examples

GET /api/guides
GET /api/packages
POST /api/guides
POST /api/bookings
GET /api/bookings/:bookingCode
PATCH /api/bookings/:bookingCode/status
POST /api/reviews
GET /api/admin/stats

This is a local MVP. Real authentication, production payment gateway, email/SMS, maps, guide verification and deployment should be added before public launch.
