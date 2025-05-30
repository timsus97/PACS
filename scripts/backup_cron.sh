#!/bin/bash

# Script to setup automatic backups via cron

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up automatic PACS backup schedule...${NC}"

# Create cron entries
CRON_DAILY="0 2 * * * cd $PROJECT_ROOT && ./backup.sh incremental >> /var/log/pacs_backup.log 2>&1"
CRON_WEEKLY="0 3 * * 0 cd $PROJECT_ROOT && ./backup.sh full >> /var/log/pacs_backup.log 2>&1"
CRON_VERIFY="0 4 * * 1 cd $PROJECT_ROOT && ./scripts/verify_backups.sh >> /var/log/pacs_backup.log 2>&1"

# Function to add cron job
add_cron_job() {
    local job="$1"
    local desc="$2"
    
    # Check if job already exists
    if crontab -l 2>/dev/null | grep -q "$PROJECT_ROOT.*backup"; then
        echo -e "${YELLOW}Removing existing backup cron jobs...${NC}"
        crontab -l | grep -v "$PROJECT_ROOT.*backup" | crontab -
    fi
    
    # Add new job
    (crontab -l 2>/dev/null; echo "$job") | crontab -
    echo -e "${GREEN}Added: $desc${NC}"
}

# Add cron jobs
echo "Adding cron jobs for PACS backup..."
add_cron_job "$CRON_DAILY" "Daily incremental backup at 2:00 AM"
add_cron_job "$CRON_WEEKLY" "Weekly full backup on Sunday at 3:00 AM"
add_cron_job "$CRON_VERIFY" "Weekly backup verification on Monday at 4:00 AM"

# Create log rotation config
echo -e "\n${YELLOW}Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/pacs_backup > /dev/null << EOF
/var/log/pacs_backup.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

echo -e "${GREEN}Log rotation configured${NC}"

# Display current crontab
echo -e "\n${YELLOW}Current backup schedule:${NC}"
crontab -l | grep "$PROJECT_ROOT.*backup"

echo -e "\n${GREEN}Automatic backup setup complete!${NC}"
echo -e "${YELLOW}Backup schedule:${NC}"
echo "  - Daily incremental: Every day at 2:00 AM"
echo "  - Weekly full: Every Sunday at 3:00 AM"
echo "  - Verification: Every Monday at 4:00 AM"
echo -e "\n${YELLOW}Logs will be written to: /var/log/pacs_backup.log${NC}" 