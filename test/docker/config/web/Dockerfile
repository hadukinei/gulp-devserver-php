# Apache + PHP
FROM php:8.4.8-apache
#8.3.7

# Install
RUN apt-get -y update && apt-get -y upgrade

# PHP: xdebug
RUN pecl install xdebug \
  && docker-php-ext-enable xdebug

# Clean up
RUN apt-get clean \
  && rm -rf /var/lib/apt/lists/*
