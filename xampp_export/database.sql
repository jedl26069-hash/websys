-- Ensuring we strictly use one database: 'websystem_db'
CREATE DATABASE IF NOT EXISTS websystem_db;
USE websystem_db;

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store valid, pre-generated adapter keys
-- This ensures only authentic adapters can be registered
CREATE TABLE IF NOT EXISTS valid_adapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_key VARCHAR(50) UNIQUE NOT NULL,
    is_claimed BOOLEAN DEFAULT 0,
    claimed_by_user_id INT DEFAULT NULL,
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Added adapters table to link devices to specific users
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

-- Adding a test user for immediate login capability
-- Username: admin
-- Password: Password123
INSERT INTO accounts (username, email, password) VALUES 
('admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert some initial valid keys for testing
INSERT INTO valid_adapters (serial_key) VALUES 
('SA-2025-ALPHA'),
('SA-2025-BETA'),
('SA-2025-GAMMA'),
('55555'),
('1AAAA');
