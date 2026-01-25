const express = require("express");
const router = express.Router();

const membershipPaymentController = require(
  "../controllers/membershipPayment.controller"
);

const {
  createMembershipOrder,
  verifyMembershipPayment,
} = require("../controllers/membershipPayment.controller");

const { authenticate } = require("../middleware/auth.middleware");

/**
 * Membership payment routes
 * Razorpay ONLY for memberships
 */

// Create Razorpay order
router.post(
  "/order",
  authenticate,
  createMembershipOrder
);

// Verify payment & activate membership
router.post(
  "/verify",
  authenticate,
  verifyMembershipPayment
);
// fetch and show data on profile
router.get(
  "/my",
  authenticate,
  membershipPaymentController.getMyMembership
);

module.exports = router;
