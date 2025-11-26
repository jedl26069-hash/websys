@'
<?php
require_once __DIR__ . "/../db_config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["adapter_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "adapter_id required"]);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("INSERT INTO adapters (adapter_id, label, location) VALUES (?, ?, ?)");
    $stmt->execute([$data["adapter_id"], $data["label"] ?? null, $data["location"] ?? null]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\add.php" -Encoding UTF8