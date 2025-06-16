// Admin Settings Module
class AdminSettings {
    constructor() {
        this.isInitialized = false;
        this.currentTab = 'general';
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
    }

    // Initialize settings module
    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.loadData();
        
        this.isInitialized = true;
        console.log('Admin Settings module initialized');
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Save settings button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', this.saveSettings.bind(this));
        }
    }

    // Switch between tabs
    switchTab(tabName) {
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });

        // Update active tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        this.currentTab = tabName;
    }

    // Load settings data
    async loadData() {
        try {
            // Simulate loading settings data
            const settings = {
                general: {
                    siteName: 'Mahara Platform',
                    siteDescription: 'Professional services marketplace in Algeria',
                    siteEmail: 'contact@mahara.dz',
                    sitePhone: '+213 123 456 789'
                },
                email: {
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    smtpUsername: '',
                    smtpPassword: ''
                },
                payment: {
                    currency: 'DZD',
                    commissionRate: 10
                },
                security: {
                    requireEmailVerification: true,
                    enableTwoFactor: true,
                    sessionTimeout: 60
                }
            };

            this.populateSettings(settings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Populate settings form with data
    populateSettings(settings) {
        // General settings
        if (settings.general) {
            this.setFieldValue('site-name', settings.general.siteName);
            this.setFieldValue('site-description', settings.general.siteDescription);
            this.setFieldValue('site-email', settings.general.siteEmail);
            this.setFieldValue('site-phone', settings.general.sitePhone);
        }

        // Email settings
        if (settings.email) {
            this.setFieldValue('smtp-host', settings.email.smtpHost);
            this.setFieldValue('smtp-port', settings.email.smtpPort);
            this.setFieldValue('smtp-username', settings.email.smtpUsername);
            this.setFieldValue('smtp-password', settings.email.smtpPassword);
        }

        // Payment settings
        if (settings.payment) {
            this.setFieldValue('currency', settings.payment.currency);
            this.setFieldValue('commission-rate', settings.payment.commissionRate);
        }

        // Security settings
        if (settings.security) {
            this.setCheckboxValue('require-email-verification', settings.security.requireEmailVerification);
            this.setCheckboxValue('enable-two-factor', settings.security.enableTwoFactor);
            this.setFieldValue('session-timeout', settings.security.sessionTimeout);
        }
    }

    // Set field value helper
    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value || '';
        }
    }

    // Set checkbox value helper
    setCheckboxValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.checked = !!value;
        }
    }

    // Save settings
    async saveSettings() {
        try {
            const settings = this.collectSettings();
            
            // Simulate API call to save settings
            console.log('Saving settings:', settings);
            
            // Show success message
            this.showToast('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    // Collect settings from form
    collectSettings() {
        return {
            general: {
                siteName: this.getFieldValue('site-name'),
                siteDescription: this.getFieldValue('site-description'),
                siteEmail: this.getFieldValue('site-email'),
                sitePhone: this.getFieldValue('site-phone')
            },
            email: {
                smtpHost: this.getFieldValue('smtp-host'),
                smtpPort: parseInt(this.getFieldValue('smtp-port')) || 587,
                smtpUsername: this.getFieldValue('smtp-username'),
                smtpPassword: this.getFieldValue('smtp-password')
            },
            payment: {
                currency: this.getFieldValue('currency'),
                commissionRate: parseFloat(this.getFieldValue('commission-rate')) || 10
            },
            security: {
                requireEmailVerification: this.getCheckboxValue('require-email-verification'),
                enableTwoFactor: this.getCheckboxValue('enable-two-factor'),
                sessionTimeout: parseInt(this.getFieldValue('session-timeout')) || 60
            }
        };
    }

    // Get field value helper
    getFieldValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.value : '';
    }

    // Get checkbox value helper
    getCheckboxValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.checked : false;
    }

    // Show toast notification
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

    // Get toast icon
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Get toast color
    getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSettings;
}