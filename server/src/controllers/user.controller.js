/**
 * User Controller
 * Admin user management
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, username, email, first_name, last_name, phone, role, is_active, created_at
            FROM users WHERE 1=1
        `;
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (status === 'active') {
            query += ' AND is_active = TRUE';
        } else if (status === 'inactive') {
            query += ' AND is_active = FALSE';
        }

        if (search) {
            query += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Get total count
        const countQuery = query.replace('SELECT id, username, email, first_name, last_name, phone, role, is_active, created_at', 'SELECT COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;

        // Add pagination
        //query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        //params.push(parseInt(limit), parseInt(offset));
        // Add pagination (SAFE numeric injection)
        query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;



        const [users] = await db.execute(query, params);

        res.json({
            success: true,
            data: {
                users: users.map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    firstName: u.first_name,
                    lastName: u.last_name,
                    phone: u.phone,
                    role: u.role,
                    isActive: u.is_active,
                    createdAt: u.created_at
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID (Admin only)
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [users] = await db.execute(
            `SELECT id, username, email, first_name, last_name, phone, avatar_url, role, is_active, created_at
             FROM users WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Get membership info
        const [memberships] = await db.execute(
            `SELECT um.*, mp.name as plan_name
             FROM user_memberships um
             JOIN membership_plans mp ON um.plan_id = mp.id
             WHERE um.user_id = ? ORDER BY um.created_at DESC LIMIT 1`,
            [id]
        );

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                avatarUrl: user.avatar_url,
                role: user.role,
                isActive: user.is_active,
                createdAt: user.created_at,
                membership: memberships.length > 0 ? memberships[0] : null
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user (Admin only)
 */
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, isActive } = req.body;

        // Check if user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await db.execute(
            `UPDATE users SET first_name = ?, last_name = ?, phone = ?, is_active = ?
             WHERE id = ?`,
            [firstName, lastName, phone || null, isActive !== false, id]
        );

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change user role (Admin only)
 */
const changeUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Prevent changing own role
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        // Validate role
        if (!['user', 'coach', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be user, coach, or admin'
            });
        }

        const [result] = await db.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If promoted to coach, create coach profile if not exists
        if (role === 'coach') {
            const [existingCoach] = await db.execute(
                'SELECT id FROM coaches WHERE user_id = ?',
                [id]
            );

            if (existingCoach.length === 0) {
                await db.execute(
                    `INSERT INTO coaches (user_id, specialization, experience_years, bio)
                     VALUES (?, 'General Fitness', 0, 'New coach profile')`,
                    [id]
                );
            }
        }

        res.json({
            success: true,
            message: `User role changed to ${role}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get bookings of a specific user (Admin only)
 */
const getUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.status,
        f.name AS facility_name
      FROM bookings b
      JOIN facilities f ON b.facility_id = f.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
      `,
      [id]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable user (Soft delete)
 * Admin only
 */
const disableUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin disabling himself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot disable your own account",
      });
    }

    const [result] = await db.execute(
      "UPDATE users SET is_active = 0 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User disabled successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    getUserBookings,
    disableUser
};
