<?php
/**
 * Mahara Platform Configuration File
 * This file contains all the configuration settings for the Mahara platform
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'mahara_db');
define('DB_USER', 'mahara_user');
define('DB_PASS', 'your_password');
define('DB_CHARSET', 'utf8mb4');

// Application Configuration
define('APP_NAME', 'Mahara');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development'); // development, production
define('APP_DEBUG', true);
define('APP_URL', 'http://mahara.local');
define('API_BASE_URL', APP_URL . '/api');

// Security Configuration
define('JWT_SECRET', 'your-jwt-secret-key-change-this-in-production');
define('JWT_EXPIRY', 3600 * 24 * 7); // 7 days
define('PASSWORD_MIN_LENGTH', 8);
define('SESSION_LIFETIME', 3600 * 2); // 2 hours

// File Upload Configuration
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']);
define('UPLOAD_PATH', __DIR__ . '/uploads/');
define('UPLOAD_URL', APP_URL . '/uploads/');

// Email Configuration
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'your-email@gmail.com');
define('MAIL_PASSWORD', 'your-email-password');
define('MAIL_FROM_EMAIL', 'noreply@mahara.dz');
define('MAIL_FROM_NAME', 'Mahara Platform');

// Multilingual Configuration
define('DEFAULT_LANGUAGE', 'ar');
define('SUPPORTED_LANGUAGES', ['ar', 'fr', 'en']);
define('RTL_LANGUAGES', ['ar']);

// Business Logic Configuration
define('DEFAULT_COMMISSION_RATE', 10); // Percentage
define('BOOKING_AUTO_CANCEL_HOURS', 24);
define('MAX_IMAGES_PER_SERVICE', 5);
define('REVIEW_MIN_RATING', 1);
define('REVIEW_MAX_RATING', 5);

// Pagination Configuration
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Cache Configuration
define('CACHE_ENABLED', true);
define('CACHE_LIFETIME', 3600); // 1 hour

// API Rate Limiting
define('API_RATE_LIMIT', 100); // requests per hour per IP
define('API_RATE_LIMIT_WINDOW', 3600); // 1 hour

// Error Reporting
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('Africa/Algiers');

// CORS Configuration
define('CORS_ALLOWED_ORIGINS', ['*']); // In production, specify exact domains
define('CORS_ALLOWED_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
define('CORS_ALLOWED_HEADERS', ['Content-Type', 'Authorization', 'X-Requested-With']);

// Logging Configuration
define('LOG_ENABLED', true);
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR
define('LOG_PATH', __DIR__ . '/logs/');

// Create necessary directories if they don't exist
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

// Autoload function for classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/classes/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Include utility functions
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/validation.php';
require_once __DIR__ . '/includes/translation.php';
?>

