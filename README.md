# 🏥 Clinton Medical PACS - Медицинская Система Архивирования Изображений

<div align="center">

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![OHIF](https://img.shields.io/badge/OHIF-Viewer-blue?style=for-the-badge)](https://ohif.org)
[![Orthanc](https://img.shields.io/badge/Orthanc-DICOM-green?style=for-the-badge)](https://orthanc-server.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Полноценная PACS система с многоязычной поддержкой и врачебными отчетами**

[🚀 Быстрая Установка](#-быстрая-установка-1-команда) •
[📖 Документация](#-документация) •
[🎯 Возможности](#-возможности) •
[📷 Скриншоты](#-скриншоты) •
[💻 Поддержка](#-поддержка)

</div>

---

## 🚀 **БЫСТРАЯ УСТАНОВКА (1 команда)**

```bash
# Автоматическая установка для Linux/macOS
bash <(curl -sSL https://raw.githubusercontent.com/your-repo/clinton-medical-pacs/main/install.sh)
```

**Готово!** Откройте https://localhost

### 🔑 Входные данные:
- **Администратор**: `admin` / `admin`
- **Врач**: `doctor` / `doctor`  
- **Оператор**: `operator` / `operator`

---

## 📋 **Альтернативная Установка**

### Шаг 1: Скачать проект
```bash
git clone https://github.com/your-repo/clinton-medical-pacs.git
cd clinton-medical-pacs
```

### Шаг 2: Запустить установку
```bash
chmod +x install.sh
./install.sh
```

### Шаг 3: Готово!
Система автоматически:
- ✅ Установит все зависимости
- ✅ Сгенерирует безопасные пароли  
- ✅ Создаст SSL сертификаты
- ✅ Запустит все сервисы
- ✅ Загрузит тестовые данные

---

## 🎯 **Возможности**

### 🏥 **Медицинские Функции**
- **DICOM Просмотрщик**: Полноценный просмотр медицинских изображений
- **MPR & 3D**: Многоплоскостная реконструкция и 3D рендеринг
- **Инструменты**: Измерения, аннотации, zoom, windowing
- **Модальности**: CT, MRI, Рентген, УЗИ, Эндоскопия
- **Врачебные Отчеты**: Создание, редактирование, PDF экспорт

### 🌍 **Многоязычность**
- **5 языков**: Английский, Русский, Испанский, Французский, Немецкий
- **Автоопределение**: Язык интерфейса меняется автоматически
- **PDF отчеты**: На выбранном языке с локализацией дат

### 👥 **Управление Пользователями**
- **3 роли**: Администратор, Врач, Оператор
- **Права доступа**: Гибкая настройка разрешений
- **JWT токены**: Безопасная аутентификация
- **Аудит**: Полное логирование действий

### 🔒 **Безопасность**
- **HTTPS**: SSL/TLS шифрование
- **Ролевой доступ**: RBAC система
- **Аудит логи**: Полная трассировка действий
- **Безопасные пароли**: Автогенерация при установке

---

## 🛠️ **Управление Системой**

### Простые команды через Make:
```bash
make help           # Показать все команды
make start          # Запустить систему
make stop           # Остановить систему  
make restart        # Перезапустить
make status         # Показать статус
make logs           # Показать логи
make health         # Проверить здоровье
make backup         # Создать бэкап
```

### Или Docker Compose:
```bash
docker-compose ps          # Статус
docker-compose logs -f     # Логи
docker-compose restart     # Перезапуск
```

---

## 📊 **Архитектура**

```
Internet → Nginx Proxy → OHIF Viewer (React)
                      → Flask Auth API (Python)
                      → Orthanc DICOM Server (C++) → PostgreSQL
```

### Технологический стек:
- **Frontend**: OHIF Viewer v3 + React + 1900+ строк кастомизаций
- **Backend**: Orthanc DICOM Server v24.10.1 + PostgreSQL 15
- **Auth**: Flask + Python + JWT + RBAC
- **Proxy**: Nginx + SSL/TLS  
- **Container**: Docker + Docker Compose

---

## 🌐 **Доступ к Системе**

| Сервис | URL | Описание |
|--------|-----|----------|
| **Основное приложение** | https://localhost | OHIF медицинский просмотрщик |
| **Страница входа** | https://localhost/login | Аутентификация пользователей |
| **Orthanc интерфейс** | http://localhost:8042 | DICOM сервер управление |
| **API аутентификации** | http://localhost:5001 | Flask REST API |

---

## 📖 **Документация**

| Документ | Описание |
|----------|----------|
| [INSTALL.md](INSTALL.md) | 📋 Подробное руководство по установке |
| [README_QUICK_START.md](README_QUICK_START.md) | ⚡ Быстрый старт |
| [TECH_STACK.md](TECH_STACK.md) | 🔧 Технический стек |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 🏗️ Архитектура системы |
| [*_RU.md](TECH_STACK_RU.md) | 🇷🇺 Русские версии документов |

---

## 💻 **Системные Требования**

### Минимальные:
- **OS**: Linux, macOS, Windows (с WSL2)
- **RAM**: 8 ГБ
- **CPU**: 2+ ядра  
- **Диск**: 100 ГБ
- **Docker**: 20.10+

### Рекомендуемые:
- **RAM**: 16+ ГБ
- **CPU**: 4+ ядра
- **Диск**: 500+ ГБ (SSD)
- **Сеть**: 1 Гбит/с

---

## 🆘 **Поддержка**

### Быстрая диагностика:
```bash
make health         # Проверить систему
make logs           # Посмотреть логи
docker-compose ps   # Статус контейнеров
```

### Частые проблемы:
- **Порты заняты**: `make ports` для проверки
- **Docker не запущен**: Запустите Docker Desktop
- **SSL предупреждения**: Нормально для self-signed сертификатов

### Контакты:
- **Автор**: Tim Hunt (tr00x)
- **GitHub**: [Issues](https://github.com/timsus97/PACS/issues)
- **Email**: tavci57@gmail.com
- **Telegram**: @tr00x

---

## 📄 **Лицензия**

MIT License - Clinton Medical PACS  
Copyright © 2024 Tim Hunt (tr00x)

Разрешается свободное использование, модификация и распространение данного программного обеспечения.
Подробности смотрите в файле [LICENSE](LICENSE).

---

## 🌟 **Скриншоты**

📷 **[Полная галерея скриншотов →](screenshots/README.md)**

<div align="center">

### 📋 Список Исследований
![Study List](screenshots/01_study_list.svg)
*Главный интерфейс с двумя загруженными исследованиями (МРТ и КТ) и расширенными фильтрами*

### 🖥️ OHIF Просмотрщик с Врачебными Отчетами
![OHIF Viewer with Reports](screenshots/02_ohif_viewer_reports.svg)
*Продвинутый DICOM просмотрщик с панелью создания медицинских отчетов на русском языке*

### 🌍 Многоязычная Поддержка
![Language Selector](screenshots/03_language_selector.svg)
*Переключение между 5 языками с демонстрацией локализации интерфейса*

### 🔐 Система Авторизации
![Login Page](screenshots/04_login_page.svg)
*Профессиональная страница входа с ролевой системой доступа*

### 📄 Экспорт PDF Отчетов
![PDF Export](screenshots/05_pdf_export.svg)
*Система генерации профессиональных медицинских отчетов в PDF формате*

### 🏗️ Архитектура Системы
![System Architecture](screenshots/06_system_architecture.svg)
*Полная диаграмма микросервисной архитектуры с Docker Compose*

</div>

**Основные возможности на скриншотах:**
- ✅ Профессиональный медицинский интерфейс с брендингом Clinton Medical
- ✅ Система врачебных отчетов с богатым текстовым редактором
- ✅ Экспорт в PDF с подписью врача и информацией о пациенте
- ✅ Полная многоязычная локализация (EN, RU, ES, FR, DE)
- ✅ Ролевая система доступа для врачей и администраторов
- ✅ DICOM совместимость и поддержка различных модальностей
- ✅ Микросервисная архитектура с автоматическим развертыванием
- ✅ Профессиональная система безопасности и аудита

---

<div align="center">

**🏥 Сделано с ❤️ для медицинских учреждений**

[⭐ Поставьте звезду](https://github.com/your-repo/clinton-medical-pacs) • 
[🍴 Форкните](https://github.com/your-repo/clinton-medical-pacs/fork) • 
[📢 Поделитесь](https://twitter.com/intent/tweet?text=Check%20out%20Clinton%20Medical%20PACS!)

</div>

## Latest Update: Dashboard Removal and Direct OHIF Access

This repository contains a complete PACS (Picture Archiving and Communication System) solution with OHIF viewer, Flask authentication, and custom branding.

### Key Features After Update
- **No Dashboard**: Direct access to OHIF viewer after login
- **Custom Branding**: Clinton Medical branding throughout the system
- **Secure Authentication**: Flask-based login system
- **DICOM Support**: Full DICOM viewing and management
- **Responsive Design**: Modern, mobile-friendly interface

### System Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │   Flask     │    │    OHIF     │
│  (Proxy)    │◄──►│   (Auth)    │◄──►│  (Viewer)   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  SSL/HTTPS  │    │  Sessions   │    │   Orthanc   │
│ Certificates│    │ Management  │    │  (DICOM)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Deployment Information
- **Server**: 31.97.135.47 (srv853233.hstgr.cloud)
- **OS**: Ubuntu 22.04
- **Resources**: 16GB RAM, 4 CPU, 200GB disk
- **Network**: Docker internal network (172.18.0.x)

### Container Services
1. **pacs_ohif_supabase**: Custom OHIF viewer with Clinton Medical branding
2. **pacs_flask_auth**: Flask authentication service
3. **nginx_proxy**: SSL proxy and load balancer
4. **pacs_orthanc**: DICOM server and database

### Key Changes Made

#### 1. Dashboard Removal
- Removed dashboard completely
- Direct redirect from login to OHIF viewer (/)
- Modified Flask routes to handle root path redirects
- Updated nginx configuration for proper routing

#### 2. Authentication Flow
```
Login (/login) → Authentication → Direct to OHIF (/)
```

#### 3. Custom Branding Implementation
- **Header**: "Clinton Medical PACS" instead of OHIF branding
- **Logo**: Custom Clinton Medical logo
- **Colors**: Professional medical theme
- **Hidden Elements**: Investigational use notices removed

#### 4. Configuration Files

**Flask App (flask_auth_service/app.py)**
- Added root route redirects
- Removed dashboard route
- Updated login success handling

**OHIF Config (config/ohif/app-config.js)**
- Updated server URLs to match domain
- Added dynamic configuration support
- Removed extension duplication errors

**Nginx Config (config/nginx/nginx.conf)**
- Root path serves OHIF directly
- Updated CSP headers for custom fonts
- Added CORS support for DICOM API
- Large file support (2GB max)

**Customizations (config/ohif/customizations.js)**
- Disabled auto-authentication checks
- Custom branding CSS and JavaScript
- MutationObserver for dynamic text replacement
- Console spam reduction

### DICOM Connection Settings

For connecting medical devices (e.g., Esaote MyLab):

```
Server IP: 31.97.135.47
Domain: srv853233.hstgr.cloud
DICOM Port: 4242
AE Title: ORTHANC
Called AE: ORTHANC
Local AE: ESAOTE (or your device AE)
Transfer Syntax: Implicit VR Little Endian
Max File Size: 2GB
Timeout: 300 seconds
```

### Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/timsus97/PACS.git
   cd PACS
   ```

2. **Deploy to Server**
   ```bash
   docker-compose up -d
   ```

3. **Access System**
   - Login: https://srv853233.hstgr.cloud/login
   - Direct OHIF: https://srv853233.hstgr.cloud/
   - Orthanc Admin: https://srv853233.hstgr.cloud:8042

### Security Features
- SSL/TLS encryption
- Session-based authentication
- CSRF protection
- Content Security Policy headers
- Secure cookie settings

### File Upload Support
- Maximum file size: 2GB
- Timeout settings: 300 seconds
- Support for large DICOM studies
- Chunked upload handling

### Troubleshooting

**Common Issues:**
1. **Login Loops**: Check nginx root route configuration
2. **Font Loading**: Verify CSP font-src headers
3. **DICOM Connection**: Ensure port 4242 is accessible
4. **Large Files**: Check nginx upload limits

**Container Restart:**
```bash
docker restart pacs_ohif_supabase pacs_flask_auth nginx_proxy
```

### Development Notes

**Local Development:**
- All configuration files are mounted as volumes
- Changes to configs require container restart
- Test locally before deploying to production

**Custom Branding:**
- CSS rules use !important to override React components
- JavaScript MutationObserver for dynamic content
- Index.html directly modified for aggressive branding

### Support

For technical support or questions:
- Check container logs: `docker logs [container_name]`
- Verify network connectivity between containers
- Ensure all environment variables are set correctly

---

**Last Updated**: January 2025
**Version**: 2.0 (Dashboard Removal Update)
**Tested On**: Ubuntu 22.04, Docker 24.x 