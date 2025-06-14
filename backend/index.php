<?php
/**
 * Mahara API - Main Entry Point
 * Handles all API requests and routes them to appropriate handlers
 */

// Include configuration and dependencies
require_once 'config.php';

// Handle CORS
handleCORS();

// Check rate limiting
if (!checkRateLimit()) {
    errorResponse('Rate limit exceeded', 429);
}

// Get request information
$requestMethod = getRequestMethod();
$requestUri = $_SERVER['REQUEST_URI'];
$requestData = getRequestData();

// Parse the request URI to get the endpoint
$uriParts = explode('/', trim(parse_url($requestUri, PHP_URL_PATH), '/'));

// Remove 'api' from the path if present
if (isset($uriParts[0]) && $uriParts[0] === 'api') {
    array_shift($uriParts);
}

$endpoint = isset($uriParts[0]) ? $uriParts[0] : '';
$action = isset($uriParts[1]) ? $uriParts[1] : '';
$id = isset($uriParts[2]) ? $uriParts[2] : '';

// Log the request
logMessage("API Request: {$requestMethod} {$requestUri}");

try {
    // Route the request
    switch ($endpoint) {
        case 'auth':
            require_once 'api/auth.php';
            break;
            
        case 'users':
            require_once 'api/users.php';
            break;
            
        case 'services':
            require_once 'api/services.php';
            break;
            
        case 'categories':
            require_once 'api/categories.php';
            break;
            
        case 'bookings':
            require_once 'api/bookings.php';
            break;
            
        case 'reviews':
            require_once 'api/reviews.php';
            break;
            
        case 'messages':
            require_once 'api/messages.php';
            break;
            
        case 'search':
            require_once 'api/search.php';
            break;
            
        case 'admin':
            require_once 'api/admin.php';
            break;
            
        case 'upload':
            require_once 'api/upload.php';
            break;
            
        case 'notifications':
            require_once 'api/notifications.php';
            break;
            
        case 'settings':
            require_once 'api/settings.php';
            break;
            
        default:
            errorResponse('Endpoint not found', 404);
    }
    
} catch (Exception $e) {
    logMessage("API Error: " . $e->getMessage(), 'ERROR');
    
    if (APP_DEBUG) {
        errorResponse($e->getMessage(), 500);
    } else {
        errorResponse('Internal server error', 500);
    }
}
?>

