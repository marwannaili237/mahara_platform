// Mahara Platform Configuration
const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:8000/backend/test_index.php',
    API_ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            ME: '/auth/me',
            VERIFY: '/auth/verify',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password'
        },
        SERVICES: {
            LIST: '/services/list',
            CREATE: '/services/create',
            VIEW: '/services/view',
            UPDATE: '/services/update',
            DELETE: '/services/delete',
            MY_SERVICES: '/services/my-services',
            FEATURED: '/services/featured'
        },
        CATEGORIES: {
            LIST: '/categories/list',
            VIEW: '/categories/view'
        },
        BOOKINGS: {
            LIST: '/bookings/list',
            CREATE: '/bookings/create',
            VIEW: '/bookings/view',
            UPDATE: '/bookings/update',
            CANCEL: '/bookings/cancel',
            MY_BOOKINGS: '/bookings/my-bookings'
        },
        REVIEWS: {
            LIST: '/reviews/list',
            CREATE: '/reviews/create',
            UPDATE: '/reviews/update',
            DELETE: '/reviews/delete'
        },
        SEARCH: {
            SERVICES: '/search/services',
            PROVIDERS: '/search/providers'
        },
        UPLOAD: {
            IMAGE: '/upload/image',
            DOCUMENT: '/upload/document'
        },
        NOTIFICATIONS: {
            LIST: '/notifications/list',
            MARK_READ: '/notifications/mark-read',
            MARK_ALL_READ: '/notifications/mark-all-read'
        }
    },

    // Application Settings
    APP: {
        NAME: 'Mahara',
        VERSION: '1.0.0',
        DEFAULT_LANGUAGE: 'ar',
        SUPPORTED_LANGUAGES: ['ar', 'fr', 'en'],
        RTL_LANGUAGES: ['ar'],
        CURRENCY: 'DZD',
        TIMEZONE: 'Africa/Algiers'
    },

    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 500,
        PAGINATION_SIZE: 20,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        TOAST_DURATION: 5000
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'mahara_auth_token',
        USER_DATA: 'mahara_user_data',
        LANGUAGE: 'mahara_language',
        THEME: 'mahara_theme',
        SEARCH_HISTORY: 'mahara_search_history',
        FAVORITES: 'mahara_favorites'
    },

    // Validation Rules
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 8,
        PHONE_PATTERN: /^(\+213|0)(5|6|7)[0-9]{8}$|^(\+213|0)(2|3|4)[0-9]{7}$/,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        NAME_MIN_LENGTH: 2,
        SEARCH_MIN_LENGTH: 2,
        REVIEW_MIN_LENGTH: 10
    },

    // Map Configuration (if needed)
    MAP: {
        DEFAULT_CENTER: [36.7538, 3.0588], // Algiers coordinates
        DEFAULT_ZOOM: 10,
        TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },

    // Error Messages
    ERRORS: {
        NETWORK_ERROR: 'Network error occurred',
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Access forbidden',
        NOT_FOUND: 'Resource not found',
        SERVER_ERROR: 'Server error occurred',
        VALIDATION_ERROR: 'Validation error',
        FILE_TOO_LARGE: 'File size too large',
        INVALID_FILE_TYPE: 'Invalid file type'
    },

    // Success Messages
    SUCCESS: {
        LOGIN: 'Login successful',
        REGISTER: 'Registration successful',
        LOGOUT: 'Logout successful',
        PROFILE_UPDATED: 'Profile updated successfully',
        SERVICE_CREATED: 'Service created successfully',
        SERVICE_UPDATED: 'Service updated successfully',
        BOOKING_CREATED: 'Booking created successfully',
        REVIEW_SUBMITTED: 'Review submitted successfully'
    },

    // Algerian Wilayas (Provinces)
    WILAYAS: [
        { code: 'Adrar', name_ar: 'أدرار', name_fr: 'Adrar', name_en: 'Adrar' },
        { code: 'Chlef', name_ar: 'الشلف', name_fr: 'Chlef', name_en: 'Chlef' },
        { code: 'Laghouat', name_ar: 'الأغواط', name_fr: 'Laghouat', name_en: 'Laghouat' },
        { code: 'Oum El Bouaghi', name_ar: 'أم البواقي', name_fr: 'Oum El Bouaghi', name_en: 'Oum El Bouaghi' },
        { code: 'Batna', name_ar: 'باتنة', name_fr: 'Batna', name_en: 'Batna' },
        { code: 'Béjaïa', name_ar: 'بجاية', name_fr: 'Béjaïa', name_en: 'Bejaia' },
        { code: 'Biskra', name_ar: 'بسكرة', name_fr: 'Biskra', name_en: 'Biskra' },
        { code: 'Béchar', name_ar: 'بشار', name_fr: 'Béchar', name_en: 'Bechar' },
        { code: 'Blida', name_ar: 'البليدة', name_fr: 'Blida', name_en: 'Blida' },
        { code: 'Bouira', name_ar: 'البويرة', name_fr: 'Bouira', name_en: 'Bouira' },
        { code: 'Tamanrasset', name_ar: 'تمنراست', name_fr: 'Tamanrasset', name_en: 'Tamanrasset' },
        { code: 'Tébessa', name_ar: 'تبسة', name_fr: 'Tébessa', name_en: 'Tebessa' },
        { code: 'Tlemcen', name_ar: 'تلمسان', name_fr: 'Tlemcen', name_en: 'Tlemcen' },
        { code: 'Tiaret', name_ar: 'تيارت', name_fr: 'Tiaret', name_en: 'Tiaret' },
        { code: 'Tizi Ouzou', name_ar: 'تيزي وزو', name_fr: 'Tizi Ouzou', name_en: 'Tizi Ouzou' },
        { code: 'Alger', name_ar: 'الجزائر', name_fr: 'Alger', name_en: 'Algiers' },
        { code: 'Djelfa', name_ar: 'الجلفة', name_fr: 'Djelfa', name_en: 'Djelfa' },
        { code: 'Jijel', name_ar: 'جيجل', name_fr: 'Jijel', name_en: 'Jijel' },
        { code: 'Sétif', name_ar: 'سطيف', name_fr: 'Sétif', name_en: 'Setif' },
        { code: 'Saïda', name_ar: 'سعيدة', name_fr: 'Saïda', name_en: 'Saida' },
        { code: 'Skikda', name_ar: 'سكيكدة', name_fr: 'Skikda', name_en: 'Skikda' },
        { code: 'Sidi Bel Abbès', name_ar: 'سيدي بلعباس', name_fr: 'Sidi Bel Abbès', name_en: 'Sidi Bel Abbes' },
        { code: 'Annaba', name_ar: 'عنابة', name_fr: 'Annaba', name_en: 'Annaba' },
        { code: 'Guelma', name_ar: 'قالمة', name_fr: 'Guelma', name_en: 'Guelma' },
        { code: 'Constantine', name_ar: 'قسنطينة', name_fr: 'Constantine', name_en: 'Constantine' },
        { code: 'Médéa', name_ar: 'المدية', name_fr: 'Médéa', name_en: 'Medea' },
        { code: 'Mostaganem', name_ar: 'مستغانم', name_fr: 'Mostaganem', name_en: 'Mostaganem' },
        { code: 'M\'Sila', name_ar: 'المسيلة', name_fr: 'M\'Sila', name_en: 'M\'Sila' },
        { code: 'Mascara', name_ar: 'معسكر', name_fr: 'Mascara', name_en: 'Mascara' },
        { code: 'Ouargla', name_ar: 'ورقلة', name_fr: 'Ouargla', name_en: 'Ouargla' },
        { code: 'Oran', name_ar: 'وهران', name_fr: 'Oran', name_en: 'Oran' },
        { code: 'El Bayadh', name_ar: 'البيض', name_fr: 'El Bayadh', name_en: 'El Bayadh' },
        { code: 'Illizi', name_ar: 'إليزي', name_fr: 'Illizi', name_en: 'Illizi' },
        { code: 'Bordj Bou Arréridj', name_ar: 'برج بوعريريج', name_fr: 'Bordj Bou Arréridj', name_en: 'Bordj Bou Arreridj' },
        { code: 'Boumerdès', name_ar: 'بومرداس', name_fr: 'Boumerdès', name_en: 'Boumerdes' },
        { code: 'El Tarf', name_ar: 'الطارف', name_fr: 'El Tarf', name_en: 'El Tarf' },
        { code: 'Tindouf', name_ar: 'تندوف', name_fr: 'Tindouf', name_en: 'Tindouf' },
        { code: 'Tissemsilt', name_ar: 'تيسمسيلت', name_fr: 'Tissemsilt', name_en: 'Tissemsilt' },
        { code: 'El Oued', name_ar: 'الوادي', name_fr: 'El Oued', name_en: 'El Oued' },
        { code: 'Khenchela', name_ar: 'خنشلة', name_fr: 'Khenchela', name_en: 'Khenchela' },
        { code: 'Souk Ahras', name_ar: 'سوق أهراس', name_fr: 'Souk Ahras', name_en: 'Souk Ahras' },
        { code: 'Tipaza', name_ar: 'تيبازة', name_fr: 'Tipaza', name_en: 'Tipaza' },
        { code: 'Mila', name_ar: 'ميلة', name_fr: 'Mila', name_en: 'Mila' },
        { code: 'Aïn Defla', name_ar: 'عين الدفلى', name_fr: 'Aïn Defla', name_en: 'Ain Defla' },
        { code: 'Naâma', name_ar: 'النعامة', name_fr: 'Naâma', name_en: 'Naama' },
        { code: 'Aïn Témouchent', name_ar: 'عين تموشنت', name_fr: 'Aïn Témouchent', name_en: 'Ain Temouchent' },
        { code: 'Ghardaïa', name_ar: 'غرداية', name_fr: 'Ghardaïa', name_en: 'Ghardaia' },
        { code: 'Relizane', name_ar: 'غليزان', name_fr: 'Relizane', name_en: 'Relizane' }
    ],

    // Service Categories (will be loaded from API)
    CATEGORIES: [],

    // Default Service Images
    DEFAULT_IMAGES: {
        SERVICE: '/images/default-service.jpg',
        USER: '/images/default-avatar.png',
        CATEGORY: '/images/default-category.jpg'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

