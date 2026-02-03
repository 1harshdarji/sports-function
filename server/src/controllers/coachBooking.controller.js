/**
 * Coach Booking Controller
 * Handles monthly coach sessions
 */

const db = require("../config/database");

/**
 * Test endpoint
 */
const testCoachBooking = async (req, res) => {
  res.json({
    success: true,
    message: "Coach booking module is active",
  });
};

/**
 * Create coach booking (monthly)
 */
const createCoachBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { coachId, firstName, lastName } = req.body;

    if (!coachId) {
      return res.status(400).json({
        success: false,
        message: "coachId is required",
      });
    }

    // 1️⃣ Check coach exists
    const [[coach]] = await db.execute(
      "SELECT id, hourly_rate FROM coaches WHERE id = ? AND is_available = 1",
      [coachId]
    );


    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found or unavailable",
      });
    }

    // 2️⃣ Check active booking
    const [[active]] = await db.execute(
      `SELECT id FROM coach_bookings
       WHERE user_id = ? AND coach_id = ?
       AND payment_status = 'paid'
       AND end_date >= CURDATE()`,
      [userId, coachId]
    );

    if (active) {
      return res.status(400).json({
        success: false,
        message: "You already have an active booking with this coach",
      });
    }

    // 3️⃣ Get active membership
    const [[membership]] = await db.execute(
      `SELECT um.*, mp.name
       FROM user_memberships um
       JOIN membership_plans mp ON um.plan_id = mp.id
       WHERE um.user_id = ?
       AND um.status = 'active'
       AND um.end_date >= CURDATE()`,
      [userId]
    );

    // 4️⃣ Pricing
    const BASE_PRICE = Number(coach.hourly_rate); 
    let discountPercent = 0;

    if (membership && membership.name === "Elite") {
      discountPercent = 25;
    }

    const finalAmount =
      BASE_PRICE - (BASE_PRICE * discountPercent) / 100;

    // 5️⃣ Date calculation
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 6️⃣ Insert booking
    const [result] = await db.execute(
      `INSERT INTO coach_bookings
       (user_id, coach_id, participant_first_name,
        participant_last_name,start_date, end_date,
        base_price, discount_percent, final_amount, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        coachId,
        firstName,
        lastName,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        BASE_PRICE,
        discountPercent,
        finalAmount,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Coach booking created (payment pending)",
      data: {
        bookingId: result.insertId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        basePrice: BASE_PRICE,
        discountPercent,
        finalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getMyCoachBookings = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT cb.*,
     CONCAT(c.first_name, ' ', c.last_name) AS coach_name,
     c.specialization
     FROM coach_bookings cb
     JOIN coaches c ON cb.coach_id = c.id
     WHERE cb.user_id = ?`,
    [req.user.id]
  );

  res.json({ success: true, data: rows });
};


module.exports = {
  testCoachBooking,
  createCoachBooking,
  getMyCoachBookings,
};

