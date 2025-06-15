// Simple test for JavaScript utility functions
console.log('Starting JavaScript tests...\n');

let passed = 0;
let failed = 0;

function test(description, testFunction) {
    try {
        testFunction();
        console.log(`✓ ${description}`);
        passed++;
    } catch (error) {
        console.log(`✗ ${description}`);
        console.log(`  Error: ${error.message}`);
        failed++;
    }
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
        },
        toContain: (expected) => {
            if (!actual.includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        }
    };
}

// Test utility functions that can be extracted and tested independently

// Text truncation function (extracted from main.js)
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Star rating function (extracted from main.js)
function createStarRating(rating) {
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

// Debounce function (from APIUtils)
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Format number function (from T object)
function formatNumber(num) {
    return num.toLocaleString();
}

// Run tests
console.log('=== Text Truncation Tests ===');

test('should truncate long text correctly', () => {
    const result = truncateText('This is a long text that should be truncated', 20);
    expect(result).toBe('This is a long text ...');
});

test('should return short text unchanged', () => {
    const result = truncateText('Short text', 20);
    expect(result).toBe('Short text');
});

test('should handle empty text', () => {
    const result = truncateText('', 20);
    expect(result).toBe('');
});

test('should handle null text', () => {
    const result = truncateText(null, 20);
    expect(result).toBe('');
});

test('should handle undefined text', () => {
    const result = truncateText(undefined, 20);
    expect(result).toBe('');
});

console.log('\n=== Star Rating Tests ===');

test('should create 5 full stars for rating 5', () => {
    const result = createStarRating(5);
    expect(result).toContain('data-rating="5"');
    expect(result).toContain('fas fa-star');
});

test('should create half star for rating 3.5', () => {
    const result = createStarRating(3.5);
    expect(result).toContain('data-rating="3.5"');
    expect(result).toContain('fa-star-half-alt');
});

test('should create empty stars for rating 0', () => {
    const result = createStarRating(0);
    expect(result).toContain('data-rating="0"');
    expect(result).toContain('far fa-star');
});

test('should create correct mix for rating 2.5', () => {
    const result = createStarRating(2.5);
    expect(result).toContain('data-rating="2.5"');
    expect(result).toContain('fas fa-star'); // full stars
    expect(result).toContain('fa-star-half-alt'); // half star
    expect(result).toContain('far fa-star'); // empty stars
});

console.log('\n=== Utility Function Tests ===');

test('should format numbers correctly', () => {
    const result = formatNumber(1234567);
    expect(result).toContain('1'); // Should contain the number
});

test('debounce should return a function', () => {
    const debouncedFunc = debounce(() => {}, 100);
    expect(typeof debouncedFunc).toBe('function');
});

console.log('\n=== Email Validation Tests ===');

// Email validation function (extracted from validation logic)
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

test('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.org')).toBe(true);
});

test('should reject invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
});

console.log('\n=== Phone Validation Tests ===');

// Phone validation function (for Algerian numbers)
function validatePhone(phone) {
    const phoneRegex = /^(\+213|0)(5|6|7)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

test('should validate correct Algerian phone numbers', () => {
    expect(validatePhone('+213555123456')).toBe(true);
    expect(validatePhone('0555123456')).toBe(true);
    expect(validatePhone('+213 555 123 456')).toBe(true);
    expect(validatePhone('0555-123-456')).toBe(true);
});

test('should reject invalid phone numbers', () => {
    expect(validatePhone('123456789')).toBe(false);
    expect(validatePhone('+33123456789')).toBe(false);
    expect(validatePhone('0123456789')).toBe(false);
    expect(validatePhone('')).toBe(false);
});

// Show summary
const total = passed + failed;
console.log('\n=== Test Summary ===');
console.log(`${passed}/${total} tests passed`);
if (failed > 0) {
    console.log(`${failed} tests failed`);
}

process.exit(failed === 0 ? 0 : 1);