/**
 * Membership Controller
 * Plans and user subscriptions
 */

const db = require('../config/database');

/**
 * Get all membership plans
 */
const getAllPlans = async (req, res, next) => {
    try {
        const [plans] = await db.execute(
            `SELECT id, name, description, duration_type, duration_months, price, features, is_active
             FROM membership_plans WHERE is_active = TRUE ORDER BY price ASC`
        );

        res.json({
            success: true,
            data: plans.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                durationType: p.duration_type,
                durationMonths: p.duration_months,
                price: parseFloat(p.price),
                features: p.features ? JSON.parse(p.features) : [],
                isActive: p.is_active
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create membership plan (Admin only)
 */
const createPlan = async (req, res, next) => {
    try {
        const { name, description, durationType, durationMonths, price, features } = req.body;

        const [result] = await db.execute(
            `INSERT INTO membership_plans (name, description, duration_type, duration_months, price, features)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, durationType, durationMonths, price, JSON.stringify(features || [])]
        );

        res.status(201).json({
            success: true,
            message: 'Membership plan created',
            data: { id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update membership plan (Admin only)
 */
const updatePlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, durationType, durationMonths, price, features, isActive } = req.body;

        const [result] = await db.execute(
            `UPDATE membership_plans 
             SET name = ?, description = ?, duration_type = ?, duration_months = ?, 
                 price = ?, features = ?, is_active = ?
             WHERE id = ?`,
            [name, description, durationType, durationMonths, price, JSON.stringify(features || []), isActive !== false, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.json({
            success: true,
            message: 'Plan updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete membership plan (Admin only)
 */
const deletePlan = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check for active subscriptions
        const [activeSubscriptions] = await db.execute(
            `SELECT COUNT(*) as count FROM user_memberships 
             WHERE plan_id = ? AND status = 'active'`,
            [id]
        );

        if (activeSubscriptions[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete plan with active subscriptions. Deactivate it instead.'
            });
        }

        const [result] = await db.execute('DELETE FROM membership_plans WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.json({
            success: true,
            message: 'Plan deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Subscribe to a plan
 */
const subscribe = async (req, res, next) => {
    try {
        const { planId, autoRenew } = req.body;
        const userId = req.user.id;

        // Get plan details
        const [plans] = await db.execute(
            'SELECT * FROM membership_plans WHERE id = ? AND is_active = TRUE',
            [planId]
        );

        if (plans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found or inactive'
            });
        }

        const plan = plans[0];

        // Check for existing active membership
        const [existing] = await db.execute(
            `SELECT id FROM user_memberships 
             WHERE user_id = ? AND status = 'active' AND end_date >= CURDATE()`,
            [userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active membership'
            });
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.duration_months);

        // Create membership (pending payment)
        const [result] = await db.execute(
            `INSERT INTO user_memberships (user_id, plan_id, start_date, end_date, status, auto_renew)
             VALUES (?, ?, ?, ?, 'pending', ?)`,
            [userId, planId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], autoRenew || false]
        );

        res.status(201).json({
            success: true,
            message: 'Subscription created. Complete payment to activate.',
            data: {
                membershipId: result.insertId,
                planName: plan.name,
                amount: parseFloat(plan.price),
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's membership
 */
const getMyMembership = async (req, res, next) => {
    try {
        const [memberships] = await db.execute(
            `SELECT um.*, mp.name as plan_name, mp.description, mp.features, mp.price
             FROM user_memberships um
             JOIN membership_plans mp ON um.plan_id = mp.id
             WHERE um.user_id = ?
             ORDER BY um.created_at DESC`,
            [req.user.id]
        );

        const activeMembership = memberships.find(m => m.status === 'active' && new Date(m.end_date) >= new Date());

        res.json({
            success: true,
            data: {
                active: activeMembership ? {
                    id: activeMembership.id,
                    planName: activeMembership.plan_name,
                    startDate: activeMembership.start_date,
                    endDate: activeMembership.end_date,
                    autoRenew: activeMembership.auto_renew,
                    features: activeMembership.features ? JSON.parse(activeMembership.features) : []
                } : null,
                history: memberships.map(m => ({
                    id: m.id,
                    planName: m.plan_name,
                    startDate: m.start_date,
                    endDate: m.end_date,
                    status: m.status,
                    price: parseFloat(m.price)
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all memberships (Admin only)
 */
const getAllMemberships = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT um.*, mp.name as plan_name, mp.price,
                   u.username, u.email, u.first_name, u.last_name
            FROM user_memberships um
            JOIN membership_plans mp ON um.plan_id = mp.id
            JOIN users u ON um.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND um.status = ?';
            params.push(status);
        }

        query += ' ORDER BY um.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [memberships] = await db.execute(query, params);

        res.json({
            success: true,
            data: memberships.map(m => ({
                id: m.id,
                user: {
                    id: m.user_id,
                    username: m.username,
                    email: m.email,
                    name: `${m.first_name} ${m.last_name}`
                },
                plan: m.plan_name,
                price: parseFloat(m.price),
                startDate: m.start_date,
                endDate: m.end_date,
                status: m.status,
                autoRenew: m.auto_renew
            }))
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan,
    subscribe,
    getMyMembership,
    getAllMemberships
};
