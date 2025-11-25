<?php
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(0, '/');
    session_start();
}

// Get the requested URI path
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalize path: Remove the project folder name to get relative path
$project_folder = '/mysystem';
if (strpos($request_uri, $project_folder) === 0) {
    $relative_path = substr($request_uri, strlen($project_folder));
} else {
    $relative_path = $request_uri;
}

// Ensure relative path starts with a slash
$relative_path = '/' . ltrim($relative_path, '/');

if (strpos($relative_path, '/api/') === 0) {
    // Let Apache handle API routing via .htaccess
    exit();
}

// Check if user is logged in (only for non-API, non-static requests)
if (!isset($_SESSION['user_id'])) {
    // Redirect to login if not authenticated
    header('Location: /mysystem/api/auth/login.php');
    exit();
}

$file_path = '';

if (strpos($relative_path, '/_next/') === 0) {
    // Map /_next/... -> dist/_next/...
    $file_path = 'dist' . $relative_path;
} elseif (strpos($relative_path, '/assets/') === 0) {
    // Map /assets/... -> dist/assets/...
    $file_path = 'dist' . $relative_path;
} elseif ($relative_path === '/' || $relative_path === '') {
    // Root path -> serve index.html
    $file_path = 'dist/index.html';
} elseif ($relative_path === '/add-adapter') {
    $file_path = 'dist/add-adapter.html';
} else {
    // Try to find a matching HTML file for other routes
    $clean_path = ltrim($relative_path, '/');
    if (file_exists('dist/' . $clean_path . '.html')) {
        $file_path = 'dist/' . $clean_path . '.html';
    } elseif (file_exists('dist' . $relative_path)) {
        $file_path = 'dist' . $relative_path;
    } else {
        // Fallback to index.html for client-side routing
        $file_path = 'dist/index.html';
    }
}

// Check if the request is for a static file that exists
if ($file_path && file_exists($file_path) && is_file($file_path)) {
    // Serve the file with the correct content type
    $ext = pathinfo($file_path, PATHINFO_EXTENSION);
    switch ($ext) {
        case 'html':
            header('Content-Type: text/html');
            break;
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
        case 'gif':
            header('Content-Type: image/gif');
            break;
        case 'svg':
            header('Content-Type: image/svg+xml');
            break;
        case 'ico':
            header('Content-Type: image/x-icon');
            break;
        case 'woff':
            header('Content-Type: font/woff');
            break;
        case 'woff2':
            header('Content-Type: font/woff2');
            break;
        default:
            header('Content-Type: application/octet-stream');
    }
    readfile($file_path);
    exit();
}

// If it's not a static file, serve the React app (index.html)
if (file_exists('dist/index.html')) {
    header('Content-Type: text/html');
    readfile('dist/index.html');
} else {
    echo "Error: React build not found. Please run 'npm run build' and copy the 'out' folder to 'dist' in htdocs/mysystem/.";
}
?>
