/**
 * Payment Controller
 * Dummy payment handling (Razorpay/Stripe ready)
 */

const db = require('../config/database');

/**
 * Create a payment (initiate)
 */
const createPayment = async (req, res, next) => {
    try {
        const {amount, paymentType, paymentMethod, facilityId, bookingDate, startTime, endTime} = req.body;
        const userId = req.user.id;

        // Validate payment type
        if (!['membership', 'booking', 'event', 'other'].includes(paymentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment type'
            });
        }

        // Generate dummy transaction ID
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create payment record
        const [result] = await db.execute(
            `INSERT INTO payments (user_id, amount, payment_type, reference_id, payment_method, 
             transaction_id, status, metadata)
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [userId, amount, paymentType, referenceId || null, paymentMethod || 'card', 
             transactionId, JSON.stringify({ initiated_at: new Date().toISOString() })]
        );

        // DUMMY: In production, integrate with Razorpay/Stripe here
        // For now, we simulate a successful payment
// TEMP: Immediately create booking (demo flow)
        let bookingId = null;

        if (paymentType === 'booking') {
            const [bookingResult] = await db.execute(
                `INSERT INTO bookings 
                (user_id, facility_id, booking_date, start_time, end_time, total_price, status)
                VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
                [
                    userId,
                    facilityId,
                    bookingDate,
                    startTime,
                    endTime,
                    amount
                ]
            );

            bookingId = bookingResult.insertId;

            // Link booking to payment
            await db.execute(
                `UPDATE payments SET reference_id = ?, status = 'completed', paid_at = NOW()
                WHERE id = ?`,
                [bookingId, result.insertId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Payment initiated',
            data: {
                paymentId: result.insertId,
                transactionId,
                amount: parseFloat(amount),
                status: 'pending',
                // In production, return gateway order ID for frontend
                bookingId

            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Confirm payment (webhook simulation)
 * In production, this would be called by payment gateway webhook
 */
const confirmPayment = async (req, res, next) => {
    try {
        const { paymentId, gatewayPaymentId } = req.body;

        const [payments] = await db.execute(
            'SELECT * FROM payments WHERE id = ?',
            [paymentId]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const payment = payments[0];

        if (payment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed'
            });
        }

        // Update payment status
        await db.execute(
            `UPDATE payments SET status = 'completed', gateway_payment_id = ?, paid_at = NOW()
             WHERE id = ?`,
            [gatewayPaymentId || `PAY_${Date.now()}`, paymentId]
        );

        // Activate related subscription/booking
        if (payment.payment_type === 'membership' && payment.reference_id) {
            await db.execute(
                `UPDATE user_memberships SET status = 'active' WHERE id = ?`,
                [payment.reference_id]
            );
        } else if (payment.payment_type === 'booking' && payment.reference_id) {
            await db.execute(
                `UPDATE bookings SET status = 'confirmed' WHERE id = ?`,
                [payment.reference_id]
            );
        }

        res.json({
            success: true,
            message: 'Payment confirmed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's payment history
 */
const getMyPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [payments] = await db.execute(
            `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [req.user.id, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: payments.map(p => ({
                id: p.id,
                amount: parseFloat(p.amount),
                currency: p.currency,
                paymentType: p.payment_type,
                referenceId: p.reference_id,
                paymentMethod: p.payment_method,
                transactionId: p.transaction_id,
                status: p.status,
                paidAt: p.paid_at,
                createdAt: p.created_at
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all payments (Admin only)
 */
const getAllPayments = async (req, res, next) => {
    try {
        const { status, paymentType, startDate, endDate, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, u.username, u.email, u.first_name, u.last_name
            FROM payments p
            JOIN users u ON p.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        if (paymentType) {
            query += ' AND p.payment_type = ?';
            params.push(paymentType);
        }

        if (startDate) {
            query += ' AND p.created_at >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND p.created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [payments] = await db.execute(query, params);

        // Get totals
        const [totals] = await db.execute(
            `SELECT 
                COUNT(*) as total_count,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
             FROM payments`
        );

        res.json({
            success: true,
            data: {
                payments: payments.map(p => ({
                    id: p.id,
                    user: {
                        id: p.user_id,
                        username: p.username,
                        email: p.email,
                        name: `${p.first_name} ${p.last_name}`
                    },
                    amount: parseFloat(p.amount),
                    currency: p.currency,
                    paymentType: p.payment_type,
                    referenceId: p.reference_id,
                    paymentMethod: p.payment_method,
                    transactionId: p.transaction_id,
                    gatewayPaymentId: p.gateway_payment_id,
                    status: p.status,
                    paidAt: p.paid_at,
                    createdAt: p.created_at
                })),
                summary: {
                    totalCount: totals[0].total_count,
                    totalRevenue: parseFloat(totals[0].total_revenue) || 0,
                    completedCount: totals[0].completed_count,
                    pendingCount: totals[0].pending_count,
                    failedCount: totals[0].failed_count
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment status (Admin only)
 */
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, gatewayPaymentId } = req.body;

        if (!['pending', 'processing', 'completed', 'failed', 'refunded'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updateFields = ['status = ?'];
        const params = [status];

        if (gatewayPaymentId) {
            updateFields.push('gateway_payment_id = ?');
            params.push(gatewayPaymentId);
        }

        if (status === 'completed') {
            updateFields.push('paid_at = NOW()');
        }

        params.push(id);

        const [result] = await db.execute(
            `UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            message: `Payment status updated to ${status}`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPayment,
    confirmPayment,
    getMyPayments,
    getAllPayments,
    updatePaymentStatus
};
