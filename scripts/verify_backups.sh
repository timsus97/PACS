#!/bin/bash

# PACS Backup Verification Script
# Verifies integrity of all backup files and sends alerts if issues found

BACKUP_ROOT="/backup/pacs"
VERIFY_LOG="/var/log/pacs_backup_verify.log"
ALERT_EMAIL="${BACKUP_ALERT_EMAIL:-admin@klinika-pro.ru}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
TOTAL_BACKUPS=0
VALID_BACKUPS=0
CORRUPT_BACKUPS=0
MISSING_MANIFEST=0

# Log function
log() {
    echo -e "${2:-$NC}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$VERIFY_LOG"
}

# Verify single backup file
verify_backup_file() {
    local backup_file="$1"
    local filename=$(basename "$backup_file")
    
    TOTAL_BACKUPS=$((TOTAL_BACKUPS + 1))
    
    # Check if file exists and is readable
    if [ ! -r "$backup_file" ]; then
        log "ERROR: Cannot read backup file: $filename" "$RED"
        CORRUPT_BACKUPS=$((CORRUPT_BACKUPS + 1))
        return 1
    fi
    
    # Check file size
    local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ "$size" -lt 1024 ]; then
        log "ERROR: Backup file too small: $filename (${size} bytes)" "$RED"
        CORRUPT_BACKUPS=$((CORRUPT_BACKUPS + 1))
        return 1
    fi
    
    # Verify tar archive integrity
    if ! tar tzf "$backup_file" >/dev/null 2>&1; then
        log "ERROR: Corrupt backup archive: $filename" "$RED"
        CORRUPT_BACKUPS=$((CORRUPT_BACKUPS + 1))
        return 1
    fi
    
    # Check for manifest file
    if ! tar tzf "$backup_file" | grep -q "manifest.json"; then
        log "WARNING: No manifest in backup: $filename" "$YELLOW"
        MISSING_MANIFEST=$((MISSING_MANIFEST + 1))
    fi
    
    # Extract and verify manifest
    local temp_dir="/tmp/verify_$$"
    mkdir -p "$temp_dir"
    
    if tar xzf "$backup_file" -C "$temp_dir" manifest.json 2>/dev/null; then
        if [ -f "$temp_dir/manifest.json" ]; then
            local backup_date=$(grep -o '"backup_date"[[:space:]]*:[[:space:]]*"[^"]*"' "$temp_dir/manifest.json" | cut -d'"' -f4)
            local backup_type=$(grep -o '"backup_type"[[:space:]]*:[[:space:]]*"[^"]*"' "$temp_dir/manifest.json" | cut -d'"' -f4)
            log "VALID: $filename (Type: $backup_type, Date: $backup_date)" "$GREEN"
        fi
    fi
    
    rm -rf "$temp_dir"
    VALID_BACKUPS=$((VALID_BACKUPS + 1))
    return 0
}

# Check backup age
check_backup_age() {
    local backup_dir="$1"
    local max_age_days="$2"
    local backup_type="$3"
    
    local latest_backup=$(find "$backup_dir" -name "*.tar.gz" -type f -mtime -"$max_age_days" | sort -r | head -1)
    
    if [ -z "$latest_backup" ]; then
        log "ALERT: No $backup_type backup found in last $max_age_days days!" "$RED"
        return 1
    else
        local age_hours=$((($(date +%s) - $(stat -f%m "$latest_backup" 2>/dev/null || stat -c%Y "$latest_backup" 2>/dev/null)) / 3600))
        log "Latest $backup_type backup is $age_hours hours old: $(basename "$latest_backup")" "$GREEN"
        return 0
    fi
}

# Main verification process
log "=== PACS Backup Verification Started ===" "$YELLOW"

# Verify daily backups
log "\nVerifying daily incremental backups..." "$YELLOW"
for backup in $(find "$BACKUP_ROOT/daily" -name "*.tar.gz" -type f | sort -r | head -10); do
    verify_backup_file "$backup"
done

# Verify weekly backups
log "\nVerifying weekly full backups..." "$YELLOW"
for backup in $(find "$BACKUP_ROOT/weekly" -name "*.tar.gz" -type f | sort -r | head -4); do
    verify_backup_file "$backup"
done

# Check backup freshness
log "\nChecking backup freshness..." "$YELLOW"
FRESH_DAILY=$(check_backup_age "$BACKUP_ROOT/daily" 2 "daily")
FRESH_WEEKLY=$(check_backup_age "$BACKUP_ROOT/weekly" 8 "weekly")

# Generate summary
log "\n=== Verification Summary ===" "$YELLOW"
log "Total backups checked: $TOTAL_BACKUPS"
log "Valid backups: $VALID_BACKUPS" "$GREEN"
log "Corrupt backups: $CORRUPT_BACKUPS" "$RED"
log "Missing manifests: $MISSING_MANIFEST" "$YELLOW"

# Check disk space
BACKUP_DISK_USAGE=$(df -h "$BACKUP_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
log "\nBackup disk usage: ${BACKUP_DISK_USAGE}%"

if [ "$BACKUP_DISK_USAGE" -gt 80 ]; then
    log "WARNING: Backup disk usage is above 80%!" "$YELLOW"
fi

# Send alert if issues found
if [ "$CORRUPT_BACKUPS" -gt 0 ] || [ "$FRESH_DAILY" != "0" ] || [ "$FRESH_WEEKLY" != "0" ] || [ "$BACKUP_DISK_USAGE" -gt 90 ]; then
    ALERT_SUBJECT="PACS Backup Alert - Issues Detected"
    ALERT_BODY="PACS Backup Verification Report\n\n"
    ALERT_BODY+="Corrupt backups: $CORRUPT_BACKUPS\n"
    ALERT_BODY+="Backup disk usage: ${BACKUP_DISK_USAGE}%\n"
    
    if [ "$FRESH_DAILY" != "0" ]; then
        ALERT_BODY+="WARNING: No recent daily backup!\n"
    fi
    
    if [ "$FRESH_WEEKLY" != "0" ]; then
        ALERT_BODY+="WARNING: No recent weekly backup!\n"
    fi
    
    ALERT_BODY+="\nPlease check the backup system immediately.\n"
    ALERT_BODY+="Log file: $VERIFY_LOG\n"
    
    # Send email alert (requires mail/sendmail configured)
    # echo -e "$ALERT_BODY" | mail -s "$ALERT_SUBJECT" "$ALERT_EMAIL"
    
    log "\nALERT: Issues detected! Alert would be sent to $ALERT_EMAIL" "$RED"
    echo -e "$ALERT_BODY"
else
    log "\nAll backup checks passed!" "$GREEN"
fi

log "\n=== Verification Complete ===" "$YELLOW"

# Rotate verification log
if [ -f "$VERIFY_LOG" ] && [ $(wc -l < "$VERIFY_LOG") -gt 10000 ]; then
    mv "$VERIFY_LOG" "${VERIFY_LOG}.old"
    touch "$VERIFY_LOG"
fi

exit 0 