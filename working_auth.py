import os
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib

app = Flask(__name__)
CORS(app)

# Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'ClintonPACSJWTSecret2024!VerySecureKey')
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://pacs_user:ClintonPACS2024!SecureDB@localhost:5432/pacs_db')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_database():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Create users table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'doctor',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create default users if they don't exist
        users = [
            ('admin', 'admin@clinton-medical.com', 'admin123', 'admin'),
            ('doctor', 'doctor@clinton-medical.com', 'doctor123', 'doctor'),
            ('operator', 'operator@clinton-medical.com', 'operator123', 'operator')
        ]
        
        for username, email, password, role in users:
            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if not cur.fetchone():
                password_hash = hash_password(password)
                cur.execute(
                    "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                    (username, email, password_hash, role)
                )
        
        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

@app.route('/')
def main_page():
    # Simple redirect logic - auth check handled by JavaScript on dashboard
    return redirect('/dashboard')

@app.route('/dashboard')
def dashboard_page():
    try:
        with open('/app/auth_landing.html', 'r') as f:
            return f.read()
    except:
        return '''<!DOCTYPE html>
<html><head><title>Clinton Medical PACS - Dashboard</title></head>
<body><h1>Loading Dashboard...</h1>
<script>
const token = localStorage.getItem('auth_token');
if (!token) { 
    window.location.href = '/login'; 
} else { 
    document.body.innerHTML = '<h1>Welcome to Clinton Medical PACS</h1><p>Dashboard loading...</p><a href="/">🔗 Go to OHIF Viewer</a>'; 
}
</script></body></html>'''

@app.route('/login')
def login_page():
    return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clinton Medical PACS - Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 50px; }
        .login-container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; color: #2c3e50; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="password"] { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #2980b9; }
        .error { color: #e74c3c; margin-top: 10px; }
        .info { color: #27ae60; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>Clinton Medical PACS</h1>
            <p>Secure Medical Imaging System</p>
        </div>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
            <div id="message"></div>
        </form>
        <div class="info" style="margin-top: 20px; font-size: 14px;">
            <strong>Test Credentials:</strong><br>
            Username: admin / Password: admin123
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
                    messageDiv.innerHTML = '<div class="info">Login successful! Redirecting...</div>';
                    localStorage.setItem("auth_token", data.token);
                    localStorage.setItem("user_info", JSON.stringify(data.user));
                    setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="error">Error: ' + data.error + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">Connection error: ' + error.message + '</div>';
            }
        });
    </script>
</body>
</html>'''

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE username = %s AND is_active = TRUE", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if user and user['password_hash'] == hash_password(password):
            token = jwt.encode({
                'user_id': user['id'],
                'username': user['username'],
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, JWT_SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'role': user['role']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'auth'}), 200

if __name__ == '__main__':
    print("Initializing database...")
    init_database()
    print("Starting Flask application...")
    app.run(host='0.0.0.0', port=5000, debug=True) 