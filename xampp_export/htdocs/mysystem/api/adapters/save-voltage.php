<?php
error_reporting(0);
ini_set('display_errors', 0);
date_default_timezone_set('UTC');

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['adapter_id']) || !isset($input['voltage'])) {
    echo json_encode(['success' => false, 'error' => 'Missing data']);
    exit;
}

$adapterId = $input['adapter_id'];
$voltage = $input['voltage'];
$status = $input['status'] ?? 'active';

$file = __DIR__ . '/../../voltage_data.json';
$allData = [];

if (file_exists($file)) {
    $allData = json_decode(file_get_contents($file), true) ?? [];
}

if (!isset($allData[$adapterId])) {
    $allData[$adapterId] = [];
}

$newReading = [
    'time' => date('H:i:s'),
    'voltage' => $voltage,
    'status' => $status
];

$allData[$adapterId][] = $newReading;

// Limit to last 50 readings
if (count($allData[$adapterId]) > 50) {
    $allData[$adapterId] = array_slice($allData[$adapterId], -50);
}

file_put_contents($file, json_encode($allData, JSON_PRETTY_PRINT));

echo json_encode(['success' => true]);
?>
