from flask import Flask, request, jsonify, redirect
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def main_page():
    return redirect('/dashboard')

@app.route('/dashboard')
def dashboard_page():
    return '''<!DOCTYPE html>
<html><head><title>Clinton Medical PACS - Dashboard</title></head>
<body style="font-family: Arial; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 50px; color: white;">
<div style="max-width: 400px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 12px; text-align: center;">
<h1>Clinton Medical PACS</h1>
<p>Добро пожаловать в систему!</p>
<div style="margin-top: 30px;">
<a href="/" style="display: inline-block; margin: 10px; padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 6px;">📊 DICOM Viewer</a>
<a href="/orthanc" style="display: inline-block; margin: 10px; padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 6px;">🗃️ DICOM Archive</a>
<a href="/monitoring" style="display: inline-block; margin: 10px; padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 6px;">📈 Monitoring</a>
</div>
</div>
</body></html>'''

@app.route('/login')
def login_page():
    return '''<!DOCTYPE html>
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
                    localStorage.setItem("auth_token", data.token);
                    localStorage.setItem("user_info", JSON.stringify(data.user));
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
</html>'''

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        # ПРОВЕРКА admin/admin
        if username == 'admin' and password == 'admin':
            return jsonify({
                'token': 'valid_admin_token_123',
                'user': {
                    'id': 1,
                    'username': username,
                    'email': f'{username}@clinton-medical.com',
                    'role': 'admin'
                }
            }), 200
        else:
            return jsonify({'error': 'Неверный логин или пароль'}), 401
            
    except Exception as e:
        return jsonify({'error': 'Ошибка сервера'}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'auth'}), 200

if __name__ == '__main__':
    print("Starting auth service...")
    app.run(host='0.0.0.0', port=5000, debug=True) 