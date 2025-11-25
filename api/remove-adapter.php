<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

// Database connection
$host = 'localhost';
$db   = 'smart_adapter_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->adapter_id) || !isset($data->user_id)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$adapterId = $data->adapter_id;
$userId = $data->user_id;

// Remove adapter from user_adapters table
$stmt = $pdo->prepare("DELETE FROM user_adapters WHERE user_id = ? AND adapter_id = ?");
$stmt->execute([$userId, $adapterId]);

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => 'Adapter removed successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Adapter not found or already removed']);
}
?>
