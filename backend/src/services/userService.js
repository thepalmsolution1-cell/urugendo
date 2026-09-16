const prisma = require('../lib/prisma');
const { HttpError } = require('../utils/httpError');
const { sanitizeUser } = require('./authService');

async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return sanitizeUser(user);
}

async function updateUserProfile(userId, updateData) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new HttpError(404, 'User not found');
  }

  const dataToUpdate = {};

  if (updateData.name !== undefined) {
    dataToUpdate.name = updateData.name;
  }

  const rawLang = updateData.preferred_language || updateData.preferredLanguage;
  if (rawLang !== undefined) {
    dataToUpdate.preferredLanguage = String(rawLang).toUpperCase() === 'RW' ? 'RW' : 'EN';
  }

  const rawLocs = updateData.preferred_locations || updateData.preferredLocations;
  if (rawLocs !== undefined && Array.isArray(rawLocs)) {
    dataToUpdate.preferredLocations = rawLocs;
  }

  const rawPrefs = updateData.experience_preferences || updateData.experiencePreferences;
  if (rawPrefs !== undefined && Array.isArray(rawPrefs)) {
    dataToUpdate.experiencePreferences = rawPrefs;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });

  return sanitizeUser(updatedUser);
}

module.exports = {
  getUserProfile,
  updateUserProfile,
};
