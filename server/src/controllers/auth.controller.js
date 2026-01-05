/**
 * Authentication Controller
 * Handles user registration, login, and profile
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName, phone, gender } = req.body;

        // Check if user already exists
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password yes
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.execute(
            `INSERT INTO users (username, email, password, first_name, last_name, gender, phone, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'user')`,
            [username, email, hashedPassword, firstName, lastName, gender, phone || null]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: result.insertId,
                    username,
                    email,
                    firstName,
                    lastName,
                    gender,
                    role: 'user'
                },
                token
            }
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Registration failed from backend",});
    };
}


/**
 * Login user with email/username and password
 */
const login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        // Find user by email or username
        const [users] = await db.execute(
            `SELECT id, username, email, password, first_name, last_name, gender, role, is_active, avatar_url
             FROM users WHERE email = ? OR username = ?`,
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }
        // ADMIN DISABLED
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Your account has been disabled. Contact admin.",
            });
            }


        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
       const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    gender: user.gender,
                    role: user.role,
                    avatarUrl: user.avatar_url
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 */
const getMe = async (req, res, next) => {
    try {
        const [users] = await db.execute(
            `SELECT id, username, email, first_name, last_name, phone, avatar_url, role, created_at
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Get active membership if exists
        const [memberships] = await db.execute(
            `SELECT um.*, mp.name as plan_name, mp.duration_type
             FROM user_memberships um
             JOIN membership_plans mp ON um.plan_id = mp.id
             WHERE um.user_id = ? AND um.status = 'active' AND um.end_date >= CURDATE()
             ORDER BY um.end_date DESC LIMIT 1`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,   // Added: match profile.controller
                last_name: user.last_name,     // Added
                phone: user.phone,
                avatar_url: user.avatar_url,
                role: user.role,
                created_at: user.created_at,
                membership: memberships.length > 0 ? memberships[0] : null
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, phone, avatarUrl } = req.body;

        await db.execute(
            `UPDATE users SET first_name = ?, last_name = ?, phone = ?, avatar_url = ?
             WHERE id = ?`,
            [firstName, lastName, phone || null, avatarUrl || null, req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get current password hash
        const [users] = await db.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, users[0].password);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
};
