const express = require('express');
const cors = require('cors');

const providerRoutes = require('./routes/providerRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const planRoutes = require('./routes/planRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const { HttpError } = require('./utils/httpError');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
  });
});

// Owen: provider & admin surface
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Joe: User-facing routes mounted at /api and /api/v1
const mountUserFacingRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}`, experienceRoutes);
  app.use(`${prefix}/budget`, budgetRoutes);
  app.use(`${prefix}/plans`, planRoutes);
  app.use(`${prefix}/favorites`, favoriteRoutes);
};

mountUserFacingRoutes('/api');
mountUserFacingRoutes('/api/v1');

// 404 handler for unmatched routes
app.use((req, res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.path} not found`));
});

// Central error handler
app.use((err, req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Format Prisma errors to clean HTTP error messages without leaking raw stack trace
  if (err.code && typeof err.code === 'string') {
    if (err.code === 'P2002') {
      status = 400;
      message = 'A record with this unique field already exists';
    } else if (err.code === 'P2025') {
      status = 404;
      message = 'Requested record not found';
    } else if (err.code === 'P2003' || err.code === 'P2005' || err.code === 'P2006') {
      status = 400;
      message = 'Invalid input parameters or constraint violation';
    } else if (err.code.startsWith('P1')) {
      status = 503;
      message = 'Database connection error';
    }
  }

  if (status >= 500) {
    console.error('[Backend Server Error]:', err.stack || err);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      ...(err.errors ? { details: err.errors } : {}),
    },
  });
});

module.exports = app;
