// Simple Node.js test for main.js functions
const fs = require('fs');
const path = require('path');

// Read the main.js file
const mainJsPath = path.join(__dirname, '../js/main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

// Mock global objects
global.document = {
    readyState: 'complete',
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({
        className: '',
        innerHTML: '',
        appendChild: () => {}
    })
};

global.window = {
    addEventListener: () => {}
};

global.console = {
    log: () => {},
    error: () => {}
};

// Mock CONFIG
global.CONFIG = {
    UI: { DEBOUNCE_DELAY: 300 },
    DEFAULT_IMAGES: {
        SERVICE: '/images/default-service.jpg',
        USER: '/images/default-user.jpg'
    }
};

// Mock T (Translation)
global.T = {
    getCurrentLanguage: () => 'en',
    formatNumber: (num) => num.toLocaleString(),
    setLanguage: () => {},
    updatePageLanguage: () => {}
};

// Mock t function
global.t = (key) => {
    const translations = {
        'stats.services': 'services',
        'services.no_featured': 'No featured services available',
        'service.featured': 'Featured',
        'service.location.flexible': 'Flexible location',
        'common.view': 'View',
        'service.book': 'Book'
    };
    return translations[key] || key;
};

// Mock Auth, API, APIUtils
global.Auth = { init: async () => {} };
global.API = {
    getCategories: async () => ({ success: true, data: [] }),
    getFeaturedServices: async () => ({ success: true, data: [] })
};
global.APIUtils = {
    debounce: (func, delay) => func
};

// Execute the main.js content
eval(mainJsContent);

// Test framework
class TestFramework {
    constructor() {
        this.passed = 0;
        this.failed = 0;
    }

    describe(description, testFunction) {
        console.log(`\n=== ${description} ===`);
        testFunction();
    }

    it(description, testFunction) {
        try {
            testFunction();
            console.log(`✓ ${description}`);
            this.passed++;
        } catch (error) {
            console.log(`✗ ${description}`);
            console.log(`  Error: ${error.message}`);
            this.failed++;
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected "${actual}" to contain "${expected}"`);
                }
            }
        };
    }

    showSummary() {
        const total = this.passed + this.failed;
        console.log(`\n=== Test Summary ===`);
        console.log(`${this.passed}/${total} tests passed`);
        if (this.failed > 0) {
            console.log(`${this.failed} tests failed`);
        }
        return this.failed === 0;
    }
}

// Run tests
const test = new TestFramework();

test.describe('MaharaApp Class Tests', () => {
    test.it('should create MaharaApp instance', () => {
        const app = new MaharaApp();
        test.expect(app).toBeTruthy();
        test.expect(app.isInitialized).toBe(false);
        test.expect(app.currentPage).toBe('home');
    });

    test.it('should have bound methods', () => {
        const app = new MaharaApp();
        test.expect(typeof app.init).toBe('function');
        test.expect(typeof app.initializeComponents).toBe('function');
        test.expect(typeof app.setupEventListeners).toBe('function');
    });
});

test.describe('Utility Functions Tests', () => {
    test.it('should truncate text correctly', () => {
        const app = new MaharaApp();
        
        // Test normal truncation
        const result1 = app.truncateText('This is a long text that should be truncated', 20);
        test.expect(result1).toBe('This is a long text ...');
        
        // Test text shorter than max length
        const result2 = app.truncateText('Short text', 20);
        test.expect(result2).toBe('Short text');
        
        // Test empty text
        const result3 = app.truncateText('', 20);
        test.expect(result3).toBe('');
        
        // Test null/undefined text
        const result4 = app.truncateText(null, 20);
        test.expect(result4).toBe('');
    });

    test.it('should create star rating HTML correctly', () => {
        const app = new MaharaApp();
        
        // Test full rating
        const result1 = app.createStarRating(5);
        test.expect(result1).toContain('data-rating="5"');
        test.expect(result1).toContain('fas fa-star');
        
        // Test half rating
        const result2 = app.createStarRating(3.5);
        test.expect(result2).toContain('data-rating="3.5"');
        test.expect(result2).toContain('fa-star-half-alt');
        
        // Test zero rating
        const result3 = app.createStarRating(0);
        test.expect(result3).toContain('data-rating="0"');
        test.expect(result3).toContain('far fa-star');
    });

    test.it('should create service card HTML correctly', () => {
        const app = new MaharaApp();
        const mockService = {
            id: 1,
            title: 'Test Service',
            description: 'This is a test service description',
            images: ['test-image.jpg'],
            is_featured: true,
            avg_rating: 4.5,
            total_reviews: 10,
            wilaya: 'Algiers',
            formatted_price: '5000 DZD',
            provider: {
                name: 'Test Provider',
                profile_image: 'provider.jpg'
            }
        };
        
        const result = app.createServiceCard(mockService);
        test.expect(result).toContain('data-service-id="1"');
        test.expect(result).toContain('Test Service');
        test.expect(result).toContain('test-image.jpg');
        test.expect(result).toContain('Featured');
        test.expect(result).toContain('Algiers');
        test.expect(result).toContain('5000 DZD');
        test.expect(result).toContain('Test Provider');
    });
});

test.describe('Component Initialization Tests', () => {
    test.it('should initialize components without errors', () => {
        const app = new MaharaApp();
        
        // Should not throw errors
        app.initializeComponents();
        test.expect(true).toBeTruthy(); // If we get here, no errors were thrown
    });
});

// Show results and exit with appropriate code
const success = test.showSummary();
process.exit(success ? 0 : 1);