const prisma = require('../lib/prisma');
const config = require('../config');
const { HttpError } = require('../utils/httpError');

/**
 * Auth middleware.
 * TODO(Joe): swap development header auth for real JWT/session once user auth lands.
 * Dev only: send `X-User-Id: <uuid>` of an existing User row.
 */
async function requireAuth(req, _res, next) {
  try {
    const userId = req.header('X-User-Id');

    if (!userId) {
      if (config.nodeEnv === 'development') {
        throw new HttpError(
          401,
          'Authentication required. In development, set header X-User-Id to an existing User id.'
        );
      }
      throw new HttpError(401, 'Authentication required.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpError(401, 'Invalid user.');
    }

    req.user = user;
    next();
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
