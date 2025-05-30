# auth.py - Authentication functions for Flask app
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        from models import User
        
        token = None
        auth_header = request.headers.get('Authorization', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing', 'error': 'unauthorized'}), 401
        
        try:
            # Use current_app instead of importing app
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(username=data['user']).first()
            
            if not current_user:
                return jsonify({'message': 'User not found', 'error': 'unauthorized'}), 401
                
            if not current_user.is_active:
                return jsonify({'message': 'User account is disabled', 'error': 'unauthorized'}), 401
                
            # Validate roles
            if 'roles' in data and data['roles'] != current_user.get_roles_list():
                return jsonify({'message': 'Invalid token roles', 'error': 'unauthorized'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired', 'error': 'token_expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token', 'error': 'invalid_token'}), 401
        except Exception as e:
            current_app.logger.error(f"Token validation error: {str(e)}")
            return jsonify({'message': 'Token validation failed', 'error': 'server_error'}), 500
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if not isinstance(allowed_roles, (list, tuple)):
                roles_list = [allowed_roles]
            else:
                roles_list = allowed_roles
                
            if current_user.role not in roles_list:
                return jsonify({
                    'message': 'Insufficient permissions',
                    'error': 'forbidden',
                    'required_roles': roles_list,
                    'user_role': current_user.role
                }), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator 