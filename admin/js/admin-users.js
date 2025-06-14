// Mahara Admin Users Management Module
class AdminUsers {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalUsers = 0;
        this.filters = {
            type: '',
            status: '',
            search: ''
        };
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    // Initialize users module
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Users module initialization error:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter controls
        const userTypeFilter = document.getElementById('user-type-filter');
        const userStatusFilter = document.getElementById('user-status-filter');
        const userSearch = document.getElementById('user-search');

        if (userTypeFilter) {
            userTypeFilter.addEventListener('change', this.handleFilterChange.bind(this));
        }

        if (userStatusFilter) {
            userStatusFilter.addEventListener('change', this.handleFilterChange.bind(this));
        }

        if (userSearch) {
            userSearch.addEventListener('input', AdminApp_Instance.debounce((e) => {
                this.filters.search = e.target.value;
                this.loadUsers();
            }, 300));
        }

        // Action buttons
        const addUserBtn = document.getElementById('add-user');
        const exportUsersBtn = document.getElementById('export-users');

        if (addUserBtn) {
            addUserBtn.addEventListener('click', this.showAddUserModal.bind(this));
        }

        if (exportUsersBtn) {
            exportUsersBtn.addEventListener('click', this.exportUsers.bind(this));
        }

        // Select all checkbox
        const selectAllUsers = document.getElementById('select-all-users');
        if (selectAllUsers) {
            selectAllUsers.addEventListener('change', this.handleSelectAll.bind(this));
        }
    }

    // Load users data
    async loadData() {
        await this.loadUsers();
    }

    // Load users
    async loadUsers() {
        try {
            // Simulate API call
            const users = this.generateMockUsers();
            
            // Apply filters
            const filteredUsers = this.applyFilters(users);
            
            // Apply pagination
            const paginatedUsers = this.applyPagination(filteredUsers);
            
            // Render users table
            this.renderUsersTable(paginatedUsers);
            
            // Update pagination
            this.updatePagination(filteredUsers.length);
            
        } catch (error) {
            console.error('Error loading users:', error);
            AdminApp_Instance.showToast('Error loading users', 'error');
        }
    }

    // Generate mock users data
    generateMockUsers() {
        const users = [];
        const firstNames = ['Ahmed', 'Fatima', 'Mohamed', 'Aicha', 'Youssef', 'Khadija', 'Omar', 'Zineb', 'Ali', 'Nadia'];
        const lastNames = ['Benali', 'Boumediene', 'Cherif', 'Djelloul', 'Ferhat', 'Ghali', 'Hamidi', 'Idir', 'Kaci', 'Larbi'];
        const userTypes = ['customer', 'provider', 'admin'];
        const statuses = ['active', 'inactive', 'suspended'];

        for (let i = 1; i <= 50; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            users.push({
                id: i,
                first_name: firstName,
                last_name: lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
                phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
                user_type: userType,
                status: status,
                profile_image: null,
                created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        return users;
    }

    // Apply filters
    applyFilters(users) {
        return users.filter(user => {
            // Type filter
            if (this.filters.type && user.user_type !== this.filters.type) {
                return false;
            }

            // Status filter
            if (this.filters.status && user.status !== this.filters.status) {
                return false;
            }

            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
                const email = user.email.toLowerCase();
                
                if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });
    }

    // Apply pagination
    applyPagination(users) {
        this.totalUsers = users.length;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return users.slice(startIndex, endIndex);
    }

    // Render users table
    renderUsersTable(users) {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="no-data">
                            <i class="fas fa-users"></i>
                            <p>No users found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}">
                </td>
                <td>
                    <div class="user-info">
                        <img src="${user.profile_image || '../images/default-avatar.png'}" alt="${user.first_name}" class="user-avatar">
                        <div class="user-details">
                            <span class="user-name">${user.first_name} ${user.last_name}</span>
                            <span class="user-phone">${user.phone}</span>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="user-type-badge ${user.user_type}">${this.formatUserType(user.user_type)}</span>
                </td>
                <td>
                    <span class="status-badge ${user.status}">${this.formatStatus(user.status)}</span>
                </td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="AdminUsers_Instance.viewUser(${user.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="AdminUsers_Instance.editUser(${user.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-${user.status === 'suspended' ? 'success' : 'warning'}" 
                                onclick="AdminUsers_Instance.toggleUserStatus(${user.id}, '${user.status}')" 
                                title="${user.status === 'suspended' ? 'Activate' : 'Suspend'}">
                            <i class="fas fa-${user.status === 'suspended' ? 'check' : 'ban'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="AdminUsers_Instance.deleteUser(${user.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to checkboxes
        const checkboxes = tableBody.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.updateSelectAllState.bind(this));
        });
    }

    // Update pagination
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pagination = document.getElementById('users-pagination');
        const showingElement = document.getElementById('users-showing');
        const totalElement = document.getElementById('users-total');

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
                        this.loadUsers();
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

        if (filterId === 'user-type-filter') {
            this.filters.type = value;
        } else if (filterId === 'user-status-filter') {
            this.filters.status = value;
        }

        this.currentPage = 1; // Reset to first page
        this.loadUsers();
    }

    // Handle select all
    handleSelectAll(e) {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    }

    // Update select all state
    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById('select-all-users');
        const checkboxes = document.querySelectorAll('.user-checkbox');
        const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');

        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
        }
    }

    // User actions
    viewUser(userId) {
        console.log('View user:', userId);
        AdminApp_Instance.showToast('User details modal coming soon', 'info');
    }

    editUser(userId) {
        console.log('Edit user:', userId);
        AdminApp_Instance.showToast('Edit user modal coming soon', 'info');
    }

    toggleUserStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        const action = newStatus === 'active' ? 'activated' : 'suspended';
        
        console.log(`Toggle user ${userId} status to:`, newStatus);
        AdminApp_Instance.showToast(`User ${action} successfully`, 'success');
        
        // Reload users
        this.loadUsers();
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            console.log('Delete user:', userId);
            AdminApp_Instance.showToast('User deleted successfully', 'success');
            
            // Reload users
            this.loadUsers();
        }
    }

    showAddUserModal() {
        AdminApp_Instance.showToast('Add user modal coming soon', 'info');
    }

    exportUsers() {
        AdminApp_Instance.showToast('Export functionality coming soon', 'info');
    }

    // Utility methods
    formatUserType(type) {
        const types = {
            customer: 'Customer',
            provider: 'Provider',
            admin: 'Admin'
        };
        return types[type] || type;
    }

    formatStatus(status) {
        const statuses = {
            active: 'Active',
            inactive: 'Inactive',
            suspended: 'Suspended'
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

// Create global users instance
const AdminUsers_Instance = new AdminUsers();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminUsers, AdminUsers_Instance };
}

