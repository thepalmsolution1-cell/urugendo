const express = require('express');
const cors = require('cors');

const providerRoutes = require('./routes/providerRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
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

// Joe (user-facing) mounts go here later:
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/requests', requestRouter);
// app.use('/api/v1/plans', planRouter);
// app.use('/api/v1/favorites', favoriteRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[Backend Error]:', err);
  }
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(err instanceof HttpError ? {} : {}),
    },
  });
});

module.exports = app;
