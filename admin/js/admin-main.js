// Mahara Admin Panel Main Application
class AdminApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 'dashboard';
        this.auth = AdminAuth_Instance;
        this.modules = {};
        
        // Bind methods
        this.init = this.init.bind(this);
        this.initializeComponents = this.initializeComponents.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
    }

    // Initialize the admin application
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.init);
                return;
            }

            // Initialize authentication first
            await this.auth.init();

            // Only proceed if authenticated
            if (this.auth.isAuthenticated()) {
                // Initialize components
                this.initializeComponents();

                // Setup event listeners
                this.setupEventListeners();

                // Load initial data
                await this.loadInitialData();

                // Show dashboard by default
                this.showPage('dashboard');
            }

            this.isInitialized = true;
            console.log('Admin app initialized successfully');
        } catch (error) {
            console.error('Admin app initialization error:', error);
        }
    }

    // Initialize various components
    initializeComponents() {
        // Initialize sidebar
        this.initSidebar();
        
        // Initialize header
        this.initHeader();
        
        // Initialize notifications
        this.initNotifications();
        
        // Initialize search
        this.initSearch();
        
        // Initialize modules
        this.initModules();
    }

    // Setup global event listeners
    setupEventListeners() {
        // Navigation clicks
        this.setupNavigationListeners();
        
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    // Initialize sidebar
    initSidebar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        // Desktop sidebar toggle
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                localStorage.setItem('admin_sidebar_collapsed', sidebar.classList.contains('collapsed'));
            });
        }

        // Mobile sidebar toggle
        if (mobileSidebarToggle && sidebar) {
            mobileSidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Restore sidebar state
        const isCollapsed = localStorage.getItem('admin_sidebar_collapsed') === 'true';
        if (isCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
        }

        // Close mobile sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !mobileSidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    // Initialize header
    initHeader() {
        // Quick add button
        const quickAddBtn = document.getElementById('quick-add');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', this.showQuickAddMenu.bind(this));
        }
    }

    // Initialize notifications
    initNotifications() {
        const notificationBtn = document.querySelector('.notification-btn');
        const notifications = document.getElementById('notifications');
        const markAllReadBtn = document.querySelector('.mark-all-read');

        if (notificationBtn && notifications) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifications.classList.toggle('active');
            });

            // Close notifications when clicking outside
            document.addEventListener('click', () => {
                notifications.classList.remove('active');
            });
        }

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', this.markAllNotificationsRead.bind(this));
        }

        // Load notifications
        this.loadNotifications();
    }

    // Initialize search
    initSearch() {
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', this.debounce((e) => {
                this.handleGlobalSearch(e.target.value);
            }, 300));
        }
    }

    // Initialize modules
    initModules() {
        // Initialize dashboard module
        if (typeof AdminDashboard !== 'undefined') {
            this.modules.dashboard = new AdminDashboard();
        }

        // Initialize users module
        if (typeof AdminUsers !== 'undefined') {
            this.modules.users = new AdminUsers();
        }

        // Initialize services module
        if (typeof AdminServices !== 'undefined') {
            this.modules.services = new AdminServices();
        }

        // Initialize settings module
        if (typeof AdminSettings !== 'undefined') {
            this.modules.settings = new AdminSettings();
        }

        // Initialize other modules as they are created
    }

    // Setup navigation listeners
    setupNavigationListeners() {
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    // Show specific page
    showPage(pageName) {
        // Update current page
        this.currentPage = pageName;

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        // Update navigation
        this.updateActiveNavLink(pageName);

        // Update page title
        this.updatePageTitle(pageName);

        // Load page data
        this.loadPageData(pageName);

        // Update URL hash
        window.location.hash = pageName;
    }

    // Update active navigation link
    updateActiveNavLink(pageName) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
    }

    // Update page title
    updatePageTitle(pageName) {
        const pageTitle = document.getElementById('page-title');
        const titles = {
            dashboard: 'Dashboard',
            users: 'User Management',
            services: 'Service Management',
            bookings: 'Booking Management',
            reviews: 'Review Management',
            categories: 'Category Management',
            analytics: 'Analytics',
            settings: 'Settings'
        };

        if (pageTitle) {
            pageTitle.textContent = titles[pageName] || 'Admin Panel';
        }
    }

    // Load page-specific data
    async loadPageData(pageName) {
        try {
            const module = this.modules[pageName];
            
            if (module) {
                // Initialize module if not already initialized
                if (typeof module.init === 'function' && !module.isInitialized) {
                    module.init();
                }
                
                // Load data if method exists
                if (typeof module.loadData === 'function') {
                    await module.loadData();
                }
            }
        } catch (error) {
            console.error(`Error loading ${pageName} data:`, error);
        }
    }

    // Load initial data
    async loadInitialData() {
        try {
            // Load dashboard stats
            await this.loadDashboardStats();
            
            // Load notifications
            await this.loadNotifications();
            
            // Update navigation badges
            await this.updateNavigationBadges();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Load dashboard statistics
    async loadDashboardStats() {
        try {
            // Simulate API calls for stats
            // In a real implementation, these would be actual API calls
            const stats = {
                totalUsers: 1250,
                totalServices: 450,
                totalBookings: 2100,
                totalRevenue: 125000
            };

            // Update stat numbers
            this.updateStatNumber('total-users', stats.totalUsers);
            this.updateStatNumber('total-services', stats.totalServices);
            this.updateStatNumber('total-bookings', stats.totalBookings);
            this.updateStatNumber('total-revenue', stats.totalRevenue);

        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    // Update stat number with animation
    updateStatNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            
            if (elementId === 'total-revenue') {
                element.textContent = this.formatCurrency(currentValue);
            } else {
                element.textContent = this.formatNumber(currentValue);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Load notifications
    async loadNotifications() {
        try {
            // Simulate notifications data
            const notifications = [
                {
                    id: 1,
                    title: 'New Service Pending Approval',
                    message: 'A new service "Web Development" requires approval',
                    type: 'pending',
                    time: '5 minutes ago',
                    unread: true
                },
                {
                    id: 2,
                    title: 'New User Registration',
                    message: 'Ahmed Benali has registered as a service provider',
                    type: 'user',
                    time: '1 hour ago',
                    unread: true
                },
                {
                    id: 3,
                    title: 'Booking Completed',
                    message: 'Booking #1234 has been completed successfully',
                    type: 'booking',
                    time: '2 hours ago',
                    unread: false
                }
            ];

            this.renderNotifications(notifications);
            this.updateNotificationCount(notifications.filter(n => n.unread).length);

        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Render notifications
    renderNotifications(notifications) {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
                ${notification.unread ? '<div class="unread-indicator"></div>' : ''}
            </div>
        `).join('');

        // Add click listeners
        const notificationItems = notificationList.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                this.markNotificationRead(id);
            });
        });
    }

    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            pending: 'clock',
            user: 'user-plus',
            booking: 'calendar-check',
            service: 'briefcase',
            review: 'star',
            system: 'cog'
        };
        return icons[type] || 'bell';
    }

    // Update notification count
    updateNotificationCount(count) {
        const notificationCount = document.getElementById('notification-count');
        if (notificationCount) {
            notificationCount.textContent = count;
            notificationCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Mark notification as read
    markNotificationRead(notificationId) {
        // Implement notification read logic
        console.log('Marking notification as read:', notificationId);
    }

    // Mark all notifications as read
    markAllNotificationsRead() {
        // Implement mark all as read logic
        this.updateNotificationCount(0);
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.classList.remove('unread');
            const indicator = item.querySelector('.unread-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
    }

    // Update navigation badges
    async updateNavigationBadges() {
        try {
            // Simulate badge counts
            const badges = {
                users: 5,
                services: 12,
                bookings: 8,
                reviews: 3
            };

            Object.keys(badges).forEach(key => {
                const badge = document.getElementById(`${key}-count`);
                if (badge) {
                    badge.textContent = badges[key];
                    badge.style.display = badges[key] > 0 ? 'flex' : 'none';
                }
            });

        } catch (error) {
            console.error('Error updating navigation badges:', error);
        }
    }

    // Handle global search
    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        console.log('Global search:', query);
        // Implement global search functionality
    }

    // Show quick add menu
    showQuickAddMenu() {
        // Implement quick add menu
        console.log('Show quick add menu');
    }

    // Handle window resize
    handleResize() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 1024 && sidebar) {
            sidebar.classList.remove('active');
        }
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals/dropdowns
        if (e.key === 'Escape') {
            // Close notifications
            const notifications = document.getElementById('notifications');
            if (notifications) {
                notifications.classList.remove('active');
            }
        }
    }

    // Utility methods
    debounce(func, wait) {
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

    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Show toast notification
    showToast(message, type = 'info') {
        this.auth.showToast(message, type);
    }

    // Get current page
    getCurrentPage() {
        return this.currentPage;
    }

    // Check if page is active
    isPageActive(pageName) {
        return this.currentPage === pageName;
    }
}

// Create global admin app instance
const AdminApp_Instance = new AdminApp();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminApp_Instance.init());
} else {
    AdminApp_Instance.init();
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && AdminApp_Instance.isInitialized) {
        AdminApp_Instance.showPage(hash);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminApp, AdminApp_Instance };
}

