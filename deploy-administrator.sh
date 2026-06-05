cd ~/green-web/administrator

echo "Pull latest dashboard..."
git pull origin main

echo "Install dependencies..."
npm install

echo "Build dashboard..."
rm -rf dist
npm run build

echo "Copy build to Nginx admin folder..."
sudo rm -rf /var/www/carbongo-admin/*
sudo mkdir -p /var/www/carbongo-admin
sudo cp -r dist/* /var/www/carbongo-admin/

echo "Set permission..."
sudo chown -R www-data:www-data /var/www/carbongo-admin

echo "Reload Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "Deploy dashboard selesai."
echo "Open: https://admin.carbongo.site/admin/login?v=$(date +%s)"