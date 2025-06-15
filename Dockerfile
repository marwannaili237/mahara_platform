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

# Copy the custom Apache configuration file
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Enable the custom configuration (it's usually enabled by default, but good to be explicit)
RUN a2ensite 000-default.conf

# Set the working directory
WORKDIR /var/www/html

# Expose port 80 (Apache default)
EXPOSE 80
