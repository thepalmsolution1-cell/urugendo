const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const config = require('../config');
const { HttpError } = require('../utils/httpError');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function sanitizeUser(user) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

async function registerUser({ email, contactPhone, password, name, preferredLanguage }) {
  if (!email && !contactPhone) {
    throw new HttpError(400, 'Either email or contact phone must be provided');
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new HttpError(400, 'User with this email already exists');
    }
  }

  if (contactPhone) {
    const existingPhone = await prisma.user.findUnique({ where: { contactPhone } });
    if (existingPhone) {
      throw new HttpError(400, 'User with this phone number already exists');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const lang = (preferredLanguage || 'EN').toUpperCase() === 'RW' ? 'RW' : 'EN';

  const user = await prisma.user.create({
    data: {
      email: email || null,
      contactPhone: contactPhone || null,
      passwordHash: hashedPassword,
      name,
      preferredLanguage: lang,
    },
  });

  const token = generateToken(user);
  return {
    user: sanitizeUser(user),
    token,
  };
}

async function loginUser({ credential, email, contactPhone, password }) {
  const identifier = credential || email || contactPhone;
  if (!identifier) {
    throw new HttpError(400, 'Email or phone number is required to log in');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { contactPhone: identifier },
      ],
    },
  });

  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = generateToken(user);
  return {
    user: sanitizeUser(user),
    token,
  };
}

module.exports = {
  registerUser,
  loginUser,
  sanitizeUser,
};
