require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const roadmapRoutes = require('./routes/roadmap');
const prepRoutes = require('./routes/prep');
const testRoutes = require('./routes/test');
const interviewRoutes = require('./routes/interview');
const jobRoutes = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database connection (attempts Mongo, activates local fallback file if failed)
db.connectDB().then(() => {
  // Routes Configuration
  app.use('/api/auth', authRoutes);
  app.use('/api/roadmap', roadmapRoutes);
  app.use('/api/prep', prepRoutes);
  app.use('/api/test', testRoutes);
  app.use('/api/interview', interviewRoutes);
  app.use('/api/jobs', jobRoutes);

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      mode: db.isOffline() ? 'Offline JSON Database' : 'MongoDB Connected',
      timestamp: new Date().toISOString()
    });
  });

  // Start listening
  app.listen(PORT, () => {
    console.log(`CampusPrep Hub Backend running on port ${PORT}`);
    console.log(`Mode: ${db.isOffline() ? 'Local Fallback JSON' : 'MongoDB Atlas'}`);
  });
}).catch(err => {
  console.error('Failed to initialize database: ', err);
  process.exit(1);
});
