const db = require("../config/database");

/**
 * Submit coach review
 */
const submitCoachReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { coachId, bookingId, rating, review } = req.body;

    if (!coachId || !bookingId || !rating) {
    return res.status(400).json({
        success: false,
        message: "coachId, bookingId and rating are required",
    });
    }

    // 🔹 fetch participant name from coach_bookings
    const [[booking]] = await db.execute(
    `
    SELECT participant_first_name, participant_last_name
    FROM coach_bookings
    WHERE id = ? AND user_id = ? AND coach_id = ? AND payment_status = 'paid'
    `,
    [bookingId, userId, coachId]
    );

    if (!booking) {
    return res.status(403).json({
        success: false,
        message: "Invalid or unpaid booking",
    });
    }

    const {
    participant_first_name,
    participant_last_name,
    } = booking;


    // 1️⃣ Save review
    await db.execute(
    `
    INSERT INTO coach_reviews
    (user_id, coach_id, booking_id, rating, review)
    VALUES (?, ?, ?, ?, ?)

    `,
    [
        userId,
        coachId,
        bookingId,
        rating,
        review || null,
    ]
    );

    // 2️⃣ Recalculate coach rating
    await db.execute(
      `
      UPDATE coaches
        SET
        rating = (
            SELECT ROUND(AVG(rating), 1)
            FROM coach_reviews
            WHERE coach_id = ?
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM coach_reviews
            WHERE coach_id = ?
        )
        WHERE id = ?
      `,
      [coachId, coachId, coachId]
    );

    res.json({
      success: true,
      message: "Review submitted successfully",
    });
  } catch (err) {
    // ✅ Handle duplicate review gracefully
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this coach",
        });
    }

    // ❌ Only log unexpected errors
    console.error("Submit review failed:", err);

    res.status(500).json({
        success: false,
        message: "Failed to submit review",
    });
  }

};

module.exports = { submitCoachReview };
