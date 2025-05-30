#!/bin/bash

# PACS Audit Log Integrity Protection Script
# Implements cryptographic protection for audit logs

# Configuration
AUDIT_DIR="/var/log/pacs/audit"
ARCHIVE_DIR="/var/log/pacs/audit/archive"
HASH_DIR="/var/log/pacs/audit/hashes"
SIGNING_KEY="/etc/pacs/audit_signing.key"
PUBLIC_KEY="/etc/pacs/audit_public.key"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create directories
mkdir -p "$AUDIT_DIR" "$ARCHIVE_DIR" "$HASH_DIR"

# Generate signing keys if not exist
generate_keys() {
    if [ ! -f "$SIGNING_KEY" ] || [ ! -f "$PUBLIC_KEY" ]; then
        echo -e "${YELLOW}Generating audit log signing keys...${NC}"
        mkdir -p /etc/pacs
        openssl genrsa -out "$SIGNING_KEY" 4096
        openssl rsa -in "$SIGNING_KEY" -pubout -out "$PUBLIC_KEY"
        chmod 600 "$SIGNING_KEY"
        chmod 644 "$PUBLIC_KEY"
        echo -e "${GREEN}Signing keys generated${NC}"
    fi
}

# Function to calculate hash chain
calculate_hash_chain() {
    local log_file="$1"
    local previous_hash="$2"
    
    # Calculate SHA-256 hash including previous hash
    echo -n "${previous_hash}:" | cat - "$log_file" | sha256sum | awk '{print $1}'
}

# Function to sign log file
sign_log_file() {
    local log_file="$1"
    local signature_file="${log_file}.sig"
    
    # Create digital signature
    openssl dgst -sha256 -sign "$SIGNING_KEY" -out "$signature_file" "$log_file"
    
    # Set immutable attribute
    chmod 444 "$log_file"
    if command -v chattr &> /dev/null; then
        sudo chattr +i "$log_file" 2>/dev/null || true
    fi
}

# Function to verify log integrity
verify_log_integrity() {
    local log_file="$1"
    local signature_file="${log_file}.sig"
    
    if [ ! -f "$signature_file" ]; then
        echo -e "${RED}No signature found for $log_file${NC}"
        return 1
    fi
    
    # Verify digital signature
    if openssl dgst -sha256 -verify "$PUBLIC_KEY" -signature "$signature_file" "$log_file" &>/dev/null; then
        echo -e "${GREEN}Integrity verified: $log_file${NC}"
        return 0
    else
        echo -e "${RED}INTEGRITY VIOLATION: $log_file${NC}"
        return 1
    fi
}

# Function to rotate and archive audit logs
rotate_audit_logs() {
    echo -e "${YELLOW}Rotating audit logs...${NC}"
    
    # Get current date
    DATE=$(date +%Y%m%d_%H%M%S)
    
    # Find audit logs to rotate (older than 1 day)
    find "$AUDIT_DIR" -name "*.log" -type f -mtime +0 | while read log_file; do
        # Skip already archived files
        [[ "$log_file" == *"/archive/"* ]] && continue
        
        # Calculate final hash
        FINAL_HASH=$(sha256sum "$log_file" | awk '{print $1}')
        
        # Sign the log file
        sign_log_file "$log_file"
        
        # Create archive with timestamp
        ARCHIVE_NAME="$(basename "$log_file" .log)_${DATE}.log"
        ARCHIVE_PATH="$ARCHIVE_DIR/$ARCHIVE_NAME"
        
        # Move to archive
        mv "$log_file" "$ARCHIVE_PATH"
        mv "${log_file}.sig" "${ARCHIVE_PATH}.sig"
        
        # Store hash chain
        echo "$FINAL_HASH" > "$HASH_DIR/${ARCHIVE_NAME}.hash"
        
        # Compress archived log
        gzip "$ARCHIVE_PATH"
        
        echo -e "${GREEN}Archived: $ARCHIVE_NAME${NC}"
    done
}

# Function to create audit log entry
create_audit_entry() {
    local user="$1"
    local action="$2"
    local resource="$3"
    local result="$4"
    local details="$5"
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local log_file="$AUDIT_DIR/audit_$(date +%Y%m%d).log"
    
    # Create JSON audit entry
    local audit_entry=$(cat <<EOF
{
    "timestamp": "$timestamp",
    "user": "$user",
    "action": "$action",
    "resource": "$resource",
    "result": "$result",
    "details": "$details",
    "source_ip": "${REMOTE_ADDR:-unknown}",
    "session_id": "${SESSION_ID:-unknown}",
    "checksum": ""
}
EOF
)
    
    # Calculate checksum of entry
    local checksum=$(echo -n "$audit_entry" | sha256sum | awk '{print $1}')
    audit_entry=$(echo "$audit_entry" | sed "s/\"checksum\": \"\"/\"checksum\": \"$checksum\"/")
    
    # Append to log file with exclusive lock
    {
        flock -x 200
        echo "$audit_entry" >> "$log_file"
    } 200>"${log_file}.lock"
}

# Function to monitor audit log tampering
monitor_tampering() {
    echo -e "${YELLOW}Checking for audit log tampering...${NC}"
    
    local violations=0
    
    # Check all archived logs
    find "$ARCHIVE_DIR" -name "*.log.gz" -type f | while read archive; do
        # Extract and verify
        local temp_file="/tmp/audit_verify_$$.log"
        gunzip -c "$archive" > "$temp_file"
        
        local sig_file="${archive%.gz}.sig"
        if [ -f "$sig_file" ]; then
            if ! openssl dgst -sha256 -verify "$PUBLIC_KEY" -signature "$sig_file" "$temp_file" &>/dev/null; then
                echo -e "${RED}TAMPERING DETECTED: $archive${NC}"
                ((violations++))
                
                # Alert security team
                send_security_alert "Audit log tampering detected: $archive"
            fi
        fi
        
        rm -f "$temp_file"
    done
    
    if [ $violations -eq 0 ]; then
        echo -e "${GREEN}No tampering detected${NC}"
    else
        echo -e "${RED}Found $violations integrity violations!${NC}"
    fi
}

# Function to send security alert
send_security_alert() {
    local message="$1"
    
    # Log to syslog
    logger -p security.crit "PACS AUDIT: $message"
    
    # Send email alert (if configured)
    if [ ! -z "$SECURITY_EMAIL" ]; then
        echo "$message" | mail -s "PACS Security Alert" "$SECURITY_EMAIL"
    fi
    
    # Write to security log
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] SECURITY ALERT: $message" >> /var/log/pacs/security.log
}

# Function to export audit logs for compliance
export_audit_logs() {
    local start_date="$1"
    local end_date="$2"
    local export_file="$3"
    
    echo -e "${YELLOW}Exporting audit logs from $start_date to $end_date...${NC}"
    
    # Create temporary directory
    local temp_dir="/tmp/audit_export_$$"
    mkdir -p "$temp_dir"
    
    # Find and copy relevant logs
    find "$ARCHIVE_DIR" -name "*.log.gz" -newermt "$start_date" ! -newermt "$end_date" | while read log; do
        cp "$log" "$temp_dir/"
        cp "${log%.gz}.sig" "$temp_dir/" 2>/dev/null || true
    done
    
    # Create manifest
    cat > "$temp_dir/manifest.json" <<EOF
{
    "export_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "period": {
        "start": "$start_date",
        "end": "$end_date"
    },
    "files": $(ls -1 "$temp_dir"/*.log.gz | wc -l),
    "export_reason": "Compliance audit",
    "integrity_method": "SHA-256 with RSA signature"
}
EOF
    
    # Create tamper-evident archive
    tar czf "$export_file" -C "$temp_dir" .
    
    # Sign the export
    openssl dgst -sha256 -sign "$SIGNING_KEY" -out "${export_file}.sig" "$export_file"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    echo -e "${GREEN}Audit logs exported to: $export_file${NC}"
}

# Main execution based on command
case "$1" in
    init)
        generate_keys
        ;;
    rotate)
        rotate_audit_logs
        ;;
    verify)
        monitor_tampering
        ;;
    export)
        export_audit_logs "$2" "$3" "$4"
        ;;
    audit)
        create_audit_entry "$2" "$3" "$4" "$5" "$6"
        ;;
    *)
        echo "Usage: $0 {init|rotate|verify|export|audit}"
        echo "  init                          - Initialize signing keys"
        echo "  rotate                        - Rotate and sign audit logs"
        echo "  verify                        - Verify audit log integrity"
        echo "  export <start> <end> <file>   - Export audit logs for period"
        echo "  audit <user> <action> <resource> <result> <details> - Create audit entry"
        exit 1
        ;;
esac

exit 0 