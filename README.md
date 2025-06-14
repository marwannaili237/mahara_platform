
# Mahara: Local Skill & Service Marketplace

## Project Overview
Mahara is a multilingual (Arabic, French, English) online platform designed to connect skilled individuals and service providers with local demand across Algeria. It aims to formalize the informal service economy, provide transparent pricing, and build trust through a robust rating and review system. The platform will consist of a responsive website, an Android APK, and a secure admin panel.

## Technologies Used

*   **Backend:** PHP
*   **Frontend (Website):** HTML, CSS, JavaScript
*   **Database:** [To be determined, likely MySQL/MariaDB]
*   **Frontend (Android APK):** [To be determined, likely a hybrid framework or native Android development using Java/Kotlin, integrating with PHP backend]

## Multilingual Support
Mahara is built with comprehensive multilingual support for Arabic, French, and English. This includes:
*   **Content Translation:** All static text, labels, and messages will be translatable.
*   **Dynamic Content:** User-generated content will be displayed in the language it was created, with options for translation where feasible.
*   **Right-to-Left (RTL) Support:** The interface will correctly render for Arabic (RTL) text direction.

## UI/UX Principles
Our commitment is to deliver a beautiful, professional, and easy-to-use interface across all platforms. Key UI/UX principles include:
*   **Clean and Intuitive Layouts:** Ensuring effortless navigation and information discovery.
*   **Modern Aesthetics:** Utilizing a contemporary design language with a professional color palette, clear typography, and engaging visual elements.
*   **Responsiveness:** The website will adapt seamlessly to various screen sizes (desktops, tablets, mobile phones) to provide an optimal viewing and interaction experience.
*   **Accessibility:** Designing with accessibility in mind to ensure the platform is usable by a wide range of users.
*   **Multilingual Adaptation:** The interface will seamlessly adapt to different languages, including proper handling of RTL for Arabic.

## Setup Guide
This guide provides instructions on how to set up the Mahara project locally for development and testing. Please ensure you have the necessary prerequisites installed before proceeding.

### Prerequisites
*   **Web Server:** Apache or Nginx
*   **PHP:** Version 7.4 or higher (with necessary extensions like `mysqli`, `json`, `mbstring`, `gd`)
*   **Database Server:** MySQL or MariaDB
*   **Composer:** PHP dependency manager
*   **Node.js & npm (for frontend build tools, if any):** [To be determined based on specific JS libraries/frameworks]

### 1. Database Setup

1.  **Create Database:** Create a new database for Mahara on your MySQL/MariaDB server. You can do this via phpMyAdmin, MySQL Workbench, or the command line:
    ```sql
    CREATE DATABASE mahara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
2.  **Create Database User (Recommended):** Create a dedicated user for the `mahara_db` with appropriate permissions:
    ```sql
    CREATE USER 'mahara_user'@'localhost' IDENTIFIED BY 'your_password';
    GRANT ALL PRIVILEGES ON mahara_db.* TO 'mahara_user'@'localhost';
    FLUSH PRIVILEGES;
    ```
3.  **Import Schema:** The database schema will be provided in `database/schema.sql`. Import this file into your newly created database:
    ```bash
    mysql -u mahara_user -p mahara_db < database/schema.sql
    ```
    (You will be prompted for the `mahara_user` password)

### 2. Backend Setup (PHP)

1.  **Clone the Repository:** Clone the Mahara backend repository to your local development environment:
    ```bash
    git clone [repository_url_for_backend] mahara-backend
    cd mahara-backend
    ```
2.  **Install Composer Dependencies:** Install all required PHP dependencies:
    ```bash
    composer install
    ```
3.  **Configure Environment Variables:** Create a `.env` file in the `mahara-backend` root directory based on `.env.example` (if provided) and configure your database connection details:
    ```
    DB_HOST=localhost
    DB_NAME=mahara_db
    DB_USER=mahara_user
    DB_PASS=your_password
    APP_ENV=development
    APP_DEBUG=true
    # Add other necessary configurations like API keys, mail settings, etc.
    ```
4.  **Web Server Configuration:** Configure your Apache or Nginx web server to point its document root to the `public` directory within `mahara-backend` (or the appropriate entry point for your PHP framework).
    *   **Apache Example (Virtual Host):**
        ```apache
        <VirtualHost *:80>
            ServerName mahara.local
            DocumentRoot /path/to/mahara-backend/public

            <Directory /path/to/mahara-backend/public>
                AllowOverride All
                Require all granted
            </Directory>

            ErrorLog ${APACHE_LOG_DIR}/mahara_error.log
            CustomLog ${APACHE_LOG_DIR}/mahara_access.log combined
        </VirtualHost>
        ```
    *   **Nginx Example (Server Block):**
        ```nginx
        server {
            listen 80;
            server_name mahara.local;
            root /path/to/mahara-backend/public;

            add_header X-Frame-Options 


SAMEORIGIN;
            add_header X-Content-Type-Options nosniff;

            index index.php index.html index.htm;

            location / {
                try_files $uri $uri/ /index.php?$query_string;
            }

            location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/var/run/php/php7.4-fpm.sock; # Adjust PHP version as needed
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
            }

            location ~ /\.ht {
                deny all;
            }
        }
        ```
    *   **Enable the site and restart web server:**
        ```bash
        # For Apache
        sudo a2ensite mahara.local.conf # Assuming you saved the config as mahara.local.conf
        sudo systemctl reload apache2

        # For Nginx
        sudo ln -s /etc/nginx/sites-available/mahara.local /etc/nginx/sites-enabled/
        sudo systemctl reload nginx
        ```
5.  **Test Backend:** Open your browser and navigate to `http://mahara.local` (or whatever `ServerName` you configured). You should see a basic PHP page or an API endpoint response.

### 3. Frontend Website Setup (HTML, CSS, JavaScript)

1.  **Clone the Repository:** Clone the Mahara frontend repository to your local development environment:
    ```bash
    git clone [repository_url_for_frontend] mahara-frontend
    cd mahara-frontend
    ```
2.  **Configure API Endpoint:** The frontend will need to know where your backend API is located. Open the main JavaScript configuration file (e.g., `js/config.js` or similar) and update the API base URL:
    ```javascript
    // js/config.js (Example)
    const API_BASE_URL = 'http://mahara.local/api'; // Or your deployed backend URL
    ```
3.  **Open in Browser:** You can typically open the `index.html` file directly in your browser for local development, or serve it via a simple local web server (e.g., Python's `http.server` or Node.js `serve` package) to avoid CORS issues during development.
    ```bash
    # Using Python's http.server
    python3 -m http.server 8000
    # Then open http://localhost:8000 in your browser
    ```
4.  **Multilingual Implementation Notes:**
    *   **Language Files:** Translations will be stored in JSON or JavaScript objects (e.g., `lang/en.json`, `lang/fr.json`, `lang/ar.json`).
    *   **JavaScript for Translation:** A JavaScript function will be used to load the appropriate language file and replace text content based on user selection or browser language settings.
    *   **RTL CSS:** A separate CSS file or conditional CSS rules will be applied for Arabic to handle Right-to-Left text direction and layout adjustments.

### 4. Admin Panel Setup

*(Note: The Admin Panel will likely be part of the backend repository or a separate, dedicated frontend application. This guide assumes it's integrated with the PHP backend for simplicity, or served from a sub-directory.)*

1.  **Access:** The admin panel will be accessible via a specific URL, e.g., `http://mahara.local/admin`.
2.  **Authentication:** You will need to log in with your administrator credentials. These will be set up during the initial database seeding or can be created manually in the `users` table with an `is_admin` flag.
3.  **Security:** Ensure your web server configuration (as described in Backend Setup) properly protects the admin routes and requires authentication.

### 5. Android APK Development (Feasibility & Implementation Notes)

Developing a native Android APK directly from PHP is not standard practice. Typically, an Android app (written in Java/Kotlin or a hybrid framework like React Native/Flutter) would consume the PHP backend APIs. Given the constraint of using PHP, HTML, CSS, and JavaScript, the most feasible approach for an 


Android APK would be a **WebView-based application**.

1.  **WebView Approach:**
    *   The Android APK would primarily consist of a WebView component that loads the Mahara website (the HTML, CSS, JavaScript frontend). This means the website needs to be highly optimized for mobile and responsive.
    *   **Advantages:** Rapid development, single codebase for web and mobile (mostly), easy updates (just update the website).
    *   **Disadvantages:** May not feel fully 


native


native or provide access to all device-specific features (e.g., advanced camera, NFC) without additional native code.

2.  **Building the WebView APK:**
    *   You would use Android Studio (Java/Kotlin) to create a basic Android project.
    *   The main activity would contain a `WebView` component.
    *   You would configure the `WebView` to load the URL of your deployed Mahara website.
    *   Permissions for internet access would be required in `AndroidManifest.xml`.
    *   For features like push notifications or accessing device camera/location, you might need to implement a JavaScript interface in your Android code to bridge between the WebView and native Android functionalities.

### 6. Comprehensive Testing & Bug Fixing

*   **Unit Testing:** Implement unit tests for PHP backend functions and critical JavaScript components.
*   **Integration Testing:** Test the interaction between the frontend, backend APIs, and database.
*   **Multilingual Testing:** Thoroughly test all language versions, including RTL support for Arabic, to ensure correct display and functionality.
*   **Cross-Browser/Device Testing:** Test the website on various browsers (Chrome, Firefox, Safari, Edge) and devices (desktop, tablet, mobile) to ensure responsiveness and compatibility.
*   **APK Testing:** Test the Android APK on different Android versions and devices.
*   **Security Testing:** Conduct security audits, especially for the admin panel and user authentication flows.

### 7. Deployment & Delivery

1.  **Backend Deployment:**
    *   Deploy your PHP backend code to a production web server (e.g., Apache/Nginx with PHP-FPM) with a public domain name.
    *   Ensure your database is hosted securely and accessible by the backend.
    *   Configure SSL/TLS (HTTPS) for secure communication.
2.  **Frontend Website Deployment:**
    *   Deploy your HTML, CSS, and JavaScript files to your web server. This can be on the same server as the backend or a separate static file hosting service.
3.  **Android APK Publication:**
    *   Generate a signed APK release build from Android Studio.
    *   Publish the APK to the Google Play Store (requires a developer account) or distribute it directly to users.
4.  **Admin Panel Access:**
    *   The admin panel will be accessible via a specific URL (e.g., `https://yourdomain.com/admin`).
    *   Ensure strong, unique credentials are used for your admin account.

## Important Notes

*   **Security:** Always prioritize security. Use prepared statements for database queries, sanitize all user inputs, hash passwords, and implement proper authentication and authorization mechanisms.
*   **Error Handling & Logging:** Implement robust error handling and logging on both the frontend and backend to facilitate debugging and maintenance.
*   **Performance Optimization:** Optimize images, minify CSS/JavaScript, and implement caching strategies to ensure a fast and smooth user experience.
*   **Scalability:** Design the database and backend APIs with scalability in mind to handle future growth in users and services.

This `README.md` will be continuously updated as the project progresses and specific implementation details are finalized.

