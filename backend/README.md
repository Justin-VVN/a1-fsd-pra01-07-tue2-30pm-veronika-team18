# Backend Setup

## Run the backend

1. Open a terminal in `backend/`
2. Install dependencies if not already installed:
   ```powershell
   npm install
   ```
3. Start the backend:
   ```powershell
   npm run dev
   ```

The backend will attempt to listen on port `3001` by default. If port `3001` is already in use, stop the conflicting process or run:

```powershell
$env:PORT=3002; npm run dev
```

## Seed the database

This project includes a seed helper that creates:
- one vendor user
- one hirer user
- two venues
- one sample booking
- one blocked date

Run it with:

```powershell
npm run seed
```

If the database has already been seeded, the script will skip and preserve existing data.

## Verify

After the backend starts, you can verify the API using curl or Postman, for example:

```powershell
curl http://localhost:3001/api/users
curl http://localhost:3001/api/venues
curl http://localhost:3001/api/bookings
```
