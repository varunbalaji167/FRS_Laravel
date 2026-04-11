#!/bin/bash
set -e

echo "Deploying updates..."

# Put app in maintenance mode
php artisan down

# Pull latest changes
git pull origin main

# Install/update backend dependencies
composer install --optimize-autoloader --no-dev

# Clean install for frontend dependencies (Bypasses permission errors)
rm -rf node_modules
npm install
npm run build

# Run database migrations
php artisan migrate --force

# Clear and recache
php artisan optimize:clear
php artisan optimize

# RESTART THE QUEUE WORKER (CRITICAL for Redis)
# This tells the background process to finish its current task and restart with new code.
php artisan queue:restart

# Bring app out of maintenance mode
php artisan up

echo "Deployment finished successfully!"