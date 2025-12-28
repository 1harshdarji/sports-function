/**
 * Admin Controller
 * Dashboard stats and management
 */

const db = require('../config/database');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
    try {
        // User stats
        const [userStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
                COUNT(CASE WHEN role = 'coach' THEN 1 END) as coaches,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d
            FROM users WHERE is_active = TRUE
        `);

        // Membership stats
        const [membershipStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_active,
                COUNT(CASE WHEN mp.duration_type = 'monthly' THEN 1 END) as monthly,
                COUNT(CASE WHEN mp.duration_type = 'yearly' THEN 1 END) as yearly
            FROM user_memberships um
            JOIN membership_plans mp ON um.plan_id = mp.id
            WHERE um.status = 'active' AND um.end_date >= CURDATE()
        `);

        // Booking stats
        const [bookingStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN booking_date = CURDATE() THEN 1 END) as today
            FROM bookings WHERE booking_date >= CURDATE()
        `);

        // Event stats
        const [eventStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_events,
                COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
                SUM(current_participants) as total_registrations
            FROM events WHERE event_date >= CURDATE()
        `);

        // Revenue stats
        const [revenueStats] = await db.execute(`
            SELECT 
                COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN status = 'completed' AND paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END), 0) as revenue_30d,
                COALESCE(SUM(CASE WHEN status = 'completed' AND paid_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN amount ELSE 0 END), 0) as revenue_7d,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
            FROM payments
        `);

        // Facility usage
        const [facilityStats] = await db.execute(`
            SELECT f.name, COUNT(b.id) as bookings_count
            FROM facilities f
            LEFT JOIN bookings b ON f.id = b.facility_id AND b.booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            WHERE f.is_active = TRUE
            GROUP BY f.id
            ORDER BY bookings_count DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                users: userStats[0],
                memberships: membershipStats[0],
                bookings: bookingStats[0],
                events: {
                    ...eventStats[0],
                    total_registrations: eventStats[0].total_registrations || 0
                },
                revenue: {
                    total: parseFloat(revenueStats[0].total_revenue) || 0,
                    last30Days: parseFloat(revenueStats[0].revenue_30d) || 0,
                    last7Days: parseFloat(revenueStats[0].revenue_7d) || 0,
                    pendingPayments: revenueStats[0].pending_payments
                },
                topFacilities: facilityStats.map(f => ({
                    name: f.name,
                    bookingsCount: f.bookings_count
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get revenue report
 */
const getRevenueReport = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        let dateFormat, groupClause;
        
        switch (groupBy) {
            case 'month':
                dateFormat = '%Y-%m';
                groupClause = 'DATE_FORMAT(paid_at, "%Y-%m")';
                break;
            case 'week':
                dateFormat = '%Y-%u';
                groupClause = 'YEARWEEK(paid_at)';
                break;
            default: // day
                dateFormat = '%Y-%m-%d';
                groupClause = 'DATE(paid_at)';
        }

        let query = `
            SELECT 
                DATE_FORMAT(paid_at, '${dateFormat}') as period,
                payment_type,
                COUNT(*) as transaction_count,
                SUM(amount) as total_amount
            FROM payments
            WHERE status = 'completed'
        `;
        const params = [];

        if (startDate) {
            query += ' AND paid_at >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND paid_at <= ?';
            params.push(endDate + ' 23:59:59');
        }

        query += ` GROUP BY ${groupClause}, payment_type ORDER BY period DESC`;

        const [revenue] = await db.execute(query, params);

        // Aggregate by period
        const aggregated = {};
        revenue.forEach(r => {
            if (!aggregated[r.period]) {
                aggregated[r.period] = {
                    period: r.period,
                    total: 0,
                    breakdown: {}
                };
            }
            aggregated[r.period].total += parseFloat(r.total_amount);
            aggregated[r.period].breakdown[r.payment_type] = {
                count: r.transaction_count,
                amount: parseFloat(r.total_amount)
            };
        });

        res.json({
            success: true,
            data: Object.values(aggregated)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get recent activity
 */
const getRecentActivity = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;

        // Combine recent users, bookings, payments
        const [users] = await db.execute(
            `SELECT 'user_registered' as type, id, CONCAT(first_name, ' ', last_name) as description, created_at
             FROM users ORDER BY created_at DESC LIMIT ?`,
            [parseInt(limit)]
        );

        const [bookings] = await db.execute(
            `SELECT 'booking_created' as type, b.id, 
                    CONCAT(u.first_name, ' booked ', f.name) as description, b.created_at
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN facilities f ON b.facility_id = f.id
             ORDER BY b.created_at DESC LIMIT ?`,
            [parseInt(limit)]
        );

        const [payments] = await db.execute(
            `SELECT 'payment_received' as type, p.id, 
                    CONCAT(u.first_name, ' paid ₹', p.amount) as description, p.created_at
             FROM payments p
             JOIN users u ON p.user_id = u.id
             WHERE p.status = 'completed'
             ORDER BY p.paid_at DESC LIMIT ?`,
            [parseInt(limit)]
        );

        // Combine and sort
        const activities = [...users, ...bookings, ...payments]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all pending bookings (Admin)
 */
const getPendingBookings = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
        b.id,
        b.user_id,
        u.username,
        u.email,
        b.facility_id,
        f.name AS facility_name,
        b.slot_id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.total_price,
        b.status,
        b.created_at
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN facilities f ON f.id = b.facility_id
       WHERE b.status = 'pending'
       ORDER BY b.created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve booking
 */
const approveBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.execute(
        `UPDATE bookings SET status = 'confirmed' WHERE id = ?`, // FIX: keep same status used everywhere
        [id]
    );


    res.json({
      success: true,
      message: "Booking approved",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject booking
 */
const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // get slot id
    const [[booking]] = await db.execute(
      `SELECT slot_id FROM bookings WHERE id=?`,
      [id]
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // reject booking
    await db.execute(
      `UPDATE bookings SET status='rejected' WHERE id=?`,
      [id]
    );

    // unlock slot
    await db.execute(
      `UPDATE facility_slots SET is_available=1 WHERE id=?`,
      [booking.slot_id]
    );

    res.json({
      success: true,
      message: "Booking rejected",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getDashboardStats,
  getRevenueReport,
  getRecentActivity,
  getPendingBookings,
  approveBooking,
  rejectBooking,
};
