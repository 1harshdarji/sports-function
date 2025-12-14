const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

router.use(authenticate, adminOnly);

router.get('/stats', adminController.getDashboardStats);
router.get('/revenue', adminController.getRevenueReport);
router.get('/activity', adminController.getRecentActivity);

module.exports = router;
