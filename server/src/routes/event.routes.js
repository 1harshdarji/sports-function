const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const eventController = require('../controllers/event.controller');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', authenticate, adminOnly, eventController.createEvent);
router.put('/:id', authenticate, adminOnly, eventController.updateEvent);
router.delete('/:id', authenticate, adminOnly, eventController.deleteEvent);
router.post('/:id/register', authenticate, eventController.registerForEvent);
router.delete('/:id/register', authenticate, eventController.unregisterFromEvent);

module.exports = router;
