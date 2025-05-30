#!/bin/bash

# PACS System Deployment Script
# This script automates the deployment process.

set -e

LOG_FILE="./logs/deploy.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

ENV_FILE=".env"

echo "Starting deployment: ${TIMESTAMP}" | tee -a $LOG_FILE

# 0. Ensure project root
cd "$PROJECT_ROOT" || { echo "Failed to change to project root" | tee -a $LOG_FILE; exit 1; }

# 1. Check for .env file
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file ($ENV_FILE) not found. Please create it from .env.example or provide one." | tee -a $LOG_FILE
    exit 1
fi
echo "Using environment file: $ENV_FILE" | tee -a $LOG_FILE

# 2. Run Rule Enforcement Script (as per PROJECT_RULES.md)
if [ -f "./scripts/enforce_rules.sh" ]; then
    echo "Running project rule enforcement script..." | tee -a $LOG_FILE
    if ! ./scripts/enforce_rules.sh; then
        echo "Error: Project rule enforcement failed. Please check logs and fix issues." | tee -a $LOG_FILE
        exit 1
    fi
    echo "Project rule enforcement script passed." | tee -a $LOG_FILE
else
    echo "Warning: Rule enforcement script (./scripts/enforce_rules.sh) not found. Skipping." | tee -a $LOG_FILE
fi

# 3. Pull latest images (optional, good for production)
# echo "Pulling latest Docker images..." | tee -a $LOG_FILE
# docker-compose pull

# 4. Build services (especially Flask app or if OHIF needs custom build)
# Use --no-cache for a clean build if needed
echo "Building Docker images (if necessary)..." | tee -a $LOG_FILE
docker-compose build --pull # --pull ensures base images are updated

# 5. Stop and remove old containers (if any)
echo "Stopping and removing existing containers (if any)..." | tee -a $LOG_FILE
docker-compose down --remove-orphans

# 6. Start services
echo "Starting all services in detached mode..." | tee -a $LOG_FILE
docker-compose up -d

# 7. Run post-deployment checks/tasks
echo "Running post-deployment checks..." | tee -a $LOG_FILE

# Check service status (wait a bit for services to initialize)
sleep 15 # Adjust as needed
docker-compose ps

# Check health of key services
# Nginx (root should redirect to OHIF)
if curl -k -s -f https://localhost/ > /dev/null; then # -k for self-signed certs
    echo "OHIF Viewer (via Nginx HTTPS) seems accessible." | tee -a $LOG_FILE
else
    echo "Error: OHIF Viewer (via Nginx HTTPS) is not accessible." | tee -a $LOG_FILE
fi

# Orthanc (via Nginx)
if curl -k -s -f https://localhost/orthanc/app/explorer.html > /dev/null; then
    echo "Orthanc (via Nginx HTTPS) seems accessible." | tee -a $LOG_FILE
else
    echo "Error: Orthanc (via Nginx HTTPS) is not accessible." | tee -a $LOG_FILE
fi

# Flask Auth Service (via Nginx)
if curl -k -s -f https://localhost/authorize/health > /dev/null; then
    echo "Flask Auth Service (via Nginx HTTPS) health check passed." | tee -a $LOG_FILE
else
    echo "Error: Flask Auth Service (via Nginx HTTPS) health check failed." | tee -a $LOG_FILE
fi

# Optional: Run Orthanc test data upload script if AUTO_LOAD_TEST_DATA is true in .env
source .env # Load .env variables into current shell
if [[ "$AUTO_LOAD_TEST_DATA" == "true" || "$AUTO_LOAD_TEST_DATA" == "True" ]]; then
    if [ -f "./scripts/upload.sh" ]; then
        echo "AUTO_LOAD_TEST_DATA is true. Running upload.sh..." | tee -a $LOG_FILE
        if ! ./scripts/upload.sh; then
            echo "Warning: upload.sh script encountered errors." | tee -a $LOG_FILE
        else
            echo "upload.sh script completed." | tee -a $LOG_FILE
        fi
    else
        echo "Warning: AUTO_LOAD_TEST_DATA is true, but upload.sh not found." | tee -a $LOG_FILE
    fi
fi

echo "Deployment process finished: ${TIMESTAMP}" | tee -a $LOG_FILE
echo "System should be accessible at https://${DOMAIN_NAME:-localhost}/"

exit 0 