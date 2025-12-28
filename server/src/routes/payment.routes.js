const router = require("express").Router();
const { authenticate, adminOnly } = require("../middleware/auth.middleware");
const paymentController = require("../controllers/payment.controller");

// Razorpay flow
router.post("/razorpay/order", authenticate, paymentController.createRazorpayOrder);
router.post("/razorpay/verify", authenticate, paymentController.verifyRazorpayPayment);

// User
router.get("/my", authenticate, paymentController.getMyPayments);

// Admin
router.get("/", authenticate, adminOnly, paymentController.getAllPayments);
router.put("/:id/status", authenticate, adminOnly, paymentController.updatePaymentStatus);

module.exports = router;
