/**
 * Facility Controller
 * Facility management and slot handling
 */

const db = require('../config/database');

/**
 * Get all facilities
 */
const getAllFacilities = async (req, res, next) => {
    try {
        const { category, active } = req.query;

        let query = `SELECT * FROM facilities WHERE 1=1`;
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (active !== 'false') {
            query += ' AND is_active = TRUE';
        }

        query += ' ORDER BY category, name';

        const [facilities] = await db.execute(query, params);

        res.json({
            success: true,
            data: facilities.map(f => ({
                id: f.id,
                name: f.name,
                sportKey: f.sport_key,//added
                description: f.description,
                category: f.category,
                location: f.location,
                imageUrl: f.image_url,
                capacity: f.capacity,
                pricePerHour: parseFloat(f.price_per_hour),
                amenities: Array.isArray(f.amenities)
                    ? f.amenities
                    : (f.amenities ? JSON.parse(f.amenities) : []),
                isActive: f.is_active
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get facility by ID
 */
const getFacilityById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [facilities] = await db.execute(
            'SELECT * FROM facilities WHERE id = ?',
            [id]
        );

        if (facilities.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        const facility = facilities[0];

        res.json({
            success: true,
            data: {
                id: facility.id,
                name: facility.name,
                sportKey: facility.sport_key,
                description: facility.description,
                category: facility.category,
                location: facility.location,
                imageUrl: facility.image_url,
                capacity: facility.capacity,
                pricePerHour: parseFloat(facility.price_per_hour),
                amenities: Array.isArray(facility.amenities)
                    ? facility.amenities
                    : (facility.amenities ? JSON.parse(facility.amenities) : []),
                isActive: facility.is_active
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Create facility (Admin only)
 */
const createFacility = async (req, res, next) => {
    try {
        const { name, description, category = null, imageUrl = null, capacity = 1, pricePerHour = null, amenities = [] } = req.body;

        const [result] = await db.execute(
            `INSERT INTO facilities (name, description, category, image_url, capacity, price_per_hour, amenities)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, description, category, imageUrl || null, capacity || 1, pricePerHour, JSON.stringify(amenities || [])]
        );

        res.status(201).json({
            success: true,
            message: 'Facility created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update facility (Admin only)
 */
const updateFacility = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, category, imageUrl, capacity, pricePerHour, amenities, isActive } = req.body;

        const [result] = await db.execute(
            `UPDATE facilities 
             SET name = ?, description = ?, category = ?, image_url = ?, 
                 capacity = ?, price_per_hour = ?, amenities = ?, is_active = ?
             WHERE id = ?`,
            [name, description, category, imageUrl || null, capacity, pricePerHour, 
             JSON.stringify(amenities || []), isActive !== false, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        res.json({
            success: true,
            message: 'Facility updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete facility (Admin only)
 */
const deleteFacility = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check for upcoming bookings
        const [upcomingBookings] = await db.execute(
            `SELECT COUNT(*) as count FROM bookings 
             WHERE facility_id = ? AND booking_date >= CURDATE() AND status IN ('pending', 'confirmed')`,
            [id]
        );

        if (upcomingBookings[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete facility with upcoming bookings'
            });
        }

        const [result] = await db.execute('DELETE FROM facilities WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        res.json({
            success: true,
            message: 'Facility deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get available slots for a facility on a specific date
 */
const getAvailableSlots = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

            const bookingDate = new Date(date);
            // JS: 0=Sunday, 1=Monday ... 6=Saturday
            const jsDay = bookingDate.getDay();
            // DB: 1=Monday ... 7=Sunday
            const dayOfWeek = jsDay === 0 ? 7 : jsDay;

        // Get all slots for this day
        const [slots] = await db.execute(
            `SELECT * FROM facility_slots 
             WHERE facility_id = ? AND day_of_week = ? AND is_available = TRUE`,
            [id, dayOfWeek]
        );

        // Get already booked slots
        const [bookedSlots] = await db.execute(
            `SELECT start_time, end_time FROM bookings 
             WHERE facility_id = ? AND booking_date = ? AND status IN ('pending', 'confirmed')`,
            [id, date]
        );

        // Filter out booked slots
        const availableSlots = slots.filter(slot => {
            return !bookedSlots.some(booked => 
                slot.start_time === booked.start_time && slot.end_time === booked.end_time
            );
        });

        res.json({
            success: true,
            data: {
                date,
                slots: availableSlots.map(s => ({
                    id: s.id,
                    startTime: s.start_time,
                    endTime: s.end_time,
                    isAvailable: s.is_available
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create slot for facility (Admin only)
 */
const createSlot = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { dayOfWeek, startTime, endTime } = req.body;

        // Check if slot overlaps with existing
        const [existing] = await db.execute(
            `SELECT id FROM facility_slots 
             WHERE facility_id = ? AND day_of_week = ? 
             AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
            [id, dayOfWeek, startTime, startTime, endTime, endTime]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Slot overlaps with existing slot'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO facility_slots (facility_id, day_of_week, start_time, end_time)
             VALUES (?, ?, ?, ?)`,
            [id, dayOfWeek, startTime, endTime]
        );

        res.status(201).json({
            success: true,
            message: 'Slot created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility,
    getAvailableSlots,
    createSlot
};
