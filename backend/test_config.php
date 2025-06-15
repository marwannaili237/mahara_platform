<?php
/**
 * Test Configuration for Local Development
 */

// Database Configuration (SQLite for testing)
define('DB_HOST', '');
define('DB_NAME', '/workspace/mahara_platform/backend/test_mahara.db');
define('DB_USER', '');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8');

// Application Configuration
define('APP_NAME', 'Mahara');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development');
define('APP_DEBUG', true);
define('APP_URL', 'http://localhost:8000');
define('API_BASE_URL', APP_URL . '/backend');

// Security Configuration
define('JWT_SECRET', 'test-jwt-secret-key-for-development');
define('JWT_EXPIRY', 3600 * 24 * 7); // 7 days
define('PASSWORD_MIN_LENGTH', 8);
define('SESSION_LIFETIME', 3600 * 2); // 2 hours

// File Upload Configuration
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']);
define('UPLOAD_PATH', __DIR__ . '/uploads/');
define('UPLOAD_URL', APP_URL . '/uploads/');

// Email Configuration (disabled for testing)
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'test@example.com');
define('MAIL_PASSWORD', 'test-password');
define('MAIL_FROM_EMAIL', 'noreply@mahara.dz');
define('MAIL_FROM_NAME', 'Mahara Platform');

// Multilingual Configuration
define('DEFAULT_LANGUAGE', 'ar');
define('SUPPORTED_LANGUAGES', ['ar', 'fr', 'en']);
define('RTL_LANGUAGES', ['ar']);

// Business Logic Configuration
define('DEFAULT_COMMISSION_RATE', 10);
define('BOOKING_AUTO_CANCEL_HOURS', 24);
define('MAX_IMAGES_PER_SERVICE', 5);
define('REVIEW_MIN_RATING', 1);
define('REVIEW_MAX_RATING', 5);

// Pagination Configuration
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Cache Configuration
define('CACHE_ENABLED', false); // Disabled for testing
define('CACHE_LIFETIME', 3600);

// API Rate Limiting (disabled for testing)
define('API_RATE_LIMIT', 1000);
define('API_RATE_LIMIT_WINDOW', 3600);

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Africa/Algiers');

// CORS Configuration
define('CORS_ALLOWED_ORIGINS', ['*']);
define('CORS_ALLOWED_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
define('CORS_ALLOWED_HEADERS', ['Content-Type', 'Authorization', 'X-Requested-With']);

// Logging Configuration
define('LOG_ENABLED', true);
define('LOG_LEVEL', 'DEBUG');
define('LOG_PATH', __DIR__ . '/logs/');

// Create necessary directories
$directories = [
    UPLOAD_PATH,
    LOG_PATH,
    __DIR__ . '/cache/',
    __DIR__ . '/sessions/'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Include utility functions
require_once __DIR__ . '/includes/test_database.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/validation.php';
require_once __DIR__ . '/includes/translation.php';
?>