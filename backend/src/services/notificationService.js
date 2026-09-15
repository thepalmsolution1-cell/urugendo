const prisma = require('../lib/prisma');
const { HttpError } = require('../utils/httpError');

const ALLOWED_TYPES = new Set([
  'RESERVATION_UPDATE',
  'PLAN_UPDATE',
  'PROVIDER_RESPONSE',
  'SYSTEM',
]);

/**
 * Shared notification helper (FR-33). Both Joe and Owen call this.
 */
async function createNotification({ userId, type, title, body, payload = null }) {
  if (!userId || !type || !title || !body) {
    throw new HttpError(400, 'userId, type, title, and body are required.');
  }
  if (!ALLOWED_TYPES.has(type)) {
    throw new HttpError(400, `Invalid notification type: ${type}`);
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      payload: payload ?? undefined,
    },
  });
}

module.exports = { createNotification };
