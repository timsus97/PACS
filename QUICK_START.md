# 🚀 Quick Start - Supabase Migration

## ⚡ Быстрый запуск (5 минут)

### 1. Создай проект в Supabase
1. Иди на [supabase.com](https://supabase.com)
2. **Sign up** или **Login**
3. **"New Project"**
4. **Name:** `clinton-medical-pacs`
5. **Region:** `Frankfurt`
6. **Click "Create new project"**

### 2. Получи ключи
1. В проекте иди в **Settings → API**
2. Скопируй:
   - **Project URL:** `https://xxx.supabase.co`
   - **Anon public key:** `eyJhbGciOiJIUzI1NiI...`

### 3. Замени ключи в файлах
**В файле `supabase-auth-config.js`:**
```javascript
url: 'https://your-project.supabase.co', // 👈 ЗАМЕНИ
anonKey: 'your-anon-key-here', // 👈 ЗАМЕНИ
```

**В файле `supabase-login.html`:**
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'; // 👈 ЗАМЕНИ
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // 👈 ЗАМЕНИ
```

### 4. Запусти развертывание
```bash
./deploy-supabase.sh
```

### 5. Тестируй
1. Открой https://srv853233.hstgr.cloud/login
2. Зарегистрируйся
3. Войди в систему
4. **OHIF должен работать без редиректов!** 🎉

## 🔧 Полезные команды

**Мониторинг логов:**
```bash
ssh root@31.97.135.47 'cd /opt/clinton-pacs && docker-compose logs -f'
```

**Откат (если что-то не так):**
```bash
ssh root@31.97.135.47 'cd /opt/clinton-pacs && docker-compose down && cp docker-compose.flask-backup.yml docker-compose.yml && docker-compose up -d'
```

**Проверка статуса:**
```bash
ssh root@31.97.135.47 'cd /opt/clinton-pacs && docker-compose ps'
```

## 🎯 Ожидаемый результат

❌ **Было:** Flask → сложные редиректы → проблемы с OHIF  
✅ **Станет:** Supabase → стандартные JWT → OHIF работает из коробки

**Время работы:** ~5 минут  
**Результат:** Стабильная система без редиректов! 🚀 