const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const adminController = require('../controllers/adminBooking.controller');


router.use(authenticate, adminOnly);
/*
router.get('/stats', adminController.getDashboardStats);
router.get('/revenue', adminController.getRevenueReport);
router.get('/activity', adminController.getRecentActivity);
*/
router.get('/bookings', adminController.getPendingBookings);
router.put('/bookings/:id/approve', adminController.approveBooking);
router.put('/bookings/:id/reject', adminController.rejectBooking);

/*
router.post('/facilities', adminController.createFacility);
router.post('/slots', adminController.createSlot);


*/

module.exports = router;
