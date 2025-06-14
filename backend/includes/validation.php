<?php
/**
 * Validation Functions
 * Handles input validation and sanitization
 */

/**
 * Validate email address
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number (Algerian format)
 */
function validatePhone($phone) {
    // Remove spaces and special characters
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    
    // Algerian phone number patterns
    $patterns = [
        '/^(\+213|0)(5|6|7)[0-9]{8}$/', // Mobile
        '/^(\+213|0)(2|3|4)[0-9]{7}$/'  // Landline
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $phone)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Validate password strength
 */
function validatePassword($password) {
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        return false;
    }
    
    // Check for at least one letter and one number
    if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        return false;
    }
    
    return true;
}

/**
 * Validate user registration data
 */
function validateUserRegistration($data) {
    $errors = [];
    
    // Required fields
    $required = ['email', 'password', 'first_name', 'last_name'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "Field is required";
        }
    }
    
    // Email validation
    if (!empty($data['email']) && !validateEmail($data['email'])) {
        $errors['email'] = "Invalid email format";
    }
    
    // Password validation
    if (!empty($data['password']) && !validatePassword($data['password'])) {
        $errors['password'] = "Password must be at least " . PASSWORD_MIN_LENGTH . " characters and contain letters and numbers";
    }
    
    // Phone validation (if provided)
    if (!empty($data['phone']) && !validatePhone($data['phone'])) {
        $errors['phone'] = "Invalid phone number format";
    }
    
    // Name validation
    if (!empty($data['first_name']) && strlen($data['first_name']) < 2) {
        $errors['first_name'] = "First name must be at least 2 characters";
    }
    
    if (!empty($data['last_name']) && strlen($data['last_name']) < 2) {
        $errors['last_name'] = "Last name must be at least 2 characters";
    }
    
    // User type validation
    if (!empty($data['user_type']) && !in_array($data['user_type'], ['customer', 'provider'])) {
        $errors['user_type'] = "Invalid user type";
    }
    
    // Language validation
    if (!empty($data['preferred_language']) && !in_array($data['preferred_language'], SUPPORTED_LANGUAGES)) {
        $errors['preferred_language'] = "Unsupported language";
    }
    
    return $errors;
}

/**
 * Validate service data
 */
function validateServiceData($data) {
    $errors = [];
    
    // Required fields
    $required = ['title_ar', 'title_fr', 'title_en', 'description_ar', 'description_fr', 'description_en', 'category_id', 'price_type'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "Field is required";
        }
    }
    
    // Title length validation
    foreach (['title_ar', 'title_fr', 'title_en'] as $field) {
        if (!empty($data[$field]) && strlen($data[$field]) < 5) {
            $errors[$field] = "Title must be at least 5 characters";
        }
    }
    
    // Description length validation
    foreach (['description_ar', 'description_fr', 'description_en'] as $field) {
        if (!empty($data[$field]) && strlen($data[$field]) < 20) {
            $errors[$field] = "Description must be at least 20 characters";
        }
    }
    
    // Price type validation
    if (!empty($data['price_type']) && !in_array($data['price_type'], ['fixed', 'hourly', 'negotiable'])) {
        $errors['price_type'] = "Invalid price type";
    }
    
    // Price amount validation
    if ($data['price_type'] !== 'negotiable' && (empty($data['price_amount']) || !is_numeric($data['price_amount']) || $data['price_amount'] <= 0)) {
        $errors['price_amount'] = "Valid price amount is required";
    }
    
    // Service location validation
    if (!empty($data['service_location']) && !in_array($data['service_location'], ['provider_location', 'customer_location', 'online', 'flexible'])) {
        $errors['service_location'] = "Invalid service location";
    }
    
    return $errors;
}

/**
 * Validate booking data
 */
function validateBookingData($data) {
    $errors = [];
    
    // Required fields
    $required = ['service_id', 'requested_date', 'location_type'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "Field is required";
        }
    }
    
    // Date validation
    if (!empty($data['requested_date'])) {
        $date = DateTime::createFromFormat('Y-m-d', $data['requested_date']);
        if (!$date || $date->format('Y-m-d') !== $data['requested_date']) {
            $errors['requested_date'] = "Invalid date format";
        } elseif ($date < new DateTime()) {
            $errors['requested_date'] = "Date cannot be in the past";
        }
    }
    
    // Time validation (if provided)
    if (!empty($data['requested_time'])) {
        $time = DateTime::createFromFormat('H:i', $data['requested_time']);
        if (!$time || $time->format('H:i') !== $data['requested_time']) {
            $errors['requested_time'] = "Invalid time format";
        }
    }
    
    // Duration validation (if provided)
    if (!empty($data['duration_hours']) && (!is_numeric($data['duration_hours']) || $data['duration_hours'] <= 0)) {
        $errors['duration_hours'] = "Duration must be a positive number";
    }
    
    // Location type validation
    if (!empty($data['location_type']) && !in_array($data['location_type'], ['provider_location', 'customer_location', 'online', 'other'])) {
        $errors['location_type'] = "Invalid location type";
    }
    
    return $errors;
}

/**
 * Validate review data
 */
function validateReviewData($data) {
    $errors = [];
    
    // Required fields
    $required = ['rating'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "Field is required";
        }
    }
    
    // Rating validation
    if (!empty($data['rating']) && (!is_numeric($data['rating']) || $data['rating'] < REVIEW_MIN_RATING || $data['rating'] > REVIEW_MAX_RATING)) {
        $errors['rating'] = "Rating must be between " . REVIEW_MIN_RATING . " and " . REVIEW_MAX_RATING;
    }
    
    // Review text validation (if provided)
    if (!empty($data['review_text']) && strlen($data['review_text']) < 10) {
        $errors['review_text'] = "Review text must be at least 10 characters";
    }
    
    return $errors;
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate file upload
 */
function validateFileUpload($file) {
    $errors = [];
    
    // Check if file was uploaded
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = "File upload failed";
        return $errors;
    }
    
    // Check file size
    if ($file['size'] > UPLOAD_MAX_SIZE) {
        $errors[] = "File size exceeds maximum allowed size";
    }
    
    // Check file type
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($fileExtension, UPLOAD_ALLOWED_TYPES)) {
        $errors[] = "File type not allowed";
    }
    
    // Check if file is actually an image (for image uploads)
    if (in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
        $imageInfo = getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            $errors[] = "File is not a valid image";
        }
    }
    
    return $errors;
}

/**
 * Generate unique filename for uploads
 */
function generateUniqueFilename($originalName) {
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    return uniqid() . '_' . time() . '.' . $extension;
}

/**
 * Validate Algerian wilaya (province)
 */
function validateWilaya($wilaya) {
    $validWilayas = [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
        'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
        'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
        'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
        'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
        'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
        'Ghardaïa', 'Relizane'
    ];
    
    return in_array($wilaya, $validWilayas);
}

/**
 * Clean and validate search query
 */
function validateSearchQuery($query) {
    $query = trim($query);
    
    // Minimum length
    if (strlen($query) < 2) {
        return false;
    }
    
    // Maximum length
    if (strlen($query) > 100) {
        return false;
    }
    
    // Remove special characters except spaces, Arabic, French, and English letters
    $query = preg_replace('/[^\p{L}\p{N}\s\-_]/u', '', $query);
    
    return $query;
}
?>

