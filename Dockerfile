# Use official PHP Apache image
FROM php:8.2-apache

# Install system dependencies & PHP extensions
RUN apt-get update && apt-get install -y \
    libzip-dev libonig-dev libpng-dev libjpeg-dev \
    && docker-php-ext-install -j$(nproc) pdo_mysql mysqli mbstring gd

# Enable Apache rewrite module
RUN a2enmod rewrite

# Remove the default site config (optional safety)
RUN rm /etc/apache2/sites-enabled/000-default.conf

# Copy your custom Apache configuration
COPY mahara.conf /etc/apache2/sites-available/mahara.conf

# Enable your site
RUN a2ensite mahara.conf

# Copy frontend into web root
COPY frontend/ /var/www/html/

# Copy backend and admin as subdirs
COPY backend/ /var/www/html/backend/
COPY admin/ /var/www/html/admin/

# Copy .htaccess to support SPA routing
COPY .htaccess /var/www/html/.htaccess

# Set correct permissions (prevent 403 Forbidden)
RUN chown -R www-data:www-data /var/www/html && \
    find /var/www/html -type d -exec chmod 755 {} \; && \
    find /var/www/html -type f -exec chmod 644 {} \;

# Set working directory
WORKDIR /var/www/html

# Expose port for Railway
EXPOSE 80