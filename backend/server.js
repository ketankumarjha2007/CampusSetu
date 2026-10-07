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
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CampusSetu backend is running',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CampusSetu API is healthy',
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
      },
    });
  }
);

// User routes
app.use('/api/users', userRoutes);

// Issue routes
app.use('/api/issues', issueRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `CampusSetu backend running on port ${PORT}`
  );
});