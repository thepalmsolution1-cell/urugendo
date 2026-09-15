const express = require('express');
const cors = require('cors');

const app = express();

// Middleware Configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Baseline Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString()
  });
});

// Route Mounting Placeholders
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/bookings', bookingRouter);
// app.use('/api/v1/experiences', experienceRouter);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Backend Error]:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

module.exports = app;
