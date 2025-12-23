/**
 * Profile Controller
 * Handles logged-in user profile data
 */

const db = require('../config/database');

/**
 * Get logged-in user's profile
 * Uses req.user.id (same pattern as auth.controller.js)
 */
const getProfile = async (req, res, next) => {
    try {
        // IMPORTANT:
        // We intentionally use req.user.id
        // This matches auth.middleware + auth.controller usage
        const userId = req.user.id;

        const [users] = await db.execute(
            `SELECT 
                id,
                username,
                email,
                first_name,
                last_name,
                age,
                gender,
                phone
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update logged-in user's profile
 * Only editable fields are updated
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // keep consistent everywhere

        const { age, gender, phone } = req.body;

        await db.execute(
            `UPDATE users
             SET age = ?, gender = ?, phone = ?
             WHERE id = ?`,
            [age, gender, phone || null, userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile
};
