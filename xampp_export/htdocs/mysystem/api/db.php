<?php
// Ensure session uses a global path '/' so it's shared across all directories
// This MUST come before session_start()
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(0, '/');
    session_start();
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'websystem_db');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    // Create a new PDO instance to connect to the single 'websystem_db' database
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASS);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Set default fetch mode to associative array
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // Stop execution if connection fails
    die("ERROR: Could not connect. " . $e->getMessage());
}
?>
