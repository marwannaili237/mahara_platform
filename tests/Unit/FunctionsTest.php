<?php

use PHPUnit\Framework\TestCase;

class FunctionsTest extends TestCase
{
    public function testGenerateBookingReference()
    {
        $reference1 = generateBookingReference();
        $reference2 = generateBookingReference();

        // Should be different
        $this->assertNotEquals($reference1, $reference2);
        
        // Should start with MH and today's date
        $expectedPrefix = 'MH' . date('Ymd');
        $this->assertStringStartsWith($expectedPrefix, $reference1);
        $this->assertStringStartsWith($expectedPrefix, $reference2);
        
        // Should be at least 14 characters total (MH + 8 digits for date + up to 6 characters from uniqid)
        $this->assertGreaterThanOrEqual(14, strlen($reference1));
        $this->assertGreaterThanOrEqual(14, strlen($reference2));
    }

    public function testCalculateDistanceWithSameLocation()
    {
        $distance = calculateDistance(36.7538, 3.0588, 36.7538, 3.0588); // Algiers to Algiers
        $this->assertEquals(0, $distance, 'Distance between same coordinates should be 0');
    }

    public function testCalculateDistanceWithKnownLocations()
    {
        // Distance between Algiers (36.7538, 3.0588) and Oran (35.6969, -0.6331)
        $distance = calculateDistance(36.7538, 3.0588, 35.6969, -0.6331);
        
        // Should be approximately 362 km
        $this->assertGreaterThan(350, $distance);
        $this->assertLessThan(380, $distance);
    }

    public function testCalculateDistanceWithNegativeCoordinates()
    {
        $distance = calculateDistance(-36.7538, -3.0588, -35.6969, 0.6331);
        $this->assertGreaterThan(0, $distance);
    }

    public function testGenerateRandomStringWithDefaultLength()
    {
        $string = generateRandomString();
        $this->assertEquals(10, strlen($string));
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9]+$/', $string);
    }

    public function testGenerateRandomStringWithCustomLength()
    {
        $lengths = [5, 15, 20, 32];
        
        foreach ($lengths as $length) {
            $string = generateRandomString($length);
            $this->assertEquals($length, strlen($string));
            $this->assertMatchesRegularExpression('/^[a-zA-Z0-9]+$/', $string);
        }
    }

    public function testGenerateRandomStringUniqueness()
    {
        $strings = [];
        for ($i = 0; $i < 100; $i++) {
            $strings[] = generateRandomString(20);
        }
        
        // All strings should be unique
        $this->assertEquals(100, count(array_unique($strings)));
    }

    public function testFormatFileSizeWithBytes()
    {
        $this->assertEquals('0 B', formatFileSize(0));
        $this->assertEquals('512 B', formatFileSize(512));
        $this->assertEquals('1023 B', formatFileSize(1023));
    }

    public function testFormatFileSizeWithKilobytes()
    {
        $this->assertEquals('1 KB', formatFileSize(1024));
        $this->assertEquals('1.5 KB', formatFileSize(1536));
        $this->assertEquals('500 KB', formatFileSize(512000));
    }

    public function testFormatFileSizeWithMegabytes()
    {
        $this->assertEquals('1 MB', formatFileSize(1048576));
        $this->assertEquals('2.5 MB', formatFileSize(2621440));
        $this->assertEquals('100 MB', formatFileSize(104857600));
    }

    public function testFormatFileSizeWithGigabytes()
    {
        $this->assertEquals('1 GB', formatFileSize(1073741824));
        $this->assertEquals('2.5 GB', formatFileSize(2684354560));
    }

    public function testTruncateTextWithShortText()
    {
        $text = 'Short text';
        $result = truncateText($text, 100);
        $this->assertEquals('Short text', $result);
    }

    public function testTruncateTextWithLongText()
    {
        $text = 'This is a very long text that should be truncated because it exceeds the maximum length limit';
        $result = truncateText($text, 50);
        
        $this->assertEquals(53, strlen($result)); // 50 + 3 for '...'
        $this->assertStringEndsWith('...', $result);
        $this->assertStringStartsWith('This is a very long text that should be truncated', $result);
    }

    public function testTruncateTextWithCustomSuffix()
    {
        $text = 'This is a long text that needs truncation';
        $result = truncateText($text, 20, ' [more]');
        
        $this->assertStringEndsWith(' [more]', $result);
        $this->assertEquals(27, strlen($result)); // 20 + 7 for ' [more]'
    }

    public function testTruncateTextWithUnicodeCharacters()
    {
        $text = 'هذا نص طويل باللغة العربية يجب اقتطاعه';
        $result = truncateText($text, 20);
        
        // For Unicode text, mb_strlen is used, so result should be 23 characters (20 + 3 for '...')
        $this->assertEquals(23, mb_strlen($result));
        $this->assertStringEndsWith('...', $result);
    }

    public function testGenerateSlugWithEnglishText()
    {
        $this->assertEquals('hello-world', generateSlug('Hello World'));
        $this->assertEquals('this-is-a-test', generateSlug('This is a test!'));
        $this->assertEquals('special-characters', generateSlug('Special @#$% Characters'));
    }

    public function testGenerateSlugWithArabicText()
    {
        $this->assertEquals('hla-wshla', generateSlug('أهلاً وسهلاً'));
        $this->assertEquals('khdmat-tnzyf', generateSlug('خدمات تنظيف'));
    }

    public function testGenerateSlugWithFrenchText()
    {
        $this->assertEquals('bonjour-le-monde', generateSlug('Bonjour le monde'));
        $this->assertEquals('service-de-nettoyage', generateSlug('Service de nettoyage'));
    }

    public function testGenerateSlugWithMixedContent()
    {
        $this->assertEquals('test-123-hello', generateSlug('Test 123 Hello!'));
        $this->assertEquals('mixed-content-2024', generateSlug('Mixed Content 2024'));
    }

    public function testGenerateSlugWithSpecialCharacters()
    {
        $this->assertEquals('hello-world', generateSlug('Hello---World'));
        $this->assertEquals('test-slug', generateSlug('  Test   Slug  '));
        $this->assertEquals('no-special-chars', generateSlug('No @#$%^&*() Special Chars'));
    }

    public function testGetClientIPWithRemoteAddr()
    {
        // Mock $_SERVER for testing
        $_SERVER['REMOTE_ADDR'] = '192.168.1.100';
        unset($_SERVER['HTTP_CLIENT_IP']);
        unset($_SERVER['HTTP_X_FORWARDED_FOR']);
        
        $ip = getClientIP();
        $this->assertEquals('192.168.1.100', $ip);
    }

    public function testGetClientIPWithForwardedFor()
    {
        $_SERVER['HTTP_X_FORWARDED_FOR'] = '203.0.113.1, 192.168.1.100';
        $_SERVER['REMOTE_ADDR'] = '192.168.1.100';
        
        $ip = getClientIP();
        $this->assertEquals('203.0.113.1', $ip);
    }

    public function testGetClientIPWithPrivateIP()
    {
        $_SERVER['HTTP_X_FORWARDED_FOR'] = '192.168.1.100';
        $_SERVER['REMOTE_ADDR'] = '203.0.113.1';
        
        $ip = getClientIP();
        $this->assertEquals('203.0.113.1', $ip);
    }

    public function testGetClientIPFallback()
    {
        unset($_SERVER['HTTP_CLIENT_IP']);
        unset($_SERVER['HTTP_X_FORWARDED_FOR']);
        unset($_SERVER['REMOTE_ADDR']);
        
        $ip = getClientIP();
        $this->assertEquals('0.0.0.0', $ip);
    }

    public function testCheckRateLimitWithinLimit()
    {
        $identifier = 'test_user_' . time();
        
        // First request should be allowed
        $this->assertTrue(checkRateLimit($identifier));
        
        // Multiple requests within limit should be allowed
        for ($i = 0; $i < 10; $i++) {
            $this->assertTrue(checkRateLimit($identifier));
        }
    }

    public function testLogMessageWhenDisabled()
    {
        // LOG_ENABLED is set to false in bootstrap.php
        $logFile = LOG_PATH . 'app_' . date('Y-m-d') . '.log';
        
        // Remove log file if exists
        if (file_exists($logFile)) {
            unlink($logFile);
        }
        
        logMessage('Test message');
        
        // Log file should not be created when logging is disabled
        $this->assertFileDoesNotExist($logFile);
    }

    protected function setUp(): void
    {
        // Clean up any existing cache files before each test
        $cacheDir = __DIR__ . '/../../backend/cache/';
        if (is_dir($cacheDir)) {
            $files = glob($cacheDir . 'rate_limit_*.json');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
    }

    protected function tearDown(): void
    {
        // Clean up after each test
        $this->setUp();
        
        // Reset $_SERVER variables
        unset($_SERVER['HTTP_CLIENT_IP']);
        unset($_SERVER['HTTP_X_FORWARDED_FOR']);
        if (!isset($_SERVER['REMOTE_ADDR'])) {
            $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
        }
    }
}