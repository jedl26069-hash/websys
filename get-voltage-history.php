@'
<?php
require_once __DIR__ . "/../db_config.php";

$adapter_id = $_GET["adapter_id"] ?? null;

if (!$adapter_id) {
    http_response_code(400);
    echo json_encode(["error" => "adapter_id required"]);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("SELECT voltage, status, timestamp FROM voltage_logs WHERE adapter_id = ? ORDER BY timestamp DESC LIMIT 50");
    $stmt->execute([$adapter_id]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\get-voltage-history.php" -Encoding UTF8