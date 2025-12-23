const express = require('express');
const router = express.Router();

// Reuse existing authentication middleware
const { authenticate } = require('../middleware/auth.middleware');

const {
    getProfile,
    updateProfile
} = require('../controllers/profile.controller');

// Profile APIs (protected)
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);

module.exports = router;
