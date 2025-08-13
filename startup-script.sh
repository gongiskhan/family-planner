#!/bin/bash
# Update and install dependencies
apt-get update
apt-get install -y nginx curl

# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale
tailscale up --authkey=tskey-auth-kPSBpKf3hn11CNTRL-XokQyEUYBt7A4CDt13Vdy7bvQg35AJVYQ --hostname family-task-manager-vm

# Configure nginx
cat > /etc/nginx/sites-available/default << EOL
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm;

    server_name _;

    location / {
        try_files \$uri /index.html;
    }
}
EOL

# Restart nginx
systemctl restart nginx
