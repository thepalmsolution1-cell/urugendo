const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const config = require('../config');
const { HttpError } = require('../utils/httpError');

/**
 * Middleware to enforce JWT authentication.
 * Verifies Bearer token in Authorization header, fetches user from DB,
 * and attaches sanitized user object to req.user.
 */
async function authenticateJWT(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentication token missing or malformed');
    }

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        contactPhone: true,
        name: true,
        role: true,
        preferredLanguage: true,
        preferredLocations: true,
        experiencePreferences: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new HttpError(401, 'User account associated with token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware to optionally attach JWT user to req.user if a valid token is provided.
 * Does not block unauthenticated requests.
 */
async function optionalJWT(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwtSecret);
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
              id: true,
              email: true,
              contactPhone: true,
              name: true,
              role: true,
              preferredLanguage: true,
              preferredLocations: true,
              experiencePreferences: true,
              createdAt: true,
              updatedAt: true,
            },
          });
          if (user) {
            req.user = user;
          }
        } catch (_ignoreErr) {
          // Ignore invalid token in optional auth context
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticateJWT,
  optionalJWT,
};
