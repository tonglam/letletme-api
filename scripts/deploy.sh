#!/bin/bash
set -e

echo "Starting deployment process..."

# Ensure Bun is in PATH
export PATH=$PATH:$HOME/.bun/bin

# Check if Bun is installed, if not install it
if ! command -v bun &> /dev/null; then
    echo "Bun not found, installing..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
    export PATH=$PATH:$HOME/.bun/bin
fi

# Navigate to application directory
cd /home/workspace/letletme-api
echo "Changed to application directory: $(pwd)"

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    echo "Creating logs directory..."
    mkdir -p logs
    chmod 755 logs
fi

# Install dependencies
echo "Installing dependencies..."
bun install

# Build the application
echo "Building application..."
bun build ./src/index.ts --target bun --outdir ./dist

# Check if PM2 is installed, if not install it
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    npm install -g pm2
fi

# Configure PM2 to use our log directory
PM2_ARGS="--name letletme-api --log ./logs/app.log --error ./logs/error.log --time"

# Start or reload the application
echo "Deploying application with PM2..."

# Check if the application is already running in PM2
PM2_PROCESS_EXISTS=false
if pm2 list | grep -q "letletme-api"; then
    PM2_PROCESS_EXISTS=true
fi

if [ "$PM2_PROCESS_EXISTS" = true ]; then
    # Application exists, reload it
    echo "Reloading existing PM2 process..."
    pm2 reload letletme-api
else
    # Application doesn't exist, start it
    echo "Starting new PM2 process with Bun..."
    pm2 start --interpreter $(which bun) dist/index.js $PM2_ARGS
fi

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

echo "Deployment completed successfully!" 