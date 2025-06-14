// Mahara Platform Authentication System
class AuthManager {
    constructor() {
        this.api = API;
        this.currentUser = null;
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.logout = this.logout.bind(this);
        this.checkAuth = this.checkAuth.bind(this);
    }

    // Initialize authentication system
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Check if user is already authenticated
            await this.checkAuth();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }

    // Setup event listeners for auth forms and buttons
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegisterSubmit.bind(this));
        }

        // Auth buttons
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout);
        }

        // Modal switches
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');

        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideLoginModal();
                this.showRegisterModal();
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideRegisterModal();
                this.showLoginModal();
            });
        }

        // Modal close buttons
        const modalCloses = document.querySelectorAll('.modal-close');
        modalCloses.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = btn.getAttribute('data-modal');
                if (modalId) {
                    this.hideModal(modalId);
                }
            });
        });

        // Modal overlay clicks
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        modalOverlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = overlay.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    // Check current authentication status
    async checkAuth() {
        try {
            this.currentUser = await this.api.getCurrentUser();
            this.updateUI();
            return this.currentUser;
        } catch (error) {
            console.error('Auth check error:', error);
            this.currentUser = null;
            this.updateUI();
            return null;
        }
    }

    // Handle login form submission
    async handleLoginSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            APIUtils.showError(t('message.error.required_fields'));
            return;
        }

        try {
            this.setLoading(true, 'login');
            
            const response = await this.api.login(email, password);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.updateUI();
                this.hideLoginModal();
                APIUtils.showSuccess(t('message.success.login'));
                
                // Redirect if needed
                this.handlePostLoginRedirect();
            } else {
                APIUtils.showError(response.message || t('message.error.login'));
            }
        } catch (error) {
            APIUtils.showError(APIUtils.handleError(error));
        } finally {
            this.setLoading(false, 'login');
        }
    }

    // Handle register form submission
    async handleRegisterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            user_type: formData.get('user_type')
        };

        // Validate required fields
        if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
            APIUtils.showError(t('message.error.required_fields'));
            return;
        }

        // Validate email format
        if (!CONFIG.VALIDATION.EMAIL_PATTERN.test(userData.email)) {
            APIUtils.showError(t('message.error.invalid_email'));
            return;
        }

        // Validate password length
        if (userData.password.length < CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
            APIUtils.showError(t('message.error.password_too_short', { min: CONFIG.VALIDATION.PASSWORD_MIN_LENGTH }));
            return;
        }

        try {
            this.setLoading(true, 'register');
            
            const response = await this.api.register(userData);
            
            if (response.success) {
                this.hideRegisterModal();
                APIUtils.showSuccess(t('message.success.register'));
                
                // Show login modal for user to login
                setTimeout(() => {
                    this.showLoginModal();
                }, 1000);
            } else {
                APIUtils.showError(response.message || t('message.error.register'));
            }
        } catch (error) {
            APIUtils.showError(APIUtils.handleError(error));
        } finally {
            this.setLoading(false, 'register');
        }
    }

    // Login user programmatically
    async login(email, password) {
        try {
            const response = await this.api.login(email, password);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.updateUI();
                return response;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            throw error;
        }
    }

    // Register user programmatically
    async register(userData) {
        try {
            const response = await this.api.register(userData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            await this.api.logout();
            this.currentUser = null;
            this.updateUI();
            APIUtils.showSuccess(t('message.success.logout'));
            
            // Redirect to home if on protected page
            if (this.isOnProtectedPage()) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            this.api.setToken(null);
            this.api.clearUserData();
            this.currentUser = null;
            this.updateUI();
        }
    }

    // Update UI based on authentication status
    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');

        if (this.currentUser) {
            // User is authenticated
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            
            if (userAvatar) {
                userAvatar.src = this.currentUser.profile_image || CONFIG.DEFAULT_IMAGES.USER;
            }
            
            if (userName) {
                userName.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            }

            // Update user-specific menu items
            this.updateUserMenuItems();
        } else {
            // User is not authenticated
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }

        // Trigger auth state change event
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user: this.currentUser, isAuthenticated: !!this.currentUser }
        }));
    }

    // Update user menu items based on user type
    updateUserMenuItems() {
        const myServicesLink = document.getElementById('my-services-link');
        
        if (myServicesLink) {
            // Show "My Services" only for providers
            if (this.currentUser.user_type === 'provider') {
                myServicesLink.style.display = 'block';
            } else {
                myServicesLink.style.display = 'none';
            }
        }
    }

    // Show login modal
    showLoginModal() {
        this.showModal('login-modal');
    }

    // Hide login modal
    hideLoginModal() {
        this.hideModal('login-modal');
    }

    // Show register modal
    showRegisterModal() {
        this.showModal('register-modal');
    }

    // Hide register modal
    hideRegisterModal() {
        this.hideModal('register-modal');
    }

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Set loading state for forms
    setLoading(isLoading, formType) {
        const form = document.getElementById(`${formType}-form`);
        const submitBtn = form?.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('common.loading')}`;
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = t(`auth.${formType}`);
            }
        }
    }

    // Handle post-login redirect
    handlePostLoginRedirect() {
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
        }
    }

    // Check if current page requires authentication
    isOnProtectedPage() {
        const protectedPaths = ['/profile', '/dashboard', '/my-services', '/my-bookings'];
        return protectedPaths.some(path => window.location.pathname.startsWith(path));
    }

    // Require authentication (redirect to login if not authenticated)
    requireAuth() {
        if (!this.currentUser) {
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            this.showLoginModal();
            return false;
        }
        return true;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentUser && this.currentUser.user_type === role;
    }

    // Check if user is provider
    isProvider() {
        return this.hasRole('provider');
    }

    // Check if user is customer
    isCustomer() {
        return this.hasRole('customer');
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Create global auth manager instance
const Auth = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, Auth };
}

