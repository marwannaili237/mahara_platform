<?php

use PHPUnit\Framework\TestCase;

class ValidationTest extends TestCase
{
    public function testValidateEmailWithValidEmails()
    {
        $validEmails = [
            'test@example.com',
            'user.name@domain.co.uk',
            'user+tag@example.org',
            'user123@test-domain.com',
            'arabic.user@example.dz'
        ];

        foreach ($validEmails as $email) {
            $this->assertTrue(validateEmail($email), "Email '{$email}' should be valid");
        }
    }

    public function testValidateEmailWithInvalidEmails()
    {
        $invalidEmails = [
            'invalid-email',
            '@example.com',
            'user@',
            'user..name@example.com',
            'user@.com',
            '',
            'user@domain',
            'user name@example.com'
        ];

        foreach ($invalidEmails as $email) {
            $this->assertFalse(validateEmail($email), "Email '{$email}' should be invalid");
        }
    }

    public function testValidatePhoneWithValidAlgerianNumbers()
    {
        $validNumbers = [
            '+213555123456',    // Mobile with country code
            '0555123456',       // Mobile without country code
            '+213661234567',    // Mobile with 6 prefix
            '0771234567',       // Mobile with 7 prefix
            '+21323123456',     // Landline with country code
            '023123456',        // Landline without country code
            '+213 55 51 23 456', // With spaces
            '0555-123-456'      // With dashes
        ];

        foreach ($validNumbers as $number) {
            $this->assertTrue(validatePhone($number), "Phone number '{$number}' should be valid");
        }
    }

    public function testValidatePhoneWithInvalidNumbers()
    {
        $invalidNumbers = [
            '123456789',        // Too short
            '+33123456789',     // Wrong country code
            '0123456789',       // Invalid prefix
            '05551234567890',   // Too long
            '',                 // Empty
            'abc123456',        // Contains letters
            '+213'              // Only country code
        ];

        foreach ($invalidNumbers as $number) {
            $this->assertFalse(validatePhone($number), "Phone number '{$number}' should be invalid");
        }
    }

    public function testValidatePasswordWithValidPasswords()
    {
        $validPasswords = [
            'password123',
            'MyPass123',
            'Test123456',
            'Complex1Pass',
            'a1b2c3d4e5'
        ];

        foreach ($validPasswords as $password) {
            $this->assertTrue(validatePassword($password), "Password '{$password}' should be valid");
        }
    }

    public function testValidatePasswordWithInvalidPasswords()
    {
        $invalidPasswords = [
            'short1',           // Too short
            'password',         // No numbers
            '12345678',         // No letters
            '',                 // Empty
            'Pass1'             // Too short
        ];

        foreach ($invalidPasswords as $password) {
            $this->assertFalse(validatePassword($password), "Password '{$password}' should be invalid");
        }
    }

    public function testValidateUserRegistrationWithValidData()
    {
        $validData = [
            'email' => 'test@example.com',
            'password' => 'password123',
            'first_name' => 'Ahmed',
            'last_name' => 'Benali',
            'phone' => '0555123456',
            'user_type' => 'customer',
            'preferred_language' => 'ar'
        ];

        $errors = validateUserRegistration($validData);
        $this->assertEmpty($errors, 'Valid registration data should not have errors');
    }

    public function testValidateUserRegistrationWithMissingRequiredFields()
    {
        $invalidData = [
            'email' => 'test@example.com'
            // Missing required fields
        ];

        $errors = validateUserRegistration($invalidData);
        $this->assertArrayHasKey('password', $errors);
        $this->assertArrayHasKey('first_name', $errors);
        $this->assertArrayHasKey('last_name', $errors);
    }

    public function testValidateUserRegistrationWithInvalidEmail()
    {
        $invalidData = [
            'email' => 'invalid-email',
            'password' => 'password123',
            'first_name' => 'Ahmed',
            'last_name' => 'Benali'
        ];

        $errors = validateUserRegistration($invalidData);
        $this->assertArrayHasKey('email', $errors);
        $this->assertEquals('Invalid email format', $errors['email']);
    }

    public function testValidateUserRegistrationWithShortNames()
    {
        $invalidData = [
            'email' => 'test@example.com',
            'password' => 'password123',
            'first_name' => 'A',
            'last_name' => 'B'
        ];

        $errors = validateUserRegistration($invalidData);
        $this->assertArrayHasKey('first_name', $errors);
        $this->assertArrayHasKey('last_name', $errors);
    }

    public function testValidateServiceDataWithValidData()
    {
        $validData = [
            'title_ar' => 'خدمة تنظيف المنازل',
            'title_fr' => 'Service de nettoyage de maison',
            'title_en' => 'House cleaning service',
            'description_ar' => 'خدمة تنظيف شاملة للمنازل والمكاتب',
            'description_fr' => 'Service de nettoyage complet pour maisons et bureaux',
            'description_en' => 'Complete cleaning service for homes and offices',
            'category_id' => 1,
            'price_type' => 'hourly',
            'price_amount' => 50.00,
            'service_location' => 'customer_location'
        ];

        $errors = validateServiceData($validData);
        $this->assertEmpty($errors, 'Valid service data should not have errors');
    }

    public function testValidateServiceDataWithShortTitles()
    {
        $invalidData = [
            'title_ar' => 'قص',
            'title_fr' => 'Crt',
            'title_en' => 'Shrt',
            'description_ar' => 'وصف طويل بما فيه الكفاية',
            'description_fr' => 'Description assez longue',
            'description_en' => 'Long enough description',
            'category_id' => 1,
            'price_type' => 'fixed'
        ];

        $errors = validateServiceData($invalidData);
        $this->assertArrayHasKey('title_ar', $errors);
        $this->assertArrayHasKey('title_fr', $errors);
        $this->assertArrayHasKey('title_en', $errors);
    }

    public function testValidateBookingDataWithValidData()
    {
        $validData = [
            'service_id' => 1,
            'requested_date' => date('Y-m-d', strtotime('+1 day')),
            'requested_time' => '14:30',
            'duration_hours' => 2.5,
            'location_type' => 'customer_location'
        ];

        $errors = validateBookingData($validData);
        $this->assertEmpty($errors, 'Valid booking data should not have errors');
    }

    public function testValidateBookingDataWithPastDate()
    {
        $invalidData = [
            'service_id' => 1,
            'requested_date' => date('Y-m-d', strtotime('-1 day')),
            'location_type' => 'customer_location'
        ];

        $errors = validateBookingData($invalidData);
        $this->assertArrayHasKey('requested_date', $errors);
        $this->assertEquals('Date cannot be in the past', $errors['requested_date']);
    }

    public function testValidateReviewDataWithValidData()
    {
        $validData = [
            'rating' => 4,
            'review_text' => 'Excellent service, very professional and on time.'
        ];

        $errors = validateReviewData($validData);
        $this->assertEmpty($errors, 'Valid review data should not have errors');
    }

    public function testValidateReviewDataWithInvalidRating()
    {
        $invalidData = [
            'rating' => 6,  // Above max rating
            'review_text' => 'Good service'
        ];

        $errors = validateReviewData($invalidData);
        $this->assertArrayHasKey('rating', $errors);
    }

    public function testSanitizeInputWithString()
    {
        $input = '<script>alert("xss")</script>Hello World';
        $expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Hello World';
        $this->assertEquals($expected, sanitizeInput($input));
    }

    public function testSanitizeInputWithArray()
    {
        $input = [
            'name' => '<script>alert("xss")</script>Ahmed',
            'email' => 'test@example.com',
            'nested' => [
                'value' => '<b>Bold</b> text'
            ]
        ];

        $result = sanitizeInput($input);
        $this->assertEquals('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Ahmed', $result['name']);
        $this->assertEquals('test@example.com', $result['email']);
        $this->assertEquals('&lt;b&gt;Bold&lt;/b&gt; text', $result['nested']['value']);
    }

    public function testValidateWilayaWithValidProvinces()
    {
        $validWilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Tlemcen'];

        foreach ($validWilayas as $wilaya) {
            $this->assertTrue(validateWilaya($wilaya), "Wilaya '{$wilaya}' should be valid");
        }
    }

    public function testValidateWilayaWithInvalidProvinces()
    {
        $invalidWilayas = ['Paris', 'London', 'InvalidWilaya', ''];

        foreach ($invalidWilayas as $wilaya) {
            $this->assertFalse(validateWilaya($wilaya), "Wilaya '{$wilaya}' should be invalid");
        }
    }

    public function testValidateSearchQueryWithValidQueries()
    {
        $validQueries = [
            'plumber',
            'خدمات التنظيف',
            'service de nettoyage',
            'electrician repair',
            'تصليح الكهرباء'
        ];

        foreach ($validQueries as $query) {
            $result = validateSearchQuery($query);
            $this->assertNotFalse($result, "Query '{$query}' should be valid");
        }
    }

    public function testValidateSearchQueryWithInvalidQueries()
    {
        $invalidQueries = [
            'a',                    // Too short
            str_repeat('a', 101),   // Too long
            '',                     // Empty
            ' '                     // Only spaces
        ];

        foreach ($invalidQueries as $query) {
            $this->assertFalse(validateSearchQuery($query), "Query '{$query}' should be invalid");
        }
    }

    public function testGenerateUniqueFilename()
    {
        $originalName = 'test-file.jpg';
        $filename1 = generateUniqueFilename($originalName);
        $filename2 = generateUniqueFilename($originalName);

        // Should be different
        $this->assertNotEquals($filename1, $filename2);
        
        // Should end with .jpg
        $this->assertStringEndsWith('.jpg', $filename1);
        $this->assertStringEndsWith('.jpg', $filename2);
        
        // Should contain timestamp and unique id
        $this->assertMatchesRegularExpression('/^[a-f0-9]+_\d+\.jpg$/', $filename1);
    }
}