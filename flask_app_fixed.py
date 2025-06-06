from flask import Flask, request, jsonify, redirect
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 🎯 ИСПРАВЛЕННАЯ ВЕРСИЯ - правильные редиректы без циклов

@app.route("/viewer")
def viewer_page():
    # ✅ Прямой редирект на OHIF вместо на корень "/"
    return redirect("/ohif/", code=302)

@app.route("/dashboard")
def dashboard_page():
    return """<!DOCTYPE html>
<html>
<head>
    <title>Clinton Medical PACS - Dashboard</title>
    <style>
        body { font-family: Arial; background: linear-gradient(135deg, #667eea, #764ba2); margin: 0; padding: 50px; color: white; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .nav-button { display: block; text-decoration: none; color: white; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; transition: all 0.3s; }
        .nav-button:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
        .icon { font-size: 2em; margin-bottom: 10px; }
        .title { font-size: 1.2em; font-weight: bold; }
        .debug-info { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; margin: 20px 0; font-family: monospace; font-size: 12px; }
        .success { background: rgba(40,167,69,0.3); padding: 15px; border-radius: 5px; margin: 20px 0; }
        .logout-btn { background: rgba(220,53,69,0.3) !important; }
        .logout-btn:hover { background: rgba(220,53,69,0.5) !important; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Clinton Medical PACS</h1>
            <p>Медицинская информационная система</p>
        </div>
        
        <div class="success">
            <strong>✅ ИСПРАВЛЕНО:</strong><br>
            • /viewer → прямой переход на /ohif/<br>
            • /logout → правильная очистка сессии<br>
            • Больше нет циклов редиректов!
        </div>
        
        <div class="debug-info">
            <strong>Отладка сессий:</strong><br>
            <span id="token-debug">Проверяю токены...</span>
        </div>
        
        <div class="nav-grid">
            <a href="/viewer" class="nav-button">
                <div class="icon">🔬</div>
                <div class="title">OHIF Viewer</div>
                <div>Просмотр медицинских изображений</div>
                <small style="color: #28a745;">✅ Исправлен</small>
            </a>
            <a href="/orthanc" class="nav-button">
                <div class="icon">🗄️</div>
                <div class="title">Orthanc Server</div>
                <div>Управление PACS архивом</div>
            </a>
            <a href="/orthanc/app/explorer.html" class="nav-button">
                <div class="icon">🔍</div>
                <div class="title">Поиск исследований</div>
                <div>Поиск пациентов и данных</div>
            </a>
            <a href="javascript:void(0)" onclick="handleLogout()" class="nav-button logout-btn">
                <div class="icon">🚪</div>
                <div class="title">Выход</div>
                <div>Выход из системы</div>
                <small style="color: #28a745;">✅ Исправлен</small>
            </a>
        </div>
        <div style="text-align: center; margin-top: 30px; opacity: 0.7;">
            <p>Система готова • Supabase + Flask интеграция</p>
        </div>
    </div>
    
    <script>
        // Отладка токенов
        function updateDebugInfo() {
            const flaskToken = localStorage.getItem('authToken');
            const supabaseSession = localStorage.getItem('supabase_session');
            const guestAccess = localStorage.getItem('guest_access');
            const debugElement = document.getElementById('token-debug');
            
            debugElement.innerHTML = 
                'Flask токен: ' + (flaskToken ? '"' + flaskToken + '"' : 'НЕТ') + 
                '<br>Supabase сессия: ' + (supabaseSession ? 'ЕСТЬ' : 'НЕТ') +
                '<br>Гостевой доступ: ' + (guestAccess ? 'ДА' : 'НЕТ') +
                '<br>Все ключи: ' + JSON.stringify(Object.keys(localStorage));
        }
        
        // Правильная функция выхода
        function handleLogout() {
            if (confirm('Вы действительно хотите выйти из системы?')) {
                // Очищаем все токены и сессии
                localStorage.removeItem('authToken');
                localStorage.removeItem('supabase_session'); 
                localStorage.removeItem('guest_access');
                localStorage.removeItem('user_info');
                
                // Очищаем Supabase сессию если есть
                if (window.supabaseClient) {
                    window.supabaseClient.auth.signOut();
                }
                
                // Показываем сообщение и редиректим
                alert('Вы вышли из системы. Переход на страницу входа...');
                window.location.href = '/login';
            }
        }
        
        updateDebugInfo();
    </script>
</body>
</html>"""

@app.route("/login")
def login_page():
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clinton Medical PACS - Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 50px; }
        .login-container { max-width: 400px; margin: 0 auto; background: rgba(255,255,255,0.95); padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; color: #2c3e50; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="password"] { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #2980b9; }
        .info { color: #27ae60; margin-top: 10px; font-size: 14px; }
        .error { color: #e74c3c; margin-top: 10px; font-size: 14px; }
        .warning { background: rgba(255,165,0,0.1); border: 1px solid #ffc107; padding: 10px; border-radius: 4px; margin: 10px 0; color: #856404; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>Clinton Medical PACS</h1>
            <p>Медицинская визуализация</p>
        </div>
        
        <div class="warning">
            <strong>⚠️ Альтернативный логин:</strong><br>
            Используйте Supabase авторизацию для лучшего опыта!<br>
            <a href="/login" style="color: #667eea;">→ Перейти к Supabase Login</a>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Логин:</label>
                <input type="text" id="username" name="username" value="admin" required>
            </div>
            <div class="form-group">
                <label for="password">Пароль:</label>
                <input type="password" id="password" name="password" value="admin" required>
            </div>
            <button type="submit">Войти (Flask)</button>
            <div id="message"></div>
        </form>
        <div class="info">
            <strong>Тест логин:</strong> admin<br>
            <strong>Тест пароль:</strong> admin
        </div>
    </div>
    <script>
        document.getElementById("loginForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const messageDiv = document.getElementById("message");
            
            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({username, password})
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = '<div style="color: #27ae60; margin-top: 10px;">✅ Вход выполнен! Переход к системе...</div>';
                    
                    // Сохраняем токен
                    console.log('Сохраняем Flask токен:', data.token);
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("user_info", JSON.stringify(data.user));
                    
                    setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="error">❌ Ошибка: ' + data.error + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">❌ Ошибка подключения</div>';
            }
        });
    </script>
</body>
</html>"""

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        
        if username == "admin" and password == "admin":
            return jsonify({
                "token": "valid_admin_token_123",
                "user": {
                    "id": 1,
                    "username": username,
                    "email": f"{username}@clinton-medical.com",
                    "role": "admin"
                }
            }), 200
        else:
            return jsonify({"error": "Неверный логин или пароль"}), 401
            
    except Exception as e:
        return jsonify({"error": "Ошибка сервера"}), 500

@app.route("/logout")
def logout():
    # ✅ Возвращаем JSON для AJAX запросов или простой редирект
    if request.headers.get('Content-Type') == 'application/json':
        return jsonify({"message": "Logged out successfully"}), 200
    else:
        # Простой редирект на логин (без цикла)
        return redirect("/login", code=302)

@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "auth"}), 200

if __name__ == "__main__":
    print("Starting auth service...")
    app.run(host="0.0.0.0", port=5000, debug=True) 