#!/bin/bash

# ===========================================
# HCOMS Azure Container App Deployment Script
# ===========================================

set -e

# Configuration - Update these values
RESOURCE_GROUP="${RESOURCE_GROUP:-hcoms-rg}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
CONTAINER_APPS_ENV_ID="${CONTAINER_APPS_ENV_ID:-}"
DOCKER_IMAGE="${DOCKER_IMAGE:-}"

# Database configuration
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-hcoms_db}"
DB_USER="${DB_USER:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}===========================================
HCOMS Azure Container App Deployment
===========================================${NC}"

# Check required environment variables
check_required_vars() {
    local missing_vars=()

    [ -z "$RESOURCE_GROUP" ] && missing_vars+=("RESOURCE_GROUP")
    [ -z "$CONTAINER_APPS_ENV_ID" ] && missing_vars+=("CONTAINER_APPS_ENV_ID")
    [ -z "$DOCKER_IMAGE" ] && missing_vars+=("DOCKER_IMAGE")
    [ -z "$DB_HOST" ] && missing_vars+=("DB_HOST")
    [ -z "$DB_USER" ] && missing_vars+=("DB_USER")
    [ -z "$DB_PASSWORD" ] && missing_vars+=("DB_PASSWORD")
    [ -z "$JWT_SECRET" ] && missing_vars+=("JWT_SECRET")

    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required environment variables:${NC}"
        printf '  %s\n' "${missing_vars[@]}"
        echo ""
        echo "Required variables:"
        echo "  RESOURCE_GROUP          - Azure resource group name"
        echo "  CONTAINER_APPS_ENV_ID   - Full resource ID of Container Apps Environment"
        echo "  DOCKER_IMAGE            - Docker Hub image (e.g., username/hcoms:latest)"
        echo "  DB_HOST                 - PostgreSQL host"
        echo "  DB_USER                 - PostgreSQL user"
        echo "  DB_PASSWORD             - PostgreSQL password"
        echo "  JWT_SECRET              - JWT secret (min 32 chars)"
        echo ""
        echo "Optional variables:"
        echo "  DOCKER_USERNAME         - Docker Hub username (for private images)"
        echo "  DOCKER_PASSWORD         - Docker Hub password (for private images)"
        echo "  DB_PORT                 - PostgreSQL port (default: 5432)"
        echo "  DB_NAME                 - Database name (default: hcoms_db)"
        echo "  ALLOWED_EMAIL_DOMAIN    - Email domain filter (default: who.int)"
        echo "  FRONTEND_URL            - Frontend URL for CORS"
        exit 1
    fi
}

# Build and push Docker image
build_and_push() {
    echo -e "\n${YELLOW}Building and pushing Docker image...${NC}"

    if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    fi

    docker build -t "$DOCKER_IMAGE" ..
    docker push "$DOCKER_IMAGE"

    echo -e "${GREEN}✓ Docker image pushed to Docker Hub${NC}"
}

# Deploy to Azure
deploy() {
    echo -e "\n${YELLOW}Deploying Container App...${NC}"

    local params=(
        "environment=$ENVIRONMENT"
        "containerAppsEnvironmentId=$CONTAINER_APPS_ENV_ID"
        "dockerImage=$DOCKER_IMAGE"
        "dbHost=$DB_HOST"
        "dbPort=$DB_PORT"
        "dbName=$DB_NAME"
        "dbUser=$DB_USER"
        "dbPassword=$DB_PASSWORD"
        "jwtSecret=$JWT_SECRET"
    )

    [ -n "$DOCKER_USERNAME" ] && params+=("dockerUsername=$DOCKER_USERNAME")
    [ -n "$DOCKER_PASSWORD" ] && params+=("dockerPassword=$DOCKER_PASSWORD")
    [ -n "$ALLOWED_EMAIL_DOMAIN" ] && params+=("allowedEmailDomain=$ALLOWED_EMAIL_DOMAIN")
    [ -n "$FRONTEND_URL" ] && params+=("frontendUrl=$FRONTEND_URL")

    # Build parameters string
    local param_args=""
    for p in "${params[@]}"; do
        param_args="$param_args --parameters $p"
    done

    DEPLOYMENT_OUTPUT=$(az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file main.bicep \
        $param_args \
        --query 'properties.outputs' \
        --output json)

    APP_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.containerAppUrl.value')

    echo -e "${GREEN}✓ Container App deployed${NC}"
}

# Main
main() {
    check_required_vars

    echo "Configuration:"
    echo "  Resource Group: $RESOURCE_GROUP"
    echo "  Environment: $ENVIRONMENT"
    echo "  Docker Image: $DOCKER_IMAGE"
    echo "  Database Host: $DB_HOST"
    echo ""

    read -p "Build and push Docker image? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_and_push
    fi

    read -p "Deploy to Azure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy
    fi

    echo -e "\n${GREEN}===========================================
Deployment Complete!
===========================================${NC}"
    echo ""
    echo "Application URL: $APP_URL"
    echo ""
    echo "View logs:"
    echo "  az containerapp logs show -n hcoms-$ENVIRONMENT -g $RESOURCE_GROUP --follow"
}

cd "$(dirname "$0")"
main "$@"
