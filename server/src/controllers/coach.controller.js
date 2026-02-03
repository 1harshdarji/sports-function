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
      SELECT 
        id,
        user_id,
        first_name,
        last_name,
        specialization,
        experience_years,
        bio,
        hourly_rate,
        rating,
        total_reviews,
        is_available,
        profile_image
      FROM coaches
      WHERE is_available = 1
    `;

    const params = [];

    if (specialization) {
      query += ' AND specialization LIKE ?';
      params.push(`%${specialization}%`);
    }

    if (available === 'true') {
      query += ' AND is_available = 1';
    }

    query += ' ORDER BY rating DESC, experience_years DESC';

    const [coaches] = await db.execute(query, params);

    res.json({
      success: true,
      data: coaches.map(c => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        specialization: c.specialization,
        experienceYears: c.experience_years,
        bio: c.bio,
        hourlyRate: c.hourly_rate,
        rating: Number(c.rating),
        totalReviews: c.total_reviews,
        profile_image: c.profile_image,
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

    const [rows] = await db.execute(
      `
      SELECT 
        c.*,
        cr.age,
        cr.gender,
        cr.email,
        cr.phone,
        cr.preferred_location
      FROM coaches c
      LEFT JOIN coach_requests cr
        ON cr.user_id = c.user_id
       AND cr.status = 'approved'
      WHERE c.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    const coach = rows[0];

    res.json({
      success: true,
      data: {
        id: coach.id,
        name: `${coach.first_name} ${coach.last_name}`,
        specialization: coach.specialization,
        experienceYears: coach.experience_years,
        bio: coach.bio,
        hourlyRate: coach.hourly_rate,
        rating: Number(coach.rating),
        totalReviews: coach.total_reviews,
        // profile-only fields
        age: coach.age,
        gender: coach.gender,
        email: coach.email,
        phone: coach.phone,
        location: coach.preferred_location,
        profile_image: coach.profile_image,
        achievements: coach.achievements,    
        country: coach.country 
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
// Get logged-in user's coach profile
const getMyCoachProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT * FROM coaches WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        isCoach: false
      });
    }

    res.json({
      success: true,
      isCoach: true,
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
    getAllCoaches,
    getCoachById,
    createCoach,
    updateCoach,
    deleteCoach,
    getMyCoachProfile
};
