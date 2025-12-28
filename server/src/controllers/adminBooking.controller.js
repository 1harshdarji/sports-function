const db = require("../config/database");

/**
 * GET all pending bookings
 */
exports.getPendingBookings = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.total_price,
        b.status,
        u.username,
        u.email,
        f.name AS facility_name,
        s.id AS slot_id
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN facilities f ON b.facility_id = f.id
      JOIN facility_slots s ON b.slot_id = s.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET PENDING BOOKINGS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * APPROVE booking
 */
exports.approveBooking = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute(
      `UPDATE bookings SET status = 'confirmed' WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Booking approved",
    });
  } catch (err) {
    console.error("APPROVE BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * REJECT booking
 */
exports.rejectBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // get slot id
    const [[booking]] = await db.execute(
      `SELECT slot_id FROM bookings WHERE id = ?`,
      [id]
    );

    // reject booking
    await db.execute(
      `UPDATE bookings SET status = 'rejected' WHERE id = ?`,
      [id]
    );

    // make slot available again
    await db.execute(
      `UPDATE facility_slots SET is_available = 1 WHERE id = ?`,
      [booking.slot_id]
    );

    res.json({
      success: true,
      message: "Booking rejected",
    });
  } catch (err) {
    console.error("REJECT BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
