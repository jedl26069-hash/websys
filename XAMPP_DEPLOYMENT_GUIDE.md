# 🚀 XAMPP Deployment Guide (Final)

This is the **Master Guide** for deploying the Smart Adapter App.
Follow these steps to deploy the app to XAMPP without "Index of..." errors or missing data.

---

## ✅ The "One-Click" Solution (Recommended)

We have created a script that handles everything for you: building the app, moving files, and updating the backend.

1.  **Stop Apache** in XAMPP Control Panel (temporarily).
2.  **Run the Script**:
    *   Go to your project folder.
    *   Double-click **`scripts\deploy_fix.bat`**.
3.  **Wait**: It will install dependencies, build the app, and copy files.
4.  **Start Apache** in XAMPP.
5.  **Done!**
    *   **Login Here**: [http://localhost/mysystem/api/auth/login.php](http://localhost/mysystem/api/auth/login.php)
    *   It will redirect you to the app at: `http://localhost/smart-app/`

---

## 📂 Architecture Overview

To prevent conflicts, we separate the **Source Code**, **Frontend App**, and **Backend API**:

1.  **`C:\xampp\htdocs\smart-adapter\`** (Source Code)
    *   This is where you write code. **DO NOT** use this URL in the browser.
2.  **`C:\xampp\htdocs\smart-app\`** (The Website)
    *   This is the compiled React app (HTML/JS/CSS).
    *   Browser URL: `http://localhost/smart-app/`
3.  **`C:\xampp\htdocs\mysystem\`** (The Backend)
    *   This contains the PHP scripts and the database connection.
    *   Browser URL: `http://localhost/mysystem/`

---

## 🛠 Manual Deployment (If Script Fails)

If you cannot run the batch script, follow these manual steps exactly:

### 1. Build the Frontend
1.  Open `next.config.mjs` and ensure `basePath` is set to `'/smart-app'`.
2.  Open terminal in your project folder.
3.  Run: `npm run build`
    *   *Note: If it fails, delete the `app/mysystem` folder first.*
4.  You will get an **`out`** folder.

### 2. Deploy Frontend
1.  Go to `C:\xampp\htdocs\`.
2.  Create a folder named **`smart-app`**.
3.  **Copy the CONTENTS** of your project's `out` folder into `C:\xampp\htdocs\smart-app\`.
    *   You should see `index.html` directly inside `smart-app`.

### 3. Deploy Backend
1.  Go to `C:\xampp\htdocs\`.
2.  Create a folder named **`mysystem`**.
3.  Copy everything from your project's `xampp_export/htdocs/mysystem/` into `C:\xampp\htdocs\mysystem\`.

### 4. Database Setup
1.  Open phpMyAdmin (`http://localhost/phpmyadmin`).
2.  Select or create database `websystem_db`.
3.  Import `xampp_export/database.sql` (for fresh install) or `xampp_export/update_db.sql` (to update existing).

---

## ❓ Troubleshooting

### "Index of /smart-adapter"
*   **Cause**: You are trying to view your source code folder in the browser.
*   **Fix**: Use the correct URL: `http://localhost/mysystem/api/auth/login.php`.

### "No Voltage Data"
*   **Cause**: The JSON simulation file might not be writable.
*   **Fix**: The system auto-generates `voltage_data.json` in `htdocs/mysystem/`. Ensure permissions allow PHP to write to this file.

### "404 Not Found" on Login
*   **Cause**: The redirects are pointing to the wrong folder.
*   **Fix**: Ensure `basePath` in `next.config.mjs` matches your folder name (`/smart-app`).
