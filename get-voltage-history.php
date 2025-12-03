@'
<?php
require_once __DIR__ . "/../db_config.php";

$adapter_id = $_GET["adapter_id"] ?? null;
$user_id = $_GET["user_id"] ?? $_SESSION["user_id"] ?? "user-default";

if (!$adapter_id) {
    http_response_code(400);
    echo json_encode(["error" => "adapter_id is required"]);
    exit;
}

try {
    $pdo = getConnection();
    
    $verifyStmt = $pdo->prepare("SELECT id FROM adapters WHERE adapter_id = ? AND user_id = ?");
    $verifyStmt->execute([$adapter_id, $user_id]);
    
    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["error" => "Adapter not found or access denied"]);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT voltage, status, timestamp FROM voltage_logs WHERE adapter_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 100");
    $stmt->execute([$adapter_id, $user_id]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\get-voltage-history.php" -Encoding UTF8