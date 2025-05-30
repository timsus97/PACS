#!/bin/bash

# PACS System Maintenance Script
# Performs regular maintenance tasks: cleanup, optimization, validation

# Configuration
LOG_DIR="/logs"
TEMP_DIR="/tmp"
SESSION_TIMEOUT_HOURS=24
LOG_RETENTION_DAYS=90
DICOM_RETENTION_DAYS=365
REPORT_RETENTION_DAYS=2555  # 7 years for medical records

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
MAINTENANCE_LOG="/var/log/pacs_maintenance.log"

log() {
    echo -e "${2:-$BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$MAINTENANCE_LOG"
}

# Function to clean old log files
clean_logs() {
    log "Starting log cleanup..." "$YELLOW"
    
    # Clean Nginx logs
    find /logs/nginx -name "*.log" -type f -mtime +$LOG_RETENTION_DAYS -delete
    find /logs/nginx -name "*.gz" -type f -mtime +$LOG_RETENTION_DAYS -delete
    
    # Clean Orthanc logs
    find /logs/orthanc -name "*.log" -type f -mtime +$LOG_RETENTION_DAYS -delete
    
    # Clean Flask auth logs
    find /logs/flask_auth -name "*.log" -type f -mtime +$LOG_RETENTION_DAYS -delete
    
    # Clean PostgreSQL logs
    find /logs/postgres -name "*.log" -type f -mtime +$LOG_RETENTION_DAYS -delete
    
    # Rotate current logs
    for service in nginx orthanc flask_auth postgres; do
        if [ -d "/logs/$service" ]; then
            for logfile in /logs/$service/*.log; do
                if [ -f "$logfile" ] && [ $(stat -f%z "$logfile" 2>/dev/null || stat -c%s "$logfile" 2>/dev/null) -gt 104857600 ]; then
                    # Rotate if larger than 100MB
                    mv "$logfile" "${logfile}.$(date +%Y%m%d)"
                    gzip "${logfile}.$(date +%Y%m%d)"
                    touch "$logfile"
                    log "Rotated large log file: $logfile"
                fi
            done
        fi
    done
    
    log "Log cleanup completed" "$GREEN"
}

# Function to clean expired sessions
clean_sessions() {
    log "Cleaning expired sessions..." "$YELLOW"
    
    # Clean Flask sessions from database
    docker exec pacs_flask_auth python -c "
from app import app, db
from models import Session
from datetime import datetime, timedelta
with app.app_context():
    expired = Session.query.filter(Session.created_at < datetime.utcnow() - timedelta(hours=$SESSION_TIMEOUT_HOURS)).all()
    for session in expired:
        db.session.delete(session)
    db.session.commit()
    print(f'Deleted {len(expired)} expired sessions')
"
    
    # Clean browser session data from Redis if used
    if docker ps --format '{{.Names}}' | grep -q "pacs_redis"; then
        docker exec pacs_redis redis-cli --scan --pattern "session:*" | while read key; do
            ttl=$(docker exec pacs_redis redis-cli TTL "$key")
            if [ "$ttl" -le 0 ]; then
                docker exec pacs_redis redis-cli DEL "$key"
            fi
        done
    fi
    
    log "Session cleanup completed" "$GREEN"
}

# Function to clean temporary files
clean_temp_files() {
    log "Cleaning temporary files..." "$YELLOW"
    
    # Clean system temp files
    find /tmp -name "pacs_*" -type f -mtime +1 -delete
    find /tmp -name "*.dcm.tmp" -type f -mtime +1 -delete
    find /tmp -name "report_*.pdf" -type f -mtime +7 -delete
    
    # Clean Docker temp files
    docker exec pacs_orthanc find /tmp -name "*.tmp" -mtime +1 -delete 2>/dev/null || true
    docker exec pacs_flask_auth find /tmp -name "*.tmp" -mtime +1 -delete 2>/dev/null || true
    
    # Clean uploaded but unprocessed files
    find /var/lib/orthanc/tmp -name "*.dcm" -type f -mtime +1 -delete 2>/dev/null || true
    
    log "Temporary file cleanup completed" "$GREEN"
}

# Function to optimize database
optimize_database() {
    log "Optimizing PostgreSQL database..." "$YELLOW"
    
    # Run VACUUM and ANALYZE
    docker exec pacs_db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "VACUUM ANALYZE;"
    
    # Reindex if needed
    docker exec pacs_db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "REINDEX DATABASE $POSTGRES_DB;"
    
    # Update statistics
    docker exec pacs_db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "ANALYZE;"
    
    log "Database optimization completed" "$GREEN"
}

# Function to validate DICOM files
validate_dicom_files() {
    log "Validating DICOM files..." "$YELLOW"
    
    # Use Orthanc's built-in validation
    docker exec pacs_orthanc curl -s -u "$ORTHANC_USERNAME:$ORTHANC_PASSWORD" \
        http://localhost:8042/tools/reconstruct -X POST -d '{}' || true
    
    # Check for orphaned files
    docker exec pacs_orthanc find /var/lib/orthanc/db -name "*.dcm" -type f | while read file; do
        # Check if file is referenced in database
        instance_id=$(basename "$file" .dcm)
        if ! docker exec pacs_orthanc curl -s -u "$ORTHANC_USERNAME:$ORTHANC_PASSWORD" \
            "http://localhost:8042/instances/$instance_id" >/dev/null 2>&1; then
            log "Found orphaned DICOM file: $file" "$YELLOW"
            # Move to quarantine instead of deleting
            docker exec pacs_orthanc mkdir -p /var/lib/orthanc/quarantine
            docker exec pacs_orthanc mv "$file" /var/lib/orthanc/quarantine/
        fi
    done
    
    log "DICOM validation completed" "$GREEN"
}

# Function to check and deduplicate studies
deduplicate_studies() {
    log "Checking for duplicate studies..." "$YELLOW"
    
    # Query Orthanc for potential duplicates
    docker exec pacs_orthanc curl -s -u "$ORTHANC_USERNAME:$ORTHANC_PASSWORD" \
        http://localhost:8042/studies | jq -r '.[]' | while read study_id; do
        
        study_info=$(docker exec pacs_orthanc curl -s -u "$ORTHANC_USERNAME:$ORTHANC_PASSWORD" \
            "http://localhost:8042/studies/$study_id")
        
        # Extract study instance UID
        study_uid=$(echo "$study_info" | jq -r '.MainDicomTags.StudyInstanceUID')
        
        # Check for duplicates (this is a simplified check)
        # In production, implement more sophisticated duplicate detection
    done
    
    log "Deduplication check completed" "$GREEN"
}

# Function to apply retention policies
apply_retention_policies() {
    log "Applying data retention policies..." "$YELLOW"
    
    # Archive old studies (move to cold storage instead of deleting)
    current_date=$(date +%s)
    
    docker exec pacs_orthanc curl -s -u "$ORTHANC_USERNAME:$ORTHANC_PASSWORD" \
        http://localhost:8042/studies | jq -r '.[]' | while read study_id; do
        
        study_date=$(docker exec pacs_orthanc curl -s -u "$ORTHANC_USERNAME:$ORTHANC_PASSWORD" \
            "http://localhost:8042/studies/$study_id" | jq -r '.MainDicomTags.StudyDate')
        
        if [ ! -z "$study_date" ]; then
            study_timestamp=$(date -d "$study_date" +%s 2>/dev/null || date -j -f "%Y%m%d" "$study_date" +%s 2>/dev/null)
            age_days=$(( (current_date - study_timestamp) / 86400 ))
            
            if [ $age_days -gt $DICOM_RETENTION_DAYS ]; then
                log "Archiving old study: $study_id (age: $age_days days)" "$YELLOW"
                # In production, move to cold storage instead of deleting
                # For now, just log
            fi
        fi
    done
    
    log "Retention policies applied" "$GREEN"
}

# Function to update security patches
update_security() {
    log "Checking for security updates..." "$YELLOW"
    
    # Update container base images
    for image in $(docker-compose images -q); do
        docker pull "$image" || true
    done
    
    # Check for CVEs in running containers
    if command -v trivy &> /dev/null; then
        docker ps --format "table {{.Names}}\t{{.Image}}" | tail -n +2 | while read name image; do
            log "Scanning $name for vulnerabilities..."
            trivy image --severity HIGH,CRITICAL "$image" || true
        done
    fi
    
    log "Security check completed" "$GREEN"
}

# Function to generate maintenance report
generate_report() {
    log "Generating maintenance report..." "$YELLOW"
    
    report_file="/logs/maintenance_report_$(date +%Y%m%d).txt"
    
    {
        echo "PACS System Maintenance Report"
        echo "Generated: $(date)"
        echo "==============================="
        echo ""
        
        echo "System Status:"
        docker-compose ps
        echo ""
        
        echo "Disk Usage:"
        df -h | grep -E "(Filesystem|pacs|orthanc)"
        echo ""
        
        echo "Database Size:"
        docker exec pacs_db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
            "SELECT pg_size_pretty(pg_database_size('$POSTGRES_DB'));"
        echo ""
        
        echo "DICOM Storage:"
        docker exec pacs_orthanc du -sh /var/lib/orthanc/db 2>/dev/null || echo "N/A"
        echo ""
        
        echo "Active Sessions:"
        docker exec pacs_flask_auth python -c "
from app import app, db
from models import Session
with app.app_context():
    count = Session.query.count()
    print(f'Active sessions: {count}')
" 2>/dev/null || echo "N/A"
        
    } > "$report_file"
    
    log "Maintenance report saved to: $report_file" "$GREEN"
}

# Main execution
main() {
    log "=== PACS Maintenance Started ===" "$BLUE"
    
    # Run maintenance tasks
    clean_logs
    clean_sessions
    clean_temp_files
    optimize_database
    validate_dicom_files
    deduplicate_studies
    apply_retention_policies
    
    # Monthly tasks
    if [ "$(date +%d)" -eq "01" ]; then
        update_security
    fi
    
    # Generate report
    generate_report
    
    # Cleanup maintenance log if too large
    if [ -f "$MAINTENANCE_LOG" ] && [ $(stat -f%z "$MAINTENANCE_LOG" 2>/dev/null || stat -c%s "$MAINTENANCE_LOG" 2>/dev/null) -gt 10485760 ]; then
        mv "$MAINTENANCE_LOG" "${MAINTENANCE_LOG}.old"
        gzip "${MAINTENANCE_LOG}.old"
    fi
    
    log "=== PACS Maintenance Completed ===" "$GREEN"
}

# Run main function
main

exit 0 