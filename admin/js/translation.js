// Simple Translation System for Admin Panel
class Translation {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                'message.error.network': 'Network error occurred',
                'message.error.unauthorized': 'Unauthorized access',
                'message.error.forbidden': 'Access forbidden',
                'message.error.not_found': 'Resource not found',
                'message.error.server': 'Server error occurred',
                'message.error.file_too_large': 'File size too large',
                'message.error.invalid_file_type': 'Invalid file type'
            },
            ar: {
                'message.error.network': 'حدث خطأ في الشبكة',
                'message.error.unauthorized': 'وصول غير مصرح به',
                'message.error.forbidden': 'الوصول محظور',
                'message.error.not_found': 'المورد غير موجود',
                'message.error.server': 'حدث خطأ في الخادم',
                'message.error.file_too_large': 'حجم الملف كبير جداً',
                'message.error.invalid_file_type': 'نوع الملف غير صالح'
            },
            fr: {
                'message.error.network': 'Erreur réseau',
                'message.error.unauthorized': 'Accès non autorisé',
                'message.error.forbidden': 'Accès interdit',
                'message.error.not_found': 'Ressource non trouvée',
                'message.error.server': 'Erreur serveur',
                'message.error.file_too_large': 'Taille de fichier trop grande',
                'message.error.invalid_file_type': 'Type de fichier invalide'
            }
        };
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
        }
    }

    translate(key, params = {}) {
        const translations = this.translations[this.currentLanguage] || this.translations.en;
        let translation = translations[key] || key;

        // Replace parameters in translation
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });

        return translation;
    }
}

// Create global translation instance
const T = new Translation();

// Global translation function
function t(key, params = {}) {
    return T.translate(key, params);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Translation, T, t };
}