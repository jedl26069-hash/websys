<?php
error_reporting(0);
ini_set('display_errors', 0);

date_default_timezone_set('UTC');

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// require_once '../db.php'; 

// if (!isset($_SESSION['user_id'])) { ... }

$adapterId = $_GET['adapter_id'] ?? null;

if (!$adapterId) {
    echo json_encode([]);
    exit;
}

$file = __DIR__ . '/../../voltage_data.json';
$data = [];

if (file_exists($file)) {
    $jsonContent = file_get_contents($file);
    $allData = json_decode($jsonContent, true) ?? [];
    if (isset($allData[$adapterId])) {
        $data = $allData[$adapterId];
    }
}

if (empty($data)) {
    $data = [];
    $now = time();
    for ($i = 19; $i >= 0; $i--) {
        $timestamp = $now - ($i * 60); 
        $voltage = 220 + (rand(-50, 50) / 10);
        $data[] = [
            'time' => date('H:i:s', $timestamp),
            'voltage' => (float)$voltage,
            'status' => 'active'
        ];
    }
    
    // Save generated data
    if (file_exists($file)) {
        $allData = json_decode(file_get_contents($file), true) ?? [];
    } else {
        $allData = [];
    }
    $allData[$adapterId] = $data;
    file_put_contents($file, json_encode($allData, JSON_PRETTY_PRINT));
}

$lastReading = end($data);
if ($lastReading) {
    $lastTime = strtotime($lastReading['time']);
    // If data is older than 5 seconds, append new live readings
    if (time() - $lastTime > 5) {
        $voltage = 220 + (rand(-50, 50) / 10);
        $newData = [
            'time' => date('H:i:s'),
            'voltage' => (float)$voltage,
            'status' => 'active'
        ];
        $data[] = $newData;
        
        // Save update
        if (file_exists($file)) {
            $allData = json_decode(file_get_contents($file), true) ?? [];
        } else {
            $allData = [];
        }
        $allData[$adapterId] = $data;
        file_put_contents($file, json_encode($allData, JSON_PRETTY_PRINT));
    }
}

// Return the last 20 readings
$data = array_slice($data, -20);

echo json_encode($data);
?>
