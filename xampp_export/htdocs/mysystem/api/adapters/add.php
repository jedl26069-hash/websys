<?php
require_once '../db.php';

header('Content-Type: application/json');

// Ensure only authorized users can add adapters
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$adapterId = strtoupper(trim($data['id']));
$userId = $_SESSION['user_id'];

try {
    // 1. Verify the key exists in valid_adapters and is NOT claimed
    $checkStmt = $pdo->prepare("SELECT id, serial_key, is_claimed, claimed_by_user_id FROM valid_adapters WHERE serial_key = ?");
    $checkStmt->execute([$adapterId]);
    $keyData = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$keyData) {
        // Insert it as a new valid adapter
        $insertValid = $pdo->prepare("INSERT INTO valid_adapters (serial_key, is_claimed) VALUES (?, 0)");
        $insertValid->execute([$adapterId]);
        
        // Fetch it back
        $checkStmt->execute([$adapterId]);
        $keyData = $checkStmt->fetch(PDO::FETCH_ASSOC);
    }

    if ($keyData['is_claimed'] && $keyData['claimed_by_user_id'] != $userId) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'This Adapter ID has already been claimed by another user.']);
        exit;
    }

    // 2. Start Transaction to ensure both tables update or neither does
    $pdo->beginTransaction();

    // Mark key as claimed
    $updateStmt = $pdo->prepare("UPDATE valid_adapters SET is_claimed = 1, claimed_by_user_id = ?, claimed_at = NOW() WHERE id = ?");
    $updateStmt->execute([$userId, $keyData['id']]);

    $checkAdapterLink = $pdo->prepare("SELECT id FROM adapters WHERE user_id = ? AND adapter_id = ?");
    $checkAdapterLink->execute([$userId, $adapterId]);
    
    if (!$checkAdapterLink->fetch()) {
        // Add to user's adapter list
        $insertStmt = $pdo->prepare("INSERT INTO adapters (user_id, adapter_id, name) VALUES (?, ?, ?)");
        $insertStmt->execute([$userId, $adapterId, $data['name']]);

        $file = __DIR__ . '/../../voltage_data.json';
        $allData = [];
        if (file_exists($file)) {
            $allData = json_decode(file_get_contents($file), true) ?? [];
        }

        $initialData = [];
        $now = time();
        for ($i = 19; $i >= 0; $i--) {
            $timestamp = $now - ($i * 60);
            $initialData[] = [
                'time' => date('H:i:s', $timestamp),
                'voltage' => 220 + (rand(-50, 50) / 10),
                'status' => 'active'
            ];
        }
        $allData[$adapterId] = $initialData;
        file_put_contents($file, json_encode($allData, JSON_PRETTY_PRINT));
    }

    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Adapter verified and added successfully']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
