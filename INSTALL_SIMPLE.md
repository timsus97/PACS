# 🏥 Klinika Pro PACS - Супер Простая Установка

## 🎯 Установка за 5 минут

### 🖥️ Что нужно:
- Компьютер с 8ГБ+ памяти
- Доступ в интернет
- Права администратора (sudo)

### 🚀 Установка одной командой:

#### Для Linux/macOS:
```bash
bash <(curl -sSL https://raw.githubusercontent.com/timsus97/PACS/main/install.sh)
```

#### Для Windows:
1. Установить [Docker Desktop](https://docker.com/products/docker-desktop)
2. Открыть PowerShell как администратор
3. Выполнить:
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/timsus97/PACS/main/install.sh" -OutFile "install.sh"
bash install.sh
```

### ✅ Готово!
Откройте https://srv853233.hstgr.cloud в браузере

---

## 🔑 Вход в систему

### Пользователи по умолчанию:
- **Администратор**: `admin` / `admin`
- **Врач**: `doctor` / `doctor`
- **Оператор**: `operator` / `operator`

---

## 🏥 Что умеет система

✅ **Просмотр медицинских изображений** (CT, MRI, УЗИ, Рентген)  
✅ **Создание врачебных отчетов** с экспортом в PDF  
✅ **Многоязычный интерфейс** (5 языков)  
✅ **Безопасный доступ** с ролями пользователей  
✅ **Автоматические резервные копии**  

---

## 🆘 Проблемы?

### Система не открывается:
```bash
make start
```

### Забыли пароль:
```bash 
make reset
```

### Полный сброс:
```bash
make clean
make install
```

---

## 📞 Помощь

**Автор**: Tim Hunt (tr00x)  
**Email**: your-email@example.com  
**Документация**: INSTALL.md  

---

**🎉 Всё! Система готова к работе! 🚀** 