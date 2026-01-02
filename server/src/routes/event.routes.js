const express = require('express');
const router = express.Router();

const controller = require('../controllers/event.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

// PUBLIC
router.get('/', controller.getAllEvents);
router.get('/:id', controller.getEventById);
router.get("/:id/slots", controller.getEventSlotsByDate);

// USER (BOOK EVENT)
router.post('/book', authenticate, controller.bookEvent);

// ADMIN
router.post('/', authenticate, adminOnly, controller.createEvent);

router.get("/my/bookings", authenticate, controller.getMyEventBookings);



module.exports = router;
    