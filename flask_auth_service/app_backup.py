import os
import json
import jwt
import datetime
import re
from functools import wraps
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from auth import auth_bp
from models import db, User, Session, AuditLog
from reports import reports_bp

app = Flask(__name__)

# Configuration from environment variables
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt_secret_key_change_in_production')
app.config['ORTHANC_URL'] = os.environ.get('ORTHANC_URL', 'http://orthanc:8042')
# These might be used if the auth service needs to query Orthanc directly with admin rights
# app.config['ORTHANC_USERNAME'] = os.environ.get('ORTHANC_USERNAME')
# app.config['ORTHANC_PASSWORD'] = os.environ.get('ORTHANC_PASSWORD')

# SQLAlchemy Configuration
#DATABASE_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'auth_users.db')
# Ensure the database is stored in a persistent volume mapped in docker-compose
DATA_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True) # Ensure data directory exists
DATABASE_PATH = os.path.join(DATA_DIR, 'auth_users.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////app/data/users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize db with app
db.init_app(app)

JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_HOURS_DOCTOR_OPERATOR = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES_HOURS_DOCTOR_OPERATOR', 8))
JWT_EXP_DELTA_HOURS_ADMIN = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES_HOURS_ADMIN', 24))

# RBAC Permission Rules
PERMISSION_RULES = {
    'admin': {
        # Админ имеет полный доступ
        'allowed_methods': ['GET', 'POST', 'PUT', 'DELETE'],
        'allowed_paths': ['.*']  # Все пути
    },
    'doctor': {
        # Врач может читать данные пациентов, создавать/редактировать отчеты
        'allowed_methods': ['GET', 'POST', 'PUT'],
        'allowed_paths': [
            r'^/patients.*',
            r'^/studies.*',
            r'^/series.*',
            r'^/instances.*',
            r'^/dicom-web.*',
            r'^/tools/find.*',
            r'^/tools/lookup.*',
            r'^/reports.*',  # Для работы с отчетами
            r'^/app.*',      # Orthanc Explorer
        ],
        'denied_paths': [
            r'^/modalities.*',
            r'^/peers.*',
            r'^/system.*',
            r'^/tools/reset.*',
            r'^/tools/shutdown.*',
        ]
    },
    'operator': {
        # Оператор может только загружать и просматривать базовую информацию
        'allowed_methods': ['GET', 'POST'],
        'allowed_paths': [
            r'^/patients$',
            r'^/patients/[^/]+$',
            r'^/studies$',
            r'^/studies/[^/]+$',
            r'^/instances$',
            r'^/instances.*',  # Для загрузки DICOM
            r'^/tools/find$',
            r'^/app.*',
        ],
        'denied_paths': [
            r'^/patients/.*/modify.*',
            r'^/patients/.*/delete.*',
            r'^/studies/.*/modify.*',
            r'^/studies/.*/delete.*',
            r'^/reports.*',
            r'^/modalities.*',
            r'^/peers.*',
            r'^/system.*',
            r'^/tools/reset.*',
            r'^/tools/shutdown.*',
        ]
    }
}

# Audit logging
def log_access(username, roles, method, uri, authorized):
    """Логирование всех попыток доступа для audit trail"""
    timestamp = datetime.datetime.utcnow().isoformat()
    log_entry = {
        'timestamp': timestamp,
        'username': username,
        'roles': roles,
        'method': method,
        'uri': uri,
        'authorized': authorized
    }
    app.logger.info(f"AUDIT: {json.dumps(log_entry)}")

    def __repr__(self):
        return f'<User {self.username}>'


def _generate_jwt_token(username, roles_list):
    if "admin" in roles_list:
        delta_hours = JWT_EXP_DELTA_HOURS_ADMIN
    else:
        delta_hours = JWT_EXP_DELTA_HOURS_DOCTOR_OPERATOR
    
    payload = {
        'user': username,
        'roles': roles_list,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=delta_hours),
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm=JWT_ALGORITHM)
    return token

def check_permissions(roles, method, uri):
    """Проверка разрешений на основе ролей, HTTP метода и URI"""
    # Если нет ролей - доступ запрещен
    if not roles:
        return False
    
    # Проверяем каждую роль пользователя
    for role in roles:
        if role not in PERMISSION_RULES:
            continue
            
        rules = PERMISSION_RULES[role]
        
        # Проверяем HTTP метод
        if method not in rules['allowed_methods']:
            continue
            
        # Проверяем запрещенные пути (имеют приоритет)
        if 'denied_paths' in rules:
            for denied_pattern in rules['denied_paths']:
                if re.match(denied_pattern, uri):
                    return False
        
        # Проверяем разрешенные пути
        for allowed_pattern in rules['allowed_paths']:
            if re.match(allowed_pattern, uri):
                return True
    
    return False

# --- Orthanc Authorization Plugin Endpoint ---
@app.route('/auth', methods=['POST'])
def orthanc_authorize():
    """
    Endpoint called by Orthanc's Authorization Plugin.
    It expects a JSON payload with details about the request to be authorized.
    It should return a JSON response: {"authorized": true/false, "roles": ["role1", ...], "username": "user"}
    """
    try:
        auth_request_data = request.get_json()
        if not auth_request_data:
            return jsonify({"authorized": False, "message": "No data provided"}), 400

        # Extract relevant information from auth_request_data
        # This includes http_verb, uri, peer_address, authorization_header, etc.
        # For simplicity, we'll focus on the Authorization header if present.
        
        uri = auth_request_data.get('uri', '')
        method = auth_request_data.get('method', '').upper()
        auth_header = auth_request_data.get('headers', {}).get('Authorization', '')
        
        token = None
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            log_access('anonymous', [], method, uri, False)
            # No token, perhaps basic auth or Orthanc internal user?
            # If Orthanc's AuthenticationEnabled is true, it handles its own users first.
            # This plugin endpoint is then called. If no token, decide if unauthenticated access is allowed for this route.
            # For this example, we deny if no token is present for simplicity.
            app.logger.warning(f"Auth attempt denied for {uri}: No token.")
            return jsonify({"authorized": False, "message": "Missing authorization token"}), 200 # Orthanc expects 200 OK

        try:
            payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=[JWT_ALGORITHM])
            username = payload['user']
            roles = payload['roles']
            app.logger.info(f"Token validated for user: {username}, roles: {roles}")
            
            # Проверяем пользователя в БД
            user_from_db = User.query.filter_by(username=username).first()
            if not user_from_db:
                log_access(username, roles, method, uri, False)
                app.logger.warning(f"User {username} from token not found in DB.")
                return jsonify({"authorized": False, "message": "User from token not found"}), 200

            # Проверяем соответствие ролей
            if set(roles) != set(user_from_db.get_roles_list()):
                log_access(username, roles, method, uri, False)
                app.logger.warning(f"Roles in token for user {username} do not match DB roles.")
                return jsonify({"authorized": False, "message": "Token roles mismatch"}), 200

            # Проверяем разрешения
            authorized = check_permissions(roles, method, uri)
            log_access(username, roles, method, uri, authorized)
            
            if authorized:
                return jsonify({
                    "authorized": True, 
                    "username": username,
                    "roles": roles,
                    "message": "Access granted by RBAC"
                }), 200
            else:
                return jsonify({
                    "authorized": False,
                    "message": f"Access denied for role(s) {roles} to {method} {uri}"
                }), 200
        except jwt.ExpiredSignatureError:
            log_access('unknown', [], method, uri, False)
            app.logger.warning(f"Auth attempt denied for {uri}: Expired token.")
            return jsonify({"authorized": False, "message": "Token has expired"}), 200
        except jwt.InvalidTokenError:
            log_access('unknown', [], method, uri, False)
            app.logger.warning(f"Auth attempt denied for {uri}: Invalid token.")
            return jsonify({"authorized": False, "message": "Invalid token"}), 200

    except Exception as e:
        app.logger.error(f"Error in /auth endpoint: {str(e)}")
        # Permissive = false in orthanc.json means Orthanc will deny access if this service errors out.
        return jsonify({"authorized": False, "message": f"Authorization service error: {str(e)}"}), 500

# --- User Login Endpoint (Example) ---
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return make_response(jsonify({'message': 'Username and password required'}), 400)

    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        roles_list = user.get_roles_list()
        token = _generate_jwt_token(username, roles_list)
        app.logger.info(f"User {username} logged in successfully.")
        return jsonify({'token': token, 'roles': roles_list, 'username': username}), 200
    else:
        app.logger.warning(f"Login failed for user {username}.")
        return make_response(jsonify({'message': 'Invalid credentials'}), 401)

# --- Health Check Endpoint ---
@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check DB connection
        db.session.execute('SELECT 1')
        return jsonify({"status": "healthy", "service": "Flask Authorization Service", "db_status": "connected"}), 200
    except Exception as e:
        app.logger.error(f"Health check DB connection error: {str(e)}")
        return jsonify({"status": "unhealthy", "service": "Flask Authorization Service", "db_status": "error", "error_message": str(e)}), 503

# --- CLI command to initialize DB and create users ---
@app.cli.command("init-db")
def init_db_command():
    """Creates the database tables and a default admin user."""
    db.create_all()
    print("Initialized the database.")

    # Create default users if they don't exist
    default_users = [
        {"username": "admin_pacs", "password": os.environ.get('DEFAULT_ADMIN_PASSWORD', "supersecretadmin"), "roles": "admin,doctor"},
        {"username": "doctor_pacs", "password": "doctorsecret", "roles": "doctor"},
        {"username": "operator_pacs", "password": "operatorsecret", "roles": "operator"}
    ]

    for user_data in default_users:
        if not User.query.filter_by(username=user_data["username"]).first():
            user = User(username=user_data["username"], roles=user_data["roles"])
            user.set_password(user_data["password"])
            db.session.add(user)
            print(f"Created user: {user_data['username']}")
    db.session.commit()
    print("Default users checked/created.")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='')
app.register_blueprint(reports_bp, url_prefix='/api')

if __name__ == '__main__':
    # Ensure DB is created before first run in dev mode
    # In production, `flask init-db` should be called explicitly or as part of entrypoint/CMD
    with app.app_context():
        db.create_all() # Creates tables if they don't exist
        # Consider calling init_db_command logic here too if needed for dev convenience
        # but `flask init-db` is cleaner for explicit setup.

    app.run(host='0.0.0.0', port=int(os.environ.get("FLASK_RUN_PORT", 5000)), debug=True) 