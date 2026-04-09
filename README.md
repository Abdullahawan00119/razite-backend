# Razite Backend - Job Applications API

Express.js + MongoDB API for managing job applications and admin dashboard.

## Features
- ✅ Job listings & applications with CV upload (PDF/DOCX)
- ✅ Admin authentication & JWT protection
- ✅ Dashboard stats, filtering by status/department/job
- ✅ CV preview/download/delete
- ✅ Email notifications (Gmail)
- ✅ File cleanup on delete
- ✅ Validation & error handling

## Quick Start

```bash
# Clone & Install
git clone <repo>
cd razite-backend
npm install

# Copy env
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, EMAIL_USER/PASS

# Dev server
npm run dev
```

**Server runs on:** http://localhost:5000  
**API Docs:** [API-DOCUMENTATION.md](API-DOCUMENTATION.md)

## Frontend Integration
Connect React/Vite app:
```
VITE_API_URL=http://localhost:5000/api
```

## Endpoints Summary
See [API-DOCUMENTATION.md](API-DOCUMENTATION.md)

**Admin Demo:** `admin@razite.com` / `admin123`

## Scripts
- `npm run dev` - Nodemon development
- `npm start` - Production
- `npm test` - Jest tests

## Tech Stack
```
Express.js | Mongoose | Multer | Nodemailer | JWT | express-validator
```

## Deployment
```bash
# Production
npm install --production
npm start

# PM2
pm2 start src/server.js --name razite-api
```

**All set! No errors 🚀**
