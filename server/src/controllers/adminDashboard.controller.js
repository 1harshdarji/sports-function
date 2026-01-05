const db = require("../config/database");

/**
 * Admin Dashboard Summary
 */
exports.getDashboardData = async (req, res) => {
  try {
    // 1. Total Members (ONLY users)
    const [[membersCount]] = await db.execute(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'user'
    `);

    // 2. Active Bookings (confirmed only)
    const [[activeBookings]] = await db.execute(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE status = 'confirmed'
    `);

    // 3. Recent Members (membership taken recently)
    const [recentMembers] = await db.execute(`
      SELECT 
        u.username,
        u.email,
        mp.name AS plan,
        um.created_at
      FROM user_memberships um
      JOIN users u ON u.id = um.user_id
      JOIN membership_plans mp ON mp.id = um.plan_id
      ORDER BY um.created_at DESC
      LIMIT 5
    `);

    // 4. Today's Bookings
    const [todaysBookings] = await db.execute(`
      SELECT
        u.username,
        f.name AS facility_name,
        b.status
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN facilities f ON f.id = b.facility_id
      WHERE DATE(b.booking_date) = CURDATE()
      ORDER BY b.updated_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalMembers: membersCount.total,
        activeBookings: activeBookings.total,
        recentMembers,
        todaysBookings,
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
