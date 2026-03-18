#!/bin/bash
# Start script for Railpack / Railway deployment

set -e

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run database migrations or seed if needed (optional)
# node src/scripts/seedUsers.js

# Start the backend server
echo "Starting Express server..."
node src/server.js
