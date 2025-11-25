#!/bin/bash

# ICARUS Edge Functions Deploy Script
# Usage: ./scripts/deploy-edge-functions.sh <SUPABASE_ACCESS_TOKEN>

set -e

PROJECT_REF="gvbkviozlhxorjoavmky"
FUNCTIONS_DIR="supabase/functions"
ACCESS_TOKEN="${1:-$SUPABASE_ACCESS_TOKEN}"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN is required"
  echo "Usage: ./scripts/deploy-edge-functions.sh <ACCESS_TOKEN>"
  echo ""
  echo "Get your access token from: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

echo "Deploying ICARUS Edge Functions to project: $PROJECT_REF"
echo ""

# Function to deploy a single edge function
deploy_function() {
  local func_name=$1
  local func_path="$FUNCTIONS_DIR/$func_name/index.ts"

  if [ ! -f "$func_path" ]; then
    echo "Error: Function file not found: $func_path"
    return 1
  fi

  echo "Deploying: $func_name..."

  # Read the function code
  local code=$(cat "$func_path")

  # Deploy via Supabase CLI (if available)
  if command -v supabase &> /dev/null; then
    supabase functions deploy "$func_name" --project-ref "$PROJECT_REF"
  else
    echo "Supabase CLI not found. Please install it:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or deploy manually via Dashboard:"
    echo "  https://supabase.com/dashboard/project/$PROJECT_REF/functions"
    return 1
  fi

  echo "Done: $func_name"
  echo ""
}

# Deploy all functions
deploy_function "chat"
deploy_function "agent-compliance"
deploy_function "gpt-researcher"

echo "All functions deployed successfully!"
