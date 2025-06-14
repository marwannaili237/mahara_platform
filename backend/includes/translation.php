<?php
/**
 * Translation and Multilingual Support Functions
 * Handles language detection, translation loading, and text rendering
 */

/**
 * Get user's preferred language
 */
function getUserLanguage() {
    // Check if user is authenticated and has a preferred language
    $user = getCurrentUser();
    if ($user && !empty($user['preferred_language'])) {
        return $user['preferred_language'];
    }
    
    // Check URL parameter
    if (isset($_GET['lang']) && in_array($_GET['lang'], SUPPORTED_LANGUAGES)) {
        return $_GET['lang'];
    }
    
    // Check session
    if (isset($_SESSION['language']) && in_array($_SESSION['language'], SUPPORTED_LANGUAGES)) {
        return $_SESSION['language'];
    }
    
    // Check Accept-Language header
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $acceptLanguages = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
        foreach ($acceptLanguages as $lang) {
            $lang = strtolower(substr(trim($lang), 0, 2));
            if (in_array($lang, SUPPORTED_LANGUAGES)) {
                return $lang;
            }
        }
    }
    
    return DEFAULT_LANGUAGE;
}

/**
 * Load translation file
 */
function loadTranslations($language) {
    static $translations = [];
    
    if (isset($translations[$language])) {
        return $translations[$language];
    }
    
    $translationFile = __DIR__ . '/../translations/' . $language . '.json';
    
    if (file_exists($translationFile)) {
        $content = file_get_contents($translationFile);
        $translations[$language] = json_decode($content, true);
    } else {
        $translations[$language] = [];
    }
    
    return $translations[$language];
}

/**
 * Translate text
 */
function translate($key, $language = null, $params = []) {
    if ($language === null) {
        $language = getUserLanguage();
    }
    
    $translations = loadTranslations($language);
    
    $text = isset($translations[$key]) ? $translations[$key] : $key;
    
    // Replace parameters
    foreach ($params as $param => $value) {
        $text = str_replace('{' . $param . '}', $value, $text);
    }
    
    return $text;
}

/**
 * Get multilingual field value
 */
function getMultilingualField($data, $fieldPrefix, $language = null) {
    if ($language === null) {
        $language = getUserLanguage();
    }
    
    $field = $fieldPrefix . '_' . $language;
    
    if (isset($data[$field]) && !empty($data[$field])) {
        return $data[$field];
    }
    
    // Fallback to default language
    $defaultField = $fieldPrefix . '_' . DEFAULT_LANGUAGE;
    if (isset($data[$defaultField]) && !empty($data[$defaultField])) {
        return $data[$defaultField];
    }
    
    // Fallback to any available language
    foreach (SUPPORTED_LANGUAGES as $lang) {
        $fallbackField = $fieldPrefix . '_' . $lang;
        if (isset($data[$fallbackField]) && !empty($data[$fallbackField])) {
            return $data[$fallbackField];
        }
    }
    
    return '';
}

/**
 * Format multilingual data for API response
 */
function formatMultilingualData($data, $fields) {
    $language = getUserLanguage();
    $result = $data;
    
    foreach ($fields as $field) {
        $result[$field] = getMultilingualField($data, $field, $language);
        
        // Also include all language versions for admin/editing purposes
        $result[$field . '_all'] = [];
        foreach (SUPPORTED_LANGUAGES as $lang) {
            $langField = $field . '_' . $lang;
            if (isset($data[$langField])) {
                $result[$field . '_all'][$lang] = $data[$langField];
            }
        }
    }
    
    return $result;
}

/**
 * Check if language is RTL
 */
function isRTL($language = null) {
    if ($language === null) {
        $language = getUserLanguage();
    }
    
    return in_array($language, RTL_LANGUAGES);
}

/**
 * Get language direction
 */
function getLanguageDirection($language = null) {
    return isRTL($language) ? 'rtl' : 'ltr';
}

/**
 * Format date according to language
 */
function formatDate($date, $format = null, $language = null) {
    if ($language === null) {
        $language = getUserLanguage();
    }
    
    if ($format === null) {
        switch ($language) {
            case 'ar':
                $format = 'd/m/Y';
                break;
            case 'fr':
                $format = 'd/m/Y';
                break;
            case 'en':
            default:
                $format = 'm/d/Y';
                break;
        }
    }
    
    if (is_string($date)) {
        $date = new DateTime($date);
    }
    
    return $date->format($format);
}

/**
 * Format currency according to language
 */
function formatCurrency($amount, $currency = 'DZD', $language = null) {
    if ($language === null) {
        $language = getUserLanguage();
    }
    
    $amount = number_format($amount, 2);
    
    switch ($language) {
        case 'ar':
            return $amount . ' ' . $currency;
        case 'fr':
            return $amount . ' ' . $currency;
        case 'en':
        default:
            return $currency . ' ' . $amount;
    }
}

/**
 * Get localized error messages
 */
function getLocalizedErrors($errors, $language = null) {
    if ($language === null) {
        $language = getUserLanguage();
    }
    
    $localizedErrors = [];
    
    foreach ($errors as $field => $message) {
        $translationKey = 'error.' . $field . '.' . $message;
        $localizedErrors[$field] = translate($translationKey, $language);
    }
    
    return $localizedErrors;
}

/**
 * Set user language preference
 */
function setUserLanguage($language) {
    if (in_array($language, SUPPORTED_LANGUAGES)) {
        $_SESSION['language'] = $language;
        
        // Update user preference in database if authenticated
        $user = getCurrentUser();
        if ($user) {
            dbUpdate("UPDATE users SET preferred_language = ? WHERE id = ?", [$language, $user['id']]);
        }
        
        return true;
    }
    
    return false;
}

/**
 * Get language name in its own language
 */
function getLanguageName($language) {
    $names = [
        'ar' => 'العربية',
        'fr' => 'Français',
        'en' => 'English'
    ];
    
    return isset($names[$language]) ? $names[$language] : $language;
}

/**
 * Generate language switcher data
 */
function getLanguageSwitcher() {
    $currentLanguage = getUserLanguage();
    $languages = [];
    
    foreach (SUPPORTED_LANGUAGES as $lang) {
        $languages[] = [
            'code' => $lang,
            'name' => getLanguageName($lang),
            'is_current' => $lang === $currentLanguage,
            'is_rtl' => isRTL($lang)
        ];
    }
    
    return $languages;
}
?>

