-- Sports Hub Database Schema
-- Run this file to create all required tables

-- Create database
CREATE DATABASE IF NOT EXISTS sports_hub;
USE sports_hub;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    role ENUM('user', 'coach', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- =============================================
-- MEMBERSHIP PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS membership_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_type ENUM('monthly', 'yearly') NOT NULL,
    duration_months INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- USER MEMBERSHIPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_memberships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending',
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
);

-- =============================================
-- FACILITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    capacity INT DEFAULT 1,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    amenities JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- =============================================
-- FACILITY SLOTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS facility_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    facility_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    INDEX idx_facility (facility_id),
    INDEX idx_day (day_of_week)
);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    facility_id INT NOT NULL,
    slot_id INT,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES facility_slots(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_facility (facility_id),
    INDEX idx_date (booking_date),
    INDEX idx_status (status)
);

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    image_url VARCHAR(255),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location VARCHAR(255),
    max_participants INT,
    current_participants INT DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT TRUE,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_date (event_date),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- =============================================
-- EVENT REGISTRATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id)
);

-- =============================================
-- COACHES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS coaches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 0,
    bio TEXT,
    certifications JSON,
    hourly_rate DECIMAL(10, 2),
    availability JSON,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_specialization (specialization),
    INDEX idx_available (is_available)
);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_type ENUM('membership', 'booking', 'event', 'other') NOT NULL,
    reference_id INT, -- ID of related membership/booking/event
    payment_method ENUM('card', 'upi', 'netbanking', 'wallet', 'cash') DEFAULT 'card',
    transaction_id VARCHAR(100),
    gateway VARCHAR(50), -- razorpay, stripe, etc.
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_type (payment_type),
    INDEX idx_transaction (transaction_id)
);

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Default Admin User (password: Admin@123)
INSERT INTO users (username, email, password, first_name, last_name, role, is_active, email_verified)
VALUES ('admin', 'admin@sportshub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.EQDUdDN5qxPqKG', 'Admin', 'User', 'admin', TRUE, TRUE);

-- Default Membership Plans
INSERT INTO membership_plans (name, description, duration_type, duration_months, price, features, is_active) VALUES
('Basic Monthly', 'Access to gym and basic facilities', 'monthly', 1, 999.00, '["Gym access", "Locker room", "Basic equipment"]', TRUE),
('Premium Monthly', 'Full access including pool and classes', 'monthly', 1, 1999.00, '["All Basic features", "Swimming pool", "Group classes", "Personal trainer consultation"]', TRUE),
('Basic Yearly', 'Annual basic membership with 2 months free', 'yearly', 12, 9990.00, '["Gym access", "Locker room", "Basic equipment", "2 months free"]', TRUE),
('Premium Yearly', 'Annual premium with 3 months free', 'yearly', 12, 19990.00, '["All Premium features", "3 months free", "Priority booking", "Guest passes"]', TRUE);

-- Default Facilities
INSERT INTO facilities (name, description, category, capacity, price_per_hour, amenities, is_active) VALUES
('Main Gym', 'Fully equipped fitness center with modern equipment', 'gym', 50, 0.00, '["Cardio machines", "Free weights", "Resistance machines", "Personal training area"]', TRUE),
('Swimming Pool', 'Olympic-sized heated swimming pool', 'pool', 30, 200.00, '["Heated water", "Changing rooms", "Lifeguard on duty", "Swimming aids"]', TRUE),
('Tennis Court 1', 'Professional tennis court with floodlights', 'court', 4, 500.00, '["Floodlights", "Ball machine", "Equipment rental"]', TRUE),
('Tennis Court 2', 'Professional tennis court with floodlights', 'court', 4, 500.00, '["Floodlights", "Ball machine", "Equipment rental"]', TRUE),
('Badminton Court', 'Indoor badminton court with wooden flooring', 'court', 4, 300.00, '["Indoor", "Wooden flooring", "Equipment rental"]', TRUE),
('Yoga Studio', 'Peaceful yoga and meditation space', 'studio', 20, 0.00, '["Yoga mats", "Props", "Sound system", "Air conditioning"]', TRUE),
('Dance Studio', 'Spacious dance studio with mirrors', 'studio', 25, 400.00, '["Full-wall mirrors", "Sound system", "Wooden flooring"]', TRUE);

-- Default Facility Slots (9 AM to 9 PM for weekdays)
INSERT INTO facility_slots (facility_id, day_of_week, start_time, end_time) VALUES
-- Tennis Court 1 slots (Monday to Friday)
(3, 1, '09:00:00', '10:00:00'), (3, 1, '10:00:00', '11:00:00'), (3, 1, '11:00:00', '12:00:00'),
(3, 1, '14:00:00', '15:00:00'), (3, 1, '15:00:00', '16:00:00'), (3, 1, '16:00:00', '17:00:00'),
(3, 1, '17:00:00', '18:00:00'), (3, 1, '18:00:00', '19:00:00'), (3, 1, '19:00:00', '20:00:00'),
(3, 2, '09:00:00', '10:00:00'), (3, 2, '10:00:00', '11:00:00'), (3, 2, '11:00:00', '12:00:00'),
(3, 2, '14:00:00', '15:00:00'), (3, 2, '15:00:00', '16:00:00'), (3, 2, '16:00:00', '17:00:00');

COMMIT;
