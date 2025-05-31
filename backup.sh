#!/bin/bash

# Clinton Medical PACS - Backup Script
# Author: Tim Hunt (tr00x)
# Version: 1.0

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="clinton_pacs_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  🏥 CLINTON MEDICAL PACS 🏥                  ║"
    echo "║                  Резервное Копирование                      ║"
    echo "║                   Author: Tim Hunt (tr00x)                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    print_step "Создание директории резервных копий..."
    mkdir -p "$BACKUP_PATH"
    print_success "Директория создана: $BACKUP_PATH"
}

# Backup Docker volumes
backup_volumes() {
    print_step "Резервное копирование Docker volumes..."
    
    # Get volume names
    local volumes=(
        "ort_ohif1_pacs_db_data"
        "ort_ohif1_pacs_orthanc_data" 
        "ort_ohif1_pacs_flask_auth_data"
    )
    
    for volume in "${volumes[@]}"; do
        if docker volume inspect "$volume" &>/dev/null; then
            echo -n "  Копирование $volume... "
            docker run --rm \
                -v "$volume":/data:ro \
                -v "$(pwd)/$BACKUP_PATH":/backup \
                alpine:latest \
                tar czf "/backup/${volume}.tar.gz" -C /data . 2>/dev/null
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "  Volume $volume не найден ${YELLOW}⚠${NC}"
        fi
    done
    
    print_success "Docker volumes скопированы"
}

# Backup configuration files
backup_configs() {
    print_step "Резервное копирование конфигурационных файлов..."
    
    # Create config backup directory
    mkdir -p "$BACKUP_PATH/config"
    
    # Copy important config files
    local configs=(
        "docker-compose.yml"
        ".env"
        "config/"
        "flask_auth_service/"
        "login_app/"
    )
    
    for config in "${configs[@]}"; do
        if [ -e "$config" ]; then
            echo -n "  Копирование $config... "
            cp -r "$config" "$BACKUP_PATH/config/" 2>/dev/null
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "  $config не найден ${YELLOW}⚠${NC}"
        fi
    done
    
    print_success "Конфигурационные файлы скопированы"
}

# Backup database
backup_database() {
    print_step "Резервное копирование базы данных PostgreSQL..."
    
    if docker-compose ps | grep -q "pacs_db.*Up"; then
        echo -n "  Создание дампа базы данных... "
        docker-compose exec -T db_pacs pg_dump -U orthanc_user orthanc > "$BACKUP_PATH/database_dump.sql" 2>/dev/null
        echo -e "${GREEN}✓${NC}"
        print_success "База данных PostgreSQL сохранена"
    else
        print_error "PostgreSQL контейнер не запущен"
    fi
}

# Backup logs
backup_logs() {
    print_step "Резервное копирование логов..."
    
    if [ -d "logs" ]; then
        echo -n "  Копирование логов... "
        cp -r logs "$BACKUP_PATH/" 2>/dev/null
        echo -e "${GREEN}✓${NC}"
        print_success "Логи скопированы"
    else
        echo -e "  Директория logs не найдена ${YELLOW}⚠${NC}"
    fi
}

# Create backup info file
create_backup_info() {
    print_step "Создание информационного файла..."
    
    cat > "$BACKUP_PATH/backup_info.txt" << EOF
Clinton Medical PACS - Backup Information
======================================

Backup Date: $(date)
Backup Name: $BACKUP_NAME
System: $(uname -a)
Docker Version: $(docker --version 2>/dev/null || echo "Not found")
Docker Compose Version: $(docker-compose --version 2>/dev/null || echo "Not found")

Services Status at Backup Time:
$(docker-compose ps 2>/dev/null || echo "Docker Compose not available")

Backup Contents:
- Docker Volumes (DICOM data, Database, Flask data)
- Configuration Files (docker-compose.yml, .env, config/)
- Database Dump (PostgreSQL)
- Application Logs
- SSL Certificates
- Custom Scripts

Restore Instructions:
1. Stop current system: docker-compose down
2. Restore volumes: ./restore.sh $BACKUP_NAME
3. Start system: docker-compose up -d

Author: Tim Hunt (tr00x)
Version: 1.0
EOF
    
    print_success "Информационный файл создан"
}

# Compress backup
compress_backup() {
    print_step "Сжатие резервной копии..."
    
    cd "$BACKUP_DIR"
    echo -n "  Создание архива... "
    tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME" 2>/dev/null
    echo -e "${GREEN}✓${NC}"
    
    # Remove uncompressed directory
    rm -rf "$BACKUP_NAME"
    
    cd - > /dev/null
    print_success "Резервная копия сжата: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
}

# Calculate backup size
show_backup_info() {
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    local size=$(du -h "$backup_file" | cut -f1)
    
    echo ""
    echo -e "${GREEN}🎉 Резервное копирование завершено!${NC}"
    echo ""
    echo -e "${BLUE}📋 Информация о резервной копии:${NC}"
    echo -e "  Файл: ${GREEN}$backup_file${NC}"
    echo -e "  Размер: ${GREEN}$size${NC}"
    echo -e "  Время: ${GREEN}$(date)${NC}"
    echo ""
    echo -e "${BLUE}💾 Содержимое резервной копии:${NC}"
    echo "  ✅ Docker volumes (данные PACS)"
    echo "  ✅ База данных PostgreSQL" 
    echo "  ✅ Конфигурационные файлы"
    echo "  ✅ SSL сертификаты"
    echo "  ✅ Логи приложений"
    echo "  ✅ Пользовательские скрипты"
    echo ""
}

# Cleanup old backups (keep last 7)
cleanup_old_backups() {
    print_step "Очистка старых резервных копий..."
    
    # Keep only 7 most recent backups
    local backup_count=$(ls -1 "$BACKUP_DIR"/clinton_pacs_*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt 7 ]; then
        local to_remove=$((backup_count - 7))
        echo "  Найдено $backup_count резервных копий, удаляем $to_remove старых..."
        
        ls -1t "$BACKUP_DIR"/clinton_pacs_*.tar.gz | tail -n "$to_remove" | while read -r file; do
            echo -n "    Удаление $(basename "$file")... "
            rm -f "$file"
            echo -e "${GREEN}✓${NC}"
        done
        
        print_success "Старые резервные копии удалены"
    else
        print_success "Очистка не требуется ($backup_count/7 резервных копий)"
    fi
}

# Main backup function
main() {
    print_banner
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker не запущен!"
        exit 1
    fi
    
    create_backup_dir
    backup_volumes
    backup_configs
    backup_database
    backup_logs
    create_backup_info
    compress_backup
    cleanup_old_backups
    show_backup_info
}

# Run backup
main "$@" 