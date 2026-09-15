const express = require('express');
const providerController = require('../controllers/providerController');
const reservationController = require('../controllers/reservationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, providerController.register);
router.get('/me', requireAuth, providerController.listMine);
router.get('/:id', providerController.getById);
router.patch('/:id', requireAuth, providerController.update);

router.get('/:id/experiences', providerController.listExperiences);
router.post('/:id/experiences', requireAuth, providerController.createExperience);
router.patch(
  '/:id/experiences/:experienceId',
  requireAuth,
  providerController.updateExperience
);

router.get('/:id/menu-items', providerController.listMenuItems);
router.post('/:id/menu-items', requireAuth, providerController.createMenuItem);
router.patch('/:id/menu-items/:menuItemId', requireAuth, providerController.updateMenuItem);

router.get('/:id/reservations', requireAuth, reservationController.listForProvider);
router.patch(
  '/:id/reservations/:reservationId/status',
  requireAuth,
  reservationController.updateStatus
);

module.exports = router;
