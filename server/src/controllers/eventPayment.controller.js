/**
 * Event Payment Controller
 * Razorpay payment for event bookings ONLY
 */

const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const db = require("../config/database");

/**
 * Create Razorpay Order (EVENT)
 */
const createEventRazorpayOrder = async (req, res, next) => {
  try {
    const { eventId, slotId, quantity } = req.body;
    const userId = req.user.id;

    if (!eventId || !slotId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "eventId, slotId and quantity are required",
      });
    }

    // 1️⃣ Fetch event slot
    const [[slot]] = await db.execute(
      `SELECT price, total_seats, booked_seats
       FROM event_slots
       WHERE id = ? AND event_id = ?`,
      [slotId, eventId]
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Event slot not found",
      });
    }

    const remainingSeats = slot.total_seats - slot.booked_seats;

    if (quantity > remainingSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${remainingSeats} seats left`,
      });
    }
    
    // 🚫 BLOCK USER IF ALREADY BOOKED 3 FOR SAME SLOT
    const [[userSlotBooking]] = await db.execute(
      `
      SELECT COALESCE(SUM(quantity),0) AS booked
      FROM event_bookings
      WHERE user_id = ?
        AND event_id = ?
        AND slot_id = ?
        AND status IN ('pending','confirmed')
      `,
      [userId, eventId, slotId]
    );

    if (userSlotBooking.booked + quantity > 3) {
      return res.status(400).json({
        success: false,
        message: `You can book only ${
          3 - userSlotBooking.booked
        } more seat(s) for this time slot`,
      });
    }
    // 2️⃣ Calculate amount
    const amount = slot.price * quantity;

    // 3️⃣ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `event_${eventId}_slot_${slotId}`,
    });

    // 4️⃣ Store payment (PENDING)
    await db.execute(
      `INSERT INTO payments
       (user_id, amount, currency, payment_type, reference_id, gateway, gateway_order_id, status)
       VALUES (?, ?, 'INR', 'event', ?, 'razorpay', ?, 'pending')`,
      [userId, amount, slotId, order.id]
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
 * Verify Razorpay Payment & Create Event Booking
 */
const verifyEventRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    const userId = req.user.id;

    if (!bookingData) {
      return res.status(400).json({
        success: false,
        message: "bookingData is required",
      });
    }

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

    // 2️⃣ Check seat availability
    const [[slot]] = await db.execute(
      `SELECT total_seats, booked_seats
       FROM event_slots
       WHERE id = ?`,
      [bookingData.slotId]
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Event slot not found",
      });
    }

    if (slot.total_seats - slot.booked_seats < bookingData.quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough seats available",
      });
    }

    // 🚫 BLOCK: user already booked this slot
    const [[alreadyBooked]] = await db.execute(
      `
      SELECT COUNT(*) AS cnt
      FROM event_bookings
      WHERE user_id = ?
        AND event_id = ?
        AND slot_id = ?
        AND status = 'confirmed'
      `,
      [userId, bookingData.eventId, bookingData.slotId]
    );

    if (alreadyBooked.cnt > 0) {
      return res.status(400).json({
        success: false,
        message:
          "You have already booked this time slot. Please choose another time slot.",
      });
    }

    // 3️⃣ Create booking (ONLY ONCE)
    let bookingId;

    const [result] = await db.execute(
      `INSERT INTO event_bookings
       (user_id, event_id, slot_id, quantity, total_price, status)
       VALUES (?, ?, ?, ?, ?, 'confirmed')`,
      [
        userId,
        bookingData.eventId,
        bookingData.slotId,
        bookingData.quantity,
        bookingData.amount,
      ]
    );

    bookingId = result.insertId;

    // 4️⃣ Update seats
    await db.execute(
      `UPDATE event_slots
       SET booked_seats = booked_seats + ?
       WHERE id = ?`,
      [bookingData.quantity, bookingData.slotId]
    );

    // 5️⃣ Update payment record
    await db.execute(
      `UPDATE payments
       SET status = 'completed',
           reference_id = ?,
           gateway_payment_id = ?,
           paid_at = NOW()
       WHERE gateway_order_id = ?`,
      [bookingId, razorpay_payment_id, razorpay_order_id]
    );

    res.json({
      success: true,
      message: "Payment verified & event booking confirmed",
      data: { bookingId },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEventRazorpayOrder,
  verifyEventRazorpayPayment,
};
