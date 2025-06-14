<?php
/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send error response
 */
function errorResponse($message, $statusCode = 400, $errors = []) {
    $response = [
        'success' => false,
        'message' => $message
    ];
    
    if (!empty($errors)) {
        $response['errors'] = $errors;
    }
    
    jsonResponse($response, $statusCode);
}

/**
 * Send success response
 */
function successResponse($data = [], $message = 'Success') {
    $response = [
        'success' => true,
        'message' => $message,
        'data' => $data
    ];
    
    jsonResponse($response);
}

/**
 * Get request method
 */
function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Get request data (JSON or form data)
 */
function getRequestData() {
    $method = getRequestMethod();
    
    if ($method === 'GET') {
        return $_GET;
    }
    
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?: [];
    }
    
    return $_POST;
}

/**
 * Handle CORS
 */
function handleCORS() {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array('*', CORS_ALLOWED_ORIGINS) || in_array($origin, CORS_ALLOWED_ORIGINS)) {
        header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
    }
    
    header('Access-Control-Allow-Methods: ' . implode(', ', CORS_ALLOWED_METHODS));
    header('Access-Control-Allow-Headers: ' . implode(', ', CORS_ALLOWED_HEADERS));
    header('Access-Control-Allow-Credentials: true');
    
    if (getRequestMethod() === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Log message
 */
function logMessage($message, $level = 'INFO') {
    if (!LOG_ENABLED) {
        return;
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
    
    $logFile = LOG_PATH . 'app_' . date('Y-m-d') . '.log';
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Generate unique booking reference
 */
function generateBookingReference() {
    return 'MH' . date('Ymd') . strtoupper(substr(uniqid(), -6));
}

/**
 * Upload file
 */
function uploadFile($file, $directory = 'general') {
    $uploadErrors = validateFileUpload($file);
    if (!empty($uploadErrors)) {
        throw new Exception(implode(', ', $uploadErrors));
    }
    
    $uploadDir = UPLOAD_PATH . $directory . '/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filename = generateUniqueFilename($file['name']);
    $uploadPath = $uploadDir . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to upload file');
    }
    
    return [
        'filename' => $filename,
        'path' => $uploadPath,
        'url' => UPLOAD_URL . $directory . '/' . $filename,
        'size' => $file['size'],
        'type' => $file['type']
    ];
}

/**
 * Delete file
 */
function deleteFile($filePath) {
    if (file_exists($filePath)) {
        return unlink($filePath);
    }
    return false;
}

/**
 * Generate random string
 */
function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

/**
 * Calculate distance between two coordinates
 */
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371; // Earth's radius in kilometers
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    
    return $earthRadius * $c;
}

/**
 * Send email notification
 */
function sendEmail($to, $subject, $body, $isHTML = true) {
    // This is a basic implementation. In production, use a proper email library like PHPMailer
    $headers = [
        'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM_EMAIL . '>',
        'Reply-To: ' . MAIL_FROM_EMAIL,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    if ($isHTML) {
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
    }
    
    return mail($to, $subject, $body, implode("\r\n", $headers));
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
}

/**
 * Rate limiting check
 */
function checkRateLimit($identifier = null) {
    if ($identifier === null) {
        $identifier = getClientIP();
    }
    
    $cacheFile = __DIR__ . '/../cache/rate_limit_' . md5($identifier) . '.json';
    $now = time();
    $windowStart = $now - API_RATE_LIMIT_WINDOW;
    
    $requests = [];
    if (file_exists($cacheFile)) {
        $data = json_decode(file_get_contents($cacheFile), true);
        if ($data) {
            $requests = array_filter($data, function($timestamp) use ($windowStart) {
                return $timestamp > $windowStart;
            });
        }
    }
    
    if (count($requests) >= API_RATE_LIMIT) {
        return false;
    }
    
    $requests[] = $now;
    file_put_contents($cacheFile, json_encode($requests));
    
    return true;
}

/**
 * Clean old cache files
 */
function cleanOldCacheFiles() {
    $cacheDir = __DIR__ . '/../cache/';
    $files = glob($cacheDir . '*');
    $now = time();
    
    foreach ($files as $file) {
        if (is_file($file) && ($now - filemtime($file)) > 86400) { // 24 hours
            unlink($file);
        }
    }
}

/**
 * Format file size
 */
function formatFileSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= pow(1024, $pow);
    
    return round($bytes, 2) . ' ' . $units[$pow];
}

/**
 * Truncate text
 */
function truncateText($text, $length = 100, $suffix = '...') {
    if (mb_strlen($text) <= $length) {
        return $text;
    }
    
    return mb_substr($text, 0, $length) . $suffix;
}

/**
 * Generate SEO-friendly slug
 */
function generateSlug($text) {
    // Convert to lowercase
    $text = mb_strtolower($text);
    
    // Replace Arabic characters with transliteration
    $arabicMap = [
        'ا' => 'a', 'ب' => 'b', 'ت' => 't', 'ث' => 'th', 'ج' => 'j',
        'ح' => 'h', 'خ' => 'kh', 'د' => 'd', 'ذ' => 'dh', 'ر' => 'r',
        'ز' => 'z', 'س' => 's', 'ش' => 'sh', 'ص' => 's', 'ض' => 'd',
        'ط' => 't', 'ظ' => 'z', 'ع' => 'a', 'غ' => 'gh', 'ف' => 'f',
        'ق' => 'q', 'ك' => 'k', 'ل' => 'l', 'م' => 'm', 'ن' => 'n',
        'ه' => 'h', 'و' => 'w', 'ي' => 'y'
    ];
    
    $text = strtr($text, $arabicMap);
    
    // Remove special characters
    $text = preg_replace('/[^a-z0-9\s\-]/', '', $text);
    
    // Replace spaces and multiple hyphens with single hyphen
    $text = preg_replace('/[\s\-]+/', '-', $text);
    
    // Trim hyphens from ends
    return trim($text, '-');
}
?>

