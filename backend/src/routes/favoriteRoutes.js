const express = require('express');
const { body, param } = require('express-validator');
const favoriteController = require('../controllers/favoriteController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.use(authenticateJWT);

router.post(
  '/',
  [
    body().custom((value) => {
      const pId = value.providerId || value.provider_id;
      const eId = value.experienceId || value.experience_id;
      if (!pId && !eId) {
        throw new Error('Either provider_id or experience_id must be provided');
      }
      return true;
    }),
    validateRequest,
  ],
  favoriteController.addFavorite
);

router.get('/', favoriteController.getFavorites);

router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('ID parameter is required'),
    validateRequest,
  ],
  favoriteController.removeFavorite
);

module.exports = router;
