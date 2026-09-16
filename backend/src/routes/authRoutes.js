const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Must be a valid email address'),
    body().custom((value) => {
      const email = value.email;
      const phone = value.contactPhone || value.contact_phone;
      if (!email && !phone) {
        throw new Error('Either email or contact phone number must be provided');
      }
      return true;
    }),
    validateRequest,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('password').notEmpty().withMessage('Password is required'),
    body().custom((value) => {
      const credential = value.credential || value.email || value.contactPhone || value.contact_phone;
      if (!credential) {
        throw new Error('Email or phone number is required to log in');
      }
      return true;
    }),
    validateRequest,
  ],
  authController.login
);

module.exports = router;
