const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");


const {
  createEventRazorpayOrder,
  verifyEventRazorpayPayment,
} = require("../controllers/eventPayment.controller");

router.post("/razorpay/order", authenticate, createEventRazorpayOrder);
router.post("/razorpay/verify", authenticate, verifyEventRazorpayPayment);


module.exports = router;
