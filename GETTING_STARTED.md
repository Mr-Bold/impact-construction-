# 🚀 Getting Started - Impact Construction Platform

## Phase 1: Project Setup Complete ✅

All foundational work is complete and ready to run. Follow this guide to get the application up and running locally.

---

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** (v16+) and npm installed
- **Git** for version control
- **Supabase Account** (free tier available at https://supabase.com)
- **Code Editor** (VS Code recommended)

---

## 🔧 Step 1: Supabase Setup (Required)

### 1. Create a Supabase Project
1. Go to https://supabase.com and sign up/login
2. Create a new project
3. Wait for the project to initialize
4. Go to **Project Settings** → **API**
5. Copy the following:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Create Database Tables
1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents from `backend/sql/01_create_tables.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for the tables to be created (should see green checkmark)

### 3. Create Storage Buckets
1. In Supabase, go to **Storage**
2. Create a new bucket named `project-media` (public)
3. Create another bucket named `request-attachments` (public)
4. Create another bucket named `profile-photos` (public)

---

## 📝 Step 2: Backend Configuration

### 1. Set Environment Variables
Edit `backend/.env`:
```env
# From Supabase (Step 1)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Test Backend (Optional)
```bash
node server.js
```
You should see:
```
╔═══════════════════════════════════════════╗
║  Impact Construction Platform - Backend   ║
║  🚀 Server running on port 3000            ║
║  📝 Database: Supabase PostgreSQL         ║
║  🔐 Authentication: JWT                   ║
╚═══════════════════════════════════════════╝
```

Press `Ctrl+C` to stop.

---

## 🎨 Step 3: Frontend Configuration

### 1. Set Environment Variables
Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Impact Construction
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Test Frontend (Optional)
```bash
npm run dev
```
This will start the development server at `http://localhost:5173`

Press `Ctrl+C` to stop.

---

## 🏃 Step 4: Running the Full Application

### Open Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or: node server.js
```
Backend will run on: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Test the Application
1. Open browser to `http://localhost:5173`
2. You should see the Impact Construction homepage
3. Navigate through the pages:
   - **Home** - Landing page with hero section
   - **Gallery** - Project gallery with filtering
   - **Contact** - Contact form and business info
   - **Login** - Dual login (customer/admin) - currently placeholder
   - **Register** - Customer registration form - currently placeholder

### Check Backend Health
Open `http://localhost:3000/api/health` in browser
You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-09-12T...",
  "message": "Impact Construction Platform Backend is running"
}
```

---

## 📱 Pages Overview

### Public Pages (No Login Required)
- **Homepage** (`/`) - Hero section, featured projects
- **Gallery** (`/gallery`) - Browse all projects with filters
- **Project Details** (`/projects/:slug`) - View project details, like, rate, comment
- **Contact** (`/contact`) - Contact form and business information

### Authentication Pages
- **Login** (`/login`) - Dual role login (customer/admin)
- **Register** (`/register`) - Customer registration

### Protected Pages
- **Customer Dashboard** (`/dashboard`) - View requests, profile, notifications
- **Admin Dashboard** (`/admin`) - Manage projects, requests, customers, analytics

---

## 🛣️ API Routes (Placeholder - Phase 2)

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)
- `POST /api/projects/:id/like` - Like project
- `POST /api/projects/:id/rate` - Rate project
- `GET /api/projects/:id/comments` - Get comments
- `POST /api/projects/:id/comments` - Add comment

### Service Requests
- `GET /api/requests` - Get user's requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests` - Create service request
- `PUT /api/requests/:id/status` - Update request status
- `GET /api/requests/:id/messages` - Get request messages
- `POST /api/requests/:id/messages` - Send message
- `GET /api/requests/:id/quotation` - Get quotation
- `PUT /api/requests/:id/quotation/response` - Respond to quotation

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/categories` - Get categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/settings` - Get business settings
- `PUT /api/admin/settings` - Update settings

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use:

**For Backend:**
```bash
# Change PORT in backend/.env to 3001 or another port
# Or kill the process using port 3000
# On Windows: taskkill /F /IM node.exe
```

**For Frontend:**
```bash
# Vite will auto-increment to 5174, 5175, etc.
# Or stop other services using port 5173
```

### Database Connection Error
- Verify `SUPABASE_URL` and keys are correct in `.env`
- Check that Supabase project is active
- Ensure SQL migration has been run

### CORS Errors
- Frontend and backend must be on correct URLs
- Check `FRONTEND_URL` and `CORS_ORIGIN` in `backend/.env`
- Both should point to frontend dev server

### Module Not Found
```bash
# Reinstall dependencies
npm install

# Clear cache
npm cache clean --force

# Reinstall specific packages
npm install supabase express cors
```

---

## 📚 Project Files to Know

### Backend
- `server.js` - Main Express server
- `config/supabase.js` - Database configuration
- `routes/` - API endpoints
- `sql/01_create_tables.sql` - Database schema
- `.env` - Environment variables

### Frontend
- `src/App.jsx` - Main routing component
- `src/pages/` - All page components
- `src/services/api.js` - API client
- `tailwind.config.js` - Tailwind configuration
- `.env` - Environment variables

---

## 🎯 What's Working

✅ **Backend**
- Express server running
- Supabase connection configured
- Health check endpoint
- Route structure in place
- Error handling middleware

✅ **Frontend**
- All 8 main pages created
- React Router navigation
- Tailwind CSS styling
- Responsive design
- API client configured

✅ **Database**
- 15 tables designed
- Relationships and indexes
- RLS policies configured
- SQL migration ready

---

## 🚀 What's Next - Phase 2

Phase 2 will implement:
1. **User Authentication** - Register, login, password reset
2. **JWT Tokens** - Secure token generation and validation
3. **Project Management** - CRUD operations for projects
4. **Image/Video Uploads** - Multer integration with Supabase Storage
5. **Likes, Ratings, Comments** - Project interaction features
6. **Service Requests** - Customer request system
7. **Admin Dashboard** - Full admin functionality

---

## 📞 Support & Notes

- All credentials should be kept in `.env` files (never commit)
- Frontend development server has hot-reload enabled
- Backend requires manual restart for code changes
- Database migration only needs to run once
- Supabase provides a free tier for development

---

## ✨ Features Ready for Phase 2

- Clean project structure
- Database schema designed and ready
- Frontend UI scaffolding complete
- Backend routing structure in place
- Environment configuration ready
- Error handling framework in place
- CORS properly configured
- API client with interceptors ready

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)

---

**Ready to start? Follow the steps above to get the application running!**

For Phase 2 implementation details, see `PROJECT_SETUP_PLAN.md`

---

*Generated: September 12, 2026*
*Impact Construction Platform - Full-Stack Web Application*
