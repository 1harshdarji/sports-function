const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const bookingController = require('../controllers/booking.controller');

router.get('/my', authenticate, bookingController.getMyBookings);
router.post('/', authenticate, bookingController.createBooking);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);
router.get('/', authenticate, adminOnly, bookingController.getAllBookings);
router.put('/:id/status', authenticate, adminOnly, bookingController.updateBookingStatus);

module.exports = router;
