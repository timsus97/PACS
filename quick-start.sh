#!/bin/bash

# Clinton Medical PACS - Quick Start Script
# Author: Tim Hunt (tr00x)
# Version: 1.0

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════╗"
    echo "║            🏥 CLINTON MEDICAL PACS 🏥             ║"
    echo "║               Быстрый Запуск                   ║"
    echo "╚═══════════════════════════════════════════════════╝"
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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker не запущен!"
        echo "Запустите Docker Desktop или systemctl start docker"
        exit 1
    fi
    print_success "Docker работает"
}

# Kill conflicting processes
kill_conflicting_processes() {
    print_step "Освобождение портов..."
    sudo lsof -ti:80 | xargs kill -9 2>/dev/null || true
    sudo lsof -ti:443 | xargs kill -9 2>/dev/null || true
    lsof -ti:8042 | xargs kill -9 2>/dev/null || true
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    print_success "Порты освобождены"
}

# Start services
start_services() {
    print_step "Запуск сервисов..."
    docker-compose up -d
    print_success "Сервисы запущены!"
}

# Wait for services
wait_for_services() {
    print_step "Ожидание готовности сервисов..."
    
    echo -n "Проверка"
    for i in {1..15}; do
        echo -n "."
        sleep 2
        
        if curl -s -k https://srv853233.hstgr.cloud/ > /dev/null 2>&1; then
            echo ""
            print_success "Система готова!"
            return
        fi
    done
    
    echo ""
    print_error "Сервисы все еще запускаются. Проверьте: docker-compose ps"
}

# Show access info
show_access_info() {
    echo ""
    echo -e "${GREEN}🎉 Система запущена!${NC}"
    echo ""
    echo -e "${BLUE}📱 Доступ:${NC}"
    echo -e "   🌐 Приложение: ${GREEN}https://srv853233.hstgr.cloud${NC}"
    echo -e "   🔐 Вход:       ${GREEN}https://srv853233.hstgr.cloud/login${NC}"
    echo ""
    echo -e "${BLUE}🔑 Пользователи:${NC}"
    echo -e "   admin/admin, doctor/doctor, operator/operator"
    echo ""
}

main() {
    print_banner
    check_docker
    kill_conflicting_processes
    start_services
    wait_for_services
    show_access_info
}

main "$@" 