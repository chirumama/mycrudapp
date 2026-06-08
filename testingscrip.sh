#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# --- 1. Variables (Modify if needed) ---
DB_NAME="mycruddb"
DB_USER="chirag"
DB_PASS="SecurePassword123"
REPO_URL="https://github.com/chirumama/mycrudapp"
APP_DIR="/home/$USER/mycrudapp"


echo "=== Starting deployment automation ==="

# --- 2. Clone the Repository ---
echo "Cloning repository..."
if [ -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR already exists. Skipping clone."
else
    git clone "$REPO_URL" "$APP_DIR"
fi

# --- 3. Install .NET 8.0 Runtime ---
echo "Installing .NET 8.0 Runtime..."
sudo apt-get update


# --- 4. Install and Configure PostgreSQL ---
echo "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

echo "Configuring PostgreSQL user and privileges..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || true
sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;" || true

# --- 5. Update appsettings.json ---
echo "Updating appsettings.json with database credentials..."
APP_SETTINGS="$APP_DIR/backenddot/appsettings.json" # Adjust path to backend if needed

if [ -f "$APP_SETTINGS" ]; then
    # Simple sed replacement for common ConnectionString patterns
    # Adjust the key names below if your appsettings structure differs
    sed -i "s/\"Username\": \".*\"/\"Username\": \"$DB_USER\"/g" "$APP_SETTINGS"
    sed -i "s/\"Password\": \".*\"/\"Password\": \"$DB_PASS\"/g" "$APP_SETTINGS"
    echo "appsettings.json updated successfully."
else
    echo "Warning: appsettings.json not found at $APP_SETTINGS. Please update manually."
fi

# --- 6. Install and Configure Nginx ---
echo "Installing Nginx..."
sudo apt-get install -y nginx

echo "Setting permissions for home and app directories..."
sudo chmod 755 "/home/$USER"
sudo chmod -R 755 "$APP_DIR"

echo "Configuring Nginx reverse proxy..."
NGINX_CONF="/etc/nginx/sites-available/default"

sudo bash -c "cat << 'EOF' > $NGINX_CONF
server {
    listen 80;
    server_name localhost;

    # 1. Path to your HTML frontend folder
    root /home/$USER/mycrudapp/frontend;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # 2. Reverse proxy to your .NET backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"

echo "Restarting Nginx..."
sudo systemctl restart nginx

# --- 7. Start the .NET Backend ---
echo "Starting .NET Application..."
cd "$APP_DIR/backend" || cd "$APP_DIR" # Navigates to app folder

# Note: Running in the background (&) so the script can finish and show the IP
nohup dotnet CRUDapp.dll --urls=http://localhost:5000 > app.log 2>&1 &

# --- 8. Display Server IP Address ---
echo "=== Deployment complete! ==="
echo "Access your app via your browser at one of these IP addresses:"
hostname -I
