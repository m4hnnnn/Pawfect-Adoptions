# 🐾 Pawfect Adoptions — Backend API

Express + SQLite backend with JWT authentication.

## Quick Start

```bash
npm install
cp .env.example .env      # then edit .env with your JWT_SECRET
node database/init.js     # creates the database + tables
npm run dev               # starts server on port 3001
```

## Test the API

```bash
# Sign up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Maya","email":"maya@test.com","password":"secret123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maya@test.com","password":"secret123"}'
```

## Deploy to Railway (free tier)

See deployment steps in the GitHub guide below.
