<?php
/**
 * Authentication and Authorization Functions
 * Handles user authentication, JWT tokens, and access control
 */

/**
 * Hash password using PHP's password_hash function
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password against hash
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate JWT token
 */
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + JWT_EXPIRY;
    $payload = json_encode($payload);
    
    $headerEncoded = base64url_encode($header);
    $payloadEncoded = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
    $signatureEncoded = base64url_encode($signature);
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

/**
 * Verify and decode JWT token
 */
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = base64url_decode($parts[0]);
    $payload = base64url_decode($parts[1]);
    $signature = base64url_decode($parts[2]);
    
    $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }
    
    $payloadData = json_decode($payload, true);
    
    if ($payloadData['exp'] < time()) {
        return false;
    }
    
    return $payloadData;
}

/**
 * Base64 URL encode
 */
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64 URL decode
 */
function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

/**
 * Get current authenticated user from JWT token
 */
function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    
    $token = substr($authHeader, 7);
    $payload = verifyJWT($token);
    
    if (!$payload) {
        return null;
    }
    
    // Get user from database
    $user = dbQueryOne("SELECT * FROM users WHERE id = ? AND is_active = 1", [$payload['user_id']]);
    
    return $user;
}

/**
 * Check if user has specific role
 */
function hasRole($user, $role) {
    return $user && $user['user_type'] === $role;
}

/**
 * Check if user is admin
 */
function isAdmin($user = null) {
    if (!$user) {
        $user = getCurrentUser();
    }
    return hasRole($user, 'admin');
}

/**
 * Check if user is provider
 */
function isProvider($user = null) {
    if (!$user) {
        $user = getCurrentUser();
    }
    return hasRole($user, 'provider');
}

/**
 * Check if user is customer
 */
function isCustomer($user = null) {
    if (!$user) {
        $user = getCurrentUser();
    }
    return hasRole($user, 'customer');
}

/**
 * Require authentication
 */
function requireAuth() {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }
    return $user;
}

/**
 * Require admin role
 */
function requireAdmin() {
    $user = requireAuth();
    if (!isAdmin($user)) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }
    return $user;
}

/**
 * Require provider role
 */
function requireProvider() {
    $user = requireAuth();
    if (!isProvider($user)) {
        http_response_code(403);
        echo json_encode(['error' => 'Provider access required']);
        exit;
    }
    return $user;
}

/**
 * Generate verification token
 */
function generateVerificationToken() {
    return bin2hex(random_bytes(32));
}

/**
 * Generate password reset token
 */
function generatePasswordResetToken() {
    return bin2hex(random_bytes(32));
}

/**
 * Login user and return JWT token
 */
function loginUser($email, $password) {
    $user = dbQueryOne("SELECT * FROM users WHERE email = ? AND is_active = 1", [$email]);
    
    if (!$user || !verifyPassword($password, $user['password_hash'])) {
        return false;
    }
    
    $payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'user_type' => $user['user_type']
    ];
    
    $token = generateJWT($payload);
    
    // Update last login
    dbUpdate("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [$user['id']]);
    
    return [
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'user_type' => $user['user_type'],
            'preferred_language' => $user['preferred_language']
        ]
    ];
}

/**
 * Register new user
 */
function registerUser($userData) {
    // Check if email already exists
    $existingUser = dbQueryOne("SELECT id FROM users WHERE email = ?", [$userData['email']]);
    if ($existingUser) {
        throw new Exception("Email already exists");
    }
    
    // Hash password
    $userData['password_hash'] = hashPassword($userData['password']);
    unset($userData['password']);
    
    // Generate verification token
    $userData['verification_token'] = generateVerificationToken();
    $userData['is_verified'] = false;
    
    // Insert user
    $userId = dbInsert("
        INSERT INTO users (email, password_hash, first_name, last_name, user_type, 
                          phone, wilaya, city, preferred_language, verification_token, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ", [
        $userData['email'],
        $userData['password_hash'],
        $userData['first_name'],
        $userData['last_name'],
        $userData['user_type'] ?? 'customer',
        $userData['phone'] ?? null,
        $userData['wilaya'] ?? null,
        $userData['city'] ?? null,
        $userData['preferred_language'] ?? DEFAULT_LANGUAGE,
        $userData['verification_token'],
        $userData['is_verified']
    ]);
    
    return $userId;
}

/**
 * Verify user email
 */
function verifyUserEmail($token) {
    $user = dbQueryOne("SELECT id FROM users WHERE verification_token = ? AND is_verified = 0", [$token]);
    
    if (!$user) {
        return false;
    }
    
    dbUpdate("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?", [$user['id']]);
    
    return true;
}
?>

