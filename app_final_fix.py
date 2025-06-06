from flask import Flask, request, jsonify, redirect
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def main_page():
    return redirect("/dashboard")

@app.route("/viewer")
def viewer_page():
    return """<!DOCTYPE html>
<html>
<head>
    <title>OHIF Viewer - Проверка авторизации</title>
    <style>
        body { font-family: Arial; background: linear-gradient(135deg, #667eea, #764ba2); margin: 0; padding: 50px; color: white; text-align: center; }
        .checking { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; max-width: 500px; margin: 100px auto; }
        .debug { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin: 20px auto; max-width: 500px; font-family: monospace; font-size: 12px; text-align: left; }
    </style>
</head>
<body>
    <div class="checking">
        <h3>🔐 Проверка авторизации...</h3>
        <p>Пожалуйста, подождите</p>
        <div id="debug-info" class="debug">
            <strong>Отладочная информация:</strong><br>
            <span id="debug-output">Инициализация...</span>
        </div>
        <button onclick="manualCheck()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Проверить еще раз</button>
    </div>
    <script>
        function updateDebug(message) {
            const debugOutput = document.getElementById('debug-output');
            debugOutput.innerHTML += '<br>' + new Date().toLocaleTimeString() + ': ' + message;
        }
        
        function manualCheck() {
            updateDebug('=== Ручная проверка ===');
            checkAuth();
        }
        
        function checkAuth() {
            updateDebug('Начинаем проверку авторизации...');
            
            // Проверяем все ключи в localStorage
            const allKeys = Object.keys(localStorage);
            updateDebug('Ключи в localStorage: ' + JSON.stringify(allKeys));
            
            // Проверяем токен
            const token = localStorage.getItem('authToken');
            updateDebug('Токен: ' + (token ? '"' + token + '"' : 'null/undefined'));
            
            // Проверяем пользователя
            const userInfo = localStorage.getItem('user_info');
            updateDebug('User info: ' + (userInfo ? userInfo : 'null/undefined'));
            
            if (token) {
                if (token === 'valid_admin_token_123') {
                    updateDebug('✅ Токен валидный! Переход к OHIF на корневой путь...');
                    updateDebug('🔄 Временно отключаем редирект dashboard → dashboard...');
                    
                    // Устанавливаем флаг что пользователь авторизован для OHIF
                    localStorage.setItem('ohif_authorized', 'true');
                    localStorage.setItem('redirect_source', 'viewer_auth_check');
                    
                    setTimeout(() => {
                        // Переходим на корневой путь напрямую
                        window.location.replace('/');
                    }, 2000);
                } else {
                    updateDebug('❌ Токен неверный! Ожидался: "valid_admin_token_123", получен: "' + token + '"');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                }
            } else {
                updateDebug('❌ Токен не найден! Очищаем localStorage и переходим к login...');
                localStorage.clear();
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            }
        }
        
        // Запускаем проверку через 1 секунду
        setTimeout(() => {
            updateDebug('Страница загружена, запускаем проверку...');
            checkAuth();
        }, 1000);
    </script>
</body>
</html>"""

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
    </style>
</head>
<body>
    <script>
        // Проверяем не идем ли мы от OHIF viewer обратно к dashboard
        const redirectSource = localStorage.getItem('redirect_source');
        const ohifAuth = localStorage.getItem('ohif_authorized');
        
        if (redirectSource === 'viewer_auth_check' && ohifAuth === 'true') {
            // Если приходим от OHIF viewer, не делаем редирект на dashboard
            console.log('Возврат от OHIF viewer - остаемся на dashboard');
            localStorage.removeItem('redirect_source');
            localStorage.removeItem('ohif_authorized');
        }
    </script>
    
    <div class="container">
        <div class="header">
            <h1>🏥 Clinton Medical PACS</h1>
            <p>Медицинская информационная система</p>
        </div>
        
        <div class="debug-info">
            <strong>Отладка localStorage:</strong><br>
            <span id="token-debug">Проверяю токен...</span>
        </div>
        
        <div class="nav-grid">
            <a href="/viewer" class="nav-button">
                <div class="icon">🔬</div>
                <div class="title">OHIF Viewer</div>
                <div>Просмотр медицинских изображений</div>
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
            <a href="/logout" class="nav-button">
                <div class="icon">🚪</div>
                <div class="title">Выход</div>
                <div>Выход из системы</div>
            </a>
        </div>
        <div style="text-align: center; margin-top: 30px; opacity: 0.7;">
            <p>Система готова • 38 исследований в архиве</p>
        </div>
    </div>
    
    <script>
        // Отладка токена на dashboard
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('user_info');
        const debugElement = document.getElementById('token-debug');
        
        debugElement.innerHTML = 'Токен: ' + (token ? '"' + token + '"' : 'НЕТ') + 
                                '<br>Пользователь: ' + (userInfo ? userInfo : 'НЕТ') +
                                '<br>Все ключи: ' + JSON.stringify(Object.keys(localStorage));
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
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>Clinton Medical PACS</h1>
            <p>Медицинская визуализация</p>
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
            <button type="submit">Войти</button>
            <div id="message"></div>
        </form>
        <div class="info">
            <strong>Логин:</strong> admin<br>
            <strong>Пароль:</strong> admin
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
                    messageDiv.innerHTML = '<div style="color: #27ae60; margin-top: 10px;">Вход выполнен! Переход к системе...</div>';
                    
                    // Сохраняем токен с отладкой
                    console.log('Сохраняем токен:', data.token);
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("user_info", JSON.stringify(data.user));
                    
                    // Проверяем что сохранилось
                    const savedToken = localStorage.getItem("authToken");
                    console.log('Проверяем сохраненный токен:', savedToken);
                    
                    setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="error">Ошибка: ' + data.error + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">Ошибка подключения</div>';
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
    return redirect("/login")

@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "auth"}), 200

if __name__ == "__main__":
    print("Starting auth service...")
    app.run(host="0.0.0.0", port=5000, debug=True) 