#!/bin/bash
set -e

echo "Starting deployment process..."

# Ensure Bun is in PATH
export PATH=$PATH:$HOME/.bun/bin

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

# Start or reload the application
echo "Deploying application with PM2..."

# Check if the application is already running in PM2
PM2_PROCESS_EXISTS=false
if pm2 list | grep -q "letletme-api"; then
    PM2_PROCESS_EXISTS=true
fi

if [ "$PM2_PROCESS_EXISTS" = true ]; then
    # Stop the existing process
    echo "Stopping existing PM2 process..."
    pm2 stop letletme-api
    pm2 delete letletme-api
fi

# Start a new process using the recommended Bun approach
echo "Starting new PM2 process with Bun..."
pm2 start bun --name letletme-api -- run dist/index.js --log ./logs/app.log --error ./logs/error.log --time

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

echo "Deployment completed successfully!" 