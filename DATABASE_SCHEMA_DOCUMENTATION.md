# Database Schema - Complete Documentation

## Overview
The Smart Adapter database has been completely redesigned to support multi-user functionality, comprehensive notification system, and complete audit trail of all adapter events.

## Database Structure

### 1. Users Table
**Purpose:** Stores user information for multi-user support and session management.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_username (username)
);
```

**Fields:**
- `id`: Internal auto-increment ID
- `user_id`: Unique user identifier (linked to UserProvider in frontend)
- `username`: User's username
- `email`: User's email address
- `created_at`: Account creation timestamp
- `last_login`: Last login timestamp (for analytics)

---

### 2. Adapters Table (UPDATED)
**Purpose:** Stores registered smart adapter information with user association and customizable settings.

```sql
CREATE TABLE adapters (
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
```

**Key Changes:**
- Added `user_id` for multi-user support
- Added `label` and `location` (user can customize adapter name and location)
- Enhanced `status` enum to include `'overload'` and `'undervoltage'`
- Added `last_updated` timestamp
- Proper indexing for performance

**Fields:**
- `adapter_id`: Unique identifier for the adapter (e.g., "55555", "1AAAA")
- `user_id`: Foreign key to users table (ensures adapters belong to specific users)
- `label`: User-provided name/label for the adapter
- `location`: Physical location description
- `model`: Adapter model (SA-2025-X, SA-2025-PRO, SA-2025-LITE)
- `max_voltage`: Maximum voltage threshold
- `status`: Current operational status
- `registered_date`: When adapter was added
- `last_updated`: Last modification time

---

### 3. Voltage Logs Table (UPDATED)
**Purpose:** Stores real-time voltage readings with user isolation.

```sql
CREATE TABLE voltage_logs (
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
```

**Key Improvements:**
- Added `user_id` for user-specific queries
- Enhanced `status` enum (added 'warning', 'overload', 'undervoltage')
- Better indexing for time-series queries
- Increased voltage decimal places to DECIMAL(6,2)

**Fields:**
- `voltage`: Voltage reading with 2 decimal precision
- `status`: Safety status at time of reading
- `timestamp`: When reading was recorded

**Usage:**
- Query voltage history for specific user: `SELECT ... WHERE user_id = ? AND adapter_id = ? ORDER BY timestamp DESC`
- Monitor for anomalies: `SELECT ... WHERE status IN ('warning', 'overload', 'undervoltage')`

---

### 4. Safety Events Table (NEW/UPDATED)
**Purpose:** Comprehensive audit trail of all safety events and anomalies.

```sql
CREATE TABLE safety_events (
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
```

**Key Features:**
- Enhanced event types for better tracking
- Voltage at event capture
- Duration tracking for prolonged events
- Full user isolation

**Event Types:**
- `surge_detected`: High voltage detected
- `undervoltage_detected`: Low voltage detected
- `manual_shutoff`: User manually turned off adapter
- `system_error`: System malfunction
- `safety_cutoff`: Automatic safety shutdown triggered

---

### 5. Notifications Table (NEW)
**Purpose:** User-specific notification system with audit trail.

```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    adapter_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    read BOOLEAN DEFAULT FALSE,
    related_event_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id, created_at),
    INDEX idx_user_unread (user_id, read),
    INDEX idx_adapter_notifications (adapter_id)
);
```

**Features:**
- Full user isolation (only users see their own notifications)
- Linked to safety events for correlation
- Priority and type classification
- Read/unread status tracking

---

### 6. Adapter Settings Table (NEW)
**Purpose:** Store user-specific customizable settings for each adapter.

```sql
CREATE TABLE adapter_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adapter_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    surge_threshold DECIMAL(6,2) DEFAULT 240.00,
    undervoltage_threshold DECIMAL(6,2) DEFAULT 180.00,
    auto_shutoff BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adapter_id) REFERENCES adapters(adapter_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_adapter_user (adapter_id, user_id)
);
```

**Features:**
- User can customize thresholds per adapter
- Control auto-shutoff behavior
- Enable/disable notifications
- Ensures one setting per adapter-user combination

---

## PHP API Integration

### Updated API Endpoints

#### 1. Add Adapter (`add.php`)
**Changes:**
- Creates user if doesn't exist
- Associates adapter with user_id
- Creates default adapter settings
- Validates input parameters

```php
// Request
POST /api/adapters/add.php
{
    "adapter_id": "55555",
    "label": "Living Room TV",
    "location": "Living Room",
    "user_id": "user-123-abc",
    "model": "SA-2025-X",
    "max_voltage": 240.00
}
```

#### 2. List Adapters (`list.php`)
**Changes:**
- Returns only current user's adapters
- Includes label, location, status
- Sorted by registration date

```php
// Request
GET /api/adapters/list.php?user_id=user-123-abc

// Response
[
    {
        "adapter_id": "55555",
        "label": "Living Room TV",
        "location": "Living Room",
        "status": "active",
        "registered_date": "2025-12-03 10:30:00"
    }
]
```

#### 3. Get Voltage History (`get-voltage-history.php`)
**Changes:**
- User verification before returning data
- Increased limit from 50 to 100 readings
- Proper access control

```php
// Request
GET /api/adapters/get-voltage-history.php?adapter_id=55555&user_id=user-123-abc

// Response
[
    {
        "voltage": "225.50",
        "status": "normal",
        "timestamp": "2025-12-03 14:25:30"
    }
]
```

#### 4. Save Voltage (`save-voltage.php`)
**Changes:**
- Records voltage with user_id
- Status mapping (active→normal, inactive→normal)
- Updates adapter status if changed
- User verification

#### 5. Update Label (`update-label.php`)
**Changes:**
- User verification before update
- Updates label and location
- Updates last_modified timestamp
- User isolation enforced

#### 6. Delete Adapter (`delete.php`)
**Changes:**
- Verifies adapter belongs to user
- Prevents unauthorized deletion
- Cascading delete of related data

---

## Security Features

### 1. User Isolation
- All queries filtered by `user_id`
- Foreign keys enforce relationships
- Access control checks in every endpoint

### 2. Data Validation
- Type checking on all inputs
- Enum validation for status fields
- Required field validation

### 3. Cascading Deletes
- User deletion removes all adapters
- Adapter deletion removes all logs
- Prevents orphaned records

### 4. Audit Trail
- `created_at` and `updated_at` timestamps
- All safety events logged
- Historical voltage data preserved

---

## Sample Data

Database comes pre-populated with sample users and adapters:

```sql
-- Sample Users
('user-123-abc', 'testuser1', 'test1@example.com')
('user-456-def', 'testuser2', 'test2@example.com')
('user-default', 'defaultuser', 'default@example.com')

-- Sample Adapters (distributed across users)
Adapter 55555  → user-123-abc (Living Room TV)
Adapter 1AAAA  → user-123-abc (Bedroom AC)
Adapter 22AAA  → user-456-def (Kitchen Microwave)
Adapter AAAAA  → user-456-def (Office Monitor)
Adapter 333AA  → user-default (Device 1)
Adapter 4444A  → user-default (Device 2)
```

---

## Performance Optimization

### Indexes
- `idx_user_id` on users table for fast lookups
- `idx_adapter_id` for unique adapter queries
- `idx_adapter_timestamp` for time-series queries
- `idx_user_unread` for fast unread notification counts
- `idx_event_type` for event filtering

### Query Examples

**Get user's unread notifications:**
```sql
SELECT COUNT(*) FROM notifications 
WHERE user_id = ? AND read = FALSE;
```

**Get recent voltage readings:**
```sql
SELECT * FROM voltage_logs 
WHERE adapter_id = ? AND user_id = ?
ORDER BY timestamp DESC LIMIT 50;
```

**Get safety events for audit:**
```sql
SELECT * FROM safety_events 
WHERE adapter_id = ? AND user_id = ?
ORDER BY timestamp DESC;
```

---

## Migration Notes

### From Old Schema
1. ✅ `label` and `location` fields added to adapters
2. ✅ `user_id` added to all tables for multi-user support
3. ✅ Status values expanded (added `overload`, `undervoltage`)
4. ✅ New notification and settings tables created
5. ✅ All PHP APIs updated for new schema
6. ✅ Proper foreign keys and indexing added

### Backward Compatibility
- Old adapter IDs still work
- Sample data includes all existing adapter IDs
- PHP APIs automatically create users if missing

---

## Frontend Integration

### With UserProvider + NotificationProvider
1. Frontend identifies user via `useUser()` hook
2. User ID automatically sent to all API calls
3. Notifications stored per-user in frontend
4. Backend validates user ownership before operations

### Data Flow
```
Frontend (User A)
    ↓
useUser() → userId: "user-123-abc"
    ↓
API Call with userId
    ↓
Backend: Verify user_id matches adapter owner
    ↓
Return only user A's data
    ↓
Frontend displays in dashboard
```

---

## Conclusion

The updated schema is now:
- ✅ **Multi-user capable** - Full user isolation
- ✅ **Secure** - Access control enforced
- ✅ **Scalable** - Proper indexing for performance
- ✅ **Auditable** - All events tracked with timestamps
- ✅ **Feature-rich** - Comprehensive notification and settings support
- ✅ **Well-documented** - Clear foreign keys and relationships
