@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   SMART ADAPTER DEPLOYMENT SCRIPT (UNIFIED)
echo ===================================================
echo.
echo This script will deploy EVERYTHING to 'mysystem'.
echo This ensures your login and dashboard work on the same path.
echo.

:: 1. Install dependencies (just in case)
echo 1. Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies. Exiting.
    pause
    exit /b %errorlevel%
)

:: 2. Build the Next.js app
echo.
echo 2. Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Error building the project. Exiting.
    pause
    exit /b %errorlevel%
)

:: 3. Deploy to XAMPP
echo.
echo 3. Deploying Unified App to C:\xampp\htdocs\mysystem...

:: Ensure destination exists
if not exist "C:\xampp\htdocs\mysystem" mkdir "C:\xampp\htdocs\mysystem"

:: Copy Backend API (PHP files)
echo    - Copying Backend API...
:: We use ..\ because this script is in /scripts/ folder
robocopy "..\xampp_export\htdocs\mysystem" "C:\xampp\htdocs\mysystem" /E /IS /IT

:: Copy Frontend App (Static Build)
echo    - Copying Frontend App...
robocopy "..\out" "C:\xampp\htdocs\mysystem\dist" /E /IS /IT

echo.
echo ===================================================
echo   DEPLOYMENT SUCCESSFUL!
echo ===================================================
echo.
echo You can now access your app at:
echo   http://localhost/mysystem/api/auth/login.php
echo.
pause
