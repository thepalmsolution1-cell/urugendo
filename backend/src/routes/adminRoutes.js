const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/providers', adminController.listProviders);
router.patch('/providers/:id/verification', adminController.updateVerification);
router.patch('/providers/:id', adminController.updateProvider);

router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);

router.get('/tags', adminController.listTags);
router.post('/tags', adminController.createTag);
router.patch('/tags/:id', adminController.updateTag);

router.get('/locations', adminController.listLocations);
router.post('/locations', adminController.createLocation);
router.patch('/locations/:id', adminController.updateLocation);

module.exports = router;
