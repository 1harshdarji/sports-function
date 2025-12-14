const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const membershipController = require('../controllers/membership.controller');

router.get('/plans', membershipController.getAllPlans);
router.post('/plans', authenticate, adminOnly, membershipController.createPlan);
router.put('/plans/:id', authenticate, adminOnly, membershipController.updatePlan);
router.delete('/plans/:id', authenticate, adminOnly, membershipController.deletePlan);
router.post('/subscribe', authenticate, membershipController.subscribe);
router.get('/my', authenticate, membershipController.getMyMembership);
router.get('/', authenticate, adminOnly, membershipController.getAllMemberships);

module.exports = router;
