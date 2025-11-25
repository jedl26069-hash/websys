<?php
require_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['label'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE adapters SET label = ?, location = ? WHERE user_id = ? AND adapter_id = ?");
    $stmt->execute([
        $data['label'],
        $data['location'] ?? null,
        $_SESSION['user_id'],
        $data['id']
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Adapter label updated']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
