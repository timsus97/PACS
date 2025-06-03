#!/bin/bash

# Clinton Medical PACS - DICOM Test Data Upload Script
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
ORTHANC_URL="${ORTHANC_URL:-http://localhost:8042}"
ORTHANC_USER="${ORTHANC_USER:-admin_pacs}"
ORTHANC_PASS="${ORTHANC_PASS:-change_this_very_secret_password_for_orthanc_admin}"
TEST_DATA_DIR="orthanc/dicom-test-data"

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  🏥 CLINTON MEDICAL PACS 🏥                  ║"
    echo "║               Загрузка Тестовых DICOM Данных               ║"
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

# Check if Orthanc is running
check_orthanc() {
    print_step "Проверка доступности Orthanc..."
    
    if ! curl -s --connect-timeout 5 "$ORTHANC_URL/system" > /dev/null; then
        print_error "Orthanc недоступен по адресу $ORTHANC_URL"
        echo "Убедитесь что:"
        echo "  1. Docker контейнеры запущены: docker-compose ps"
        echo "  2. Orthanc сервис здоров: docker-compose logs orthanc"
        echo "  3. Порт 8042 доступен: curl http://localhost:8042/system"
    exit 1
fi

    print_success "Orthanc доступен"
}

# Create test data directory
create_test_data_dir() {
    print_step "Создание директории для тестовых данных..."
    mkdir -p "$TEST_DATA_DIR"
    print_success "Директория $TEST_DATA_DIR создана"
}

# Download sample DICOM files
download_test_files() {
    print_step "Загрузка образцов DICOM файлов..."
    
    cd "$TEST_DATA_DIR"
    
    # Sample DICOM files from public repositories
    declare -A test_files=(
        ["CT_small.dcm"]="https://github.com/darcymason/pydicom/raw/main/tests/test_files/CT_small.dcm"
        ["MR_small.dcm"]="https://github.com/darcymason/pydicom/raw/main/tests/test_files/MR_small.dcm"
        ["US_small.dcm"]="https://github.com/darcymason/pydicom/raw/main/tests/test_files/US_small.dcm" 
        ["XR_small.dcm"]="https://github.com/darcymason/pydicom/raw/main/tests/test_files/XR_small.dcm"
        ["CR_small.dcm"]="https://github.com/darcymason/pydicom/raw/main/tests/test_files/CR_small.dcm"
    )
    
    for filename in "${!test_files[@]}"; do
        if [ ! -f "$filename" ]; then
            echo -n "  Скачивание $filename... "
            if wget -q "${test_files[$filename]}" -O "$filename" 2>/dev/null || curl -s -L "${test_files[$filename]}" -o "$filename" 2>/dev/null; then
                echo -e "${GREEN}✓${NC}"
            else
                echo -e "${RED}✗${NC}"
                print_error "Не удалось скачать $filename"
            fi
        else
            echo -e "  $filename уже существует ${GREEN}✓${NC}"
        fi
    done
    
    cd - > /dev/null
    print_success "Тестовые файлы подготовлены"
}

# Upload DICOM files to Orthanc
upload_files() {
    print_step "Загрузка DICOM файлов в Orthanc..."
    
    local uploaded=0
    local failed=0
    
    if [ ! -d "$TEST_DATA_DIR" ]; then
        print_error "Директория $TEST_DATA_DIR не найдена"
        return 1
    fi
    
    # Find and upload all DICOM files
    for file in "$TEST_DATA_DIR"/*.dcm; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo -n "  Загрузка $filename... "
            
            if curl -s -u "$ORTHANC_USER:$ORTHANC_PASS" \
                   -X POST \
                   -H "Content-Type: application/dicom" \
                   --data-binary "@$file" \
                   "$ORTHANC_URL/instances" > /dev/null; then
                echo -e "${GREEN}✓${NC}"
                ((uploaded++))
            else
                echo -e "${RED}✗${NC}"
                ((failed++))
            fi
        fi
    done
    
    if [ $uploaded -gt 0 ]; then
        print_success "Загружено $uploaded DICOM файлов"
    fi
    
    if [ $failed -gt 0 ]; then
        print_error "Не удалось загрузить $failed файлов"
    fi
    
    if [ $uploaded -eq 0 ]; then
        print_error "Не найдено DICOM файлов для загрузки"
        return 1
    fi
}

# Show statistics
show_statistics() {
    print_step "Получение статистики Orthanc..."
    
    local stats
    if stats=$(curl -s -u "$ORTHANC_USER:$ORTHANC_PASS" "$ORTHANC_URL/statistics" 2>/dev/null); then
        echo ""
        echo -e "${BLUE}📊 Статистика Orthanc:${NC}"
        echo "$stats" | python3 -m json.tool 2>/dev/null || echo "$stats"
    else
        print_error "Не удалось получить статистику"
    fi
}

# Show access information
show_access_info() {
    echo ""
    echo -e "${GREEN}🎉 Тестовые данные успешно загружены!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Доступ к системе:${NC}"
    echo -e "  Основное приложение: ${GREEN}https://srv853233.hstgr.cloud${NC}"
    echo -e "  Страница входа:      ${GREEN}https://srv853233.hstgr.cloud/login${NC}"
    echo -e "  Orthanc интерфейс:   ${GREEN}http://srv853233.hstgr.cloud:8042${NC}"
    echo ""
    echo -e "${BLUE}🔑 Учетные данные:${NC}"
    echo -e "  admin/admin, doctor/doctor, operator/operator"
    echo ""
    echo -e "${BLUE}📋 Следующие шаги:${NC}"
    echo "  1. Откройте https://srv853233.hstgr.cloud"
    echo "  2. Войдите как doctor/doctor"
    echo "  3. Выберите исследование для просмотра"
    echo "  4. Создайте врачебный отчет"
    echo ""
}

# Main function
main() {
    print_banner
    check_orthanc
    create_test_data_dir
    download_test_files
    upload_files
    show_statistics
    show_access_info
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 