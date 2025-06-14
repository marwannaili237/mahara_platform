// Mahara Admin Services Management Module
class AdminServices {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalServices = 0;
        this.filters = {
            category: '',
            status: '',
            featured: '',
            search: ''
        };
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    // Initialize services module
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load categories for filter
            await this.loadCategories();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Services module initialization error:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter controls
        const categoryFilter = document.getElementById('service-category-filter');
        const statusFilter = document.getElementById('service-status-filter');
        const featuredFilter = document.getElementById('service-featured-filter');
        const serviceSearch = document.getElementById('service-search');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', this.handleFilterChange.bind(this));
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', this.handleFilterChange.bind(this));
        }

        if (featuredFilter) {
            featuredFilter.addEventListener('change', this.handleFilterChange.bind(this));
        }

        if (serviceSearch) {
            serviceSearch.addEventListener('input', AdminApp_Instance.debounce((e) => {
                this.filters.search = e.target.value;
                this.loadServices();
            }, 300));
        }

        // Action buttons
        const exportServicesBtn = document.getElementById('export-services');

        if (exportServicesBtn) {
            exportServicesBtn.addEventListener('click', this.exportServices.bind(this));
        }

        // Select all checkbox
        const selectAllServices = document.getElementById('select-all-services');
        if (selectAllServices) {
            selectAllServices.addEventListener('change', this.handleSelectAll.bind(this));
        }
    }

    // Load services data
    async loadData() {
        await this.loadServices();
    }

    // Load categories for filter
    async loadCategories() {
        const categoryFilter = document.getElementById('service-category-filter');
        if (!categoryFilter) return;

        // Simulate categories data
        const categories = [
            { id: 1, name: 'Home Services' },
            { id: 2, name: 'Education' },
            { id: 3, name: 'Technology' },
            { id: 4, name: 'Arts & Design' },
            { id: 5, name: 'Personal Care' },
            { id: 6, name: 'Business Services' }
        ];

        // Clear existing options except the first one
        const firstOption = categoryFilter.querySelector('option');
        categoryFilter.innerHTML = '';
        if (firstOption) {
            categoryFilter.appendChild(firstOption);
        }

        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    // Load services
    async loadServices() {
        try {
            // Simulate API call
            const services = this.generateMockServices();
            
            // Apply filters
            const filteredServices = this.applyFilters(services);
            
            // Apply pagination
            const paginatedServices = this.applyPagination(filteredServices);
            
            // Render services table
            this.renderServicesTable(paginatedServices);
            
            // Update pagination
            this.updatePagination(filteredServices.length);
            
        } catch (error) {
            console.error('Error loading services:', error);
            AdminApp_Instance.showToast('Error loading services', 'error');
        }
    }

    // Generate mock services data
    generateMockServices() {
        const services = [];
        const titles = [
            'Web Development', 'Graphic Design', 'Home Cleaning', 'Math Tutoring', 
            'Plumbing Services', 'Photography', 'Translation Services', 'Car Repair',
            'Interior Design', 'Cooking Classes', 'Fitness Training', 'Legal Consultation'
        ];
        const providers = [
            'Ahmed Benali', 'Fatima Zahra', 'Mohamed Ali', 'Aicha Kaci',
            'Youssef Cherif', 'Nadia Hamidi', 'Omar Djelloul', 'Zineb Ferhat'
        ];
        const categories = ['Home Services', 'Education', 'Technology', 'Arts & Design', 'Personal Care', 'Business Services'];
        const statuses = ['pending', 'approved', 'rejected'];

        for (let i = 1; i <= 40; i++) {
            const title = titles[Math.floor(Math.random() * titles.length)];
            const provider = providers[Math.floor(Math.random() * providers.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const price = Math.floor(Math.random() * 10000) + 1000;
            
            services.push({
                id: i,
                title: `${title} ${i}`,
                description: `Professional ${title.toLowerCase()} service with high quality standards.`,
                provider: {
                    id: Math.floor(Math.random() * 8) + 1,
                    name: provider,
                    profile_image: null
                },
                category: category,
                category_id: categories.indexOf(category) + 1,
                price: price,
                formatted_price: `${price.toLocaleString()} DZD`,
                status: status,
                is_featured: Math.random() > 0.7,
                images: [],
                avg_rating: (Math.random() * 2 + 3).toFixed(1),
                total_reviews: Math.floor(Math.random() * 50),
                total_bookings: Math.floor(Math.random() * 100),
                created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        return services;
    }

    // Apply filters
    applyFilters(services) {
        return services.filter(service => {
            // Category filter
            if (this.filters.category && service.category_id != this.filters.category) {
                return false;
            }

            // Status filter
            if (this.filters.status && service.status !== this.filters.status) {
                return false;
            }

            // Featured filter
            if (this.filters.featured !== '') {
                const isFeatured = this.filters.featured === '1';
                if (service.is_featured !== isFeatured) {
                    return false;
                }
            }

            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const title = service.title.toLowerCase();
                const provider = service.provider.name.toLowerCase();
                const category = service.category.toLowerCase();
                
                if (!title.includes(searchTerm) && !provider.includes(searchTerm) && !category.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });
    }

    // Apply pagination
    applyPagination(services) {
        this.totalServices = services.length;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return services.slice(startIndex, endIndex);
    }

    // Render services table
    renderServicesTable(services) {
        const tableBody = document.getElementById('services-table-body');
        if (!tableBody) return;

        if (services.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="no-data">
                            <i class="fas fa-briefcase"></i>
                            <p>No services found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = services.map(service => `
            <tr>
                <td>
                    <input type="checkbox" class="service-checkbox" value="${service.id}">
                </td>
                <td>
                    <div class="service-info">
                        <img src="${service.images[0] || '../images/default-service.png'}" alt="${service.title}" class="service-image">
                        <div class="service-details">
                            <span class="service-title">${service.title}</span>
                            <div class="service-rating">
                                ${this.createStarRating(service.avg_rating)}
                                <span class="rating-text">${service.avg_rating} (${service.total_reviews})</span>
                            </div>
                            ${service.is_featured ? '<span class="featured-badge">Featured</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="provider-info">
                        <img src="${service.provider.profile_image || '../images/default-avatar.png'}" alt="${service.provider.name}" class="provider-avatar">
                        <span>${service.provider.name}</span>
                    </div>
                </td>
                <td>${service.category}</td>
                <td>${service.formatted_price}</td>
                <td>
                    <span class="status-badge ${service.status}">${this.formatStatus(service.status)}</span>
                </td>
                <td>${this.formatDate(service.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="AdminServices_Instance.viewService(${service.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${service.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="AdminServices_Instance.approveService(${service.id})" title="Approve">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="AdminServices_Instance.rejectService(${service.id})" title="Reject">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-${service.is_featured ? 'warning' : 'primary'}" 
                                onclick="AdminServices_Instance.toggleFeatured(${service.id}, ${service.is_featured})" 
                                title="${service.is_featured ? 'Remove from Featured' : 'Add to Featured'}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="AdminServices_Instance.deleteService(${service.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to checkboxes
        const checkboxes = tableBody.querySelectorAll('.service-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.updateSelectAllState.bind(this));
        });
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

        return `<div class="star-rating">${starsHTML}</div>`;
    }

    // Update pagination
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pagination = document.getElementById('services-pagination');
        const showingElement = document.getElementById('services-showing');
        const totalElement = document.getElementById('services-total');

        // Update showing info
        if (showingElement && totalElement) {
            const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);
            showingElement.textContent = totalItems > 0 ? `${startItem}-${endItem}` : '0';
            totalElement.textContent = totalItems;
        }

        // Update pagination buttons
        if (pagination) {
            pagination.innerHTML = this.generatePaginationHTML(totalPages);
            
            // Add event listeners
            const paginationBtns = pagination.querySelectorAll('button');
            paginationBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const page = parseInt(e.target.getAttribute('data-page'));
                    if (page && page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadServices();
                    }
                });
            });
        }
    }

    // Generate pagination HTML
    generatePaginationHTML(totalPages) {
        if (totalPages <= 1) return '';

        let html = '';
        
        // Previous button
        html += `<button ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<span>...</span>';
            }
        }

        // Next button
        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </button>`;

        return html;
    }

    // Handle filter change
    handleFilterChange(e) {
        const filterId = e.target.id;
        const value = e.target.value;

        if (filterId === 'service-category-filter') {
            this.filters.category = value;
        } else if (filterId === 'service-status-filter') {
            this.filters.status = value;
        } else if (filterId === 'service-featured-filter') {
            this.filters.featured = value;
        }

        this.currentPage = 1; // Reset to first page
        this.loadServices();
    }

    // Handle select all
    handleSelectAll(e) {
        const checkboxes = document.querySelectorAll('.service-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    }

    // Update select all state
    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById('select-all-services');
        const checkboxes = document.querySelectorAll('.service-checkbox');
        const checkedBoxes = document.querySelectorAll('.service-checkbox:checked');

        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
        }
    }

    // Service actions
    viewService(serviceId) {
        console.log('View service:', serviceId);
        AdminApp_Instance.showToast('Service details modal coming soon', 'info');
    }

    approveService(serviceId) {
        console.log('Approve service:', serviceId);
        AdminApp_Instance.showToast('Service approved successfully', 'success');
        this.loadServices();
    }

    rejectService(serviceId) {
        if (confirm('Are you sure you want to reject this service?')) {
            console.log('Reject service:', serviceId);
            AdminApp_Instance.showToast('Service rejected', 'warning');
            this.loadServices();
        }
    }

    toggleFeatured(serviceId, isFeatured) {
        const action = isFeatured ? 'removed from featured' : 'added to featured';
        console.log(`Toggle service ${serviceId} featured status`);
        AdminApp_Instance.showToast(`Service ${action} successfully`, 'success');
        this.loadServices();
    }

    deleteService(serviceId) {
        if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            console.log('Delete service:', serviceId);
            AdminApp_Instance.showToast('Service deleted successfully', 'success');
            this.loadServices();
        }
    }

    exportServices() {
        AdminApp_Instance.showToast('Export functionality coming soon', 'info');
    }

    // Utility methods
    formatStatus(status) {
        const statuses = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Create global services instance
const AdminServices_Instance = new AdminServices();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminServices, AdminServices_Instance };
}

