import os
from flask import Flask, request, jsonify
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
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://pacs_user:ClintonPACS2024!SecureDB@db_pacs:5432/pacs_db')

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

@app.route('/api/verify', methods=['POST'])
def verify_token():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token required'}), 400
        
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return jsonify({'valid': True, 'user': payload}), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
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