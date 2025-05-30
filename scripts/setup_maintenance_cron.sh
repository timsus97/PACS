#!/bin/bash

# Setup maintenance cron jobs for PACS system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up PACS maintenance schedule...${NC}"

# Create cron entries
CRON_DAILY_MAINTENANCE="0 3 * * * cd $PROJECT_ROOT && ./scripts/maintenance.sh >> /var/log/pacs_maintenance_cron.log 2>&1"
CRON_WEEKLY_SECURITY="0 4 * * 0 cd $PROJECT_ROOT && ./scripts/security_update.sh >> /var/log/pacs_security.log 2>&1"
CRON_MONTHLY_REPORT="0 5 1 * * cd $PROJECT_ROOT && ./scripts/generate_monthly_report.sh >> /var/log/pacs_reports.log 2>&1"

# Function to add cron job
add_cron_job() {
    local job="$1"
    local desc="$2"
    
    # Add new job
    (crontab -l 2>/dev/null | grep -v "$desc"; echo "# $desc"; echo "$job") | crontab -
    echo -e "${GREEN}Added: $desc${NC}"
}

# Add maintenance jobs
add_cron_job "$CRON_DAILY_MAINTENANCE" "Daily PACS maintenance at 3:00 AM"
add_cron_job "$CRON_WEEKLY_SECURITY" "Weekly security updates on Sunday at 4:00 AM"
add_cron_job "$CRON_MONTHLY_REPORT" "Monthly reports on 1st of month at 5:00 AM"

# Create systemd timer as alternative (more reliable than cron)
sudo tee /etc/systemd/system/pacs-maintenance.service > /dev/null << EOF
[Unit]
Description=PACS System Maintenance
After=docker.service

[Service]
Type=oneshot
ExecStart=$PROJECT_ROOT/scripts/maintenance.sh
StandardOutput=journal
StandardError=journal
EOF

sudo tee /etc/systemd/system/pacs-maintenance.timer > /dev/null << EOF
[Unit]
Description=Run PACS maintenance daily
Requires=pacs-maintenance.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Enable systemd timer
sudo systemctl daemon-reload
sudo systemctl enable pacs-maintenance.timer
sudo systemctl start pacs-maintenance.timer

echo -e "\n${GREEN}Maintenance schedule configured!${NC}"
echo -e "${YELLOW}Current cron jobs:${NC}"
crontab -l | grep "PACS"

echo -e "\n${YELLOW}Systemd timer status:${NC}"
systemctl status pacs-maintenance.timer --no-pager 