const db = require('../config/database');
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createMembershipOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;

    // 1️⃣ Fetch plan
    const [plans] = await db.execute(
      "SELECT * FROM membership_plans WHERE id = ? AND is_active = 1",
      [planId]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    const plan = plans[0];

    // 2️⃣ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.price * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `membership_${userId}_${Date.now()}`,
    });

    // 3️⃣ Save pending payment
    const [result] = await db.execute(
      `INSERT INTO membership_payments 
       (user_id, plan_id, amount, currency, gateway_order_id, status)
       VALUES (?, ?, ?, 'INR', ?, 'pending')`,
      [userId, plan.id, plan.price, order.id]
    );

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        paymentRecordId: result.insertId,
        planName: plan.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyMembershipPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentRecordId,
    } = req.body;

    // 1️⃣ Signature verification
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

    // 2️⃣ Fetch payment record
    const [payments] = await db.execute(
      "SELECT * FROM membership_payments WHERE id = ? AND user_id = ?",
      [paymentRecordId, userId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const payment = payments[0];

    // 3️⃣ Fetch plan
    const [plans] = await db.execute(
      "SELECT * FROM membership_plans WHERE id = ?",
      [payment.plan_id]
    );

    const plan = plans[0];

    // 4️⃣ Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);

    const day = endDate.getDate();
    endDate.setMonth(endDate.getMonth() + plan.duration_months);

    // Fix month overflow (31 → 30/28)
    if (endDate.getDate() !== day) {
    endDate.setDate(0);
    }

    await db.execute(
        `UPDATE user_memberships 
        SET status = 'expired'
        WHERE user_id = ? AND status = 'active'`,
        [userId]
        );

    // 5️⃣ Create membership
    const [membershipResult] = await db.execute(
      `INSERT INTO user_memberships
       (user_id, plan_id, start_date, end_date, status, auto_renew)
       VALUES (?, ?, ?, ?, 'active', 0)`,
      [
        userId,
        plan.id,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ]
    );

    // 6️⃣ Update payment
    await db.execute(
      `UPDATE membership_payments
       SET status = 'completed',
           gateway_payment_id = ?,
           gateway_signature = ?,
           membership_id = ?
       WHERE id = ?`,
      [
        razorpay_payment_id,
        razorpay_signature,
        membershipResult.insertId,
        paymentRecordId,
      ]
    );

    res.json({
      success: true,
      message: "Membership activated successfully",
      data: {
        membershipId: membershipResult.insertId,
        startDate,  //startDate: startDate.toISOString().split("T")[0],
        endDate,    //endDate: endDate.toISOString().split("T")[0],
        planName: plan.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyMembership = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(`
      SELECT 
        um.id AS membership_id,
        um.start_date,
        um.end_date,
        um.status,
        um.created_at AS purchased_on,

        mp.name AS plan_name,
        mp.price AS amount_paid

      FROM user_memberships um
      JOIN membership_plans mp ON mp.id = um.plan_id
      WHERE um.user_id = ?
      AND um.status = 'active'
      LIMIT 1
    `, [userId]);

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    next(err);
  }
};


module.exports = {
  createMembershipOrder,
  verifyMembershipPayment,
  getMyMembership
};
