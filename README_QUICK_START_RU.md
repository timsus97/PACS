# 🏥 Clinton Medical PACS - Руководство по Быстрому Запуску

## 🚀 Быстрая Настройка

### Предварительные Требования
- Docker & Docker Compose
- 8ГБ+ ОЗУ
- 100ГБ+ свободного дискового пространства

### 1. Клонирование и Запуск
```bash
git clone https://github.com/timsus97/PACS.git
cd PACS
docker-compose up -d
```

### 2. Доступ к Системе
- **Основное Приложение**: https://srv853233.hstgr.cloud
- **Страница Входа**: https://srv853233.hstgr.cloud/login

### 3. Учетные Данные по Умолчанию
```
Администратор: admin / admin
Врач:          doctor / doctor  
Оператор:      operator / operator
```

## 🏗️ Обзор Архитектуры

```
Интернет → Nginx Прокси → OHIF Viewer
                       → Flask Auth API
                       → Orthanc DICOM Server → PostgreSQL
```

## 📋 Ключевые Функции

✅ **Медицинские Изображения**: DICOM просмотрщик с MPR, 3D рендерингом  
✅ **Ролевой Доступ**: Роли Администратор, Врач, Оператор  
✅ **Многоязычность**: Английский, Русский, Испанский, Французский, Немецкий  
✅ **Система Отчетов**: Создание, редактирование, экспорт PDF отчетов  
✅ **Безопасность**: JWT аутентификация, SSL/TLS, аудит логирование  
✅ **Стандарты**: Соответствие DICOM 3.0, DICOMweb  

## 🛠️ Технологический Стек

| Компонент | Технология | Назначение |
|-----------|------------|---------|
| Фронтенд | OHIF Viewer v3 + React | Интерфейс медицинских изображений |
| Бэкенд | Orthanc DICOM Server | Хранение медицинских данных |
| Аутентификация | Flask + Python | Управление пользователями и RBAC |
| База Данных | PostgreSQL 15 | Персистентность данных |
| Прокси | Nginx | SSL терминация и маршрутизация |
| Контейнер | Docker Compose | Оркестрация сервисов |

## 📁 Структура Проекта

```
PACS/
├── config/
│   ├── ohif/              # Конфигурация и кастомизации OHIF
│   ├── nginx/             # Конфигурация reverse proxy  
│   ├── orthanc/           # Настройки DICOM сервера
│   └── ssl/               # SSL сертификаты
├── flask_auth_service/    # Python сервис аутентификации
├── screenshots/           # Скриншоты системы
├── docker-compose.yml     # Оркестрация контейнеров
├── TECH_STACK_RU.md      # Подробная техническая документация
└── README_QUICK_START_RU.md # Этот файл
```

## 🔑 Ключевые Сервисы

### OHIF Viewer (Порт 3000)
- Интерфейс медицинских изображений
- Пользовательская система врачебных отчетов (1900+ строк JS)
- Многоязычная поддержка
- Ролевые элементы UI

### Orthanc DICOM (Порт 8042)
- DICOM 3.0 совместимый сервер
- DICOMweb REST API
- PostgreSQL бэкенд
- Интеграция плагина авторизации

### Flask Auth (Порт 5001)
- JWT токен аутентификация
- Ролевой контроль доступа
- API управления пользователями
- Обработка сессий

### Nginx Прокси (Порт 443/80)
- SSL терминация
- Управление маршрутами  
- Заголовки безопасности
- Обработка CORS

## 🧪 Разработка

### Добавить Тестовые Данные
```bash
./upload.sh                    # Загрузить образцы DICOM файлов
./download_test_dicom.sh       # Скачать тестовые наборы данных
```

### Логи и Отладка
```bash
docker-compose logs -f ohif_viewer    # Логи OHIF
docker-compose logs -f orthanc        # Логи DICOM сервера  
docker-compose logs -f flask_auth_service  # Логи аутентификации
```

### Доступ к Базе Данных
```bash
# Доступ к PostgreSQL
docker-compose exec db_pacs psql -U postgres -d orthanc

# Управление пользователями
docker-compose exec flask_auth_service python create_admin_user.py
```

## 🔧 Конфигурация

### Переменные Окружения
- Проверьте `docker-compose.yml` для настраиваемых опций
- SSL сертификаты в `config/ssl/`
- Настройки аутентификации в Flask сервисе

### Кастомизация
- Интерфейс OHIF: `config/ohif/customizations.js`
- Переводы: Встроенные в customizations.js
- Маршрутизация: `config/nginx/nginx.conf`

## 📋 Общие Задачи

### Сброс Пароля Администратора
```bash
docker-compose exec flask_auth_service python create_admin_user.py
```

### Резервное Копирование Системы
```bash
./backup.sh    # Создает полную резервную копию системы
```

### Обновление Конфигурации
```bash
# После изменения конфигурации
docker-compose restart ohif_viewer
docker-compose restart nginx
```

## 🆘 Устранение Неполадок

### Конфликты Портов
```bash
sudo lsof -ti:443 | xargs kill -9  # Завершить процесс на порту 443
sudo lsof -ti:80 | xargs kill -9   # Завершить процесс на порту 80
```

### Проблемы с Контейнерами
```bash
docker-compose down --volumes    # Полный сброс
docker-compose up -d            # Перезапуск всех сервисов
```

### Проблемы с Аутентификацией
```bash
# Очистить данные браузера и перезапустить сервис аутентификации
docker-compose restart flask_auth_service
```

## 📞 Поддержка

Для подробной документации смотрите: **TECH_STACK_RU.md**

### Контакты:
- **Автор**: Tim Hunt (tr00x)  
- **GitHub**: [Issues](https://github.com/timsus97/PACS/issues)
- **Email**: tavci57@gmail.com
- **Telegram**: @tr00x

---

**Проект**: Clinton Medical PACS v1.0  
**Автор**: Tim Hunt (tr00x)  
**Обновлено**: Декабрь 2024  
**Лицензия**: Проприетарная 