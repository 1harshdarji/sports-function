const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

router.post('/', authenticate, paymentController.createPayment);
router.post('/confirm', authenticate, paymentController.confirmPayment);
router.get('/my', authenticate, paymentController.getMyPayments);
router.get('/', authenticate, adminOnly, paymentController.getAllPayments);
router.put('/:id/status', authenticate, adminOnly, paymentController.updatePaymentStatus);

module.exports = router;
