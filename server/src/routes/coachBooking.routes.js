const router = require("express").Router();
const { authenticate } = require("../middleware/auth.middleware");

const {
  testCoachBooking,
  createCoachBooking,
  getMyCoachBookings,
} = require("../controllers/coachBooking.controller");

// test route
router.get("/", testCoachBooking);

// create coach booking
router.post("/", authenticate, createCoachBooking);
router.get("/my", authenticate, getMyCoachBookings);

module.exports = router;
