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
    
    $verifyStmt = $pdo->prepare("SELECT id FROM adapters WHERE adapter_id = ? AND user_id = ?");
    $verifyStmt->execute([$data["adapter_id"], $user_id]);
    
    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["error" => "Adapter not found or access denied"]);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM adapters WHERE adapter_id = ? AND user_id = ?");
    $stmt->execute([$data["adapter_id"], $user_id]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\delete.php" -Encoding UTF8