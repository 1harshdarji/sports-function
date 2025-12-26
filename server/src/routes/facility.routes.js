const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const facilityController = require('../controllers/facility.controller');

router.get('/', facilityController.getAllFacilities);
router.get('/:id', facilityController.getFacilityById);
router.post('/', authenticate, adminOnly, facilityController.createFacility);
router.put('/:id', authenticate, adminOnly, facilityController.updateFacility);
router.delete('/:id', authenticate, adminOnly, facilityController.deleteFacility);
router.get('/:id/slots', facilityController.getAvailableSlots);
router.post('/:id/slots', authenticate, adminOnly, facilityController.createSlot);

module.exports = router;
