# syntax=docker/dockerfile:1
#
# Production image: Vite assets, Composer vendor (private Satis via BuildKit secret), nginx + php-fpm.
#
# Local build (never commit credentials; use a secret file or env):
#   docker buildx build --secret id=composer_auth,src=$HOME/.config/composer/auth.json -t warehouse-api:local api
# Or:  COMPOSER_AUTH='{"http-basic":{"satis.dedoc.co":{...}}}' docker buildx build --secret id=composer_auth,env=COMPOSER_AUTH -t warehouse-api:local api

# -----------------------------------------------------------------------------
# Front-end build (Vite). No package-lock.json in repo: npm install resolves deps.
# -----------------------------------------------------------------------------
FROM node:22-bookworm-slim AS assets

WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts

COPY vite.config.js ./
COPY public ./public
COPY resources ./resources

RUN npm run build

# -----------------------------------------------------------------------------
# Composer dependencies (production, no dev). Requires secret `composer_auth`
# with the same JSON as Composer's COMPOSER_AUTH / auth.json for satis.dedoc.co.
# -----------------------------------------------------------------------------
FROM php:8.4-cli-bookworm AS vendor

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        zip \
        libzip-dev \
    && docker-php-ext-configure zip \
    && docker-php-ext-install -j"$(nproc)" zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY . .

# Install without Composer scripts: artisan is not usable until vendor exists; discovery runs at container start.
RUN --mount=type=secret,id=composer_auth \
    COMPOSER_AUTH="$(cat /run/secrets/composer_auth)" \
    composer install \
        --no-dev \
        --no-interaction \
        --prefer-dist \
        --optimize-autoloader \
        --no-scripts

# -----------------------------------------------------------------------------
# Runtime: PHP-FPM + nginx under supervisord (single container for small deploys).
# -----------------------------------------------------------------------------
FROM php:8.4-fpm-bookworm AS app

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        libicu-dev \
        libpng-dev \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-configure zip \
    && docker-php-ext-install -j"$(nproc)" \
        intl \
        opcache \
        pcntl \
        pdo_mysql \
        pdo_sqlite \
        mbstring \
        exif \
        bcmath \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

RUN rm -f /etc/nginx/sites-enabled/default

COPY docker/nginx/default.conf /etc/nginx/sites-enabled/laravel.conf
COPY docker/supervisor/supervisord.conf /etc/supervisor/supervisord.conf

# Application source (vendor and built assets come from earlier stages so they are never overwritten).
COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
