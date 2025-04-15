#!/bin/bash

# Script to start Netlify dev server with the correct configuration

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null
then
    echo "Netlify CLI is not installed. Installing..."
    npm install -g netlify-cli
fi

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "Warning: .env.development file not found. Environment variables may not be loaded correctly."
else
    echo "Found .env.development file. Loading environment variables..."
    # Export environment variables from .env.development
    export $(grep -v '^#' .env.development | xargs)
fi

# Start Netlify dev server
echo "Starting Netlify dev server..."
netlify dev