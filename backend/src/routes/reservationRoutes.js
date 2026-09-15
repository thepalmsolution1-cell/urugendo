const express = require('express');
const reservationController = require('../controllers/reservationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, reservationController.create);
router.get('/me', requireAuth, reservationController.listMine);

module.exports = router;
