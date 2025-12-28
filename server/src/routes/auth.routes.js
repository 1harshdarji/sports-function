const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

// Register done
router.post('/register', [
    body('username').trim().isLength({ min: 3, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('gender').isIn(['male', 'female', 'other']),

    validate
], authController.register);

// Login
router.post('/login', [
    body('identifier').trim().notEmpty(),
    body('password').notEmpty(),
    validate
], authController.login);

// Get current user
router.get('/me', authenticate, authController.getMe);

// Update profile hello
router.put('/profile', authenticate, authController.updateProfile);

// Change password
router.put('/password', authenticate, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    validate
], authController.changePassword);

module.exports = router;
