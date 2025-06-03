# 🏥 Clinton Medical PACS - Полное Руководство по Установке

## 🚀 **Автоматическая Установка (Рекомендуется)**

### Быстрая Установка (1 команда)
```bash
curl -sSL https://raw.githubusercontent.com/timsus97/PACS/main/install.sh | bash
```

## 📋 **Ручная Установка**

### Шаг 1: Скачать проект
```bash
git clone https://github.com/timsus97/PACS.git
cd clinton-medical-pacs
```

## 🎯 Быстрая Установка (2 команды)

Для тех, кто хочет установить систему максимально быстро:

```bash
# 1. Скачать и запустить автоматическую установку
curl -sSL https://raw.githubusercontent.com/timsus97/PACS/main/install.sh | bash

# 2. Готово! Открыть https://srv853233.hstgr.cloud
```

## 📋 Подробная Инструкция

### 1️⃣ Системные Требования

#### Минимальные требования:
- **ОС**: Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+), macOS 10.15+, Windows 10+ (с WSL2)
- **RAM**: 8 ГБ (рекомендуется 16 ГБ+)
- **Диск**: 100 ГБ свободного места
- **CPU**: 2+ ядра (рекомендуется 4+ ядра)
- **Сеть**: Доступ к интернету для загрузки образов

#### Рекомендуемые требования:
- **RAM**: 16+ ГБ
- **Диск**: 500+ ГБ (SSD предпочтительно)
- **CPU**: 4+ ядра
- **GPU**: Опционально для ускорения рендеринга

### 2️⃣ Автоматическая Установка

#### Способ 1: Скачать проект и установить
```bash
# Клонировать репозиторий
git clone https://github.com/timsus97/PACS.git
cd PACS

# Запустить автоматическую установку
chmod +x install.sh
./install.sh
```

#### Способ 2: Прямая установка из интернета
```bash
# Скачать и запустить установщик одной командой
curl -sSL https://raw.githubusercontent.com/timsus97/PACS/main/install.sh | bash
```

### 3️⃣ Что Делает Автоматическая Установка

1. **🔍 Проверяет систему**: ОС, RAM, свободное место
2. **🐳 Устанавливает Docker**: Автоматически для вашей ОС
3. **🐙 Устанавливает Docker Compose**: Если нужно
4. **🔐 Генерирует пароли**: Безопасные случайные пароли
5. **🔒 Создает SSL сертификаты**: Для HTTPS соединения
6. **📁 Создает структуру**: Все необходимые директории
7. **📥 Загружает тестовые данные**: Образцы DICOM файлов
8. **🚀 Запускает систему**: Все сервисы в Docker контейнерах
9. **✅ Проверяет готовность**: Автоматическая диагностика

### 4️⃣ Ручная Установка (Если Нужна)

#### Шаг 1: Установить Docker

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**macOS:**
```bash
# Установить Docker Desktop из https://docker.com/products/docker-desktop
# Или через Homebrew:
brew install --cask docker
```

**Windows:**
1. Скачать Docker Desktop с https://docker.com/products/docker-desktop
2. Установить и запустить
3. Включить WSL2 integration

#### Шаг 2: Подготовить проект
```bash
# Клонировать проект
git clone https://github.com/timsus97/PACS.git
cd klinika-pro-pacs

# Создать конфигурацию
cp .env.example .env

# Отредактировать пароли в .env (опционально)
nano .env
```

#### Шаг 3: Запустить систему
```bash
# Собрать и запустить
docker-compose up -d

# Проверить статус
docker-compose ps
```

### 5️⃣ Проверка Установки

После установки система будет доступна по адресам:

- **🌐 Основное приложение**: https://srv853233.hstgr.cloud
- **🔐 Страница входа**: https://srv853233.hstgr.cloud/login
- **🏥 Orthanc интерфейс**: http://srv853233.hstgr.cloud:8042
- **🔧 API аутентификации**: http://srv853233.hstgr.cloud:5001

### 6️⃣ Первый Вход в Систему

#### Учетные данные по умолчанию:
- **👨‍💼 Администратор**: `admin` / `admin`
- **👩‍⚕️ Врач**: `doctor` / `doctor`
- **👨‍💻 Оператор**: `operator` / `operator`

#### Первые шаги:
1. Откройте https://srv853233.hstgr.cloud (игнорируйте предупреждение о сертификате)
2. Войдите как `admin` / `admin`
3. Загрузите тестовые данные: `./upload.sh`
4. Откройте исследование и начните работу!

### 7️⃣ Управление Системой

#### С помощью Makefile (рекомендуется):
```bash
make help          # Показать все доступные команды
make start          # Быстрый запуск
make stop           # Остановить систему
make restart        # Перезапустить
make status         # Показать статус
make logs           # Показать логи
make health         # Проверить здоровье системы
make backup         # Создать резервную копию
```

#### Прямые команды Docker Compose:
```bash
docker-compose ps              # Статус сервисов
docker-compose logs -f         # Логи всех сервисов
docker-compose restart         # Перезапуск
docker-compose down            # Остановка
docker-compose up -d           # Запуск в фоне
```

### 8️⃣ Загрузка Тестовых Данных

```bash
# Автоматическая загрузка тестовых DICOM файлов
./upload.sh

# Или через Make
make upload-test
```

### 9️⃣ Устранение Проблем

#### Проблема: "Docker not found"
**Решение**: Установите Docker согласно инструкциям выше

#### Проблема: "Permission denied"
**Решение**: 
```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### Проблема: "Port already in use"
**Решение**:
```bash
# Освободить порты
sudo lsof -ti:80,443 | xargs kill -9
# Или использовать make
make ports
```

#### Проблема: "SSL Certificate error"
**Решение**: Это нормально для self-signed сертификатов. Нажмите "Advanced" → "Proceed to srv853233.hstgr.cloud"

#### Проблема: Медленная загрузка
**Решение**: 
```bash
# Проверить статус сервисов
make status
make health

# Перезапустить если нужно
make restart
```

### 🔟 Дополнительная Конфигурация

#### Изменение портов:
Отредактируйте файл `.env`:
```bash
NGINX_PORT_HTTP=8080
NGINX_PORT_HTTPS=8443
```

#### Настройка доменного имени:
1. Настройте DNS на ваш сервер
2. Получите SSL сертификат от Let's Encrypt
3. Замените сертификаты в `config/ssl/`

#### Настройка LDAP/Active Directory:
Отредактируйте конфигурацию Flask auth service в `flask_auth_service/`

### 1️⃣1️⃣ Продакшн Развертывание

#### Безопасность:
1. **Смените пароли по умолчанию**:
   ```bash
   # Отредактируйте .env файл
   nano .env
   docker-compose restart flask_auth_service
   ```

2. **Настройте фаервол**:
   ```bash
   # Ubuntu/Debian
   sudo ufw enable
   sudo ufw allow 80,443/tcp
   
   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-port=80/tcp
   sudo firewall-cmd --permanent --add-port=443/tcp
   sudo firewall-cmd --reload
   ```

3. **Настройте SSL сертификаты**:
   ```bash
   # Let's Encrypt
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.com
   ```

#### Мониторинг:
```bash
# Проверка логов
make logs

# Мониторинг ресурсов
docker stats

# Создание резервных копий
make backup
```

### 1️⃣2️⃣ Обновление Системы

```bash
# Скачать обновления
git pull

# Обновить систему
make update

# Или вручную
docker-compose pull
docker-compose build --no-cache
docker-compose up -d
```

### 1️⃣3️⃣ Удаление Системы

```bash
# Полная очистка (ВНИМАНИЕ: удалит все данные!)
make clean

# Или вручную
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -f
```

---

## 🆘 Получить Помощь

### Проверить статус системы:
```bash
make health
```

### Посмотреть логи:
```bash
make logs
```

### Связаться с разработчиком:
- **Автор**: Tim Hunt (tr00x)
- **GitHub**: [ссылка на репозиторий]
- **Email**: [ваш email]

---

## 📚 Дополнительная Документация

- **Быстрый старт**: `README_QUICK_START.md`
- **Технический стек**: `TECH_STACK.md` 
- **Архитектура**: `ARCHITECTURE.md`
- **Русские версии**: `*_RU.md`

---

**🎉 Поздравляем! Ваша система Clinton Medical PACS готова к работе! 🚀** 