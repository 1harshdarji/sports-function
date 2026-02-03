const router = require("express").Router();
const { authenticate } = require("../middleware/auth.middleware");

const {
  createCoachPaymentOrder,
  verifyCoachPayment,
} = require("../controllers/coachPayment.controller");

router.post("/create-order", authenticate, createCoachPaymentOrder);
router.post("/verify", authenticate, verifyCoachPayment);

module.exports = router;
