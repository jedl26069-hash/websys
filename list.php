@'
<?php
require_once __DIR__ . "/../db_config.php";

$user_id = $_GET["user_id"] ?? $_SESSION["user_id"] ?? "user-default";

try {
    $pdo = getConnection();
    
    $stmt = $pdo->prepare("SELECT adapter_id, label, location, model, max_voltage, status, registered_date, last_updated FROM adapters WHERE user_id = ? ORDER BY registered_date DESC");
    $stmt->execute([$user_id]);
    $adapters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($adapters);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\list.php" -Encoding UTF8

