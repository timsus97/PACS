#!/bin/bash

# PACS System Rule Enforcement Script
# This script automatically enforces project rules before deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Rule 1.2: Kill conflicting processes on required ports
enforce_port_rules() {
    log_info "Enforcing port allocation rules..."
    
    REQUIRED_PORTS=(443 8042 3000 80)
    
    for port in "${REQUIRED_PORTS[@]}"; do
        local pids=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$pids" ]; then
            log_warning "Killing processes on port $port: $pids"
            echo $pids | xargs kill -9 2>/dev/null || true
        fi
    done
    
    log_success "Port allocation rules enforced"
}

# Rule 9.1: Check code quality
enforce_code_quality() {
    log_info "Checking code quality rules..."
    
    # Check for secrets in code
    if grep -r "password\|secret\|key" --include="*.js" --include="*.ts" --include="*.json" . | grep -v "node_modules" | grep -v ".git"; then
        log_error "Potential secrets found in code. This violates rule 9.1"
        return 1
    fi
    
    log_success "Code quality checks passed"
}

# Rule 7.2: Check Docker configuration
enforce_docker_rules() {
    log_info "Checking Docker configuration rules..."
    
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml not found. This violates rule 1.1"
        return 1
    fi
    
    # Check for health checks
    if ! grep -q "healthcheck" docker-compose.yml; then
        log_warning "No health checks found in docker-compose.yml"
    fi
    
    # Check for named volumes
    if ! grep -q "volumes:" docker-compose.yml; then
        log_warning "No named volumes found in docker-compose.yml"
    fi
    
    log_success "Docker configuration rules checked"
}

# Rule 3.1: Check Orthanc plugin configuration
enforce_orthanc_rules() {
    log_info "Checking Orthanc configuration rules..."
    
    local orthanc_config="config/orthanc/orthanc.json"
    
    if [ -f "$orthanc_config" ]; then
        # Check for DICOMweb plugin
        if ! grep -q "DicomWeb" "$orthanc_config"; then
            log_warning "DICOMweb plugin not found in Orthanc config (Rule 3.1)"
        fi
        
        # Check for Authorization plugin
        if ! grep -q "Authorization" "$orthanc_config"; then
            log_warning "Authorization plugin not found in Orthanc config (Rule 3.1)"
        fi
        
        # Check for PostgreSQL plugin
        if ! grep -q "PostgreSQL" "$orthanc_config"; then
            log_warning "PostgreSQL plugin not found in Orthanc config (Rule 3.1)"
        fi

        # Check for Compression plugin
        if ! grep -q "Compression" "$orthanc_config"; then
            log_warning "Compression plugin not found in Orthanc config (Rule 3.1)"
        fi
        
        log_success "Orthanc configuration rules checked"
    else
        log_warning "Orthanc configuration file not found at $orthanc_config"
    fi
}

# Rule 4.1: Check OHIF configuration
enforce_ohif_rules() {
    log_info "Checking OHIF configuration rules..."
    
    local ohif_config_path="config/ohif/app-config.js"
    # Further checks might require parsing JS or more complex grep, this is a basic check.
    if [ -f "$ohif_config_path" ]; then
        # Check for custom branding (e.g., "Klinika Pro")
        if ! grep -q "Klinika Pro" "$ohif_config_path" && ! grep -q "custom-logo" "$ohif_config_path"; then
            log_warning "Custom branding 'Klinika Pro' or custom logo might be missing in OHIF config (Rule 4.1)"
        fi
        
        # Check for Orthanc data source pointing to /orthanc path
        if ! grep -q "/orthanc/dicom-web" "$ohif_config_path"; then # Adjusted to common DICOMweb path
            log_warning "OHIF data source may not be pointing to /orthanc/dicom-web (Rule 4.1)"
        fi

        # Check for removal of download functionality (heuristic)
        if grep -q -E "downloadButton|enableDicomDownload" "$ohif_config_path"; then
            log_warning "OHIF config might still contain download button references (Rule 4.2)"
        fi
        
        log_success "OHIF configuration rules checked"
    else
        log_warning "OHIF configuration file not found at $ohif_config_path (Rule 4.1)"
    fi
}

# Rule 2.3: Check security configuration
enforce_security_rules() {
    log_info "Checking security configuration rules..."
    
    # Check for HTTPS configuration
    if [ -f "config/nginx/nginx.conf" ]; then
        if ! grep -q "ssl" config/nginx/nginx.conf; then
            log_warning "SSL configuration not found in Nginx config"
        fi
        
        if ! grep -q "443" config/nginx/nginx.conf; then
            log_warning "HTTPS port 443 not configured in Nginx"
        fi
    fi
    
    # Check for environment variables
    if [ -f ".env" ]; then
        if grep -q "password.*=" .env; then
            log_warning "Plain text passwords found in .env file"
        fi
    fi
    
    log_success "Security configuration rules checked"
}

# Rule 6.3: Check backup configuration
enforce_backup_rules() {
    log_info "Checking backup configuration rules..."
    
    local backup_script="scripts/backup.sh"
    
    if [ ! -f "$backup_script" ]; then
        log_warning "Backup script not found at $backup_script"
    else
        if [ ! -x "$backup_script" ]; then
            log_warning "Backup script is not executable"
        fi
    fi
    
    log_success "Backup configuration rules checked"
}

# Rule 8.1: Performance checks
enforce_performance_rules() {
    log_info "Checking performance configuration..."
    
    # Check for resource limits in docker-compose
    if [ -f "docker-compose.yml" ]; then
        if ! grep -q "mem_limit\|cpus" docker-compose.yml; then
            log_warning "No resource limits found in docker-compose.yml"
        fi
    fi
    
    log_success "Performance configuration checked"
}

# Rule 6.2 & 9.2: Check Test Data and Upload Script
enforce_test_data_rules() {
    log_info "Checking test data and upload script rules..."

    local test_data_dir="orthanc/dicom-test-data"
    if [ ! -d "$test_data_dir" ]; then
        log_warning "Test data directory '$test_data_dir' not found (Rule 6.2)"
    else
        # Check for subdirectories like ct, mri, us, video
        if [ ! -d "$test_data_dir/ct" ] || [ ! -d "$test_data_dir/mri" ] || [ ! -d "$test_data_dir/us" ]; then # video is optional
             log_warning "Required subdirectories (ct, mri, us) may be missing in '$test_data_dir' (Rule 6.2)"
        fi
    fi

    local upload_script="scripts/upload.sh"
    if [ ! -f "$upload_script" ]; then
        log_warning "Upload script '$upload_script' not found (Rule 9.2)"
    elif [ ! -x "$upload_script" ]; then
        log_warning "Upload script '$upload_script' is not executable (Rule 9.2)"
    fi

    log_success "Test data and upload script rules checked"
}

# Main enforcement function
main() {
    log_info "Starting PACS system rule enforcement..."
    echo "=================================="
    
    cd "$PROJECT_ROOT"
    
    # Enforce all rules
    enforce_port_rules
    enforce_code_quality
    enforce_docker_rules
    enforce_orthanc_rules
    enforce_ohif_rules
    enforce_test_data_rules
    enforce_security_rules
    enforce_backup_rules
    enforce_performance_rules
    
    echo "=================================="
    log_success "Rule enforcement completed!"
    
    # Display summary
    echo ""
    log_info "Summary of enforced rules:"
    echo "  ✓ Port allocation (1.2)"
    echo "  ✓ Code quality (9.1)"
    echo "  ✓ Docker configuration (1.1, 7.2)"
    echo "  ✓ Orthanc configuration (3.1)"
    echo "  ✓ OHIF configuration (4.1, 4.2)"
    echo "  ✓ Test Data & Upload Script (6.2, 9.2)"
    echo "  ✓ Security configuration (2.3)"
    echo "  ✓ Backup configuration (6.3)"
    echo "  ✓ Performance configuration (8.1)"
    echo ""
    log_info "System is ready for deployment!"
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 