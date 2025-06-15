<?php
/**
 * Test API Entry Point for Local Development
 */

// Include test configuration
require_once 'test_config.php';

// Handle CORS
handleCORS();

// Get request information
$requestMethod = getRequestMethod();
$requestUri = $_SERVER['REQUEST_URI'];
$requestData = getRequestData();

// Parse the request URI to get the endpoint
$uriParts = explode('/', trim(parse_url($requestUri, PHP_URL_PATH), '/'));

// Remove 'backend' from the path if present
if (isset($uriParts[0]) && $uriParts[0] === 'backend') {
    array_shift($uriParts);
}

// Remove 'test_index.php' from the path if present
if (isset($uriParts[0]) && $uriParts[0] === 'test_index.php') {
    array_shift($uriParts);
}

$endpoint = isset($uriParts[0]) ? $uriParts[0] : '';
$action = isset($uriParts[1]) ? $uriParts[1] : '';
$id = isset($uriParts[2]) ? $uriParts[2] : '';

// Log the request
logMessage("Test API Request: {$requestMethod} {$requestUri}");
logMessage("Parsed endpoint: {$endpoint}, action: {$action}");

try {
    // Route the request
    switch ($endpoint) {
        case 'auth':
            require_once 'api/auth.php';
            break;
            
        case 'test':
            // Simple test endpoint
            successResponse(['message' => 'Test API is working!', 'timestamp' => date('Y-m-d H:i:s')]);
            break;
            
        default:
            errorResponse('Endpoint not found: ' . $endpoint, 404);
    }
    
} catch (Exception $e) {
    logMessage("Test API Error: " . $e->getMessage(), 'ERROR');
    
    if (APP_DEBUG) {
        errorResponse($e->getMessage() . ' (File: ' . $e->getFile() . ', Line: ' . $e->getLine() . ')', 500);
    } else {
        errorResponse('Internal server error', 500);
    }
}
?>