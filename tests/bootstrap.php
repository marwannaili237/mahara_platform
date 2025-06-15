<?php

// Bootstrap file for PHPUnit tests

// Define test constants
define('PASSWORD_MIN_LENGTH', 8);
define('SUPPORTED_LANGUAGES', ['ar', 'fr', 'en']);
define('CORS_ALLOWED_ORIGINS', ['*']);
define('CORS_ALLOWED_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
define('CORS_ALLOWED_HEADERS', ['Content-Type', 'Authorization', 'X-Requested-With']);
define('LOG_ENABLED', false);
define('LOG_PATH', __DIR__ . '/../backend/logs/');
define('UPLOAD_PATH', __DIR__ . '/../backend/uploads/');
define('UPLOAD_URL', '/uploads/');
define('UPLOAD_MAX_SIZE', 5242880); // 5MB
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']);
define('API_RATE_LIMIT', 100);
define('API_RATE_LIMIT_WINDOW', 3600);
define('REVIEW_MIN_RATING', 1);
define('REVIEW_MAX_RATING', 5);
define('MAIL_FROM_NAME', 'Mahara Platform');
define('MAIL_FROM_EMAIL', 'noreply@mahara.local');

// Create necessary directories for tests
$dirs = [
    __DIR__ . '/../backend/cache',
    __DIR__ . '/../backend/logs',
    __DIR__ . '/../backend/uploads'
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Include the functions we want to test
require_once __DIR__ . '/../backend/includes/functions.php';
require_once __DIR__ . '/../backend/includes/validation.php';