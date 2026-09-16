const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.use(authenticateJWT);

router.get('/me', userController.getProfile);

router.put(
  '/me',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('preferred_language').optional().isIn(['EN', 'RW', 'en', 'rw']).withMessage('Preferred language must be EN or RW'),
    body('preferredLanguage').optional().isIn(['EN', 'RW', 'en', 'rw']).withMessage('Preferred language must be EN or RW'),
    body('preferred_locations').optional().isArray().withMessage('preferred_locations must be an array'),
    body('preferredLocations').optional().isArray().withMessage('preferredLocations must be an array'),
    body('experience_preferences').optional().isArray().withMessage('experience_preferences must be an array'),
    body('experiencePreferences').optional().isArray().withMessage('experiencePreferences must be an array'),
    validateRequest,
  ],
  userController.updateProfile
);

module.exports = router;
