<?php
require_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing adapter ID']);
    exit;
}

try {
    $pdo->beginTransaction();
    
    $unclaimStmt = $pdo->prepare("UPDATE valid_adapters SET is_claimed = 0, claimed_by_user_id = NULL, claimed_at = NULL WHERE serial_key = ?");
    $unclaimStmt->execute([$data['id']]);
    
    $stmt = $pdo->prepare("DELETE FROM adapters WHERE user_id = ? AND adapter_id = ?");
    $stmt->execute([$_SESSION['user_id'], $data['id']]);
    
    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Adapter removed and unclaimed successfully']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
