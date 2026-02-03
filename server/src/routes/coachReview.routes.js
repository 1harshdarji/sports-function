const express = require("express");
const router = express.Router();
//console.log("coachReview.routes loaded");
const { authenticate } = require("../middleware/auth.middleware");
const { submitCoachReview } = require("../controllers/coachReview.controller");
// POST review
router.post("/", authenticate, submitCoachReview);

module.exports = router;
