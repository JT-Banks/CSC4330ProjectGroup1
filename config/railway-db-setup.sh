#!/bin/bash
# Railway Database Setup Script
# This script should be run manually after deployment

echo "🔄 Setting up database for Railway deployment..."

# Set Railway environment variables
export NODE_ENV=production

# Run database setup
node setup-database.js

echo "✅ Database setup complete!"
