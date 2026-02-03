const router = require("express").Router();
//const { getCoachRequests } = require("../controllers/adminCoach.controller");
const { authenticate, adminOnly } = require("../middleware/auth.middleware");
const {getCoachRequests,approveCoachRequest,rejectCoachRequest} = require("../controllers/adminCoach.controller");

router.get("/admin/coach-requests", authenticate, adminOnly, getCoachRequests);
router.post("/admin/coach-requests/:id/approve",authenticate,adminOnly,approveCoachRequest);
router.post("/admin/coach-requests/:id/reject",authenticate,adminOnly,rejectCoachRequest);

module.exports = router;
