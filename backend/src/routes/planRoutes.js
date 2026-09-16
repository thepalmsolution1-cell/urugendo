const express = require('express');
const { body, param } = require('express-validator');
const planController = require('../controllers/planController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.use(authenticateJWT);

router.post(
  '/',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('components').optional().isArray().withMessage('components must be an array'),
    body('budgetRwf').optional().isNumeric().withMessage('budgetRwf must be a number'),
    body('budget_rwf').optional().isNumeric().withMessage('budget_rwf must be a number'),
    validateRequest,
  ],
  planController.createPlan
);

router.get('/', planController.getPlans);

router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Plan ID must be a valid UUID'),
    validateRequest,
  ],
  planController.getPlan
);

router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Plan ID must be a valid UUID'),
    validateRequest,
  ],
  planController.deletePlan
);

module.exports = router;
