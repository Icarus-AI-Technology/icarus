#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-production}"
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "preview" ]]; then
  echo "Invalid environment '$ENVIRONMENT'. Use 'production' or 'preview'." >&2
  exit 1
fi

# Load local env files when present to simplify manual runs.
dotenv_file="${DOTENV_FILE:-.env.local}"
if [[ -f "$dotenv_file" ]]; then
  echo "Loading environment variables from $dotenv_file"
  # shellcheck disable=SC2046,SC2166
  set -o allexport
  source "$dotenv_file"
  set +o allexport
elif [[ -f .env ]]; then
  echo "Loading environment variables from .env"
  set -o allexport
  source .env
  set +o allexport
fi

missing_vars=()
for var in VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID; do
  if [[ -z "${!var:-}" ]]; then
    missing_vars+=("$var")
  fi
done

if (( ${#missing_vars[@]} > 0 )); then
  echo "Missing required environment variables: ${missing_vars[*]}" >&2
  echo "Set VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID before running the deploy." >&2
  exit 1
fi

config_args=(--yes --environment="$ENVIRONMENT" --token="$VERCEL_TOKEN")
build_args=(--token="$VERCEL_TOKEN" --local-config vercel.json)
deploy_args=(--prebuilt --token="$VERCEL_TOKEN")

if [[ "$ENVIRONMENT" == "production" ]]; then
  build_args+=(--prod)
  deploy_args+=(--prod)
fi

echo "Pulling Vercel settings for $ENVIRONMENT..."
npx vercel pull "${config_args[@]}"

echo "Building project with Vercel CLI..."
npx vercel build "${build_args[@]}"

echo "Deploying prebuilt output to $ENVIRONMENT..."
npx vercel deploy "${deploy_args[@]}"
