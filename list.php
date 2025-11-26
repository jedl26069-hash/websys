@'
<?php
require_once __DIR__ . "/../db_config.php";

try {
    $pdo = getConnection();
    $stmt = $pdo->query("SELECT * FROM adapters ORDER BY registered_date DESC");
    $adapters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($adapters);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
'@ | Out-File -FilePath "api\adapters\list.php" -Encoding UTF8
