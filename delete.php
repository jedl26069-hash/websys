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
    $stmt = $pdo->prepare("DELETE FROM adapters WHERE adapter_id = ?");
    $stmt->execute([$data["adapter_id"]]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\delete.php" -Encoding UTF8
