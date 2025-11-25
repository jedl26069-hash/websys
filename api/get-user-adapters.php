<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// In a real application, you would verify the user's session here
// $userId = $_SESSION['user_id'];

// Database connection
$host = 'localhost';
$db_name = 'websystem_db';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Mock User ID for demonstration
    $userId = 1; 

    $query = "
        SELECT a.adapter_id, a.status, a.last_active 
        FROM user_adapters ua
        JOIN adapters a ON ua.adapter_id = a.adapter_id
        WHERE ua.user_id = :user_id
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $adapters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "adapters" => $adapters
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
