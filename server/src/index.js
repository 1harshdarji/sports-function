/**
 * Sports Hub Backend - Main Entry Point
 * Express server with MySQL database
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const membershipRoutes = require('./routes/membership.routes');
const facilityRoutes = require('./routes/facility.routes');
const bookingRoutes = require('./routes/booking.routes');
const eventRoutes = require('./routes/event.routes');
const coachRoutes = require('./routes/coach.routes');
const paymentRoutes = require('./routes/payment.routes');
const eventPaymentRoutes = require('./routes/eventPayment.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');


// Import database connection
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE
// =============================================

// CORS configuration
app.use(cors({
    origin: true, // process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));



// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// =============================================
// ROUTES
// =============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sports Hub API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events/payments', eventPaymentRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
//app.use('/api/payments', require('./routes/payment.routes'));


// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// =============================================
// SERVER STARTUP
// =============================================

// Test database connection and start server
async function startServer() {
    try {
        // Test database connection
        const connection = await db.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();

        // Start server
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📍 API available at http://localhost:${PORT}/api`);
            console.log(`🏃 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
