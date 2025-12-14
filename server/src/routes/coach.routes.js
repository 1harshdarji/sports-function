const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const coachController = require('../controllers/coach.controller');

router.get('/', coachController.getAllCoaches);
router.get('/:id', coachController.getCoachById);
router.post('/', authenticate, adminOnly, coachController.createCoach);
router.put('/:id', authenticate, coachController.updateCoach);
router.delete('/:id', authenticate, adminOnly, coachController.deleteCoach);

module.exports = router;
