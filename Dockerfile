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

# Copy your entire project to the Apache document root
COPY . /var/www/html/

# Set correct permissions for Apache to read files
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Remove default Apache site configuration to prevent conflicts
RUN rm /etc/apache2/sites-enabled/000-default.conf

# Copy and enable your custom Apache configuration file
COPY 000-default.conf /etc/apache2/sites-available/mahara.conf
RUN a2ensite mahara.conf

# Set the working directory
WORKDIR /var/www/html

# Expose port 80 (Apache default)
EXPOSE 80
