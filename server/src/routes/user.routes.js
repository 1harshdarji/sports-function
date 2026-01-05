const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.use(authenticate, adminOnly);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.changeUserRole);
router.get('/:id/bookings', userController.getUserBookings);
router.put('/:id/disable', userController.disableUser);


module.exports = router;
