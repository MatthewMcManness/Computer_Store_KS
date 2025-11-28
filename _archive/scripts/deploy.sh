#!/bin/bash

# Computer Store KS - Deployment Script
# Version 3.0

set -e

echo "=========================================="
echo "Computer Store KS - Docker Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure your environment variables"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Create webnet network if it doesn't exist
if ! docker network inspect webnet > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating webnet network...${NC}"
    docker network create webnet
fi

# Build and deploy
echo -e "${YELLOW}Building Docker image...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for health check
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}=========================================="
    echo "Deployment successful!"
    echo "==========================================${NC}"
    echo ""
    echo "Static site: http://localhost:3000"
    echo "API health:  http://localhost:3001/api/health"
    echo ""
    echo "Container status:"
    docker-compose ps
    echo ""
    echo "View logs with: docker-compose logs -f"
else
    echo -e "${RED}Deployment failed!${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
