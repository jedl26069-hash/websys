<?php
/**
 * Smart Adapter Verification API
 * 
 * This PHP script verifies if an adapter ID exists in the database
 * and returns the adapter details if found.
 * 
 * NOTE: This file is provided as a reference for the backend implementation.
 * In production, you would connect this to your actual database.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$host = 'localhost';
$dbname = 'websystem_db';
$username = 'your_db_username';
$password = 'your_db_password';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    $adapterId = $input['adapterId'] ?? '';
    
    if (empty($adapterId)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Adapter ID is required'
        ]);
        exit;
    }
    
    // Query database for adapter
    $stmt = $pdo->prepare("SELECT * FROM adapters WHERE adapter_id = :adapter_id AND status = 'active'");
    $stmt->execute(['adapter_id' => $adapterId]);
    $adapter = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($adapter) {
        // Adapter found - return success
        echo json_encode([
            'success' => true,
            'message' => 'Adapter verified successfully',
            'data' => [
                'adapter_id' => $adapter['adapter_id'],
                'model' => $adapter['model'],
                'max_voltage' => $adapter['max_voltage'],
                'registered_date' => $adapter['registered_date']
            ]
        ]);
    } else {
        // Adapter not found
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Adapter ID not found in database'
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
