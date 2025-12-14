/**
 * Coach Controller
 * Coach profile management
 */

const db = require('../config/database');

/**
 * Get all coaches
 */
const getAllCoaches = async (req, res, next) => {
    try {
        const { specialization, available } = req.query;

        let query = `
            SELECT c.*, u.username, u.email, u.first_name, u.last_name, u.avatar_url, u.phone
            FROM coaches c
            JOIN users u ON c.user_id = u.id
            WHERE u.is_active = TRUE
        `;
        const params = [];

        if (specialization) {
            query += ' AND c.specialization LIKE ?';
            params.push(`%${specialization}%`);
        }

        if (available === 'true') {
            query += ' AND c.is_available = TRUE';
        }

        query += ' ORDER BY c.rating DESC, c.experience_years DESC';

        const [coaches] = await db.execute(query, params);

        res.json({
            success: true,
            data: coaches.map(c => ({
                id: c.id,
                userId: c.user_id,
                username: c.username,
                email: c.email,
                name: `${c.first_name} ${c.last_name}`,
                avatarUrl: c.avatar_url,
                phone: c.phone,
                specialization: c.specialization,
                experienceYears: c.experience_years,
                bio: c.bio,
                certifications: c.certifications ? JSON.parse(c.certifications) : [],
                hourlyRate: c.hourly_rate ? parseFloat(c.hourly_rate) : null,
                availability: c.availability ? JSON.parse(c.availability) : null,
                rating: parseFloat(c.rating),
                totalReviews: c.total_reviews,
                isAvailable: c.is_available
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get coach by ID
 */
const getCoachById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [coaches] = await db.execute(
            `SELECT c.*, u.username, u.email, u.first_name, u.last_name, u.avatar_url, u.phone
             FROM coaches c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (coaches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        const coach = coaches[0];

        res.json({
            success: true,
            data: {
                id: coach.id,
                userId: coach.user_id,
                username: coach.username,
                email: coach.email,
                name: `${coach.first_name} ${coach.last_name}`,
                avatarUrl: coach.avatar_url,
                phone: coach.phone,
                specialization: coach.specialization,
                experienceYears: coach.experience_years,
                bio: coach.bio,
                certifications: coach.certifications ? JSON.parse(coach.certifications) : [],
                hourlyRate: coach.hourly_rate ? parseFloat(coach.hourly_rate) : null,
                availability: coach.availability ? JSON.parse(coach.availability) : null,
                rating: parseFloat(coach.rating),
                totalReviews: coach.total_reviews,
                isAvailable: coach.is_available
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create coach profile (Admin only)
 */
const createCoach = async (req, res, next) => {
    try {
        const { userId, specialization, experienceYears, bio, certifications, hourlyRate, availability } = req.body;

        // Check if user exists and is not already a coach
        const [users] = await db.execute('SELECT id, role FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const [existingCoach] = await db.execute('SELECT id FROM coaches WHERE user_id = ?', [userId]);

        if (existingCoach.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already has a coach profile'
            });
        }

        // Create coach profile
        const [result] = await db.execute(
            `INSERT INTO coaches (user_id, specialization, experience_years, bio, certifications, hourly_rate, availability)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, specialization, experienceYears || 0, bio || null, 
             JSON.stringify(certifications || []), hourlyRate || null, 
             availability ? JSON.stringify(availability) : null]
        );

        // Update user role to coach
        await db.execute('UPDATE users SET role = ? WHERE id = ?', ['coach', userId]);

        res.status(201).json({
            success: true,
            message: 'Coach profile created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update coach profile (Admin or self)
 */
const updateCoach = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { specialization, experienceYears, bio, certifications, hourlyRate, availability, isAvailable } = req.body;

        // Check ownership or admin
        const [coaches] = await db.execute('SELECT user_id FROM coaches WHERE id = ?', [id]);

        if (coaches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        if (req.user.role !== 'admin' && coaches[0].user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        await db.execute(
            `UPDATE coaches SET specialization = ?, experience_years = ?, bio = ?, 
             certifications = ?, hourly_rate = ?, availability = ?, is_available = ?
             WHERE id = ?`,
            [specialization, experienceYears, bio, JSON.stringify(certifications || []), 
             hourlyRate, availability ? JSON.stringify(availability) : null, 
             isAvailable !== false, id]
        );

        res.json({
            success: true,
            message: 'Coach profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete coach profile (Admin only)
 */
const deleteCoach = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [coaches] = await db.execute('SELECT user_id FROM coaches WHERE id = ?', [id]);

        if (coaches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Delete coach profile
        await db.execute('DELETE FROM coaches WHERE id = ?', [id]);

        // Revert user role to 'user'
        await db.execute('UPDATE users SET role = ? WHERE id = ?', ['user', coaches[0].user_id]);

        res.json({
            success: true,
            message: 'Coach profile deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCoaches,
    getCoachById,
    createCoach,
    updateCoach,
    deleteCoach
};
