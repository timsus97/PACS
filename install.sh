#!/bin/bash

# Klinika Pro PACS - Automatic Installation Script
# Author: Tim Hunt (tr00x)
# Version: 1.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Klinika Pro PACS"
PROJECT_VERSION="1.0"
AUTHOR="Tim Hunt (tr00x)"

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🏥 KLINIKA PRO PACS 🏥                    ║"
    echo "║              Автоматическая Установка v1.0                  ║"
    echo "║                   Author: Tim Hunt (tr00x)                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print step
print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Print success
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Print warning
print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Print error
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Не запускайте этот скрипт от имени root!"
        print_warning "Используйте обычного пользователя с правами sudo"
        exit 1
    fi
}

# Detect OS
detect_os() {
    print_step "Определение операционной системы..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/ubuntu-release ] || [ -f /etc/debian_version ]; then
            DISTRO="debian"
            PKG_MANAGER="apt"
        elif [ -f /etc/redhat-release ] || [ -f /etc/centos-release ]; then
            DISTRO="redhat"
            PKG_MANAGER="yum"
        elif [ -f /etc/arch-release ]; then
            DISTRO="arch"
            PKG_MANAGER="pacman"
        else
            DISTRO="unknown"
            PKG_MANAGER="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        DISTRO="macos"
        PKG_MANAGER="brew"
    else
        OS="unknown"
        DISTRO="unknown"
        PKG_MANAGER="unknown"
    fi
    
    print_success "Обнаружена ОС: $OS ($DISTRO)"
}

# Check system requirements
check_requirements() {
    print_step "Проверка системных требований..."
    
    # Check RAM
    if [[ "$OS" == "linux" ]]; then
        TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
    elif [[ "$OS" == "macos" ]]; then
        TOTAL_RAM=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
    fi
    
    if [ "$TOTAL_RAM" -lt 8 ]; then
        print_warning "Рекомендуется минимум 8GB RAM. Обнаружено: ${TOTAL_RAM}GB"
    else
        print_success "RAM: ${TOTAL_RAM}GB ✓"
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df -h . | awk 'NR==2{print $4}' | sed 's/[^0-9]//g')
    if [ "$AVAILABLE_SPACE" -lt 100 ]; then
        print_warning "Рекомендуется минимум 100GB свободного места"
    else
        print_success "Свободное место: достаточно ✓"
    fi
}

# Install Docker
install_docker() {
    print_step "Проверка и установка Docker..."
    
    if command -v docker &> /dev/null; then
        print_success "Docker уже установлен: $(docker --version)"
        return
    fi
    
    case $PKG_MANAGER in
        "apt")
            print_step "Установка Docker на Debian/Ubuntu..."
            sudo apt update
            sudo apt install -y ca-certificates curl gnupg lsb-release
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt update
            sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        "yum")
            print_step "Установка Docker на RedHat/CentOS..."
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        "brew")
            print_step "Установка Docker на macOS..."
            brew install --cask docker
            print_warning "После установки запустите Docker Desktop из Applications"
            ;;
        *)
            print_error "Неподдерживаемая система. Установите Docker вручную: https://docs.docker.com/get-docker/"
            exit 1
            ;;
    esac
    
    # Add user to docker group (Linux only)
    if [[ "$OS" == "linux" ]]; then
        sudo usermod -aG docker $USER
        print_warning "Перелогиньтесь или выполните: newgrp docker"
    fi
    
    print_success "Docker установлен успешно!"
}

# Install Docker Compose
install_docker_compose() {
    print_step "Проверка Docker Compose..."
    
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        print_success "Docker Compose уже установлен"
        return
    fi
    
    if [[ "$OS" == "linux" ]]; then
        print_step "Установка Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose установлен!"
    fi
}

# Setup environment
setup_environment() {
    print_step "Настройка окружения..."
    
    # Create .env file if not exists
    if [ ! -f .env ]; then
        print_step "Создание файла конфигурации .env..."
        cat > .env << EOF
# Klinika Pro PACS Configuration
# Generated automatically by install.sh

# Database Configuration
POSTGRES_DB=orthanc
POSTGRES_USER=orthanc_user
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Orthanc Configuration
ORTHANC_USERNAME=admin_pacs
ORTHANC_PASSWORD=$(openssl rand -base64 24)

# Flask Authentication
FLASK_AUTH_SECRET_KEY=$(openssl rand -base64 48)
JWT_SECRET_KEY=$(openssl rand -base64 48)
JWT_ACCESS_TOKEN_EXPIRES_HOURS_DOCTOR_OPERATOR=8
JWT_ACCESS_TOKEN_EXPIRES_HOURS_ADMIN=24

# Network Configuration
NGINX_PORT_HTTP=80
NGINX_PORT_HTTPS=443

# Timezone
TZ=UTC

# Generated on: $(date)
# Version: 1.0
# Author: Tim Hunt (tr00x)
EOF
        print_success "Файл .env создан с безопасными паролями"
    else
        print_success "Файл .env уже существует"
    fi
}

# Generate SSL certificates
generate_ssl() {
    print_step "Генерация SSL сертификатов..."
    
    mkdir -p config/ssl
    
    if [ ! -f config/ssl/klinika-pacs.crt ]; then
        print_step "Создание самоподписанного SSL сертификата..."
        
        # Create OpenSSL config
        cat > config/ssl/openssl.cnf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=RU
ST=Moscow
L=Moscow
O=Klinika Pro
OU=IT Department
CN=localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
        
        # Generate private key and certificate
        openssl req -x509 -newkey rsa:4096 -keyout config/ssl/klinika-pacs.key -out config/ssl/klinika-pacs.crt -days 365 -nodes -config config/ssl/openssl.cnf
        
        # Set permissions
        chmod 600 config/ssl/klinika-pacs.key
        chmod 644 config/ssl/klinika-pacs.crt
        
        print_success "SSL сертификат создан"
    else
        print_success "SSL сертификат уже существует"
    fi
}

# Create required directories
create_directories() {
    print_step "Создание необходимых директорий..."
    
    mkdir -p logs/{nginx,orthanc,flask_auth,postgres,ohif}
    mkdir -p orthanc/dicom-test-data
    mkdir -p backup
    
    print_success "Директории созданы"
}

# Download test DICOM data
download_test_data() {
    print_step "Загрузка тестовых DICOM данных..."
    
    if [ ! "$(ls -A orthanc/dicom-test-data/)" ]; then
        if command -v wget &> /dev/null; then
            # Download sample DICOM files
            cd orthanc/dicom-test-data
            wget -q "https://github.com/darcymason/pydicom/raw/main/tests/test_files/CT_small.dcm" || true
            wget -q "https://github.com/darcymason/pydicom/raw/main/tests/test_files/MR_small.dcm" || true
            cd ../..
            print_success "Тестовые данные загружены"
        else
            print_warning "wget не найден, тестовые данные нужно добавить вручную"
        fi
    else
        print_success "Тестовые данные уже есть"
    fi
}

# Build and start services
start_services() {
    print_step "Сборка и запуск сервисов..."
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Kill processes on required ports
    print_step "Освобождение портов..."
    sudo lsof -ti:80 | xargs kill -9 2>/dev/null || true
    sudo lsof -ti:443 | xargs kill -9 2>/dev/null || true
    lsof -ti:8042 | xargs kill -9 2>/dev/null || true
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    
    # Build and start
    print_step "Сборка образов..."
    docker-compose build --no-cache
    
    print_step "Запуск сервисов..."
    docker-compose up -d
    
    print_success "Сервисы запущены!"
}

# Wait for services
wait_for_services() {
    print_step "Ожидание готовности сервисов..."
    
    echo -n "Проверка готовности"
    for i in {1..30}; do
        echo -n "."
        sleep 2
        
        # Check if services are ready
        if curl -s -k https://localhost/ > /dev/null 2>&1; then
            echo ""
            print_success "Все сервисы готовы!"
            return
        fi
    done
    
    echo ""
    print_warning "Сервисы все еще запускаются, проверьте статус: docker-compose ps"
}

# Print final instructions
print_final_instructions() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 УСТАНОВКА ЗАВЕРШЕНА! 🎉                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📱 Доступ к системе:${NC}"
    echo -e "   🌐 Основное приложение: ${GREEN}https://localhost${NC}"
    echo -e "   🔐 Страница входа:      ${GREEN}https://localhost/login${NC}"
    echo -e "   🏥 Orthanc интерфейс:   ${GREEN}http://localhost:8042${NC}"
    echo ""
    echo -e "${BLUE}🔑 Учетные данные по умолчанию:${NC}"
    echo -e "   👨‍💼 Администратор: ${GREEN}admin / admin${NC}"
    echo -e "   👩‍⚕️ Врач:          ${GREEN}doctor / doctor${NC}"
    echo -e "   👨‍💻 Оператор:      ${GREEN}operator / operator${NC}"
    echo ""
    echo -e "${BLUE}🛠️ Полезные команды:${NC}"
    echo -e "   📊 Статус сервисов:     ${YELLOW}docker-compose ps${NC}"
    echo -e "   📜 Просмотр логов:      ${YELLOW}docker-compose logs -f${NC}"
    echo -e "   🔄 Перезапуск:          ${YELLOW}docker-compose restart${NC}"
    echo -e "   ⏹️  Остановка:           ${YELLOW}docker-compose down${NC}"
    echo -e "   📂 Загрузить тест данные: ${YELLOW}./upload.sh${NC}"
    echo ""
    echo -e "${PURPLE}📚 Документация: README_QUICK_START.md${NC}"
    echo -e "${PURPLE}🏗️ Архитектура: ARCHITECTURE.md${NC}"
    echo -e "${PURPLE}⚙️ Технологии: TECH_STACK.md${NC}"
    echo ""
    echo -e "${GREEN}Система готова к использованию! 🚀${NC}"
}

# Main installation function
main() {
    print_banner
    
    check_root
    detect_os
    check_requirements
    install_docker
    install_docker_compose
    setup_environment
    generate_ssl
    create_directories
    download_test_data
    start_services
    wait_for_services
    print_final_instructions
}

# Run installation
main "$@" 