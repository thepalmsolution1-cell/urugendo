const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const config = require('../config');
const { HttpError } = require('../utils/httpError');

/**
 * Auth for Owen routes: prefer Joe's JWT Bearer token; fall back to X-User-Id in development.
 */
async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new HttpError(401, 'Authentication token required');
      }

      let decoded;
      try {
        decoded = jwt.verify(token, config.jwtSecret);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw new HttpError(401, 'Token has expired. Please log in again');
        }
        throw new HttpError(401, 'Invalid authentication token');
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        throw new HttpError(401, 'Invalid user.');
      }
      req.user = user;
      return next();
    }

    const userId = req.header('X-User-Id');
    if (userId && config.nodeEnv === 'development') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new HttpError(401, 'Invalid user.');
      }
      req.user = user;
      return next();
    }

    throw new HttpError(401, 'Authentication required.');
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Insufficient permissions.'));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
