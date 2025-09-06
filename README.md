<div align="center">
# 🇺🇸 ENGLISH VERSION

<div align="center">

# 🏥 Clinton Medical PACS

**Professional Picture Archiving and Communication System**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![DICOM](https://img.shields.io/badge/DICOM-compliant-orange.svg)](https://www.dicomstandard.org/)
[![OHIF](https://img.shields.io/badge/OHIF-3.8+-purple.svg)](https://ohif.org/)

*Modern PACS system based on microservice architecture with web interface for managing DICOM images, reports and patients.*

</div>

## 📸 Screenshots

### 🔐 Login System
<img src="screenshots/04_login_page.svg" alt="Login Page" width="600">

### 📋 Study List
<img src="screenshots/01_study_list.svg" alt="Study List" width="800">

### 🖼️ OHIF Viewer with Reports
<img src="screenshots/02_ohif_viewer_reports.svg" alt="OHIF Viewer" width="800">

### 🌍 Language Selector
<img src="screenshots/03_language_selector.svg" alt="Language Selector" width="400">

### 📄 PDF Export
<img src="screenshots/05_pdf_export.svg" alt="PDF Export" width="600">

### 🏗️ System Architecture
<img src="screenshots/06_system_architecture.svg" alt="Architecture" width="700">

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/your-repo/clinton-medical-pacs.git
cd clinton-medical-pacs

# Start system
docker-compose up -d

# Initialize database
docker-compose exec flask_auth_service python init_db.py
```

**🌐 System Access:**
- **Web Interface**: https://localhost
- **Login**: `admin` / `admin`
- **OHIF Viewer**: https://localhost/ohif
- **Orthanc**: https://localhost/orthanc

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 📁 Data Management
- 🔍 **Study Search** - quick patient search
- 📤 **DICOM Upload** - drag & drop interface
- 👥 **Patient Management** - complete CRM system
- 📊 **Statistics** - usage reports

</td>
<td width="50%">

### 🖼️ Image Viewing
- 🔬 **OHIF Viewer** - modern viewer
- 📏 **Measurements** - rulers, angles, areas
- 🎨 **Annotations** - text notes
- 🔄 **MPR** - multiplanar reconstruction

</td>
</tr>
<tr>
<td width="50%">

### 📋 Report System
- ✍️ **Report Editor** - built-in WYSIWYG
- 📄 **PDF Export** - reports with images
- 📝 **Templates** - ready report forms
- 🔄 **Versioning** - change history

</td>
<td width="50%">

### 🔐 Security
- 👤 **Role Model** - admins, doctors, operators
- 🔒 **HTTPS** - secure connection
- 🛡️ **Authentication** - JWT tokens
- 📝 **Audit** - action logging

</td>
</tr>
</table>

## 🏗️ Architecture

```mermaid
graph TB
    A[👤 User] --> B[🌐 NGINX]
    B --> C[⚛️ OHIF Viewer]
    B --> D[🐍 Flask Auth]
    B --> E[🏥 Orthanc]
    D --> F[🗄️ PostgreSQL]
    E --> G[🗄️ PostgreSQL]
    D --> H[📊 ELK Stack]
```

### 🔧 Components:

| Service | Description | Port |
|---------|-------------|------|
| **NGINX** | Reverse proxy, SSL | 80, 443 |
| **OHIF Viewer** | DICOM viewer | 3000 |
| **Flask Auth** | API, authentication | 5000 |
| **Orthanc** | DICOM server | 8042 |
| **PostgreSQL** | Database | 5432 |

## 📋 Requirements

- **Docker** and **Docker Compose**
- **RAM**: 8+ GB
- **Disk**: 100+ GB
- **CPU**: 2+ cores

## 🛠️ Main Commands

```bash
# Start
docker-compose up -d

# Status
docker-compose ps

# Logs
docker-compose logs -f

# Stop
docker-compose down

# Initialize DB
docker-compose exec flask_auth_service python init_db.py
```

## 🔧 Configuration

### SSL Certificate
```bash
./scripts/generate_ssl.sh
docker-compose restart nginx
```

### Change Passwords
```bash
cp env.example .env
nano .env  # Edit passwords
docker-compose restart flask_auth_service
```

## 📊 Usage

1. **Add Patient**: Patients → Add
2. **Upload DICOM**: Studies → Upload
3. **View**: Click on study → OHIF Viewer
4. **Report**: In viewer → Create report → Export PDF

## 🆘 Troubleshooting

```bash
# Ports occupied
sudo netstat -tlnp | grep :80
sudo systemctl stop apache2 nginx

# Insufficient memory
docker stats
sudo fallocate -l 4G /swapfile && sudo swapon /swapfile

# Database errors
docker-compose restart postgres
docker-compose logs postgres
```

## 🛡️ Security

- Change default passwords
- Use SSL in production
- Regularly update system
- Configure firewall

---

**License**: MIT | **Version**: 2.0 | **Support**: GitHub Issues


# 🏥 Clinton Medical PACS

**Профессиональная система архивирования и передачи медицинских изображений**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![DICOM](https://img.shields.io/badge/DICOM-compliant-orange.svg)](https://www.dicomstandard.org/)
[![OHIF](https://img.shields.io/badge/OHIF-3.8+-purple.svg)](https://ohif.org/)

*Современная PACS система на основе микросервисной архитектуры с веб-интерфейсом для управления DICOM изображениями, отчетами и пациентами.*

</div>

## 📸 Скриншоты

### 🔐 Система входа
<img src="screenshots/04_login_page.svg" alt="Страница входа" width="600">

### 📋 Список исследований
<img src="screenshots/01_study_list.svg" alt="Список исследований" width="800">

### 🖼️ OHIF Viewer с отчетами
<img src="screenshots/02_ohif_viewer_reports.svg" alt="OHIF Viewer" width="800">

### 🌍 Выбор языка
<img src="screenshots/03_language_selector.svg" alt="Выбор языка" width="400">

### 📄 Экспорт в PDF
<img src="screenshots/05_pdf_export.svg" alt="Экспорт PDF" width="600">

### 🏗️ Архитектура системы
<img src="screenshots/06_system_architecture.svg" alt="Архитектура" width="700">

## 🚀 Быстрый старт

```bash
# Клонировать репозиторий
git clone https://github.com/your-repo/clinton-medical-pacs.git
cd clinton-medical-pacs

# Запустить систему
docker-compose up -d

# Инициализировать базу данных
docker-compose exec flask_auth_service python init_db.py
```

**🌐 Доступ к системе:**
- **Веб-интерфейс**: https://localhost
- **Логин**: `admin` / `admin`
- **OHIF Viewer**: https://localhost/ohif
- **Orthanc**: https://localhost/orthanc

## ✨ Основные функции

<table>
<tr>
<td width="50%">

### 📁 Управление данными
- 🔍 **Поиск исследований** - быстрый поиск по пациентам
- 📤 **Загрузка DICOM** - drag & drop интерфейс
- 👥 **Управление пациентами** - полная CRM система
- 📊 **Статистика** - отчеты по использованию

</td>
<td width="50%">

### 🖼️ Просмотр изображений
- 🔬 **OHIF Viewer** - современный просмотрщик
- 📏 **Измерения** - линейки, углы, площади
- 🎨 **Аннотации** - текстовые заметки
- 🔄 **MPR** - мультипланарная реконструкция

</td>
</tr>
<tr>
<td width="50%">

### 📋 Система отчетов
- ✍️ **Редактор отчетов** - встроенный WYSIWYG
- 📄 **Экспорт PDF** - отчеты с изображениями
- 📝 **Шаблоны** - готовые формы отчетов
- 🔄 **Версионность** - история изменений

</td>
<td width="50%">

### 🔐 Безопасность
- 👤 **Ролевая модель** - админы, врачи, операторы
- 🔒 **HTTPS** - защищенное соединение
- 🛡️ **Аутентификация** - JWT токены
- 📝 **Аудит** - логирование действий

</td>
</tr>
</table>

## 🏗️ Архитектура

```mermaid
graph TB
    A[👤 Пользователь] --> B[🌐 NGINX]
    B --> C[⚛️ OHIF Viewer]
    B --> D[🐍 Flask Auth]
    B --> E[🏥 Orthanc]
    D --> F[🗄️ PostgreSQL]
    E --> G[🗄️ PostgreSQL]
    D --> H[📊 ELK Stack]
```

### 🔧 Компоненты:

| Сервис | Описание | Порт |
|--------|----------|------|
| **NGINX** | Реверс-прокси, SSL | 80, 443 |
| **OHIF Viewer** | Просмотрщик DICOM | 3000 |
| **Flask Auth** | API, аутентификация | 5000 |
| **Orthanc** | DICOM сервер | 8042 |
| **PostgreSQL** | База данных | 5432 |

## 📋 Требования

- **Docker** и **Docker Compose**
- **RAM**: 8+ ГБ
- **Диск**: 100+ ГБ
- **CPU**: 2+ ядра

## 🛠️ Основные команды

```bash
# Запуск
docker-compose up -d

# Статус
docker-compose ps

# Логи
docker-compose logs -f

# Остановка
docker-compose down

# Инициализация БД
docker-compose exec flask_auth_service python init_db.py
```

## 🔧 Настройка

### SSL сертификат
```bash
./scripts/generate_ssl.sh
docker-compose restart nginx
```

### Смена паролей
```bash
cp env.example .env
nano .env  # Отредактировать пароли
docker-compose restart flask_auth_service
```

## 📊 Использование

1. **Добавить пациента**: Пациенты → Добавить
2. **Загрузить DICOM**: Исследования → Загрузить
3. **Просмотр**: Кликнуть на исследование → OHIF Viewer
4. **Отчет**: В просмотрщике → Создать отчет → Экспорт PDF

## 🆘 Устранение проблем

```bash
# Порты заняты
sudo netstat -tlnp | grep :80
sudo systemctl stop apache2 nginx

# Недостаточно памяти
docker stats
sudo fallocate -l 4G /swapfile && sudo swapon /swapfile

# Ошибки БД
docker-compose restart postgres
docker-compose logs postgres
```

## 🛡️ Безопасность

- Смените пароли по умолчанию
- Используйте SSL в продакшн
- Регулярно обновляйте систему
- Настройте файрвол

---

**License**: MIT | **Version**: 2.0 | **Поддержка**: GitHub Issues

---

