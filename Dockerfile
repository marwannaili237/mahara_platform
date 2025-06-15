# Use an official PHP image with Apache
FROM php:8.2-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libonig-dev \
    libpng-dev \
    libjpeg-dev \
    && docker-php-ext-install -j$(nproc) pdo_mysql mysqli mbstring gd

# Enable Apache rewrite module
RUN a2enmod rewrite

# Remove default Apache site configuration to prevent conflicts
RUN rm -f /etc/apache2/sites-enabled/000-default.conf

# Copy the CONTENTS of your frontend/ directory to the Apache DocumentRoot
COPY frontend/ /var/www/html/

# Copy your backend/ directory as a subdirectory
COPY backend/ /var/www/html/backend/

# Copy your database/ directory as a subdirectory (optional, for reference)
COPY database/ /var/www/html/database/

# Copy your custom Apache configuration file
COPY mahara.conf /etc/apache2/sites-available/mahara.conf

# Enable the custom configuration
RUN a2ensite mahara.conf

# Set correct permissions for Apache to read files
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Set the working directory
WORKDIR /var/www/html

# Expose port 80 (Apache default)
EXPOSE 80
