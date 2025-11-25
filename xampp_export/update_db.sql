-- --------------------------------------------------------
-- Database Update Script
-- Run this in phpMyAdmin to update your existing database
-- or create it if it doesn't exist.
-- --------------------------------------------------------

-- 1. Create Database if it doesn't exist
CREATE DATABASE IF NOT EXISTS websystem_db;
USE websystem_db;

-- 2. Create Tables (Add Syntax)
-- These commands only run if the tables don't exist yet.

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS valid_adapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_key VARCHAR(50) UNIQUE NOT NULL,
    is_claimed BOOLEAN DEFAULT 0,
    claimed_by_user_id INT DEFAULT NULL,
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    adapter_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(100) DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 3. Update Tables (Update Syntax)
-- Adds columns if they are missing (Works in XAMPP/MariaDB)

-- Note: 'IF NOT EXISTS' for columns is supported in MariaDB (XAMPP default) 
-- If you are using an older MySQL version, you might need to run these individually 
-- or ignore errors if the column already exists.
ALTER TABLE adapters ADD COLUMN IF NOT EXISTS label VARCHAR(100) DEFAULT NULL;
ALTER TABLE adapters ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT NULL;

-- 4. Add Default Data (Insert Ignore to avoid duplicates)

INSERT IGNORE INTO accounts (username, email, password) VALUES 
('admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT IGNORE INTO valid_adapters (serial_key) VALUES 
('SA-2025-ALPHA'),
('SA-2025-BETA'),
('SA-2025-GAMMA'),
('55555'),
('1AAAA');
