# 🇺🇸 ENGLISH VERSION

# 📦 Clinton Medical PACS Installation

## 🚀 Quick Installation

```bash
# Automatic installation
curl -sSL https://raw.githubusercontent.com/your-repo/clinton-medical-pacs/main/install.sh | bash
```

## 📋 Manual Installation

### 1. Requirements
- **OS**: Linux, macOS, Windows (WSL2)
- **RAM**: 8+ GB
- **Disk**: 100+ GB
- **Docker** and **Docker Compose**

### 2. Docker Installation

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable docker && sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose
sudo systemctl enable docker && sudo usermod -aG docker $USER
```

**macOS:**
```bash
brew install --cask docker
```

### 3. PACS Installation

```bash
# Download project
git clone https://github.com/your-repo/clinton-medical-pacs.git
cd clinton-medical-pacs

# Configure environment (optional)
cp env.example .env
nano .env

# Start system
docker-compose up -d

# Initialize database
docker-compose exec flask_auth_service python init_db.py
```

### 4. Verification

1. Open https://localhost
2. Login: **admin** / **admin**

## 🔧 SSL Configuration

### Self-signed Certificate
```bash
./scripts/generate_ssl.sh
docker-compose restart nginx
```

### Let's Encrypt
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem config/ssl/
docker-compose restart nginx
```

## 🛠️ Management

```bash
# Status
docker-compose ps

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update
docker-compose pull && docker-compose up -d
```

## 🔍 Troubleshooting

**Ports occupied:**
```bash
sudo netstat -tlnp | grep :80
sudo systemctl stop apache2 nginx
```

**Low memory:**
```bash
docker stats
sudo fallocate -l 4G /swapfile && sudo swapon /swapfile
```

**Database errors:**
```bash
docker-compose restart postgres
docker-compose logs postgres
```

## 📞 Support

- **Logs**: `docker-compose logs`
- **Issues**: GitHub repository
- **Documentation**: README.md


# 📦 Установка Clinton Medical PACS

## 🚀 Быстрая установка

```bash
# Автоматическая установка
curl -sSL https://raw.githubusercontent.com/your-repo/clinton-medical-pacs/main/install.sh | bash
```

## 📋 Ручная установка

### 1. Требования
- **ОС**: Linux, macOS, Windows (WSL2)
- **RAM**: 8+ ГБ
- **Диск**: 100+ ГБ
- **Docker** и **Docker Compose**

### 2. Установка Docker

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable docker && sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose
sudo systemctl enable docker && sudo usermod -aG docker $USER
```

**macOS:**
```bash
brew install --cask docker
```

### 3. Установка PACS

```bash
# Скачать проект
git clone https://github.com/your-repo/clinton-medical-pacs.git
cd clinton-medical-pacs

# Настроить окружение (опционально)
cp env.example .env
nano .env

# Запустить систему
docker-compose up -d

# Инициализировать БД
docker-compose exec flask_auth_service python init_db.py
```

### 4. Проверка

1. Откройте https://localhost
2. Войдите: **admin** / **admin**

## 🔧 Настройка SSL

### Самоподписанный сертификат
```bash
./scripts/generate_ssl.sh
docker-compose restart nginx
```

### Let's Encrypt
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem config/ssl/
docker-compose restart nginx
```

## 🛠️ Управление

```bash
# Статус
docker-compose ps

# Логи
docker-compose logs -f

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Обновление
docker-compose pull && docker-compose up -d
```

## 🔍 Проблемы

**Порты заняты:**
```bash
sudo netstat -tlnp | grep :80
sudo systemctl stop apache2 nginx
```

**Мало памяти:**
```bash
docker stats
sudo fallocate -l 4G /swapfile && sudo swapon /swapfile
```

**Ошибки БД:**
```bash
docker-compose restart postgres
docker-compose logs postgres
```

## 📞 Поддержка

- **Логи**: `docker-compose logs`
- **Issues**: GitHub репозиторий
- **Документация**: README.md

---

