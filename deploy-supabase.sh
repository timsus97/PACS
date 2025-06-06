#!/bin/bash

# 🚀 Clinton Medical PACS - Supabase Deployment Script
# Автоматическое развертывание новой системы аутентификации

echo "🚀 Starting Supabase Migration for Clinton Medical PACS..."

SERVER="root@31.97.135.47"
PASSWORD=";dJd9@YU.a2?ek;Ddb0G"
PROJECT_DIR="/opt/clinton-pacs"

# Проверяем, что ключи Supabase заменены
echo "🔍 Checking Supabase configuration..."

if grep -q "your-project.supabase.co" supabase-auth-config.js; then
    echo "❌ ERROR: Please replace Supabase URL in supabase-auth-config.js"
    echo "   1. Create project at https://supabase.com"
    echo "   2. Copy your project URL and anon key"
    echo "   3. Replace placeholders in supabase-auth-config.js and supabase-login.html"
    exit 1
fi

if grep -q "your-anon-key-here" supabase-auth-config.js; then
    echo "❌ ERROR: Please replace Supabase anon key in supabase-auth-config.js"
    exit 1
fi

echo "✅ Supabase configuration looks good!"

# 1. Создаем бэкап текущей системы
echo "📦 Creating backup of current Flask system..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "
    cd $PROJECT_DIR
    echo '=== Creating backup ==='
    cp docker-compose.yml docker-compose.flask-backup.yml
    docker-compose down
    echo 'Current system stopped and backed up'
"

# 2. Загружаем новые файлы
echo "📤 Uploading Supabase files..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    supabase-auth-config.js \
    supabase-login.html \
    docker-compose.supabase.yml \
    SUPABASE_MIGRATION_PLAN.md \
    $SERVER:$PROJECT_DIR/

# 3. Создаем Nginx конфигурацию
echo "🔧 Creating Nginx configuration..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "
    cd $PROJECT_DIR
    mkdir -p config/nginx
    
    cat > config/nginx/nginx-supabase.conf << 'EOF'
user nginx;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Логирование
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Основные настройки
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 100M;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    server {
        listen 80;
        listen 443 ssl http2;
        server_name srv853233.hstgr.cloud;
        
        # 🔐 Страница логина (Supabase)
        location = /login {
            alias /usr/share/nginx/html/login.html;
            try_files \$uri \$uri.html =404;
        }
        
        # 📄 Статические файлы
        location /static/ {
            alias /usr/share/nginx/html/static/;
            expires 1d;
            add_header Cache-Control \"public, immutable\";
        }
        
        # 🔧 Auth конфигурация
        location = /auth-config.js {
            alias /usr/share/nginx/html/auth-config.js;
            add_header Content-Type application/javascript;
        }
        
        # 🔬 OHIF Viewer - все остальные запросы
        location / {
            proxy_pass http://pacs_ohif_supabase:80;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \"upgrade\";
        }
        
        # 🏥 Orthanc DICOM-Web API
        location /orthanc/ {
            proxy_pass http://pacs_orthanc_server:8042/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

    echo 'Nginx configuration created'
"

# 4. Применяем новую конфигурацию
echo "🐳 Deploying new Docker setup..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "
    cd $PROJECT_DIR
    
    # Переименовываем docker-compose файл
    cp docker-compose.supabase.yml docker-compose.yml
    
    # Запускаем новую систему
    echo '=== Starting Supabase-based system ==='
    docker-compose up -d
    
    echo '=== Waiting for services to start ==='
    sleep 10
    
    echo '=== Checking service status ==='
    docker-compose ps
"

# 5. Проверяем результат
echo "🔍 Testing deployment..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "
    echo '=== Testing endpoints ==='
    curl -I -s https://srv853233.hstgr.cloud/login | head -1
    curl -I -s https://srv853233.hstgr.cloud/ | head -1
"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Open https://srv853233.hstgr.cloud/login"
echo "2. Register a new user with Supabase"
echo "3. Login and test OHIF viewer access"
echo ""
echo "🔄 ROLLBACK (if needed):"
echo "   ssh root@31.97.135.47 'cd /opt/clinton-pacs && docker-compose down && cp docker-compose.flask-backup.yml docker-compose.yml && docker-compose up -d'"
echo ""
echo "📊 MONITOR LOGS:"
echo "   ssh root@31.97.135.47 'cd /opt/clinton-pacs && docker-compose logs -f'" 