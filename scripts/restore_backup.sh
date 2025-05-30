#!/bin/bash

# PACS System Restore Script
# Restores system from backup archive

# Configuration
BACKUP_FILE="$1"
RESTORE_TEMP="/tmp/pacs_restore_$$"
DATE=$(date +%Y%m%d_%H%M%S)

# Docker container names
DB_CONTAINER="pacs_db"
ORTHANC_CONTAINER="pacs_orthanc"
FLASK_CONTAINER="pacs_flask_auth"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${2:-$BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Error handling
error_exit() {
    log "ERROR: $1" "$RED"
    rm -rf "$RESTORE_TEMP"
    exit 1
}

# Usage information
usage() {
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 /backup/pacs/weekly/pacs_full_20240101_120000.tar.gz"
    exit 1
}

# Check arguments
if [ -z "$BACKUP_FILE" ]; then
    usage
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

# Create temporary directory
mkdir -p "$RESTORE_TEMP"

# Extract backup
log "Extracting backup archive..." "$YELLOW"
tar xzf "$BACKUP_FILE" -C "$RESTORE_TEMP" || error_exit "Failed to extract backup"

# Read manifest
if [ -f "$RESTORE_TEMP/manifest.json" ]; then
    log "Backup manifest found" "$GREEN"
    cat "$RESTORE_TEMP/manifest.json"
else
    error_exit "No manifest found in backup"
fi

# Confirmation prompt
echo ""
log "WARNING: This will restore the PACS system from backup!" "$YELLOW"
log "All current data will be replaced with backup data." "$YELLOW"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log "Restore cancelled by user" "$YELLOW"
    rm -rf "$RESTORE_TEMP"
    exit 0
fi

# Stop services
log "Stopping PACS services..." "$YELLOW"
docker-compose stop

# Restore PostgreSQL
if [ -f "$RESTORE_TEMP/postgres_backup.sql.gz" ]; then
    log "Restoring PostgreSQL database..." "$YELLOW"
    
    # Start only database container
    docker-compose up -d $DB_CONTAINER
    sleep 10  # Wait for database to be ready
    
    # Get database credentials
    DB_NAME=$(docker exec $DB_CONTAINER printenv POSTGRES_DB)
    DB_USER=$(docker exec $DB_CONTAINER printenv POSTGRES_USER)
    
    # Drop and recreate database
    docker exec $DB_CONTAINER psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
    docker exec $DB_CONTAINER psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
    
    # Restore database
    gunzip -c "$RESTORE_TEMP/postgres_backup.sql.gz" | docker exec -i $DB_CONTAINER psql -U "$DB_USER" -d "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        log "PostgreSQL restore completed" "$GREEN"
    else
        error_exit "PostgreSQL restore failed!"
    fi
fi

# Restore Orthanc data
if [ -f "$RESTORE_TEMP/orthanc_data.tar.gz" ]; then
    log "Restoring Orthanc data..." "$YELLOW"
    
    # Clear existing data
    docker volume rm -f pacs_orthanc_data || true
    docker volume create pacs_orthanc_data
    
    # Extract data to volume
    docker run --rm -v pacs_orthanc_data:/data -v "$RESTORE_TEMP:/backup" \
        alpine tar xzf /backup/orthanc_data.tar.gz -C /data
    
    log "Orthanc data restore completed" "$GREEN"
fi

# Restore Flask Auth Service data
if [ -f "$RESTORE_TEMP/flask_auth_data.tar.gz" ]; then
    log "Restoring Flask Auth Service data..." "$YELLOW"
    
    # Clear existing data
    docker volume rm -f pacs_flask_auth_data || true
    docker volume create pacs_flask_auth_data
    
    # Extract data to volume
    docker run --rm -v pacs_flask_auth_data:/data -v "$RESTORE_TEMP:/backup" \
        alpine tar xzf /backup/flask_auth_data.tar.gz -C /data
    
    log "Flask Auth Service data restore completed" "$GREEN"
fi

# Start all services
log "Starting all PACS services..." "$YELLOW"
docker-compose up -d

# Wait for services to be ready
log "Waiting for services to be ready..." "$YELLOW"
sleep 30

# Verify services
log "Verifying services..." "$YELLOW"
docker-compose ps

# Cleanup
rm -rf "$RESTORE_TEMP"

log "=== Restore Completed Successfully ===" "$GREEN"
log "Please verify that all services are working correctly" "$YELLOW"
log "Default login URL: https://localhost/login" "$YELLOW" 