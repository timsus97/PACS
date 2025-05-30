#!/bin/bash

# PACS System Backup Script
# This script should handle backing up PostgreSQL data and Orthanc storage.

set -e

LOG_FILE="./logs/backup.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/${TIMESTAMP}"

# Configuration (adjust as needed)
POSTGRES_DB_CONTAINER="pacs_db"
POSTGRES_USER="${POSTGRES_USER:-orthanc_user}"
POSTGRES_DB="${POSTGRES_DB:-orthanc}"
ORTHANC_DATA_VOLUME="pacs_orthanc_data" # Docker volume name for Orthanc files
ORTHANC_DB_PATH_INSIDE_VOLUME="/var/lib/orthanc/db" # Path *inside* the named volume where files are

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR/postgres"
mkdir -p "$BACKUP_DIR/orthanc_files"

echo "Starting backup: ${TIMESTAMP}" | tee -a $LOG_FILE

# 1. Backup PostgreSQL Database
echo "Backing up PostgreSQL database ($POSTGRES_DB)..." | tee -a $LOG_FILE
# Ensure the container is running, otherwise docker exec will fail
if docker ps -f name="^/${POSTGRES_DB_CONTAINER}$" --format '{{.Names}}' | grep -q "${POSTGRES_DB_CONTAINER}"; then
    docker exec -t "$POSTGRES_DB_CONTAINER" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -b -v -f "/tmp/db_backup.pgdump"
    docker cp "$POSTGRES_DB_CONTAINER:/tmp/db_backup.pgdump" "$BACKUP_DIR/postgres/db_backup_${TIMESTAMP}.pgdump"
    docker exec -t "$POSTGRES_DB_CONTAINER" rm "/tmp/db_backup.pgdump"
    echo "PostgreSQL backup completed: $BACKUP_DIR/postgres/db_backup_${TIMESTAMP}.pgdump" | tee -a $LOG_FILE
else
    echo "Error: PostgreSQL container ($POSTGRES_DB_CONTAINER) not found or not running." | tee -a $LOG_FILE
    # exit 1 # Decide if this is a fatal error for the script
fi

# 2. Backup Orthanc DICOM Files (from Docker Volume)
# This is a simplistic approach using rsync on the host if the volume data is accessible.
# For a more robust solution, consider Orthanc's archive/export features or volume snapshot tools.
echo "Backing up Orthanc DICOM files (from volume $ORTHANC_DATA_VOLUME)..." | tee -a $LOG_FILE
# The path to Docker volumes on the host depends on the Docker setup (e.g., /var/lib/docker/volumes/ on Linux)
# This script assumes you have a way to access the volume data or will adapt this part.
# If Orthanc stores files directly (not in DB LOBs), and you use a named volume like `pacs_orthanc_data`,
# you would typically copy from the host path where Docker stores this volume's data.
# This is highly dependent on your Docker host OS and configuration.
# Example using a hypothetical host path for the volume:
# DOCKER_VOLUME_HOST_PATH="/var/lib/docker/volumes/${COMPOSE_PROJECT_NAME:-pacs_system}_${ORTHANC_DATA_VOLUME}/_data"

# A safer method might be to use Orthanc's tools or run rsync from within a temporary container
# that mounts the same volume. Or, if Orthanc stores files within its PostgreSQL DB as LOBs,
# the pg_dump would already cover them (if PostgreSQL.EnableStorage is true and it's not just an index).
# The current orthanc.json has PostgreSQL.EnableStorage = true.

# Assuming files are NOT in DB LOBs and are in the volume directly:
# This is a placeholder, as direct host path access is tricky and platform-dependent.
# You might need to mount the volume to another container to perform the rsync, or use `docker cp` if small enough.
echo "Orthanc file backup needs to be configured based on volume access strategy." | tee -a $LOG_FILE
echo "If Orthanc stores files in PostgreSQL LOBs (PostgreSQL.EnableStorage=true), pg_dump covers it." | tee -a $LOG_FILE
# Example if you had a host path:
# if [ -d "$DOCKER_VOLUME_HOST_PATH" ]; then
#   rsync -avz --delete "$DOCKER_VOLUME_HOST_PATH/" "$BACKUP_DIR/orthanc_files/"
#   echo "Orthanc files backup completed to $BACKUP_DIR/orthanc_files/" | tee -a $LOG_FILE
# else
#   echo "Warning: DOCKER_VOLUME_HOST_PATH ($DOCKER_VOLUME_HOST_PATH) not found. Orthanc files not backed up by rsync." | tee -a $LOG_FILE
# fi

# 3. TODO: Backup Configuration Files (orthanc.json, nginx configs, etc.)
echo "Backing up configuration files..." | tee -a $LOG_FILE
cp -r ./config "$BACKUP_DIR/config_backup"
echo "Configuration files backed up to $BACKUP_DIR/config_backup" | tee -a $LOG_FILE

# 4. TODO: Backup .env file (handle secrets carefully)
echo "Backing up .env file (ensure secrets are handled securely)..." | tee -a $LOG_FILE
cp ./.env "$BACKUP_DIR/env_backup.env"
echo ".env file backed up to $BACKUP_DIR/env_backup.env" | tee -a $LOG_FILE


echo "Backup process finished: ${TIMESTAMP}" | tee -a $LOG_FILE
echo "Backup stored in: $BACKUP_DIR" | tee -a $LOG_FILE

# TODO: Implement retention policy (e.g., delete backups older than X days)
# TODO: Consider encrypting backups
# TODO: Consider uploading backups to remote storage (S3, etc.)

exit 0 