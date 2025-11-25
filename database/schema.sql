-- Smart Adapter Database Schema
-- This SQL file creates the necessary tables for the Smart Adapter system

-- Create database
CREATE DATABASE IF NOT EXISTS smart_adapter_db;
USE smart_adapter_db;

-- Adapters table - stores registered smart adapters
CREATE TABLE IF NOT EXISTS adapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL DEFAULT 'SA-2025-X',
    max_voltage DECIMAL(5,2) NOT NULL DEFAULT 240.00,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_adapter_id (adapter_id),
    INDEX idx_status (status)
);

-- Voltage logs table - stores real-time voltage readings
CREATE TABLE IF NOT EXISTS voltage_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) NOT NULL,
    voltage DECIMAL(5,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('normal', 'warning', 'overload') DEFAULT 'normal',
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    INDEX idx_adapter_timestamp (adapter_id, timestamp)
);

-- Safety events table - logs when safety cutoffs occur
CREATE TABLE IF NOT EXISTS safety_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) NOT NULL,
    event_type ENUM('overload', 'manual_shutoff', 'system_error') NOT NULL,
    voltage_at_event DECIMAL(5,2),
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    INDEX idx_adapter_events (adapter_id, timestamp)
);

-- Insert sample adapters for testing
INSERT INTO adapters (adapter_id, model, max_voltage, status) VALUES
('55555', 'SA-2025-X', 240.00, 'active'),
('1AAAA', 'SA-2025-X', 240.00, 'active'),
('22AAA', 'SA-2025-PRO', 250.00, 'active'),
('AAAAA', 'SA-2025-LITE', 230.00, 'active'),
('333AA', 'SA-2025-X', 240.00, 'active'),
('4444A', 'SA-2025-PRO', 250.00, 'active');
