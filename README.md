# Event Customer Check-In Dashboard

A ReactJS web application to manage event customer check-ins, QR code verification, booth assignment, and customer status updates.

## Live Demo

- **Frontend**: https://event-checkin-dashboard-1achgbcff-shahid-anwars-projects.vercel.app
- **Backend API**: https://event-checkin-dashboard-api-zx15.onrender.com/api
- **GitHub**: https://github.com/shahid-anwar/Event_Checkin_Dashboard

## Tech Stack

- **React 18 + Vite** — UI framework
- **React Router v7** — Client-side routing + protected routes
- **Redux Toolkit + RTK Query** — State management + API layer
- **Tailwind CSS v4** — Utility-first styling
- **react-hook-form + Zod** — Form handling and validation
- **json-server** — Mock REST API backend
- **recharts** — Charts on the Dashboard
- **html5-qrcode** — Camera-based QR code scanning
- **react-toastify** — Toast notifications

## Setup

```bash
git clone https://github.com/shahid-anwar/Event_Checkin_Dashboard.git
cd Event_Checkin_Dashboard
npm install
npm run dev          # starts mock API on :4000 AND vite on :5173
```

Open http://localhost:5173

## Login Credentials

| Field    | Value           |
|----------|-----------------|
| Email    | admin@event.com |
| Password | Admin@123       |

## API Endpoints (mock server)

| Method | Endpoint                         | Description          |
|--------|----------------------------------|----------------------|
| POST   | /api/login                       | Auth + token         |
| GET    | /api/dashboard-summary           | Live stats           |
| GET    | /api/customers                   | List customers       |
| POST   | /api/customers                   | Add customer         |
| PUT    | /api/customers/:id               | Update customer      |
| DELETE | /api/customers/:id               | Delete customer      |
| GET    | /api/qr-codes/verify/:qrCode     | Verify QR            |
| POST   | /api/customers/check-in          | Check in by QR       |
| GET    | /api/boothAssignments            | List assignments     |
| POST   | /api/boothAssignments            | Create assignment    |
| PUT    | /api/boothAssignments/:id        | Update assignment    |
| DELETE | /api/boothAssignments/:id        | Cancel assignment    |
| POST   | /api/customer-status             | Update status        |
| GET    | /api/customer-status/:customerId | Status history       |

## Third-Party Libraries

| Library          | Purpose                     |
|------------------|-----------------------------|
| html5-qrcode     | Camera QR code scanning     |
| recharts         | Pie + bar charts            |
| react-toastify   | Toast notifications         |
| react-hook-form  | Form state + submission     |
| zod              | Schema validation           |

## Demo QR Codes (manual entry on QR Scan page)

| QR Code     | Customer        | Status          |
|-------------|-----------------|-----------------|
| QR-C2-002   | Priya Sharma    | Waiting (ready) |
| QR-C5-005   | Karan Malhotra  | Waiting (ready) |
| QR-C1-001   | Rahul Mehta     | Already used    |

## Project Structure

```
src/
├── api/              # RTK Query API slices
├── components/       # Shared UI components
├── features/
│   ├── auth/         # Login page
│   ├── dashboard/    # Summary cards + charts
│   ├── customers/    # CRUD table + modals
│   ├── qrScanner/    # Camera scan + check-in
│   ├── boothAssignment/ # Assignment management
│   └── customerStatus/  # Status update + history
├── routes/           # Protected route wrapper
├── store/            # Redux store + auth slice
├── App.jsx
└── main.jsx
mock/
├── db.json           # Seed data
└── server.cjs        # Custom json-server with business logic
```
