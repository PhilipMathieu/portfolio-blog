#!/bin/bash
# Complete migration script - guides through the entire migration process

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Contentful to Astro Migration"
echo "=========================================="
echo ""

# Check if Contentful CLI is installed
if ! command -v contentful &> /dev/null; then
    echo "Error: Contentful CLI is not installed."
    echo "Install it with: npm install -g contentful-cli"
    exit 1
fi

# Check if logged in
if ! contentful space list &> /dev/null; then
    echo "Error: Contentful CLI is not authenticated."
    echo "Run: contentful login"
    exit 1
fi

# Get space ID
echo "Available spaces:"
contentful space list

echo ""
read -p "Enter your Contentful Space ID (or press Enter to use '8k9x98hwy7u6'): " SPACE_ID
SPACE_ID=${SPACE_ID:-8k9x98hwy7u6}

# Get management token (optional if logged in)
echo ""
echo "If you've logged in with 'contentful login', you can skip the token."
echo "Otherwise, generate a token at: https://app.contentful.com/spaces/$SPACE_ID/api/keys"
echo "The token should start with 'CFPAT-'"
read -p "Enter your CMA token (or press Enter to use login session): " CMA_TOKEN

if [ -z "$CMA_TOKEN" ]; then
    CMA_TOKEN=$CONTENTFUL_MANAGEMENT_TOKEN
fi

if [ -z "$CMA_TOKEN" ]; then
    echo "Using stored login credentials..."
    echo "Note: If this fails, you may need to provide a management token"
fi

echo ""
echo "Starting migration..."
echo ""

# Step 1: Export
echo "Step 1: Exporting content from Contentful..."
export CONTENTFUL_SPACE_ID=$SPACE_ID
export CONTENTFUL_MANAGEMENT_TOKEN=$CMA_TOKEN
./export-content.sh "$SPACE_ID" "$CMA_TOKEN"

if [ ! -f "exports/content-export.json" ]; then
    echo "Error: Export failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "Step 2: Converting to Astro MDX format..."
npm run convert

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Migration complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Review the generated MDX files in: ../astro-site/src/content/blog/"
    echo "2. Check that assets were copied to: ../astro-site/public/assets/"
    echo "3. Build and test the Astro site:"
    echo "   cd ../astro-site"
    echo "   npm run build"
    echo ""
else
    echo "Error: Conversion failed. Please check the error messages above."
    exit 1
fi

