/**
 * Booking Controller
 * Facility booking management
 */

const db = require('../config/database');

/**
 * Get user's bookings
 */
const getMyBookings = async (req, res, next) => {
    try {
        const { status, upcoming } = req.query;
        const userId = req.user.id;

        let query = `
            SELECT b.*, f.name as facility_name, f.category, f.image_url
            FROM bookings b
            JOIN facilities f ON b.facility_id = f.id
            WHERE b.user_id = ?
            AND b.status IN ('pending', 'confirmed')
        `;
        const params = [userId];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (upcoming === 'true') {
            query += ' AND b.booking_date >= CURDATE()';
        }

        query += ' ORDER BY b.booking_date DESC, b.start_time DESC';

        const [bookings] = await db.execute(query, params);

        res.json({
            success: true,
            data: bookings.map(b => ({
                id: b.id,
                facility: {
                    id: b.facility_id,
                    name: b.facility_name,
                    category: b.category,
                    imageUrl: b.image_url
                },
                date: b.booking_date,
                startTime: b.start_time,
                endTime: b.end_time,
                totalPrice: parseFloat(b.total_price),
                status: b.status,
                notes: b.notes,
                createdAt: b.created_at
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a booking
 */
const createBooking = async (req, res, next) => {
    try {
        const { facilityId, slotId, date, startTime, endTime, notes } = req.body;
        const userId = req.user.id;

        // Get facility details
        const [facilities] = await db.execute(
            'SELECT * FROM facilities WHERE id = ? AND is_active = TRUE',
            [facilityId]
        );

        if (facilities.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found or inactive'
            });
        }

        const facility = facilities[0];

        // Check if slot is available
        const [existingBooking] = await db.execute(
            `SELECT id FROM bookings 
             WHERE facility_id = ? AND booking_date = ? 
             AND start_time = ? AND end_time = ?
             AND status IN ('pending', 'confirmed')`,
            [facilityId, date, startTime, endTime]
        );

        if (existingBooking.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'This slot is already booked'
            });
        }

        // Calculate price (hours * price per hour)
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        const totalPrice = hours * parseFloat(facility.price_per_hour);

        // Create booking
        const [result] = await db.execute(
            `INSERT INTO bookings (user_id, facility_id, slot_id, booking_date, start_time, end_time, total_price, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, facilityId, slotId, date, startTime, endTime, totalPrice, notes || null]
        );
        await db.execute(
            'UPDATE facility_slots SET is_available = FALSE WHERE id = ?',
            [slotId]
        );

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                id: result.insertId,
                facilityName: facility.name,
                date,
                startTime,
                endTime,
                totalPrice,
                status: 'pending'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel a booking
 */
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Get booking
        let query = 'SELECT * FROM bookings WHERE id = ?';
        const params = [id];

        if (!isAdmin) {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const [bookings] = await db.execute(query, params);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const booking = bookings[0];

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed booking'
            });
        }

        // Update status
        await db.execute(
            'UPDATE bookings SET status = ? WHERE id = ?',
            ['cancelled', id]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all bookings (Admin only)
 */
const getAllBookings = async (req, res, next) => {
    try {
        const { status, facilityId, date, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT b.*, f.name as facility_name, f.category,
                   u.username, u.email, u.first_name, u.last_name
            FROM bookings b
            JOIN facilities f ON b.facility_id = f.id
            JOIN users u ON b.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (facilityId) {
            query += ' AND b.facility_id = ?';
            params.push(facilityId);
        }

        if (date) {
            query += ' AND b.booking_date = ?';
            params.push(date);
        }

        query += ' ORDER BY b.booking_date DESC, b.start_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [bookings] = await db.execute(query, params);

        res.json({
            success: true,
            data: bookings.map(b => ({
                id: b.id,
                user: {
                    id: b.user_id,
                    username: b.username,
                    email: b.email,
                    name: `${b.first_name} ${b.last_name}`
                },
                facility: {
                    id: b.facility_id,
                    name: b.facility_name,
                    category: b.category
                },
                date: b.booking_date,
                startTime: b.start_time,
                endTime: b.end_time,
                totalPrice: parseFloat(b.total_price),
                status: b.status,
                notes: b.notes,
                createdAt: b.created_at
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update booking status (Admin only)
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const [result] = await db.execute(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: `Booking status updated to ${status}`
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Admin: Approve booking
 */
const approveBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check booking exists
    const [rows] = await db.execute(
      `SELECT * FROM bookings WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = rows[0];

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Booking is not pending",
      });
    }

    // Approve booking
    await db.execute(
      `UPDATE bookings SET status = 'confirmed' WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Booking approved successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
    getMyBookings,
    createBooking,
    cancelBooking,
    getAllBookings,
    updateBookingStatus,
    approveBooking,
};
