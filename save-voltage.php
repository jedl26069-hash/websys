@'
<?php
require_once __DIR__ . "/../db_config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["adapter_id"]) || !isset($data["voltage"])) {
    http_response_code(400);
    echo json_encode(["error" => "adapter_id and voltage required"]);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("INSERT INTO voltage_logs (adapter_id, voltage, status) VALUES (?, ?, ?)");
    $stmt->execute([$data["adapter_id"], $data["voltage"], $data["status"] ?? "normal"]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\save-voltage.php" -Encoding UTF8