@'
<?php
require_once __DIR__ . "/../db_config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["adapter_id"]) || !isset($data["voltage"])) {
    http_response_code(400);
    echo json_encode(["error" => "adapter_id and voltage are required"]);
    exit;
}

$user_id = $data["user_id"] ?? $_SESSION["user_id"] ?? "user-default";

try {
    $pdo = getConnection();
    
    $verifyStmt = $pdo->prepare("SELECT id FROM adapters WHERE adapter_id = ? AND user_id = ?");
    $verifyStmt->execute([$data["adapter_id"], $user_id]);
    
    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["error" => "Adapter not found or access denied"]);
        exit;
    }
    
    $statusMap = [
        "normal" => "normal",
        "warning" => "warning",
        "overload" => "overload",
        "undervoltage" => "undervoltage",
        "active" => "normal",
        "inactive" => "normal"
    ];
    
    $status = $statusMap[$data["status"] ?? "normal"] ?? "normal";
    
    $stmt = $pdo->prepare("INSERT INTO voltage_logs (adapter_id, user_id, voltage, status) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data["adapter_id"], $user_id, $data["voltage"], $status]);
    
    if (isset($data["status"]) && in_array($data["status"], ["active", "inactive", "overload", "undervoltage"])) {
        $updateStmt = $pdo->prepare("UPDATE adapters SET status = ?, last_updated = CURRENT_TIMESTAMP WHERE adapter_id = ? AND user_id = ?");
        $updateStmt->execute([$data["status"], $data["adapter_id"], $user_id]);
    }
    
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\save-voltage.php" -Encoding UTF8