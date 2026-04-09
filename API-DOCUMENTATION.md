# Razite Backend API Documentation

Express.js REST API for Razite's job applications management system.

## Base URL
`http://localhost:5000/api`

## Authentication
All admin endpoints require JWT token in `Authorization: Bearer <token>`

### Admin Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "admin@razite.com",
  "password": "admin123"
}
```
**Demo Credentials:** `admin@razite.com` / `admin123`

## Jobs Endpoints (Admin Only)

- `GET /jobs` - Get all jobs with filters (?status=open&type=full-time)
- `GET /jobs/:id` - Get single job
- `POST /jobs` - Create job (admin)
- `PUT /jobs/:id` - Update job (admin)
- `DELETE /jobs/:id` - Delete job (admin)
- `POST /jobs/:id/apply` - Submit application + CV upload

## Applications Endpoints (Admin Only)

### Dashboard & Stats
```
GET /applications - All applicants (?status=pending&department=engineering&sortBy=latest)
GET /applications/dashboard/stats - Dashboard statistics
```

### Filtered Views
```
GET /applications/department/:department - Applicants by department
GET /applications/job/:jobId - Applicants for specific job
```

### Single Applicant
```
GET /applications/applicant/:id - Full details
GET /applications/applicant/:id/cv - CV metadata
GET /applications/applicant/:id/preview-cv - View CV inline (?token=...)
GET /applications/applicant/:id/download-cv - Download CV
```

### Management
```
PATCH /applications/applicant/:id/status - Update status + notes
{
  "status": "shortlisted",
  "notes": "Strong React experience"
}
DELETE /applications/applicant/:id - Delete applicant + CV file
```

## File Uploads
- CVs served at `/uploads/cvs/filename.pdf`
- Supported: PDF, DOC, DOCX (max 5MB)
- Auto-deleted on applicant removal

## Response Format
**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": {...}
}
```
**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

## Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/razite-db
JWT_SECRET=your-super-secret-key
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
CLIENT_ORIGIN=http://localhost:8080
PORT=5000
```

## Health Check
`GET /api/health`

## Testing
```bash
npm run dev
curl http://localhost:5000/api/health
```

**All errors fixed! Ready for production 🚀**
