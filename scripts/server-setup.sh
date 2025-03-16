#!/bin/bash
set -e

echo "Starting one-time server setup..."

# Ensure Bun is in PATH
export PATH=$PATH:$HOME/.bun/bin

# Install Bun if not already installed
if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
    export PATH=$PATH:$HOME/.bun/bin
fi

# Install Node.js and npm if needed (for PM2)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Install PM2 log rotation
echo "Installing PM2 log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress false

# Create application directory structure
echo "Creating application directory structure..."
mkdir -p /home/workspace/letletme-api/logs
chmod 755 /home/workspace/letletme-api/logs

# Generate PM2 startup command
echo "PM2 startup command (run with sudo):"
pm2 startup

echo "One-time server setup completed!"
echo ""
echo "IMPORTANT: To complete PM2 startup setup, run the sudo command shown above."
echo "After deployment, run 'pm2 save' to ensure your processes start on boot." 