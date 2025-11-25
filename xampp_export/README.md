# XAMPP Backend Files

This folder contains the production PHP backend for the Smart Adapter system.

## Directory Structure

\`\`\`
htdocs/mysystem/
├── api/
│   ├── adapters/
│   │   ├── add.php              # Add new adapter
│   │   ├── list.php             # List user's adapters
│   │   ├── delete.php           # Delete adapter
│   │   ├── update-label.php     # Update adapter label
│   │   ├── get-voltage-history.php  # Fetch voltage data (JSON-based)
│   │   └── save-voltage.php     # Save voltage readings (JSON-based)
│   ├── auth/
│   │   ├── login.php            # User login
│   │   ├── register.php         # User registration
│   │   ├── logout.php           # User logout
│   │   └── user.php             # Get current user info
│   └── db.php                   # Database connection + session setup
└── voltage_data.json            # Auto-generated voltage simulation storage

database.sql                     # Database schema (import to phpMyAdmin)
\`\`\`

## Key Features

### JSON-Based Voltage Storage

Voltage readings are stored in `voltage_data.json` instead of a database table:

**Why?**
- Simpler deployment (no voltage_readings table needed)
- Faster read/write for high-frequency simulation data
- Easy to inspect and debug

**How it works:**
1. When you add an adapter, `add.php` creates 20 minutes of initial voltage history
2. `get-voltage-history.php` reads from JSON and auto-generates data if missing
3. `save-voltage.php` appends new readings (frontend simulation)
4. File format: `{"ADAPTER_ID": [{"time": "...", "voltage": 220, "status": "active"}]}`

### Database Tables

The MySQL database (`websystem_db`) stores:
- `accounts` - User accounts
- `adapters` - User's claimed adapters (links user_id to adapter_id)
- `valid_adapters` - Master list of valid adapter IDs and claim status

## Deployment

See `XAMPP_DEPLOYMENT_GUIDE.md` in the project root for full instructions.

Quick steps:
1. Import `database.sql` to phpMyAdmin
2. Copy `htdocs/mysystem/` to `C:/xampp/htdocs/mysystem/`
3. Ensure Apache has write access for `voltage_data.json` creation
\`\`\`

```javascript file="" isHidden
