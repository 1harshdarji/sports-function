/**
 * Event Controller
 * Event management and registration
 */

const db = require('../config/database');

/**
 * Get all events
 */
const getAllEvents = async (req, res, next) => {
    try {
        const { category, status, upcoming } = req.query;

        let query = `SELECT * FROM events WHERE 1=1`;
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (upcoming === 'true') {
            query += ' AND event_date >= CURDATE() AND status != ?';
            params.push('cancelled');
        }

        query += ' ORDER BY event_date ASC, start_time ASC';

        const [events] = await db.execute(query, params);

        res.json({
            success: true,
            data: events.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                category: e.category,
                imageUrl: e.image_url,
                date: e.event_date,
                startTime: e.start_time,
                endTime: e.end_time,
                location: e.location,
                maxParticipants: e.max_participants,
                currentParticipants: e.current_participants,
                price: parseFloat(e.price),
                isFree: e.is_free,
                status: e.status,
                spotsLeft: e.max_participants ? e.max_participants - e.current_participants : null
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [events] = await db.execute('SELECT * FROM events WHERE id = ?', [id]);

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const event = events[0];

        // Get registrations if user is admin
        let registrations = [];
        if (req.user && req.user.role === 'admin') {
            const [regs] = await db.execute(
                `SELECT er.*, u.username, u.email, u.first_name, u.last_name
                 FROM event_registrations er
                 JOIN users u ON er.user_id = u.id
                 WHERE er.event_id = ?`,
                [id]
            );
            registrations = regs;
        }

        res.json({
            success: true,
            data: {
                id: event.id,
                title: event.title,
                description: event.description,
                category: event.category,
                imageUrl: event.image_url,
                date: event.event_date,
                startTime: event.start_time,
                endTime: event.end_time,
                location: event.location,
                maxParticipants: event.max_participants,
                currentParticipants: event.current_participants,
                price: parseFloat(event.price),
                isFree: event.is_free,
                status: event.status,
                spotsLeft: event.max_participants ? event.max_participants - event.current_participants : null,
                registrations: registrations.map(r => ({
                    id: r.id,
                    userId: r.user_id,
                    username: r.username,
                    email: r.email,
                    name: `${r.first_name} ${r.last_name}`,
                    status: r.status,
                    registeredAt: r.registered_at
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create event (Admin only)
 */
const createEvent = async (req, res, next) => {
    try {
        const { title, description, category, imageUrl, date, startTime, endTime, 
                location, maxParticipants, price, isFree } = req.body;

        const [result] = await db.execute(
            `INSERT INTO events (title, description, category, image_url, event_date, 
             start_time, end_time, location, max_participants, price, is_free, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, category || null, imageUrl || null, date, 
             startTime, endTime || null, location || null, maxParticipants || null, 
             isFree ? 0 : (price || 0), isFree !== false, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update event (Admin only)
 */
const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category, imageUrl, date, startTime, endTime, 
                location, maxParticipants, price, isFree, status } = req.body;

        const [result] = await db.execute(
            `UPDATE events SET title = ?, description = ?, category = ?, image_url = ?,
             event_date = ?, start_time = ?, end_time = ?, location = ?, 
             max_participants = ?, price = ?, is_free = ?, status = ?
             WHERE id = ?`,
            [title, description, category, imageUrl, date, startTime, endTime, 
             location, maxParticipants, isFree ? 0 : price, isFree, status || 'upcoming', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete event (Admin only)
 */
const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check for registrations
        const [registrations] = await db.execute(
            `SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND status = 'registered'`,
            [id]
        );

        if (registrations[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete event with active registrations. Cancel it instead.'
            });
        }

        const [result] = await db.execute('DELETE FROM events WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Register for an event
 */
const registerForEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get event
        const [events] = await db.execute(
            'SELECT * FROM events WHERE id = ? AND status = ?',
            [id, 'upcoming']
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not available for registration'
            });
        }

        const event = events[0];

        // Check capacity
        if (event.max_participants && event.current_participants >= event.max_participants) {
            return res.status(400).json({
                success: false,
                message: 'Event is full'
            });
        }

        // Check if already registered
        const [existing] = await db.execute(
            `SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Already registered for this event'
            });
        }

        // Register
        await db.execute(
            `INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)`,
            [id, userId]
        );

        // Update participant count
        await db.execute(
            'UPDATE events SET current_participants = current_participants + 1 WHERE id = ?',
            [id]
        );

        res.status(201).json({
            success: true,
            message: 'Successfully registered for event',
            data: {
                eventTitle: event.title,
                eventDate: event.event_date,
                startTime: event.start_time
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Unregister from an event
 */
const unregisterFromEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check registration
        const [registrations] = await db.execute(
            `SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ? AND status = 'registered'`,
            [id, userId]
        );

        if (registrations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        // Update status to cancelled
        await db.execute(
            `UPDATE event_registrations SET status = 'cancelled' WHERE event_id = ? AND user_id = ?`,
            [id, userId]
        );

        // Update participant count
        await db.execute(
            'UPDATE events SET current_participants = GREATEST(current_participants - 1, 0) WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Successfully unregistered from event'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent
};
