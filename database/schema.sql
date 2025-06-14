-- Mahara Database Schema
-- This file contains the complete database schema for the Mahara platform
-- Character set: utf8mb4 for full Unicode support including emojis
-- Collation: utf8mb4_unicode_ci for proper sorting and comparison

-- Create database (run this separately if needed)
-- CREATE DATABASE mahara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE mahara_db;

-- Table: users
-- Stores information for both customers and service providers
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('customer', 'provider', 'admin') NOT NULL DEFAULT 'customer',
    profile_image VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    wilaya VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language ENUM('ar', 'fr', 'en') DEFAULT 'ar',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_location (wilaya, city),
    INDEX idx_is_active (is_active)
);

-- Table: service_categories
-- Stores service categories with multilingual support
CREATE TABLE service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT,
    description_fr TEXT,
    description_en TEXT,
    icon VARCHAR(255),
    parent_id INT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES service_categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Table: services
-- Stores service listings created by providers
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    category_id INT NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_ar TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    description_en TEXT NOT NULL,
    price_type ENUM('fixed', 'hourly', 'negotiable') NOT NULL,
    price_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'DZD',
    duration_estimate VARCHAR(100),
    availability_schedule JSON,
    service_location ENUM('provider_location', 'customer_location', 'online', 'flexible') NOT NULL,
    wilaya VARCHAR(100),
    city VARCHAR(100),
    specific_address TEXT,
    requirements TEXT,
    images JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
    INDEX idx_provider (provider_id),
    INDEX idx_category (category_id),
    INDEX idx_location (wilaya, city),
    INDEX idx_status (status),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    FULLTEXT idx_search_ar (title_ar, description_ar),
    FULLTEXT idx_search_fr (title_fr, description_fr),
    FULLTEXT idx_search_en (title_en, description_en)
);

-- Table: bookings
-- Stores service booking requests and their status
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME,
    duration_hours DECIMAL(4, 2),
    location_type ENUM('provider_location', 'customer_location', 'online', 'other') NOT NULL,
    service_address TEXT,
    customer_notes TEXT,
    provider_notes TEXT,
    estimated_price DECIMAL(10, 2),
    final_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'DZD',
    status ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'disputed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    completion_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_provider (provider_id),
    INDEX idx_service (service_id),
    INDEX idx_status (status),
    INDEX idx_date (requested_date),
    INDEX idx_reference (booking_reference)
);

-- Table: reviews
-- Stores reviews and ratings for completed services
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    reviewer_type ENUM('customer', 'provider') NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    response_text TEXT,
    response_date TIMESTAMP NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_reviewer (booking_id, reviewer_id),
    INDEX idx_reviewed (reviewed_id),
    INDEX idx_rating (rating),
    INDEX idx_visible (is_visible)
);

-- Table: messages
-- Stores messages between customers and providers
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    message_text TEXT NOT NULL,
    attachment_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    is_system_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_sender (sender_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- Table: provider_skills
-- Stores additional skills and certifications for providers
CREATE TABLE provider_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    skill_name_ar VARCHAR(255) NOT NULL,
    skill_name_fr VARCHAR(255) NOT NULL,
    skill_name_en VARCHAR(255) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
    years_experience INT,
    certification_name VARCHAR(255),
    certification_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id),
    INDEX idx_verified (is_verified)
);

-- Table: favorites
-- Stores customer favorites (services or providers)
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    favoritable_type ENUM('service', 'provider') NOT NULL,
    favoritable_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (customer_id, favoritable_type, favoritable_id),
    INDEX idx_customer (customer_id),
    INDEX idx_favoritable (favoritable_type, favoritable_id)
);

-- Table: notifications
-- Stores system notifications for users
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    message_ar TEXT NOT NULL,
    message_fr TEXT NOT NULL,
    message_en TEXT NOT NULL,
    related_id INT,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
);

-- Table: reports
-- Stores user reports for inappropriate content or behavior
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_type ENUM('user', 'service', 'review', 'message') NOT NULL,
    reported_id INT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reporter (reporter_id),
    INDEX idx_reported (reported_type, reported_id),
    INDEX idx_status (status)
);

-- Table: system_settings
-- Stores system-wide configuration settings
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description_ar TEXT,
    description_fr TEXT,
    description_en TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (setting_key),
    INDEX idx_public (is_public)
);

-- Table: audit_logs
-- Stores audit trail for important system actions
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created (created_at)
);

-- Insert default service categories
INSERT INTO service_categories (name_ar, name_fr, name_en, description_ar, description_fr, description_en, icon, sort_order) VALUES
('خدمات المنزل', 'Services à domicile', 'Home Services', 'خدمات الصيانة والإصلاح المنزلي', 'Services de maintenance et réparation à domicile', 'Home maintenance and repair services', 'home', 1),
('التعليم والتدريب', 'Éducation et formation', 'Education & Training', 'دروس خصوصية وتدريب مهني', 'Cours particuliers et formation professionnelle', 'Private tutoring and professional training', 'education', 2),
('التكنولوجيا والبرمجة', 'Technologie et programmation', 'Technology & Programming', 'خدمات تقنية وتطوير البرمجيات', 'Services techniques et développement logiciel', 'Technical services and software development', 'technology', 3),
('الفنون والحرف', 'Arts et artisanat', 'Arts & Crafts', 'الأعمال الفنية والحرفية التقليدية', 'Œuvres artistiques et artisanat traditionnel', 'Artistic works and traditional crafts', 'art', 4),
('العناية الشخصية', 'Soins personnels', 'Personal Care', 'خدمات التجميل والعناية الشخصية', 'Services de beauté et soins personnels', 'Beauty and personal care services', 'care', 5),
('المناسبات والفعاليات', 'Événements', 'Events & Occasions', 'تنظيم المناسبات والحفلات', 'Organisation d\'événements et de fêtes', 'Event and party organization', 'events', 6);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description_ar, description_fr, description_en, is_public) VALUES
('platform_name', 'Mahara', 'string', 'اسم المنصة', 'Nom de la plateforme', 'Platform name', true),
('default_currency', 'DZD', 'string', 'العملة الافتراضية', 'Devise par défaut', 'Default currency', true),
('commission_rate', '10', 'integer', 'نسبة العمولة بالمئة', 'Taux de commission en pourcentage', 'Commission rate in percentage', false),
('max_images_per_service', '5', 'integer', 'الحد الأقصى للصور لكل خدمة', 'Nombre maximum d\'images par service', 'Maximum images per service', false),
('booking_auto_cancel_hours', '24', 'integer', 'ساعات الإلغاء التلقائي للحجز', 'Heures d\'annulation automatique de réservation', 'Booking auto-cancel hours', false);

-- Create default admin user (password should be changed immediately)
-- Default password: 'admin123' (hashed with PHP password_hash)
INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active, preferred_language) VALUES
('admin@mahara.dz', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', true, true, 'ar');

