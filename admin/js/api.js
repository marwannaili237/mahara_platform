// Mahara Platform API Client
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = this.getStoredToken();
    }

    // Get stored authentication token
    getStoredToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        }
    }

    // Get default headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': T.getCurrentLanguage()
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Upload file
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const headers = {
            'Authorization': this.token ? `Bearer ${this.token}` : undefined,
            'Accept-Language': T.getCurrentLanguage()
        };

        // Remove undefined headers
        Object.keys(headers).forEach(key => {
            if (headers[key] === undefined) {
                delete headers[key];
            }
        });

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('File Upload Error:', error);
            throw error;
        }
    }

    // Authentication Methods
    async login(email, password) {
        const response = await this.post(CONFIG.API_ENDPOINTS.AUTH.LOGIN, {
            email,
            password
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.storeUserData(response.data.user);
        }

        return response;
    }

    async register(userData) {
        const response = await this.post(CONFIG.API_ENDPOINTS.AUTH.REGISTER, userData);
        return response;
    }

    async logout() {
        try {
            await this.post(CONFIG.API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.setToken(null);
            this.clearUserData();
        }
    }

    async getCurrentUser() {
        if (!this.token) {
            return null;
        }

        try {
            const response = await this.get(CONFIG.API_ENDPOINTS.AUTH.ME);
            if (response.success) {
                this.storeUserData(response.data);
                return response.data;
            }
        } catch (error) {
            console.error('Get current user error:', error);
            // Token might be invalid, clear it
            this.setToken(null);
            this.clearUserData();
        }

        return null;
    }

    async forgotPassword(email) {
        return this.post(CONFIG.API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    }

    async resetPassword(token, password) {
        return this.post(CONFIG.API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            token,
            password
        });
    }

    // User data management
    storeUserData(userData) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }

    getStoredUserData() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    }

    clearUserData() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    }

    // Service Methods
    async getServices(params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.SERVICES.LIST, params);
    }

    async getFeaturedServices(limit = 10) {
        return this.get(CONFIG.API_ENDPOINTS.SERVICES.FEATURED, { limit });
    }

    async getService(id) {
        return this.get(`${CONFIG.API_ENDPOINTS.SERVICES.VIEW}/${id}`);
    }

    async createService(serviceData) {
        return this.post(CONFIG.API_ENDPOINTS.SERVICES.CREATE, serviceData);
    }

    async updateService(id, serviceData) {
        return this.put(`${CONFIG.API_ENDPOINTS.SERVICES.UPDATE}/${id}`, serviceData);
    }

    async deleteService(id) {
        return this.delete(`${CONFIG.API_ENDPOINTS.SERVICES.DELETE}/${id}`);
    }

    async getMyServices(params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.SERVICES.MY_SERVICES, params);
    }

    // Category Methods
    async getCategories() {
        return this.get(CONFIG.API_ENDPOINTS.CATEGORIES.LIST);
    }

    async getCategory(id) {
        return this.get(`${CONFIG.API_ENDPOINTS.CATEGORIES.VIEW}/${id}`);
    }

    // Booking Methods
    async getBookings(params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.BOOKINGS.LIST, params);
    }

    async createBooking(bookingData) {
        return this.post(CONFIG.API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
    }

    async getBooking(id) {
        return this.get(`${CONFIG.API_ENDPOINTS.BOOKINGS.VIEW}/${id}`);
    }

    async updateBooking(id, bookingData) {
        return this.put(`${CONFIG.API_ENDPOINTS.BOOKINGS.UPDATE}/${id}`, bookingData);
    }

    async cancelBooking(id) {
        return this.post(`${CONFIG.API_ENDPOINTS.BOOKINGS.CANCEL}/${id}`);
    }

    async getMyBookings(params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, params);
    }

    // Review Methods
    async getReviews(params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.REVIEWS.LIST, params);
    }

    async createReview(reviewData) {
        return this.post(CONFIG.API_ENDPOINTS.REVIEWS.CREATE, reviewData);
    }

    async updateReview(id, reviewData) {
        return this.put(`${CONFIG.API_ENDPOINTS.REVIEWS.UPDATE}/${id}`, reviewData);
    }

    async deleteReview(id) {
        return this.delete(`${CONFIG.API_ENDPOINTS.REVIEWS.DELETE}/${id}`);
    }

    // Search Methods
    async searchServices(query, params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.SEARCH.SERVICES, {
            search: query,
            ...params
        });
    }

    async searchProviders(query, params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.SEARCH.PROVIDERS, {
            search: query,
            ...params
        });
    }

    // Upload Methods
    async uploadImage(file, type = 'general') {
        return this.uploadFile(CONFIG.API_ENDPOINTS.UPLOAD.IMAGE, file, { type });
    }

    async uploadDocument(file, type = 'general') {
        return this.uploadFile(CONFIG.API_ENDPOINTS.UPLOAD.DOCUMENT, file, { type });
    }

    // Notification Methods
    async getNotifications(params = {}) {
        return this.get(CONFIG.API_ENDPOINTS.NOTIFICATIONS.LIST, params);
    }

    async markNotificationRead(id) {
        return this.post(`${CONFIG.API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${id}`);
    }

    async markAllNotificationsRead() {
        return this.post(CONFIG.API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    }

    // Utility Methods
    isAuthenticated() {
        return !!this.token;
    }

    getUserType() {
        const userData = this.getStoredUserData();
        return userData ? userData.user_type : null;
    }

    isProvider() {
        return this.getUserType() === 'provider';
    }

    isCustomer() {
        return this.getUserType() === 'customer';
    }

    isAdmin() {
        return this.getUserType() === 'admin';
    }
}

// Utility functions for common API operations
class APIUtils {
    static handleError(error) {
        console.error('API Error:', error);
        
        let message = t('message.error.network');
        
        if (error.message) {
            if (error.message.includes('401')) {
                message = t('message.error.unauthorized');
            } else if (error.message.includes('403')) {
                message = t('message.error.forbidden');
            } else if (error.message.includes('404')) {
                message = t('message.error.not_found');
            } else if (error.message.includes('500')) {
                message = t('message.error.server');
            } else {
                message = error.message;
            }
        }
        
        return message;
    }

    static showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, CONFIG.UI.TOAST_DURATION);
    }

    static showSuccess(message) {
        this.showToast(message, 'success');
    }

    static showError(message) {
        this.showToast(message, 'error');
    }

    static showWarning(message) {
        this.showToast(message, 'warning');
    }

    static showInfo(message) {
        this.showToast(message, 'info');
    }

    static async handleApiCall(apiCall, successMessage = null, errorMessage = null) {
        try {
            const response = await apiCall();
            
            if (successMessage) {
                this.showSuccess(successMessage);
            }
            
            return response;
        } catch (error) {
            const message = errorMessage || this.handleError(error);
            this.showError(message);
            throw error;
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static validateFile(file, maxSize = CONFIG.UI.MAX_FILE_SIZE, allowedTypes = CONFIG.UI.ALLOWED_IMAGE_TYPES) {
        const errors = [];
        
        if (file.size > maxSize) {
            errors.push(t('message.error.file_too_large'));
        }
        
        if (!allowedTypes.includes(file.type)) {
            errors.push(t('message.error.invalid_file_type'));
        }
        
        return errors;
    }

    static createImagePreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static async compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

// Create global API client instance
const API = new APIClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, APIUtils, API };
}

