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
# This will put backend/, frontend/, database/, etc. directly in /var/www/html/
COPY . /var/www/html/

# Set the working directory
WORKDIR /var/www/html

# Ensure Apache serves index.php for the backend API and index.html for the frontend
# We'll use .htaccess for routing
COPY .htaccess /var/www/html/

# Expose port 80 (Apache default)
EXPOSE 80
