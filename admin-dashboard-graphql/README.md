# VV Admin Dashboard (HD Section)

This folder contains two separate projects for the Admin Dashboard (HD section of Assignment 2):

## Projects

| Project | Description | Port |
|---|---|---|
| `admin-backend` | Apollo GraphQL server (Node + Express + TypeORM + graphql-ws) | 4001 |
| `admin-frontend` | React TS admin UI (Vite + Apollo Client) | 5173 |

---

## admin-backend

GraphQL API server that connects to the same Cloud MS SQL database as the main backend.

### Features (Assignment HD Requirements)
- **h.** Admin CRUD on all venues, assign/swap vendor to venue, toggle Featured status
- **i.** Reports: Top 3 popular venues (with most popular day & time slot), Top 3 active hirers
- **j.** GraphQL Subscription `venueDiscountNotification` — broadcasts real-time 45% discount alerts to all connected clients (admin dashboard + VV website simultaneously)

### Running locally
```bash
cd admin-backend
npm install
npm run dev        # starts on http://localhost:4001/graphql
```

### GraphQL Playground
Open Apollo Sandbox at `http://localhost:4001/graphql`

### Authentication
All queries/mutations require an `Authorization` header with the JWT token obtained from the `login` mutation.
Admin credentials: **username: `admin` / password: `admin`**

---

## admin-frontend

Vite + React TS admin dashboard that communicates with `admin-backend` via Apollo Client.

### Features
- Login page (admin / admin)
- **Venues page**: CRUD all venues, assign/swap vendor, toggle Featured badge
- **Reports page**: Top 3 popular venues table, Top 3 active hirers with success rate
- **Notifications page**: Trigger real-time 45% discount via GraphQL subscription; live event log

### Running locally
```bash
cd admin-frontend
npm install
npm run dev        # starts on http://localhost:5173
```

---

## Real-time Subscription Architecture

```
Admin clicks "Trigger 45% Sale"
        │
        ▼
triggerVenueDiscount mutation (admin-backend)
        │
        ├─► Persists onSale=true in DB
        │
        └─► pubsub.publish('VENUE_DISCOUNT', payload)
                │
                ├─► Admin frontend (ws://localhost:4001/graphql)
                │   useSubscription hook → updates live event log
                │
                └─► VV frontend layout (ws://localhost:4001/graphql)
                    VenueDiscountAlert component → shows red/bold banner
                    on BOTH hirers' and vendors' pages simultaneously
```

---

## Render Deployment URLs
*(Fill in after deploying)*

- Admin Backend API: `https://...`
- Admin Frontend:    `https://...`
