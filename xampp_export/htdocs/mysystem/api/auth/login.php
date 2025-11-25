<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill in all fields']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, username, password FROM accounts WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
    exit;
}

if(isset($_SESSION['user_id'])) {
    header("Location: /mysystem/");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Smart Adapter</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="min-h-screen flex items-center justify-center bg-background text-foreground fade-in tech-grid">
    
    <!-- Removed splash screen section entirely -->

    <div class="w-full max-w-sm p-4 relative z-10">
        <div class="text-center mb-6">
            <h1 class="text-3xl font-bold font-display tracking-tight glow-text">Smart Adapter</h1>
            <p class="text-sm text-muted-foreground mt-2 tracking-widest uppercase text-xs">Power. Protected.</p>
        </div>

        <div class="card slide-up backdrop-blur">
            <div class="card-header text-center">
                <h2 class="card-title text-2xl">Welcome Back</h2>
                <p class="card-description">Enter your email below to login to your account</p>
            </div>
            
            <div class="card-content">
                <div id="message" class="message"></div>
                
                <form id="loginForm" class="space-y-4">
                    <div class="form-group">
                        <label for="email" class="label">Email</label>
                        <input type="email" id="email" name="email" class="input" placeholder="m@example.com" required>
                    </div>
                    
                    <div class="form-group">
                        <div class="flex items-center justify-between">
                            <label for="password" class="label">Password</label>
                        </div>
                        <div class="relative">
                            <input type="password" id="password" name="password" class="input pr-10" required>
                            <button type="button" class="password-toggle" data-target="password" aria-label="Toggle password visibility">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-off-icon hidden"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" class="button button-primary">Sign In</button>
                </form>

                <div class="text-center text-sm mt-6 text-muted-foreground">
                    Don't have an account? 
                    <a href="register.php" class="underline text-foreground hover:text-primary transition-colors">Sign up</a>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
