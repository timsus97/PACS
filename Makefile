# Klinika Pro PACS - Makefile
# Author: Tim Hunt (tr00x)
# Version: 1.0

.PHONY: help install start stop restart status logs clean backup restore update

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# Project info
PROJECT_NAME := "Klinika Pro PACS"
VERSION := "1.0"
AUTHOR := "Tim Hunt (tr00x)"

help: ## Показать справку по командам
	@echo -e "$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo -e "$(BLUE)║                    🏥 KLINIKA PRO PACS 🏥                    ║$(NC)"
	@echo -e "$(BLUE)║                  Команды управления v1.0                    ║$(NC)"
	@echo -e "$(BLUE)║                   Author: Tim Hunt (tr00x)                   ║$(NC)"
	@echo -e "$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo -e "$(YELLOW)📋 Доступные команды:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo -e "$(BLUE)🌐 Доступ к системе:$(NC)"
	@echo -e "  Приложение: $(GREEN)https://localhost$(NC)"
	@echo -e "  Вход:       $(GREEN)https://localhost/login$(NC)"
	@echo ""

install: ## Полная установка системы
	@echo -e "$(BLUE)🚀 Запуск автоматической установки...$(NC)"
	@chmod +x install.sh
	@./install.sh

start: ## Быстрый запуск системы
	@echo -e "$(BLUE)⚡ Быстрый запуск системы...$(NC)"
	@chmod +x quick-start.sh
	@./quick-start.sh

stop: ## Остановить все сервисы
	@echo -e "$(YELLOW)🛑 Остановка сервисов...$(NC)"
	@docker-compose down
	@echo -e "$(GREEN)✅ Сервисы остановлены$(NC)"

restart: ## Перезапустить систему
	@echo -e "$(YELLOW)🔄 Перезапуск системы...$(NC)"
	@docker-compose down
	@docker-compose up -d
	@echo -e "$(GREEN)✅ Система перезапущена$(NC)"

status: ## Показать статус всех сервисов
	@echo -e "$(BLUE)📊 Статус сервисов:$(NC)"
	@docker-compose ps

logs: ## Показать логи всех сервисов
	@echo -e "$(BLUE)📜 Логи системы:$(NC)"
	@docker-compose logs -f

logs-ohif: ## Показать логи OHIF Viewer
	@docker-compose logs -f ohif_viewer

logs-orthanc: ## Показать логи Orthanc DICOM Server
	@docker-compose logs -f orthanc

logs-auth: ## Показать логи Flask Auth Service
	@docker-compose logs -f flask_auth_service

logs-nginx: ## Показать логи Nginx Proxy
	@docker-compose logs -f nginx

logs-db: ## Показать логи PostgreSQL Database
	@docker-compose logs -f db_pacs

clean: ## Очистить систему (удалить образы и контейнеры)
	@echo -e "$(RED)🧹 Очистка системы...$(NC)"
	@docker-compose down --rmi all --volumes --remove-orphans
	@docker system prune -f
	@echo -e "$(GREEN)✅ Система очищена$(NC)"

backup: ## Создать резервную копию данных
	@echo -e "$(BLUE)💾 Создание резервной копии...$(NC)"
	@chmod +x backup.sh
	@./backup.sh

restore: ## Восстановить из резервной копии
	@echo -e "$(BLUE)📁 Восстановление из резервной копии...$(NC)"
	@echo "Список доступных резервных копий:"
	@ls -la backup/ 2>/dev/null || echo "Резервные копии не найдены"

build: ## Пересобрать все образы
	@echo -e "$(BLUE)🔨 Пересборка образов...$(NC)"
	@docker-compose build --no-cache
	@echo -e "$(GREEN)✅ Образы пересобраны$(NC)"

update: ## Обновить систему
	@echo -e "$(BLUE)⬆️ Обновление системы...$(NC)"
	@docker-compose pull
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo -e "$(GREEN)✅ Система обновлена$(NC)"

upload-test: ## Загрузить тестовые DICOM данные
	@echo -e "$(BLUE)📂 Загрузка тестовых данных...$(NC)"
	@chmod +x upload.sh
	@./upload.sh

health: ## Проверить здоровье системы
	@echo -e "$(BLUE)🏥 Проверка здоровья системы:$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Статус контейнеров:$(NC)"
	@docker-compose ps
	@echo ""
	@echo -e "$(YELLOW)Проверка доступности:$(NC)"
	@echo -n "OHIF Viewer: "
	@curl -s -k https://localhost/ > /dev/null && echo -e "$(GREEN)✅ OK$(NC)" || echo -e "$(RED)❌ FAIL$(NC)"
	@echo -n "Orthanc API: "
	@curl -s http://localhost:8042/system > /dev/null && echo -e "$(GREEN)✅ OK$(NC)" || echo -e "$(RED)❌ FAIL$(NC)"
	@echo -n "Flask Auth: "
	@curl -s http://localhost:5001/health > /dev/null && echo -e "$(GREEN)✅ OK$(NC)" || echo -e "$(RED)❌ FAIL$(NC)"

shell-db: ## Войти в базу данных PostgreSQL
	@docker-compose exec db_pacs psql -U orthanc_user -d orthanc

shell-orthanc: ## Войти в контейнер Orthanc
	@docker-compose exec orthanc sh

shell-ohif: ## Войти в контейнер OHIF
	@docker-compose exec ohif_viewer sh

shell-auth: ## Войти в контейнер Flask Auth
	@docker-compose exec flask_auth_service sh

dev: ## Режим разработки (показать логи в реальном времени)
	@echo -e "$(BLUE)🔧 Режим разработки...$(NC)"
	@docker-compose up

prod: ## Продакшн режим (фоновый запуск)
	@echo -e "$(BLUE)🏭 Продакшн режим...$(NC)"
	@docker-compose up -d
	@echo -e "$(GREEN)✅ Система запущена в фоновом режиме$(NC)"

info: ## Показать информацию о системе
	@echo -e "$(BLUE)ℹ️ Информация о системе:$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Проект:$(NC) $(PROJECT_NAME)"
	@echo -e "$(YELLOW)Версия:$(NC) $(VERSION)"
	@echo -e "$(YELLOW)Автор:$(NC) $(AUTHOR)"
	@echo ""
	@echo -e "$(YELLOW)Сервисы:$(NC)"
	@echo "  - OHIF Viewer (медицинский просмотрщик)"
	@echo "  - Orthanc DICOM Server (DICOM сервер)"
	@echo "  - Flask Auth Service (аутентификация)"
	@echo "  - PostgreSQL Database (база данных)"
	@echo "  - Nginx Reverse Proxy (прокси сервер)"
	@echo ""
	@echo -e "$(YELLOW)Порты:$(NC)"
	@echo "  - 443 (HTTPS) - Основное приложение"
	@echo "  - 80 (HTTP) - Редирект на HTTPS"
	@echo "  - 8042 - Orthanc Web Interface"
	@echo "  - 5001 - Flask Auth API"
	@echo ""
	@echo -e "$(YELLOW)Пользователи по умолчанию:$(NC)"
	@echo "  - admin/admin (Администратор)"
	@echo "  - doctor/doctor (Врач)"
	@echo "  - operator/operator (Оператор)"

# Development helpers
reset: clean install ## Полный сброс и переустановка

quick: stop start ## Быстрая перезагрузка

ports: ## Показать используемые порты
	@echo -e "$(BLUE)🔌 Используемые порты:$(NC)"
	@lsof -i :80,443,8042,5001,5432 2>/dev/null || echo "Порты свободны" 