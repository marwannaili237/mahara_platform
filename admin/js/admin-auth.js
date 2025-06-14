// Mahara Admin Authentication System
class AdminAuth {
    constructor() {
        this.api = API;
        this.currentAdmin = null;
        this.isInitialized = false;
        
        // Admin credentials (in production, this should be more secure)
        this.adminCredentials = {
            email: 'admin@mahara.dz',
            password: 'MaharaAdmin2024!'
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.checkAuth = this.checkAuth.bind(this);
    }

    // Initialize admin authentication
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Check if admin is already authenticated
            const isAuthenticated = await this.checkAuth();
            
            if (isAuthenticated) {
                this.showAdminPanel();
            } else {
                this.showLoginModal();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Admin auth initialization error:', error);
            this.showLoginModal();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
        }

        // Logout button
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout);
        }

        // Modal overlay click
        const loginModal = document.getElementById('admin-login-modal');
        const modalOverlay = loginModal?.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                // Prevent closing modal by clicking overlay for admin login
                e.stopPropagation();
            });
        }
    }

    // Handle login form submission
    async handleLoginSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            this.showError('Email and password are required');
            return;
        }

        try {
            this.setLoading(true);
            
            // Validate admin credentials
            if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
                // Create admin session
                const adminData = {
                    id: 1,
                    email: email,
                    first_name: 'Admin',
                    last_name: 'User',
                    user_type: 'admin',
                    profile_image: null
                };
                
                // Store admin session
                this.setAdminSession(adminData);
                this.currentAdmin = adminData;
                
                // Show admin panel
                this.showAdminPanel();
                this.hideLoginModal();
                
                this.showSuccess('Welcome to Mahara Admin Panel');
            } else {
                this.showError('Invalid admin credentials');
            }
        } catch (error) {
            this.showError('Login failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    // Check current authentication status
    async checkAuth() {
        try {
            const adminData = this.getStoredAdminSession();
            if (adminData) {
                this.currentAdmin = adminData;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    // Login admin
    async login(email, password) {
        if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
            const adminData = {
                id: 1,
                email: email,
                first_name: 'Admin',
                last_name: 'User',
                user_type: 'admin',
                profile_image: null
            };
            
            this.setAdminSession(adminData);
            this.currentAdmin = adminData;
            return true;
        }
        throw new Error('Invalid credentials');
    }

    // Logout admin
    async logout() {
        try {
            this.clearAdminSession();
            this.currentAdmin = null;
            this.showLoginModal();
            this.hideAdminPanel();
            this.showInfo('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Show admin panel
    showAdminPanel() {
        const adminContainer = document.getElementById('admin-container');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (adminContainer) {
            adminContainer.style.display = 'flex';
        }
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        // Update admin info in sidebar
        this.updateAdminInfo();
    }

    // Hide admin panel
    hideAdminPanel() {
        const adminContainer = document.getElementById('admin-container');
        if (adminContainer) {
            adminContainer.style.display = 'none';
        }
    }

    // Show login modal
    showLoginModal() {
        const loginModal = document.getElementById('admin-login-modal');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loginModal) {
            loginModal.classList.add('active');
        }
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    // Hide login modal
    hideLoginModal() {
        const loginModal = document.getElementById('admin-login-modal');
        if (loginModal) {
            loginModal.classList.remove('active');
        }
    }

    // Update admin info in sidebar
    updateAdminInfo() {
        const adminName = document.getElementById('admin-name');
        const adminAvatar = document.getElementById('admin-avatar');
        
        if (this.currentAdmin) {
            if (adminName) {
                adminName.textContent = `${this.currentAdmin.first_name} ${this.currentAdmin.last_name}`;
            }
            
            if (adminAvatar) {
                adminAvatar.src = this.currentAdmin.profile_image || '../images/default-avatar.png';
            }
        }
    }

    // Set loading state
    setLoading(isLoading) {
        const form = document.getElementById('admin-login-form');
        const submitBtn = form?.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Login to Admin Panel';
            }
        }
    }

    // Admin session management
    setAdminSession(adminData) {
        localStorage.setItem('mahara_admin_session', JSON.stringify(adminData));
        localStorage.setItem('mahara_admin_login_time', Date.now().toString());
    }

    getStoredAdminSession() {
        const sessionData = localStorage.getItem('mahara_admin_session');
        const loginTime = localStorage.getItem('mahara_admin_login_time');
        
        if (sessionData && loginTime) {
            // Check if session is still valid (24 hours)
            const sessionAge = Date.now() - parseInt(loginTime);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (sessionAge < maxAge) {
                return JSON.parse(sessionData);
            } else {
                // Session expired
                this.clearAdminSession();
            }
        }
        
        return null;
    }

    clearAdminSession() {
        localStorage.removeItem('mahara_admin_session');
        localStorage.removeItem('mahara_admin_login_time');
    }

    // Utility methods for notifications
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showInfo(message) {
        this.showToast(message, 'info');
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove toast
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }

    // Check if current user is admin
    isAdmin() {
        return this.currentAdmin && this.currentAdmin.user_type === 'admin';
    }

    // Get current admin
    getCurrentAdmin() {
        return this.currentAdmin;
    }

    // Check if authenticated
    isAuthenticated() {
        return !!this.currentAdmin;
    }

    // Require admin authentication
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.showLoginModal();
            return false;
        }
        return true;
    }
}

// Create global admin auth instance
const AdminAuth_Instance = new AdminAuth();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminAuth, AdminAuth_Instance };
}

