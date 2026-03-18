#!/bin/bash
# Build script for Railpack / Railway deployment

set -e

echo "Building backend..."
echo "Installing dependencies..."
npm install

echo "Running syntax check..."
node --check src/server.js

echo "Build complete."
