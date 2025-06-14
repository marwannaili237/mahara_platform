// Mahara Admin Dashboard Module
class AdminDashboard {
    constructor() {
        this.charts = {};
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    // Initialize dashboard
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize charts
            this.initCharts();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Dashboard initialization error:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Date range picker
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('change', this.handleDateRangeChange.bind(this));
        }

        // Export buttons
        const exportBtns = document.querySelectorAll('[id*="export"]');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', this.handleExport.bind(this));
        });
    }

    // Initialize charts
    initCharts() {
        // User Growth Chart
        this.initUserGrowthChart();
        
        // Categories Chart
        this.initCategoriesChart();
    }

    // Initialize user growth chart
    initUserGrowthChart() {
        const canvas = document.getElementById('user-growth-chart');
        if (!canvas) return;

        // Simulate chart data
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [65, 78, 90, 81, 95, 120],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        };

        // Create simple chart visualization
        this.renderLineChart(canvas, data);
    }

    // Initialize categories chart
    initCategoriesChart() {
        const canvas = document.getElementById('categories-chart');
        if (!canvas) return;

        // Simulate chart data
        const data = {
            labels: ['Home Services', 'Education', 'Technology', 'Arts', 'Personal Care'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        };

        // Create simple pie chart visualization
        this.renderPieChart(canvas, data);
    }

    // Simple line chart renderer (without external library)
    renderLineChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Chart settings
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Find max value
        const maxValue = Math.max(...data.datasets[0].data);
        const minValue = Math.min(...data.datasets[0].data);
        const range = maxValue - minValue;
        
        // Draw grid lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= data.labels.length - 1; i++) {
            const x = padding + (chartWidth / (data.labels.length - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
        
        // Draw line
        ctx.strokeStyle = data.datasets[0].borderColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.datasets[0].data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.labels.length - 1)) * index;
            const y = height - padding - ((value - minValue) / range) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = data.datasets[0].borderColor;
        data.datasets[0].data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.labels.length - 1)) * index;
            const y = height - padding - ((value - minValue) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        data.labels.forEach((label, index) => {
            const x = padding + (chartWidth / (data.labels.length - 1)) * index;
            ctx.fillText(label, x, height - 10);
        });
    }

    // Simple pie chart renderer
    renderPieChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Chart settings
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        // Calculate total
        const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
        
        // Draw pie slices
        let currentAngle = -Math.PI / 2; // Start from top
        
        data.datasets[0].data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.fillStyle = data.datasets[0].backgroundColor[index];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${value}%`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
        
        // Draw legend
        const legendX = 20;
        let legendY = 20;
        
        data.labels.forEach((label, index) => {
            // Color box
            ctx.fillStyle = data.datasets[0].backgroundColor[index];
            ctx.fillRect(legendX, legendY, 12, 12);
            
            // Label text
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(label, legendX + 20, legendY + 9);
            
            legendY += 20;
        });
    }

    // Load dashboard data
    async loadData() {
        try {
            // Load recent activities
            await this.loadRecentActivities();
            
            // Load pending approvals
            await this.loadPendingApprovals();
            
            // Refresh charts
            this.refreshCharts();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // Load recent activities
    async loadRecentActivities() {
        const activitiesList = document.getElementById('recent-activities');
        if (!activitiesList) return;

        // Simulate activities data
        const activities = [
            {
                id: 1,
                type: 'user_registered',
                message: 'New user Ahmed Benali registered',
                time: '5 minutes ago',
                icon: 'user-plus',
                color: '#10b981'
            },
            {
                id: 2,
                type: 'service_created',
                message: 'New service "Web Development" created',
                time: '15 minutes ago',
                icon: 'briefcase',
                color: '#3b82f6'
            },
            {
                id: 3,
                type: 'booking_completed',
                message: 'Booking #1234 completed successfully',
                time: '1 hour ago',
                icon: 'check-circle',
                color: '#10b981'
            },
            {
                id: 4,
                type: 'review_submitted',
                message: 'New 5-star review submitted',
                time: '2 hours ago',
                icon: 'star',
                color: '#f59e0b'
            }
        ];

        activitiesList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background-color: ${activity.color}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    // Load pending approvals
    async loadPendingApprovals() {
        const pendingList = document.getElementById('pending-approvals');
        const pendingCount = document.getElementById('pending-count');
        
        if (!pendingList) return;

        // Simulate pending approvals data
        const pending = [
            {
                id: 1,
                type: 'service',
                title: 'Web Development Service',
                provider: 'Ahmed Benali',
                time: '2 hours ago'
            },
            {
                id: 2,
                type: 'service',
                title: 'Graphic Design Service',
                provider: 'Fatima Zahra',
                time: '4 hours ago'
            },
            {
                id: 3,
                type: 'user',
                title: 'Provider Account Verification',
                provider: 'Mohamed Ali',
                time: '6 hours ago'
            }
        ];

        if (pendingCount) {
            pendingCount.textContent = pending.length;
        }

        pendingList.innerHTML = pending.map(item => `
            <div class="pending-item">
                <div class="pending-icon">
                    <i class="fas fa-${item.type === 'service' ? 'briefcase' : 'user'}"></i>
                </div>
                <div class="pending-content">
                    <h4>${item.title}</h4>
                    <p>by ${item.provider}</p>
                    <span class="pending-time">${item.time}</span>
                </div>
                <div class="pending-actions">
                    <button class="btn btn-sm btn-success" onclick="AdminDashboard_Instance.approveItem(${item.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AdminDashboard_Instance.rejectItem(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Refresh charts
    refreshCharts() {
        // Re-initialize charts with new data
        this.initUserGrowthChart();
        this.initCategoriesChart();
    }

    // Handle date range change
    handleDateRangeChange(e) {
        const range = e.target.value;
        console.log('Date range changed:', range);
        
        // Reload data based on date range
        this.loadData();
    }

    // Handle export
    handleExport(e) {
        const exportType = e.target.id;
        console.log('Export:', exportType);
        
        // Implement export functionality
        AdminApp_Instance.showToast('Export functionality coming soon', 'info');
    }

    // Approve pending item
    approveItem(itemId) {
        console.log('Approving item:', itemId);
        AdminApp_Instance.showToast('Item approved successfully', 'success');
        
        // Reload pending approvals
        this.loadPendingApprovals();
    }

    // Reject pending item
    rejectItem(itemId) {
        console.log('Rejecting item:', itemId);
        AdminApp_Instance.showToast('Item rejected', 'warning');
        
        // Reload pending approvals
        this.loadPendingApprovals();
    }
}

// Create global dashboard instance
const AdminDashboard_Instance = new AdminDashboard();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminDashboard, AdminDashboard_Instance };
}

