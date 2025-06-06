# 🚀 Clinton Medical PACS - Supabase Migration Plan

## 🎯 Цель: Заменить проблемную Flask авторизацию на современный Supabase

### ❌ Проблемы текущей системы:
- Постоянные редиректы OHIF → login 
- Сложная интеграция Flask + OHIF auth
- Самодельная система токенов
- Проблемы с сессиями и cookies

### ✅ Преимущества Supabase:
- **Стандартные JWT токены** - OHIF их понимает
- **Готовый Auth UI** - красивые формы логина
- **OAuth провайдеры** - Google, GitHub и т.д.
- **Масштабируемость** - не нужно поддерживать auth сервер
- **Безопасность** - enterprise-grade защита

---

## 📋 Plan Migration Steps

### 🔥 Phase 1: Setup Supabase (30 минут)

1. **Создать проект в Supabase:**
   ```bash
   # 1. Идем на https://supabase.com
   # 2. Create new project: "clinton-medical-pacs"
   # 3. Region: Frankfurt (ближе к России)
   # 4. Копируем URL и anon key
   ```

2. **Настроить аутентификацию:**
   ```sql
   -- В Supabase Dashboard → Authentication → Settings
   
   -- Site URL: https://srv853233.hstgr.cloud
   -- Redirect URLs: 
   --   https://srv853233.hstgr.cloud/
   --   https://srv853233.hstgr.cloud/dashboard
   
   -- Включить Email auth
   -- Добавить Google OAuth (опционально)
   ```

3. **Создать пользователей:**
   ```sql
   -- В SQL Editor создаем профили врачей
   
   -- Создаем таблицу профилей
   CREATE TABLE public.user_profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     role TEXT CHECK (role IN ('admin', 'doctor', 'operator')) DEFAULT 'doctor',
     department TEXT,
     license_number TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- RLS политики
   ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own profile" 
   ON public.user_profiles FOR SELECT 
   TO authenticated 
   USING (auth.uid() = id);
   
   -- Триггер для автосоздания профиля
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.user_profiles (id, email, full_name)
     VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```

### 🔄 Phase 2: Update Configuration (15 минут)

4. **Обновить Supabase конфигурацию:**
   ```bash
   # Редактируем supabase-auth-config.js
   nano supabase-auth-config.js
   
   # Вставляем реальные данные:
   const SUPABASE_CONFIG = {
     url: 'https://YOUR_PROJECT.supabase.co',
     anonKey: 'YOUR_ANON_KEY',
     // ... остальное без изменений
   };
   ```

5. **Обновить HTML страницу логина:**
   ```bash
   # В supabase-login.html также вставляем реальные ключи
   nano supabase-login.html
   
   # Строки 86-87:
   const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```

### 🐳 Phase 3: Deploy New Architecture (10 минут)

6. **Остановить старую систему:**
   ```bash
   ssh root@31.97.135.47
   cd /opt/clinton-pacs
   
   # Бэкап текущей конфигурации
   cp docker-compose.yml docker-compose.yml.flask-backup
   
   # Остановить все сервисы
   docker-compose down
   ```

7. **Загрузить новые файлы:**
   ```bash
   # На локальной машине
   scp supabase-*.* root@31.97.135.47:/opt/clinton-pacs/
   scp docker-compose.supabase.yml root@31.97.135.47:/opt/clinton-pacs/
   ```

8. **Создать Nginx конфигурацию для Supabase:**
   ```bash
   # На сервере
   mkdir -p config/nginx
   cat > config/nginx/nginx-supabase.conf << 'EOF'
   user nginx;
   worker_processes auto;
   
   events {
       worker_connections 1024;
   }
   
   http {
       include /etc/nginx/mime.types;
       default_type application/octet-stream;
       
       # Логирование
       access_log /var/log/nginx/access.log;
       error_log /var/log/nginx/error.log;
       
       # Основные настройки
       sendfile on;
       tcp_nopush on;
       tcp_nodelay on;
       keepalive_timeout 65;
       client_max_body_size 100M;
       
       # Gzip
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
       
       server {
           listen 80;
           listen 443 ssl http2;
           server_name srv853233.hstgr.cloud;
           
           # SSL конфигурация (если есть сертификаты)
           # ssl_certificate /etc/nginx/ssl/cert.pem;
           # ssl_certificate_key /etc/nginx/ssl/key.pem;
           
           # 🔐 Страница логина (Supabase)
           location = /login {
               alias /usr/share/nginx/html/login.html;
               try_files $uri $uri.html =404;
           }
           
           # 📄 Статические файлы
           location /static/ {
               alias /usr/share/nginx/html/static/;
               expires 1d;
               add_header Cache-Control "public, immutable";
           }
           
           # 🔧 Auth конфигурация
           location = /auth-config.js {
               alias /usr/share/nginx/html/auth-config.js;
               add_header Content-Type application/javascript;
           }
           
           # 🔬 OHIF Viewer - все остальные запросы
           location / {
               proxy_pass http://pacs_ohif_supabase:80;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
               
               # WebSocket support
               proxy_http_version 1.1;
               proxy_set_header Upgrade $http_upgrade;
               proxy_set_header Connection "upgrade";
           }
           
           # 🏥 Orthanc DICOM-Web API
           location /orthanc/ {
               proxy_pass http://pacs_orthanc_server:8042/;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
       }
   }
   EOF
   ```

9. **Запустить новую систему:**
   ```bash
   # Используем новый docker-compose
   cp docker-compose.supabase.yml docker-compose.yml
   
   # Запускаем
   docker-compose up -d
   
   # Проверяем логи
   docker-compose logs -f
   ```

### ✅ Phase 4: Testing & Verification (15 минут)

10. **Проверить работу системы:**
    ```bash
    # 1. Открыть https://srv853233.hstgr.cloud/login
    # 2. Зарегистрироваться через Supabase
    # 3. Войти в систему
    # 4. Проверить редирект на OHIF
    # 5. Убедиться что OHIF загружается без редиректов
    
    # Мониторинг логов
    docker logs -f pacs_nginx_supabase
    docker logs -f pacs_ohif_supabase
    ```

11. **Создать тестового пользователя:**
    ```sql
    -- В Supabase Dashboard → Authentication → Users
    -- Add user manually:
    -- Email: admin@clinic.com
    -- Password: AdminPass123!
    -- Confirm: true
    ```

---

## 🔄 Rollback Plan (если что-то пойдет не так)

```bash
# Быстрый откат к Flask системе
ssh root@31.97.135.47
cd /opt/clinton-pacs

# Остановить Supabase версию
docker-compose down

# Восстановить Flask версию
cp docker-compose.yml.flask-backup docker-compose.yml

# Запустить старую систему
docker-compose up -d

echo "✅ Откат выполнен!"
```

---

## 📊 Expected Results

После миграции на Supabase:

1. **✅ Простой логин** - красивая форма без сложной логики
2. **✅ Стандартные JWT** - OHIF понимает токены из коробки  
3. **✅ Нет редиректов** - авторизация работает правильно
4. **✅ Масштабируемость** - готовность к росту
5. **✅ Безопасность** - enterprise-grade защита

### 🎯 Final Architecture:
```
User → Supabase Login → JWT Token → OHIF Viewer → Orthanc PACS
```

**Простая, надежная, масштабируемая система!** 🚀

---

## 🚨 Emergency Contacts

- **Supabase Support**: support@supabase.io
- **OHIF Community**: https://community.ohif.org/
- **Documentation**: https://docs.supabase.com/guides/auth

---

*Ready to migrate? Let's do this! 💪* 