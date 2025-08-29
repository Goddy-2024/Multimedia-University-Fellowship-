import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js'

// Import routes
import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';
import eventRoutes from './routes/events.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import registrationRoutes from './routes/registration.js';
import emailRoutes from './routes/email.js';

// Load environment variables
dotenv.config();

// Set default environment variables for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = '3d026172d704581d0f4179d6d2e346c089e05362e109c03c94ff83c1607db62da5c50609cdbf2287797f63453738a9dc094d67deaadd230537c83208219bc8f1';
}
if (!process.env.CLIENT_URL) {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the actual frontend URL
    process.env.CLIENT_URL = process.env.FRONTEND_URL || 'https://multimedia-university-fellowship.vercel.app/dashboard';
  } else {
    // In development, use localhost
    process.env.CLIENT_URL = 'http://localhost:5174';
    
  }
}

// Set default email configuration
if (!process.env.EMAIL_USER) {
  process.env.EMAIL_USER = 'godswill.omondi@gmail.com';
}

if (!process.env.EMAIL_PASS) {
  process.env.EMAIL_PASS = 'nwmwfskxmkveuhsz';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true 
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//STATS middleware

app.use((req, res, next)=>{
  console.log(`just recieved a : ${req.method} request of url: ${req.url}`);
  next();

})
// Routes-endpoints
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/email', emailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fellowship Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

connectDB().then(
    async ()=>{
      try {
        app.listen(process.env.PORT || 5000);
        console.log(`Server running successfuly at PORT: ${PORT}`)
      } catch (error) {
        console.error(`Error connecting to server: ${error}`)
        
      }

    }
)