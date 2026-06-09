#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-$HOME/green-web/dashboard}"
WEB_DIR="${WEB_DIR:-/var/www/carbongo-admin}"

if [ ! -d "$APP_DIR" ] && [ -d "$HOME/green-web/administrator" ]; then
  APP_DIR="$HOME/green-web/administrator"
fi

cd "$APP_DIR"

echo "Reset local changes..."
git fetch origin main
git reset --hard origin/main
git clean -fd

echo "Install dependencies..."
npm install

echo "Build dashboard..."
rm -rf dist
npm run build

echo "Copy build to Nginx admin folder..."
sudo mkdir -p "$WEB_DIR"
sudo rm -rf "$WEB_DIR"/*
sudo cp -r dist/* "$WEB_DIR"/

echo "Set permission..."
sudo chown -R www-data:www-data "$WEB_DIR"

echo "Reload Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "Deploy dashboard selesai."
echo "Open: https://admin.carbongo.site/admin/login?v=$(date +%s)"