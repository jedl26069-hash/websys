<?php
require_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT adapter_id as id, name, label, location, added_at as addedAt FROM adapters WHERE user_id = ? ORDER BY added_at DESC");
    $stmt->execute([$_SESSION['user_id']]);
    $adapters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($adapters);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
