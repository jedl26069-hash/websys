-- Smart Adapter Database Schema
-- This SQL file creates the necessary tables for the Smart Adapter system

-- Create database
CREATE DATABASE IF NOT EXISTS websystem_db;
USE websystem_db;

-- Users table - stores user information for multi-user support
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_username (username)
);

-- Adapters table - stores registered smart adapters with user association
CREATE TABLE IF NOT EXISTS adapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    label VARCHAR(255),
    location VARCHAR(255),
    model VARCHAR(50) NOT NULL DEFAULT 'SA-2025-X',
    max_voltage DECIMAL(5,2) NOT NULL DEFAULT 240.00,
    status ENUM('active', 'inactive', 'overload', 'undervoltage', 'maintenance') DEFAULT 'active',
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_adapter_id (adapter_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_registered_date (registered_date)
);

-- Voltage logs table - stores real-time voltage readings with safety status
CREATE TABLE IF NOT EXISTS voltage_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    voltage DECIMAL(6,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('normal', 'warning', 'overload', 'undervoltage') DEFAULT 'normal',
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_adapter_timestamp (adapter_id, timestamp),
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_status (status)
);

-- Safety events table - logs when safety cutoffs or warnings occur
CREATE TABLE IF NOT EXISTS safety_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    event_type ENUM('surge_detected', 'undervoltage_detected', 'manual_shutoff', 'system_error', 'safety_cutoff') NOT NULL,
    voltage_at_event DECIMAL(6,2),
    duration_seconds INT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_adapter_events (adapter_id, timestamp),
    INDEX idx_user_events (user_id, timestamp),
    INDEX idx_event_type (event_type)
);

-- Notifications table - stores system and event notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    adapter_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    `read` TINYINT(1) DEFAULT 0,
    related_event_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id, created_at),
    INDEX idx_user_unread (user_id, `read`),
    INDEX idx_adapter_notifications (adapter_id)
);

-- Adapter configuration table - stores user-specific adapter settings
CREATE TABLE IF NOT EXISTS adapter_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    surge_threshold DECIMAL(6,2) DEFAULT 240.00,
    undervoltage_threshold DECIMAL(6,2) DEFAULT 180.00,
    auto_shutoff TINYINT(1) DEFAULT 1,
    notifications_enabled TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_adapter_user (adapter_id, user_id)
);

-- ========================================
-- SAMPLE DATA FOR DEVELOPMENT/TESTING ONLY
-- Remove or clear these tables before production deployment
-- ========================================

-- Insert sample users for development
INSERT INTO users (user_id, username, email) VALUES
('user-123-abc', 'testuser1', 'test1@example.com'),
('user-456-def', 'testuser2', 'test2@example.com'),
('user-default', 'defaultuser', 'default@example.com');

-- Insert sample adapters for development
INSERT INTO adapters (adapter_id, user_id, label, location, model, max_voltage, status) VALUES
('55555', 'user-123-abc', 'Living Room TV', 'Living Room', 'SA-2025-X', 240.00, 'active'),
('1AAAA', 'user-123-abc', 'Bedroom AC', 'Master Bedroom', 'SA-2025-X', 240.00, 'active'),
('22AAA', 'user-456-def', 'Kitchen Microwave', 'Kitchen', 'SA-2025-PRO', 250.00, 'active'),
('AAAAA', 'user-456-def', 'Office Monitor', 'Home Office', 'SA-2025-LITE', 230.00, 'active'),
('333AA', 'user-default', 'Device 1', NULL, 'SA-2025-X', 240.00, 'active'),
('4444A', 'user-default', 'Device 2', NULL, 'SA-2025-PRO', 250.00, 'active');

-- Insert sample adapter settings for development
INSERT INTO adapter_settings (adapter_id, user_id, surge_threshold, undervoltage_threshold, auto_shutoff, notifications_enabled) VALUES
('55555', 'user-123-abc', 240.00, 180.00, 1, 1),
('1AAAA', 'user-123-abc', 240.00, 180.00, 1, 1),
('22AAA', 'user-456-def', 250.00, 175.00, 1, 1),
('AAAAA', 'user-456-def', 230.00, 185.00, 1, 1),
('333AA', 'user-default', 240.00, 180.00, 1, 1),
('4444A', 'user-default', 250.00, 180.00, 1, 1);
