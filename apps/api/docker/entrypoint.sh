#!/bin/sh
set -e

# Writable dirs for Laravel cache, sessions, logs, and compiled bootstrap files.
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# When APP_KEY is present, refresh package manifest (safe on every start).
if [ -n "${APP_KEY}" ]; then
    su www-data -s /bin/sh -c "cd /var/www/html && php artisan package:discover --ansi" || true
fi

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
