#!/bin/bash

# Clinton Medical PACS Deployment Script
# VPS: 31.97.135.47
# Domain: srv853233.hstgr.cloud

set -e

VPS_IP="31.97.135.47"
VPS_USER="root"
VPS_PASSWORD=';dJd9@YU.a2?ek;Ddb0G'
DOMAIN="srv853233.hstgr.cloud"

echo "=== Clinton Medical PACS Deployment ==="
echo "Target: $VPS_IP"
echo "Domain: $DOMAIN"
echo ""

# Function to execute commands on remote server
execute_remote() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Function to copy files to remote server
copy_to_remote() {
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" "$VPS_USER@$VPS_IP:$2"
}

echo "Step 1: Updating system packages..."
execute_remote "apt update && apt upgrade -y"

echo "Step 2: Installing required packages..."
execute_remote "apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl wget htop ufw"

echo "Step 3: Starting and enabling Docker..."
execute_remote "systemctl start docker && systemctl enable docker"

echo "Step 4: Creating project directory..."
execute_remote "mkdir -p /opt/clinton-pacs && cd /opt/clinton-pacs"

echo "Step 5: Copying project files..."
copy_to_remote "." "/opt/clinton-pacs/"

echo "Step 6: Setting up environment variables..."
execute_remote "cd /opt/clinton-pacs && cp .env.example .env"

# Update .env file with production settings
execute_remote "cd /opt/clinton-pacs && sed -i 's/localhost/$DOMAIN/g' .env"
execute_remote "cd /opt/clinton-pacs && sed -i 's/DB_PASSWORD=secure_password_123/DB_PASSWORD=ClintonPACS2024!SecureDB/g' .env"

echo "Step 7: Setting up firewall..."
execute_remote "ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw allow 4242 && ufw allow 8042 && ufw --force enable"

echo "Step 8: Building and starting containers..."
execute_remote "cd /opt/clinton-pacs && docker-compose down --remove-orphans || true"
execute_remote "cd /opt/clinton-pacs && docker-compose pull"
execute_remote "cd /opt/clinton-pacs && docker-compose build"
execute_remote "cd /opt/clinton-pacs && docker-compose up -d"

echo "Step 9: Setting up SSL certificate..."
execute_remote "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN"

echo "Step 10: Setting up monitoring..."
execute_remote "cd /opt/clinton-pacs && docker-compose -f docker-compose.monitoring.yml up -d || echo 'Monitoring setup skipped'"

echo ""
echo "=== Deployment Complete! ==="
echo "PACS URL: https://$DOMAIN"
echo "DICOM Port: 4242"
echo "DICOMweb: https://$DOMAIN/orthanc"
echo ""
echo "Default credentials:"
echo "Username: admin"
echo "Password: admin"
echo ""
echo "Database credentials:"
echo "Username: postgres"
echo "Password: ClintonPACS2024!SecureDB"
echo "Database: pacs_db" 