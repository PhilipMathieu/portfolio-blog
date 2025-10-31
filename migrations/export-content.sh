#!/bin/bash
# Export script for Contentful content migration
# Usage: ./export-content.sh [SPACE_ID] [CMA_TOKEN]
# If logged in via 'contentful login', CMA_TOKEN is optional

set -e

SPACE_ID=${1:-$CONTENTFUL_SPACE_ID}
CMA_TOKEN=${2:-$CONTENTFUL_MANAGEMENT_TOKEN}
EXPORT_DIR="./exports"
CONTENT_FILE="$EXPORT_DIR/content-export.json"
CONTENT_MODEL_FILE="$EXPORT_DIR/content-model.json"

if [ -z "$SPACE_ID" ]; then
    echo "Error: SPACE_ID is required"
    echo "Usage: ./export-content.sh <SPACE_ID> [CMA_TOKEN]"
    echo "Or set CONTENTFUL_SPACE_ID environment variable"
    exit 1
fi

echo "Creating exports directory..."
mkdir -p "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR/assets"

# Build export command - use token if provided, otherwise use login session
EXPORT_ARGS="--space-id \"$SPACE_ID\""
if [ -n "$CMA_TOKEN" ]; then
    EXPORT_ARGS="$EXPORT_ARGS --management-token \"$CMA_TOKEN\""
    echo "Using provided management token"
else
    echo "Using stored login credentials (from 'contentful login')"
fi

echo "Exporting content model..."
eval "contentful space export $EXPORT_ARGS --content-model-only --content-model-file \"$CONTENT_MODEL_FILE\""

echo "Exporting content entries and downloading assets..."
eval "contentful space export $EXPORT_ARGS --content-file \"$CONTENT_FILE\" --download-assets --assets-dir \"$EXPORT_DIR/assets\""

echo "Export complete!"
echo "Content model saved to: $CONTENT_MODEL_FILE"
echo "Content exported to: $CONTENT_FILE"
echo "Assets downloaded to: $EXPORT_DIR/assets"

