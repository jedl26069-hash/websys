<?php
require_once '../db.php';

$current_user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not Logged In';

// Simple protection: only allow if logged in (you could restrict to specific admin IDs)
if (!isset($_SESSION['user_id'])) {
    die("Unauthorized access. Please log in first. (Current User ID: $current_user_id)");
}

$count = isset($_GET['count']) ? intval($_GET['count']) : 5;
$prefix = isset($_GET['prefix']) ? $_GET['prefix'] : 'SA-2025-';

$generated = [];

try {
    $stmt = $pdo->prepare("INSERT INTO valid_adapters (serial_key) VALUES (?)");

    for ($i = 0; $i < $count; $i++) {
        // Generate a random unique string
        $randomPart = strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
        $key = $prefix . $randomPart;
        
        try {
            $stmt->execute([$key]);
            $generated[] = $key;
        } catch (PDOException $e) {
            // Skip duplicates (unlikely but possible)
            continue;
        }
    }

    echo "<h3>Successfully Generated " . count($generated) . " Keys:</h3>";
    echo "<div style='background:#f4f4f4; padding:15px; border:1px solid #ccc; max-width: 400px;'>";
    echo "<ul style='list-style-type: none; padding: 0;'>";
    foreach ($generated as $key) {
        echo "<li style='margin-bottom: 5px; font-family: monospace; font-size: 1.2em;'>";
        echo htmlspecialchars($key);
        echo "</li>";
    }
    echo "</ul>";
    echo "</div>";
    echo "<p><a href='generate_keys.php?count=5'>Generate 5 More</a></p>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
