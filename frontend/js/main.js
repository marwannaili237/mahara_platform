// Mahara Platform Main JavaScript
class MaharaApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 'home';
        this.searchTimeout = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.initializeComponents = this.initializeComponents.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
    }

    // Initialize the application
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.init);
                return;
            }

            // Register service worker for PWA
            await this.registerServiceWorker();

            // Initialize translation system
            T.updatePageLanguage();

            // Initialize authentication
            await Auth.init();

            // Initialize components
            this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadInitialData();

            // Hide loading screen
            this.hideLoadingScreen();

            this.isInitialized = true;
            console.log('Mahara app initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            this.hideLoadingScreen();
        }
    }

    // Initialize various components
    initializeComponents() {
        // Initialize navigation
        this.initNavigation();
        
        // Initialize search
        this.initSearch();
        
        // Initialize language switcher
        this.initLanguageSwitcher();
        
        // Initialize user menu
        this.initUserMenu();
        
        // Initialize modals
        this.initModals();
        
        // Initialize animations
        this.initAnimations();
        
        // Initialize statistics counter
        this.initStatsCounter();
    }

    // Setup global event listeners
    setupEventListeners() {
        // Window events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Language change events
        document.addEventListener('languageChanged', this.handleLanguageChange.bind(this));
        
        // Auth state change events
        document.addEventListener('authStateChanged', this.handleAuthStateChange.bind(this));
        
        // Form submissions
        this.setupFormListeners();
        
        // Navigation clicks
        this.setupNavigationListeners();
    }

    // Initialize navigation
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        // Smooth scrolling for anchor links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Update active nav link
                        this.updateActiveNavLink(href.substring(1));
                        
                        // Close mobile menu if open
                        if (navMenu) {
                            navMenu.classList.remove('active');
                        }
                    }
                }
            });
        });

        // Mobile menu toggle
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
            });
        }

        // Update active nav link on scroll
        this.updateActiveNavLinkOnScroll();
    }

    // Initialize search functionality
    initSearch() {
        const searchForm = document.getElementById('hero-search-form');
        const searchInput = document.getElementById('search-input');
        const locationSelect = document.getElementById('location-select');

        if (searchForm) {
            searchForm.addEventListener('submit', this.handleSearch.bind(this));
        }

        if (searchInput) {
            // Real-time search suggestions (debounced)
            searchInput.addEventListener('input', APIUtils.debounce((e) => {
                this.handleSearchInput(e.target.value);
            }, CONFIG.UI.DEBOUNCE_DELAY));
        }

        // Populate location select with wilayas
        this.populateLocationSelect();
    }

    // Initialize language switcher
    initLanguageSwitcher() {
        const langBtn = document.getElementById('lang-btn');
        const langDropdown = document.getElementById('lang-dropdown');
        const langOptions = document.querySelectorAll('.lang-option');

        if (langBtn && langDropdown) {
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                langBtn.parentElement.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                langBtn.parentElement.classList.remove('active');
            });
        }

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const language = option.getAttribute('data-lang');
                T.setLanguage(language);
                langBtn.parentElement.classList.remove('active');
            });
        });
    }

    // Initialize user menu
    initUserMenu() {
        const userBtn = document.getElementById('user-btn');
        const userDropdown = document.getElementById('user-dropdown');

        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userBtn.parentElement.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userBtn.parentElement.classList.remove('active');
            });
        }
    }

    // Initialize modals
    initModals() {
        // Modal functionality is handled in auth.js
        // Additional modal setup can be added here
    }

    // Initialize animations
    initAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.step-item, .service-card, .category-card');
        animatedElements.forEach(el => observer.observe(el));
    }

    // Initialize statistics counter
    initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const countUp = (element, target) => {
            const increment = target / 100;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = T.formatNumber(Math.floor(current));
            }, 20);
        };

        // Start counter when stats section is visible
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-count'));
                        countUp(stat, target);
                    });
                    statsObserver.disconnect();
                }
            });
        });

        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    // Load initial data
    async loadInitialData() {
        try {
            // Load categories
            await this.loadCategories();
            
            // Load featured services
            await this.loadFeaturedServices();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Load categories
    async loadCategories() {
        try {
            const response = await API.getCategories();
            if (response.success) {
                this.renderCategories(response.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Load featured services
    async loadFeaturedServices() {
        try {
            const response = await API.getFeaturedServices(8);
            if (response.success) {
                this.renderFeaturedServices(response.data);
            }
        } catch (error) {
            console.error('Error loading featured services:', error);
            // Show skeleton loading state
            this.showServicesSkeletonLoader();
        }
    }

    // Render categories
    renderCategories(categories) {
        const categoriesGrid = document.getElementById('categories-grid');
        if (!categoriesGrid) return;

        categoriesGrid.innerHTML = categories.map(category => `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-icon">
                    <i class="${category.icon || 'fas fa-briefcase'}"></i>
                </div>
                <h3 class="category-title">${category[`name_${T.getCurrentLanguage()}`] || category.name}</h3>
                <p class="category-description">${category[`description_${T.getCurrentLanguage()}`] || category.description || ''}</p>
                <div class="category-count">${T.formatNumber(category.services_count || 0)} ${t('stats.services')}</div>
            </div>
        `).join('');

        // Add click listeners to category cards
        const categoryCards = categoriesGrid.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.getAttribute('data-category-id');
                this.searchByCategory(categoryId);
            });
        });
    }

    // Render featured services
    renderFeaturedServices(services) {
        const servicesGrid = document.getElementById('featured-services-grid');
        if (!servicesGrid) return;

        if (services.length === 0) {
            servicesGrid.innerHTML = `
                <div class="no-services">
                    <i class="fas fa-search"></i>
                    <p>${t('services.no_featured')}</p>
                </div>
            `;
            return;
        }

        servicesGrid.innerHTML = services.map(service => this.createServiceCard(service)).join('');
    }

    // Create service card HTML
    createServiceCard(service) {
        const imageUrl = service.images && service.images.length > 0 
            ? service.images[0] 
            : CONFIG.DEFAULT_IMAGES.SERVICE;

        return `
            <div class="service-card" data-service-id="${service.id}">
                <div class="service-image">
                    <img src="${imageUrl}" alt="${service.title}" loading="lazy">
                    ${service.is_featured ? '<div class="featured-badge">' + t('service.featured') + '</div>' : ''}
                </div>
                <div class="service-content">
                    <div class="service-header">
                        <h3 class="service-title">${service.title}</h3>
                        <div class="service-rating">
                            ${this.createStarRating(service.avg_rating)}
                            <span class="rating-count">(${service.total_reviews})</span>
                        </div>
                    </div>
                    <p class="service-description">${this.truncateText(service.description, 100)}</p>
                    <div class="service-meta">
                        <div class="service-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${service.wilaya || service.city || t('service.location.flexible')}</span>
                        </div>
                        <div class="service-price">
                            ${service.formatted_price}
                        </div>
                    </div>
                    <div class="service-provider">
                        <img src="${service.provider.profile_image || CONFIG.DEFAULT_IMAGES.USER}" alt="${service.provider.name}" class="provider-avatar">
                        <span class="provider-name">${service.provider.name}</span>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="btn btn-outline btn-sm view-service-btn" data-service-id="${service.id}">
                        ${t('common.view')}
                    </button>
                    <button class="btn btn-primary btn-sm book-service-btn" data-service-id="${service.id}">
                        ${t('service.book')}
                    </button>
                </div>
            </div>
        `;
    }

    // Create star rating HTML
    createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return `<div class="star-rating" data-rating="${rating}">${starsHTML}</div>`;
    }

    // Truncate text
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Show services skeleton loader
    showServicesSkeletonLoader() {
        const servicesGrid = document.getElementById('featured-services-grid');
        if (!servicesGrid) return;

        const skeletonHTML = Array(6).fill().map(() => `
            <div class="service-card-skeleton">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-price"></div>
                </div>
            </div>
        `).join('');

        servicesGrid.innerHTML = skeletonHTML;
    }

    // Handle search form submission
    async handleSearch(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const query = formData.get('search') || '';
        const location = formData.get('location') || '';

        if (query.trim().length < CONFIG.VALIDATION.SEARCH_MIN_LENGTH) {
            APIUtils.showWarning(t('search.min_length', { min: CONFIG.VALIDATION.SEARCH_MIN_LENGTH }));
            return;
        }

        try {
            const params = {
                search: query.trim(),
                wilaya: location
            };

            // Navigate to search results page or show results
            this.showSearchResults(params);
            
        } catch (error) {
            APIUtils.showError(APIUtils.handleError(error));
        }
    }

    // Handle search input (for suggestions)
    async handleSearchInput(query) {
        if (query.length < CONFIG.VALIDATION.SEARCH_MIN_LENGTH) {
            this.hideSearchSuggestions();
            return;
        }

        try {
            // Implement search suggestions if needed
            // const suggestions = await API.getSearchSuggestions(query);
            // this.showSearchSuggestions(suggestions);
        } catch (error) {
            console.error('Search suggestions error:', error);
        }
    }

    // Show search results
    showSearchResults(params) {
        // For now, just log the search params
        // In a full implementation, this would navigate to a search results page
        console.log('Search params:', params);
        APIUtils.showInfo(t('search.results_coming_soon'));
    }

    // Search by category
    searchByCategory(categoryId) {
        const params = { category_id: categoryId };
        this.showSearchResults(params);
    }

    // Populate location select with wilayas
    populateLocationSelect() {
        const locationSelect = document.getElementById('location-select');
        if (!locationSelect) return;

        // Clear existing options except the first one
        const firstOption = locationSelect.querySelector('option');
        locationSelect.innerHTML = '';
        if (firstOption) {
            locationSelect.appendChild(firstOption);
        }

        // Add wilaya options
        CONFIG.WILAYAS.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya.code;
            option.textContent = wilaya[`name_${T.getCurrentLanguage()}`] || wilaya.name_en;
            locationSelect.appendChild(option);
        });
    }

    // Handle scroll events
    handleScroll() {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Update active nav link based on scroll position
        this.updateActiveNavLinkOnScroll();
    }

    // Handle resize events
    handleResize() {
        // Handle responsive adjustments if needed
    }

    // Handle language change
    handleLanguageChange(e) {
        const { language, isRTL } = e.detail;
        
        // Update location select options
        this.populateLocationSelect();
        
        // Re-render dynamic content if needed
        // this.loadInitialData();
    }

    // Handle auth state change
    handleAuthStateChange(e) {
        const { user, isAuthenticated } = e.detail;
        
        // Update UI based on auth state
        // Additional auth-related UI updates can be added here
    }

    // Update active nav link
    updateActiveNavLink(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Update active nav link on scroll
    updateActiveNavLinkOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Setup form listeners
    setupFormListeners() {
        // Additional form listeners can be added here
    }

    // Setup navigation listeners
    setupNavigationListeners() {
        // View all services button
        const viewAllServicesBtn = document.getElementById('view-all-services');
        if (viewAllServicesBtn) {
            viewAllServicesBtn.addEventListener('click', () => {
                // Navigate to services page
                window.location.href = '/services';
            });
        }

        // Category tags in hero section
        const categoryTags = document.querySelectorAll('.category-tag');
        categoryTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = tag.getAttribute('data-category');
                if (categoryId) {
                    this.searchByCategory(categoryId);
                }
            });
        });
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    // Utility method to show toast notifications
    showToast(message, type = 'info') {
        APIUtils.showToast(message, type);
    }

    // Register service worker for PWA functionality
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);

                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker is available
                                this.showUpdateAvailable();
                            }
                        });
                    }
                });

                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    console.log('Message from service worker:', event.data);
                });

                // Check for app install prompt
                this.setupInstallPrompt();

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        } else {
            console.log('Service Worker not supported');
        }
    }

    // Setup PWA install prompt
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            // Show install button
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.showToast('App installed successfully!', 'success');
        });
    }

    // Show install button
    showInstallButton(deferredPrompt) {
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('install-app-btn');
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'install-app-btn';
            installBtn.className = 'btn btn-primary install-btn';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                border-radius: 25px;
                padding: 12px 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideInUp 0.3s ease;
            `;
            document.body.appendChild(installBtn);
        }

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // Clear the deferredPrompt
                deferredPrompt = null;
                this.hideInstallButton();
            }
        });

        installBtn.style.display = 'block';
    }

    // Hide install button
    hideInstallButton() {
        const installBtn = document.getElementById('install-app-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    // Show update available notification
    showUpdateAvailable() {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="update-content">
                <span>A new version is available!</span>
                <button class="btn btn-sm btn-primary" onclick="location.reload()">Update</button>
                <button class="btn btn-sm btn-outline" onclick="this.parentElement.parentElement.remove()">Later</button>
            </div>
        `;
        updateNotification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInDown 0.3s ease;
        `;
        document.body.appendChild(updateNotification);
    }
}

// Create global app instance
const App = new MaharaApp();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MaharaApp, App };
}

