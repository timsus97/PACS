#!/usr/bin/env python3
import os
import sys
from flask import Flask
from models import db, User, Session, AuditLog
from werkzeug.security import generate_password_hash

def init_db():
    app = Flask(__name__)
    
    # Configure the Flask app
    DATA_DIR = '/app/data'
    os.makedirs(DATA_DIR, exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(DATA_DIR, "users.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize the database
    db.init_app(app)
    
    with app.app_context():
        try:
            # Drop all tables if they exist
            db.drop_all()
            print("Dropped existing tables")
            
            # Create all tables
            db.create_all()
            print("Created new tables")
            
            # Create default users
            default_users = [
                {
                    'username': 'admin',
                    'password': 'admin_password_change_me_12345',
                    'role': 'admin',
                    'email': 'admin@klinika.pro'
                },
                {
                    'username': 'doctor',
                    'password': 'doctor_password_change_me_12345',
                    'role': 'doctor',
                    'email': 'doctor@klinika.pro'
                },
                {
                    'username': 'operator',
                    'password': 'operator_password_change_me_12345',
                    'role': 'operator',
                    'email': 'operator@klinika.pro'
                }
            ]
            
            for user_data in default_users:
                user = User(
                    username=user_data['username'],
                    role=user_data['role'],
                    email=user_data['email'],
                    is_active=True
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                print(f"Created user: {user_data['username']}")
            
            db.session.commit()
            print("Database initialized successfully with default users")
            
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            db.session.rollback()
            sys.exit(1)

if __name__ == '__main__':
    init_db() 