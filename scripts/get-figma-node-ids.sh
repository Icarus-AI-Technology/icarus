#!/bin/bash

# 🎨 ICARUS v5.0 - Get Figma Component Node IDs
# This script fetches component Node IDs from your Figma file

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════════"
echo "  🎨 Figma Component Node IDs Fetcher"
echo "════════════════════════════════════════════════════════════"
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check for required variables
if [ -z "$FIGMA_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ FIGMA_ACCESS_TOKEN not found${NC}"
    echo "Please set it in .env.local"
    exit 1
fi

if [ -z "$FIGMA_FILE_KEY" ]; then
    echo -e "${RED}❌ FIGMA_FILE_KEY not found${NC}"
    echo "Please set it in .env.local"
    exit 1
fi

echo -e "${GREEN}✅ Credentials found${NC}"
echo "File Key: $FIGMA_FILE_KEY"
echo ""

echo "Fetching components from Figma..."
echo ""

# Fetch file data from Figma API
RESPONSE=$(curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
    "https://api.figma.com/v1/files/$FIGMA_FILE_KEY/components")

# Check if request was successful
if echo "$RESPONSE" | grep -q "err"; then
    echo -e "${RED}❌ Error fetching data from Figma API:${NC}"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo -e "${GREEN}✅ Successfully fetched components${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📋 Available Components"
echo "════════════════════════════════════════════════════════════"
echo ""

# Parse and display components
echo "$RESPONSE" | jq -r '.meta.components[] | "Name: \(.name)\nNode ID: \(.node_id)\nDescription: \(.description // "N/A")\n---"'

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📝 How to Use These Node IDs"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. Find the component you want to connect (e.g., \"NeuButton\")"
echo "2. Copy its Node ID"
echo "3. Update the corresponding .figma.tsx file:"
echo ""
echo "   ${BLUE}src/components/ui/neu-button.figma.tsx${NC}"
echo ""
echo "   Replace:"
echo "   ${YELLOW}node-id=YOUR_NODE_ID${NC}"
echo ""
echo "   With:"
echo "   ${GREEN}node-id=<ACTUAL_NODE_ID>${NC}"
echo ""
echo "4. Repeat for all components"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Save to file for reference
OUTPUT_FILE="figma-node-ids.json"
echo "$RESPONSE" | jq '.meta.components' > "$OUTPUT_FILE"
echo -e "${GREEN}✅ Full component data saved to: $OUTPUT_FILE${NC}"
echo ""
