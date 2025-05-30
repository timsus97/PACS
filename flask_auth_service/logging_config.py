import logging
import json
import sys
from datetime import datetime
from flask import has_request_context, request

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'message': record.getMessage(),
            'service': 'flask_auth',
            'environment': 'production'
        }
        
        # Add request context if available
        if has_request_context():
            log_data['request'] = {
                'method': request.method,
                'path': request.path,
                'remote_addr': request.remote_addr,
                'user_agent': request.headers.get('User-Agent'),
                'request_id': request.headers.get('X-Request-ID')
            }
            
            # Add user info if authenticated
            if hasattr(request, 'current_user') and request.current_user:
                log_data['user'] = {
                    'id': request.current_user.id,
                    'username': request.current_user.username,
                    'role': request.current_user.role
                }
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': self.formatException(record.exc_info)
            }
        
        # Add custom fields from record
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'created', 'filename', 
                          'funcName', 'levelname', 'levelno', 'lineno', 
                          'module', 'msecs', 'pathname', 'process', 
                          'processName', 'relativeCreated', 'thread', 
                          'threadName', 'exc_info', 'exc_text', 'stack_info']:
                log_data[key] = value
        
        return json.dumps(log_data, ensure_ascii=False)

def setup_logging(app):
    """Setup structured logging for the Flask application"""
    
    # Remove default handlers
    app.logger.handlers = []
    
    # Console handler with JSON formatter
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JSONFormatter())
    app.logger.addHandler(console_handler)
    
    # File handler for persistent logs
    log_dir = '/var/log/flask_auth'
    import os
    os.makedirs(log_dir, exist_ok=True)
    
    file_handler = logging.FileHandler(f'{log_dir}/app.log')
    file_handler.setFormatter(JSONFormatter())
    app.logger.addHandler(file_handler)
    
    # Set log level
    app.logger.setLevel(logging.INFO)
    
    # Log all requests
    @app.before_request
    def log_request():
        app.logger.info('Request received', extra={
            'action': 'request_start',
            'request_method': request.method,
            'request_path': request.path,
            'request_size': request.content_length
        })
    
    @app.after_request
    def log_response(response):
        app.logger.info('Request completed', extra={
            'action': 'request_complete',
            'response_status': response.status_code,
            'response_size': response.content_length
        })
        return response
    
    # Log authentication events
    def log_auth_event(event_type, username, success=True, details=None):
        extra = {
            'action': event_type,
            'username': username,
            'success': success,
            'auth_event': True
        }
        if details:
            extra['details'] = details
            
        if success:
            app.logger.info(f'Authentication event: {event_type}', extra=extra)
        else:
            app.logger.warning(f'Authentication failure: {event_type}', extra=extra)
    
    # Log data access events  
    def log_data_access(user_id, resource_type, resource_id, action):
        app.logger.info('Data access event', extra={
            'action': action,
            'user_id': user_id,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'data_access_event': True,
            'phi_access': resource_type in ['patient', 'study', 'report']
        })
    
    # Attach logging functions to app
    app.log_auth = log_auth_event
    app.log_data_access = log_data_access
    
    return app 