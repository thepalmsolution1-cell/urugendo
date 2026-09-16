const express = require('express');
const { body, query } = require('express-validator');
const experienceController = require('../controllers/experienceController');
const { optionalJWT } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/experience-request',
  optionalJWT,
  [
    body('text').trim().notEmpty().withMessage('Text request is required'),
    validateRequest,
  ],
  experienceController.handleExperienceRequest
);

router.get(
  '/experiences',
  [
    query('location').optional().isString().trim(),
    query('category').optional().isString().trim(),
    query('price_min').optional().isNumeric().withMessage('price_min must be a number'),
    query('price_max').optional().isNumeric().withMessage('price_max must be a number'),
    query('q').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    validateRequest,
  ],
  experienceController.handleSearchExperiences
);

module.exports = router;
