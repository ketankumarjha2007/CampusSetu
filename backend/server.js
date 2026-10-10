const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const authenticateUser = require('./middleware/authMiddleware');

const userRoutes = require('./routes/userRoutes');
const issueRoutes = require('./routes/issueRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps (no origin) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Access denied'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CampusSetu backend is running',
    version: '1.0.0',
  });
});

// Production-ready health check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    message: 'CampusSetu API is healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: Math.round(process.uptime()),
  });
});

// Protected Firebase authentication test
app.get(
  '/api/protected-test',
  authenticateUser,
  (req, res) => {
    res.json({
      success: true,
      message: 'Firebase authentication successful',
      user: {
        uid: req.firebaseUser.uid,
        email: req.firebaseUser.email || null,
        role: req.user?.role || 'unassigned',
      },
    });
  }
);

// User routes
app.use('/api/users', userRoutes);

// Issue routes
app.use('/api/issues', issueRoutes);

// Global Error Handler (Hides stack traces in production)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `CampusSetu backend running on port ${PORT}`
  );
});