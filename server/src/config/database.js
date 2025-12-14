/**
 * MySQL Database Configuration
 * Uses mysql2 with connection pooling
 */

const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Helper function to execute queries
async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

// Export pool and helper
module.exports = pool;
module.exports.query = query;
