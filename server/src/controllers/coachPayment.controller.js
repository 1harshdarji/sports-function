/**
 * Coach Booking Payment Controller
 * Razorpay ONLY for coach sessions
 */

const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const db = require("../config/database");

/**
 * Create Razorpay order for coach booking
 */
const createCoachPaymentOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
    }

    // 1️⃣ Fetch booking
    const [[booking]] = await db.execute(
      `SELECT * FROM coach_bookings 
       WHERE id = ? AND user_id = ? AND payment_status = 'pending'`,
      [bookingId, userId]
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already paid",
      });
    }

    // 2️⃣ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(booking.final_amount * 100),
      currency: "INR",
      receipt: `coach_booking_${booking.id}`,
    });

    // 3️⃣ Save payment record
    await db.execute(
      `INSERT INTO payments
       (user_id, amount, currency, payment_type, reference_id, gateway, gateway_order_id, status)
       VALUES (?, ?, 'INR', 'coach', ?, 'razorpay', ?, 'pending')`,
      [userId, booking.final_amount, booking.id, order.id]
    );

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment for coach booking
 */
const verifyCoachPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const userId = req.user.id;

    // 1️⃣ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 2️⃣ Get payment record
    const [[payment]] = await db.execute(
      `SELECT * FROM payments
       WHERE gateway_order_id = ? AND payment_type = 'coach'`,
      [razorpay_order_id]
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // 3️⃣ Mark booking as paid
    await db.execute(
      `UPDATE coach_bookings
       SET payment_status = 'paid'
       WHERE id = ?`,
      [payment.reference_id]
    );

    // 4️⃣ Update payment
    await db.execute(
      `UPDATE payments
       SET status='completed',
           gateway_payment_id=?,
           paid_at=NOW()
       WHERE id=?`,
      [razorpay_payment_id, payment.id]
    );

    res.json({
      success: true,
      message: "Coach booking payment successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCoachPaymentOrder,
  verifyCoachPayment,
};
