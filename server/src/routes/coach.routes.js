const router = require('express').Router();
/**
 * ✅ IMPORT ONLY FROM auth.middleware.js
 */
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

const coachController = require('../controllers/coach.controller');
/**
 * ================= PUBLIC ROUTES
 */
router.get('/', coachController.getAllCoaches);
router.get('/:id', coachController.getCoachById);
/**
 * ================= PROTECTED ROUTES
 */
router.post('/', authenticate, adminOnly, coachController.createCoach);
router.put('/:id', authenticate, coachController.updateCoach);
router.delete('/:id', authenticate, adminOnly, coachController.deleteCoach);

/**
 * ================= MY COACH PROFILE
 * uses SAME authenticate middleware
 */
router.get("/me", authenticate, coachController.getMyCoachProfile);

module.exports = router;
