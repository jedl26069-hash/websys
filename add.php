@'
<?php
require_once __DIR__ . "/../db_config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["adapter_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "adapter_id is required"]);
    exit;
}

$user_id = $data["user_id"] ?? $_SESSION["user_id"] ?? "user-default";

try {
    $pdo = getConnection();
    
    $userStmt = $pdo->prepare("INSERT IGNORE INTO users (user_id, username) VALUES (?, ?)");
    $userStmt->execute([$user_id, $user_id]);
    
    $stmt = $pdo->prepare("INSERT INTO adapters (adapter_id, user_id, label, location, model, max_voltage, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data["adapter_id"],
        $user_id,
        $data["label"] ?? null,
        $data["location"] ?? null,
        $data["model"] ?? "SA-2025-X",
        $data["max_voltage"] ?? 240.00,
        "active"
    ]);
    
    $settingsStmt = $pdo->prepare("INSERT INTO adapter_settings (adapter_id, user_id) VALUES (?, ?)");
    $settingsStmt->execute([$data["adapter_id"], $user_id]);
    
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\add.php" -Encoding UTF8