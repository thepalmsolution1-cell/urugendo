const express = require('express');
const { body } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/calculate',
  [
    body('experience_ids').optional().isArray().withMessage('experience_ids must be an array'),
    body('experienceIds').optional().isArray().withMessage('experienceIds must be an array'),
    body('items').optional().isArray().withMessage('items must be an array'),
    body('budget').optional().isNumeric().withMessage('budget must be a number'),
    body('budgetRwf').optional().isNumeric().withMessage('budgetRwf must be a number'),
    body('budget_rwf').optional().isNumeric().withMessage('budget_rwf must be a number'),
    validateRequest,
  ],
  budgetController.handleCalculateBudget
);

module.exports = router;
