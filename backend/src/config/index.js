const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  nvidiaApiKey: process.env.NVIDIA_API_KEY,
  jwtSecret: process.env.JWT_SECRET || 'urugendo-jwt-secret-key-dev-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
