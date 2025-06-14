<?php
/**
 * Services API Endpoints
 * Handles service listings, creation, updates, and management
 */

switch ($action) {
    case 'list':
    case '':
        handleListServices();
        break;
        
    case 'create':
        handleCreateService();
        break;
        
    case 'update':
        handleUpdateService();
        break;
        
    case 'delete':
        handleDeleteService();
        break;
        
    case 'view':
        handleViewService();
        break;
        
    case 'my-services':
        handleMyServices();
        break;
        
    case 'featured':
        handleFeaturedServices();
        break;
        
    default:
        // If action is numeric, treat it as service ID
        if (is_numeric($action)) {
            $id = $action;
            handleViewService();
        } else {
            errorResponse('Invalid service action', 404);
        }
}

/**
 * Handle list services with filtering and pagination
 */
function handleListServices() {
    if (getRequestMethod() !== 'GET') {
        errorResponse('Method not allowed', 405);
    }
    
    $params = $_GET;
    $page = isset($params['page']) ? intval($params['page']) : 1;
    $perPage = isset($params['per_page']) ? intval($params['per_page']) : DEFAULT_PAGE_SIZE;
    
    // Build query conditions
    $conditions = ['s.is_active = 1', 's.status = "approved"'];
    $queryParams = [];
    
    // Category filter
    if (!empty($params['category_id'])) {
        $conditions[] = 's.category_id = ?';
        $queryParams[] = $params['category_id'];
    }
    
    // Location filter
    if (!empty($params['wilaya'])) {
        $conditions[] = 's.wilaya = ?';
        $queryParams[] = $params['wilaya'];
    }
    
    if (!empty($params['city'])) {
        $conditions[] = 's.city = ?';
        $queryParams[] = $params['city'];
    }
    
    // Price range filter
    if (!empty($params['min_price'])) {
        $conditions[] = 's.price_amount >= ?';
        $queryParams[] = $params['min_price'];
    }
    
    if (!empty($params['max_price'])) {
        $conditions[] = 's.price_amount <= ?';
        $queryParams[] = $params['max_price'];
    }
    
    // Search filter
    if (!empty($params['search'])) {
        $search = validateSearchQuery($params['search']);
        if ($search) {
            $language = getUserLanguage();
            $searchField = "title_{$language}";
            $descField = "description_{$language}";
            
            $conditions[] = "(s.{$searchField} LIKE ? OR s.{$descField} LIKE ?)";
            $searchTerm = "%{$search}%";
            $queryParams[] = $searchTerm;
            $queryParams[] = $searchTerm;
        }
    }
    
    // Build the main query
    $whereClause = implode(' AND ', $conditions);
    $orderBy = 'ORDER BY s.is_featured DESC, s.created_at DESC';
    
    $query = "
        SELECT s.*, 
               u.first_name, u.last_name, u.profile_image,
               c.name_ar as category_name_ar, c.name_fr as category_name_fr, c.name_en as category_name_en,
               AVG(r.rating) as avg_rating,
               COUNT(DISTINCT b.id) as total_bookings
        FROM services s
        LEFT JOIN users u ON s.provider_id = u.id
        LEFT JOIN service_categories c ON s.category_id = c.id
        LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'completed'
        LEFT JOIN reviews r ON b.id = r.booking_id AND r.reviewed_id = s.provider_id
        WHERE {$whereClause}
        GROUP BY s.id
        {$orderBy}
    ";
    
    try {
        $result = getDB()->paginate($query, $queryParams, $page, $perPage);
        
        // Format the results
        $services = array_map(function($service) {
            return formatServiceData($service);
        }, $result['data']);
        
        successResponse([
            'services' => $services,
            'pagination' => $result['pagination']
        ]);
        
    } catch (Exception $e) {
        logMessage("List services error: " . $e->getMessage(), 'ERROR');
        errorResponse('Failed to fetch services');
    }
}

/**
 * Handle create service
 */
function handleCreateService() {
    if (getRequestMethod() !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $user = requireProvider();
    $data = getRequestData();
    
    // Validate input
    $errors = validateServiceData($data);
    if (!empty($errors)) {
        errorResponse('Validation failed', 400, $errors);
    }
    
    try {
        // Sanitize input
        $data = sanitizeInput($data);
        
        // Set provider ID
        $data['provider_id'] = $user['id'];
        
        // Handle images if provided
        $images = [];
        if (isset($_FILES['images'])) {
            foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
                if (!empty($tmpName)) {
                    $file = [
                        'name' => $_FILES['images']['name'][$key],
                        'type' => $_FILES['images']['type'][$key],
                        'tmp_name' => $tmpName,
                        'error' => $_FILES['images']['error'][$key],
                        'size' => $_FILES['images']['size'][$key]
                    ];
                    
                    $upload = uploadFile($file, 'services');
                    $images[] = $upload['url'];
                }
            }
        }
        
        // Insert service
        $serviceId = dbInsert("
            INSERT INTO services (
                provider_id, category_id, title_ar, title_fr, title_en,
                description_ar, description_fr, description_en,
                price_type, price_amount, currency, duration_estimate,
                service_location, wilaya, city, specific_address,
                requirements, images, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ", [
            $data['provider_id'],
            $data['category_id'],
            $data['title_ar'],
            $data['title_fr'],
            $data['title_en'],
            $data['description_ar'],
            $data['description_fr'],
            $data['description_en'],
            $data['price_type'],
            $data['price_amount'] ?? null,
            $data['currency'] ?? 'DZD',
            $data['duration_estimate'] ?? null,
            $data['service_location'],
            $data['wilaya'] ?? null,
            $data['city'] ?? null,
            $data['specific_address'] ?? null,
            $data['requirements'] ?? null,
            json_encode($images)
        ]);
        
        logMessage("Service created: ID {$serviceId} by user {$user['id']}");
        
        successResponse([
            'service_id' => $serviceId,
            'message' => translate('service.create.success')
        ]);
        
    } catch (Exception $e) {
        logMessage("Create service error: " . $e->getMessage(), 'ERROR');
        errorResponse('Failed to create service');
    }
}

/**
 * Handle view service
 */
function handleViewService() {
    global $id, $action;
    
    if (getRequestMethod() !== 'GET') {
        errorResponse('Method not allowed', 405);
    }
    
    $serviceId = $id ?: $action;
    
    if (!is_numeric($serviceId)) {
        errorResponse('Invalid service ID');
    }
    
    try {
        $service = dbQueryOne("
            SELECT s.*, 
                   u.first_name, u.last_name, u.profile_image, u.email, u.phone,
                   u.wilaya as provider_wilaya, u.city as provider_city,
                   c.name_ar as category_name_ar, c.name_fr as category_name_fr, c.name_en as category_name_en,
                   AVG(r.rating) as avg_rating,
                   COUNT(DISTINCT r.id) as total_reviews,
                   COUNT(DISTINCT b.id) as total_bookings
            FROM services s
            LEFT JOIN users u ON s.provider_id = u.id
            LEFT JOIN service_categories c ON s.category_id = c.id
            LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'completed'
            LEFT JOIN reviews r ON b.id = r.booking_id AND r.reviewed_id = s.provider_id
            WHERE s.id = ? AND s.is_active = 1
            GROUP BY s.id
        ", [$serviceId]);
        
        if (!$service) {
            errorResponse('Service not found', 404);
        }
        
        // Increment view count
        dbUpdate("UPDATE services SET views_count = views_count + 1 WHERE id = ?", [$serviceId]);
        
        // Get recent reviews
        $reviews = dbQuery("
            SELECT r.*, u.first_name, u.last_name, u.profile_image
            FROM reviews r
            LEFT JOIN users u ON r.reviewer_id = u.id
            LEFT JOIN bookings b ON r.booking_id = b.id
            WHERE b.service_id = ? AND r.is_visible = 1
            ORDER BY r.created_at DESC
            LIMIT 5
        ", [$serviceId]);
        
        $formattedService = formatServiceData($service);
        $formattedService['reviews'] = $reviews;
        
        successResponse($formattedService);
        
    } catch (Exception $e) {
        logMessage("View service error: " . $e->getMessage(), 'ERROR');
        errorResponse('Failed to fetch service');
    }
}

/**
 * Handle my services (for providers)
 */
function handleMyServices() {
    if (getRequestMethod() !== 'GET') {
        errorResponse('Method not allowed', 405);
    }
    
    $user = requireProvider();
    
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? intval($_GET['per_page']) : DEFAULT_PAGE_SIZE;
    
    try {
        $query = "
            SELECT s.*, 
                   c.name_ar as category_name_ar, c.name_fr as category_name_fr, c.name_en as category_name_en,
                   AVG(r.rating) as avg_rating,
                   COUNT(DISTINCT b.id) as total_bookings
            FROM services s
            LEFT JOIN service_categories c ON s.category_id = c.id
            LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'completed'
            LEFT JOIN reviews r ON b.id = r.booking_id AND r.reviewed_id = s.provider_id
            WHERE s.provider_id = ?
            GROUP BY s.id
            ORDER BY s.created_at DESC
        ";
        
        $result = getDB()->paginate($query, [$user['id']], $page, $perPage);
        
        // Format the results
        $services = array_map(function($service) {
            return formatServiceData($service);
        }, $result['data']);
        
        successResponse([
            'services' => $services,
            'pagination' => $result['pagination']
        ]);
        
    } catch (Exception $e) {
        logMessage("My services error: " . $e->getMessage(), 'ERROR');
        errorResponse('Failed to fetch services');
    }
}

/**
 * Handle featured services
 */
function handleFeaturedServices() {
    if (getRequestMethod() !== 'GET') {
        errorResponse('Method not allowed', 405);
    }
    
    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), 20) : 10;
    
    try {
        $services = dbQuery("
            SELECT s.*, 
                   u.first_name, u.last_name, u.profile_image,
                   c.name_ar as category_name_ar, c.name_fr as category_name_fr, c.name_en as category_name_en,
                   AVG(r.rating) as avg_rating,
                   COUNT(DISTINCT b.id) as total_bookings
            FROM services s
            LEFT JOIN users u ON s.provider_id = u.id
            LEFT JOIN service_categories c ON s.category_id = c.id
            LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'completed'
            LEFT JOIN reviews r ON b.id = r.booking_id AND r.reviewed_id = s.provider_id
            WHERE s.is_active = 1 AND s.status = 'approved' AND s.is_featured = 1
            GROUP BY s.id
            ORDER BY s.created_at DESC
            LIMIT ?
        ", [$limit]);
        
        // Format the results
        $formattedServices = array_map(function($service) {
            return formatServiceData($service);
        }, $services);
        
        successResponse($formattedServices);
        
    } catch (Exception $e) {
        logMessage("Featured services error: " . $e->getMessage(), 'ERROR');
        errorResponse('Failed to fetch featured services');
    }
}

/**
 * Format service data for API response
 */
function formatServiceData($service) {
    $multilingualFields = ['title', 'description', 'category_name'];
    $formatted = formatMultilingualData($service, $multilingualFields);
    
    // Parse images JSON
    if (!empty($service['images'])) {
        $formatted['images'] = json_decode($service['images'], true) ?: [];
    } else {
        $formatted['images'] = [];
    }
    
    // Format price
    if ($service['price_type'] !== 'negotiable' && !empty($service['price_amount'])) {
        $formatted['formatted_price'] = formatCurrency($service['price_amount'], $service['currency']);
    } else {
        $formatted['formatted_price'] = translate('service.price.negotiable');
    }
    
    // Format rating
    $formatted['avg_rating'] = $service['avg_rating'] ? round($service['avg_rating'], 1) : 0;
    $formatted['total_reviews'] = intval($service['total_reviews'] ?? 0);
    $formatted['total_bookings'] = intval($service['total_bookings'] ?? 0);
    
    // Provider info
    $formatted['provider'] = [
        'id' => $service['provider_id'],
        'name' => $service['first_name'] . ' ' . $service['last_name'],
        'profile_image' => $service['profile_image']
    ];
    
    return $formatted;
}
?>

