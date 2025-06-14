<?php
/**
 * Authentication API Endpoints
 * Handles user registration, login, logout, and password reset
 */

switch ($action) {
    case 'register':
        handleRegister();
        break;
        
    case 'login':
        handleLogin();
        break;
        
    case 'logout':
        handleLogout();
        break;
        
    case 'verify':
        handleVerifyEmail();
        break;
        
    case 'forgot-password':
        handleForgotPassword();
        break;
        
    case 'reset-password':
        handleResetPassword();
        break;
        
    case 'me':
        handleGetCurrentUser();
        break;
        
    default:
        errorResponse('Invalid auth action', 404);
}

/**
 * Handle user registration
 */
function handleRegister() {
    if (getRequestMethod() !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $data = getRequestData();
    
    // Validate input
    $errors = validateUserRegistration($data);
    if (!empty($errors)) {
        errorResponse('Validation failed', 400, $errors);
    }
    
    try {
        // Sanitize input
        $data = sanitizeInput($data);
        
        // Register user
        $userId = registerUser($data);
        
        // Send verification email (in production)
        if (APP_ENV === 'production') {
            $verificationLink = APP_URL . '/verify?token=' . $data['verification_token'];
            $subject = translate('email.verification.subject');
            $body = translate('email.verification.body', null, ['link' => $verificationLink]);
            sendEmail($data['email'], $subject, $body);
        }
        
        logMessage("User registered: {$data['email']}");
        
        successResponse([
            'user_id' => $userId,
            'message' => translate('auth.register.success')
        ]);
        
    } catch (Exception $e) {
        logMessage("Registration error: " . $e->getMessage(), 'ERROR');
        errorResponse($e->getMessage());
    }
}

/**
 * Handle user login
 */
function handleLogin() {
    if (getRequestMethod() !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $data = getRequestData();
    
    if (empty($data['email']) || empty($data['password'])) {
        errorResponse('Email and password are required');
    }
    
    try {
        $result = loginUser($data['email'], $data['password']);
        
        if (!$result) {
            errorResponse('Invalid credentials', 401);
        }
        
        logMessage("User logged in: {$data['email']}");
        
        successResponse($result, translate('auth.login.success'));
        
    } catch (Exception $e) {
        logMessage("Login error: " . $e->getMessage(), 'ERROR');
        errorResponse('Login failed');
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    if (getRequestMethod() !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $user = getCurrentUser();
    if ($user) {
        logMessage("User logged out: {$user['email']}");
    }
    
    successResponse([], translate('auth.logout.success'));
}

/**
 * Handle email verification
 */
function handleVerifyEmail() {
    if (getRequestMethod() !== 'GET') {
        errorResponse('Method not allowed', 405);
    }
    
    $token = isset($_GET['token']) ? $_GET['token'] : '';
    
    if (empty($token)) {
        errorResponse('Verification token is required');
    }
    
    try {
        $result = verifyUserEmail($token);
        
        if (!$result) {
            errorResponse('Invalid or expired verification token');
        }
        
        logMessage("Email verified for token: {$token}");
        
        successResponse([], translate('auth.verify.success'));
        
    } catch (Exception $e) {
        logMessage("Email verification error: " . $e->getMessage(), 'ERROR');
        errorResponse('Verification failed');
    }
}

/**
 * Handle forgot password
 */
function handleForgotPassword() {
    if (getRequestMethod() !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $data = getRequestData();
    
    if (empty($data['email'])) {
        errorResponse('Email is required');
    }
    
    try {
        $user = dbQueryOne("SELECT id, email FROM users WHERE email = ? AND is_active = 1", [$data['email']]);
        
        if ($user) {
            $resetToken = generatePasswordResetToken();
            $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour
            
            // Store reset token
            dbUpdate("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?", 
                    [$resetToken, $expiresAt, $user['id']]);
            
            // Send reset email (in production)
            if (APP_ENV === 'production') {
                $resetLink = APP_URL . '/reset-password?token=' . $resetToken;
                $subject = translate('email.password_reset.subject');
                $body = translate('email.password_reset.body', null, ['link' => $resetLink]);
                sendEmail($user['email'], $subject, $body);
            }
            
            logMessage("Password reset requested for: {$user['email']}");
        }
        
        // Always return success to prevent email enumeration
        successResponse([], translate('auth.forgot_password.success'));
        
    } catch (Exception $e) {
        logMessage("Forgot password error: " . $e->getMessage(), 'ERROR');
        errorResponse('Request failed');
    }
}

/**
 * Handle password reset
 */
function handleResetPassword() {
    if (getRequestMethod() !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $data = getRequestData();
    
    if (empty($data['token']) || empty($data['password'])) {
        errorResponse('Token and new password are required');
    }
    
    if (!validatePassword($data['password'])) {
        errorResponse('Password does not meet requirements');
    }
    
    try {
        $user = dbQueryOne("SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW() AND is_active = 1", 
                          [$data['token']]);
        
        if (!$user) {
            errorResponse('Invalid or expired reset token');
        }
        
        $passwordHash = hashPassword($data['password']);
        
        dbUpdate("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?", 
                [$passwordHash, $user['id']]);
        
        logMessage("Password reset completed for: {$user['email']}");
        
        successResponse([], translate('auth.reset_password.success'));
        
    } catch (Exception $e) {
        logMessage("Password reset error: " . $e->getMessage(), 'ERROR');
        errorResponse('Reset failed');
    }
}

/**
 * Handle get current user
 */
function handleGetCurrentUser() {
    if (getRequestMethod() !== 'GET') {
        errorResponse('Method not allowed', 405);
    }
    
    $user = requireAuth();
    
    // Remove sensitive information
    unset($user['password_hash'], $user['verification_token'], $user['reset_token']);
    
    successResponse($user);
}
?>

