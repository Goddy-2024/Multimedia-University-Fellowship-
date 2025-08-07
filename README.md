# Fellowship Management System - MERN Stack

A comprehensive fellowship management system built with the MERN stack (MongoDB, Express.js, React, Node.js) for managing members, events, and generating reports.

## Features

- **Authentication System**: Secure login with JWT tokens
- **Dashboard**: Overview with key metrics and statistics
- **Member Management**: Full CRUD operations for fellowship members
- **Event Management**: Schedule and manage fellowship events
- **Reports**: Interactive charts and analytics
- **Responsive Design**: Works on all device sizes

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Recharts for data visualization
- Lucide React for icons

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/fellowship_management

# JWT Secret (change in production)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5174
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create the database automatically

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### 4. Seed Sample Data

```bash
cd server
node scripts/seedData.js
```

This will create:
- Admin user (username: `admin`, password: `rhsf2024`)
- Sample members
- Sample events

### 5. Start the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev:full
```

#### Or start separately:

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:5174
- Backend API: http://localhost:5000/api
- Login with: `admin` / `rhsf2024`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Members
- `GET /api/members` - Get all members (with pagination/search)
- `POST /api/members` - Create new member
- `GET /api/members/:id` - Get single member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/stats/overview` - Get member statistics

### Events
- `GET /api/events` - Get all events (with filters)
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/attendees` - Add attendee to event
- `PUT /api/events/:id/attendees/:memberId/checkin` - Check in attendee

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/attendance-trend` - Get attendance trend data

### Reports
- `GET /api/reports/department-distribution` - Get department distribution
- `GET /api/reports/monthly-summary` - Get monthly summary
- `GET /api/reports/top-events` - Get top events
- `GET /api/reports/growth-metrics` - Get growth metrics

## Project Structure

```
fellowship-management/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   ├── services/               # API service functions
│   └── ...
├── server/                      # Backend Node.js application
│   ├── models/                 # Mongoose models
│   ├── routes/                 # Express routes
│   ├── middleware/             # Custom middleware
│   ├── scripts/               # Utility scripts
│   └── server.js              # Main server file
└── README.md
```

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- CORS protection
- Rate limiting
- Input validation
- Helmet.js security headers

## Development

### Adding New Features
1. Create database models in `server/models/`
2. Add API routes in `server/routes/`
3. Create frontend components in `src/components/`
4. Add API calls in `src/services/api.ts`

### Database Schema
- **Users**: Admin authentication
- **Members**: Fellowship member information
- **Events**: Event scheduling and attendance tracking

## Production Deployment

### Vercel Frontend Deployment

1. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**:
   - `VITE_API_URL`: Your backend API URL
   - Example: `https://your-backend-api.herokuapp.com/api`

### Backend Deployment (Heroku/Railway/Render)

1. **Deploy your backend** to your preferred platform
2. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   JWT_SECRET=your-strong-jwt-secret
   MONGODB_URI=your-mongodb-atlas-connection-string
   CLIENT_URL=https://your-frontend-app.vercel.app
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

### Environment Configuration

**Frontend (Vercel)**:
- `VITE_API_URL`: Backend API URL

**Backend (Production)**:
- `NODE_ENV=production`
- `JWT_SECRET`: Strong secret key
- `MONGODB_URI`: Production database URL
- `CLIENT_URL`: Frontend Vercel URL
- `FRONTEND_URL`: Frontend Vercel URL

### Registration Link Fix

The registration links are now dynamically generated based on the environment:
- **Development**: `http://localhost:5174/register/{formId}`
- **Production**: `https://your-frontend-app.vercel.app/register/{formId}`

### Security Checklist

1. ✅ Set `NODE_ENV=production`
2. ✅ Use a strong JWT secret
3. ✅ Configure MongoDB Atlas or production database
4. ✅ Set up proper CORS origins
5. ✅ Use HTTPS in production
6. ✅ Consider using PM2 for process management

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **CORS Errors**
   - Check `CLIENT_URL` in server `.env`
   - Ensure frontend and backend URLs match

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret configuration
   - Verify token expiration

### Support

For issues and questions, please check the console logs for detailed error messages.