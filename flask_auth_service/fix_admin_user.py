#!/usr/bin/env python3
import os
import sys
from flask import Flask
from models import db, User
from werkzeug.security import generate_password_hash

def fix_admin_user():
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
            # Find and update admin user
            admin_user = User.query.filter_by(username='admin').first()
            if admin_user:
                print("Found existing admin user, updating password...")
                # Set password directly without validation
                admin_user.password_hash = generate_password_hash('admin')
                db.session.commit()
                print("Admin password updated successfully!")
            else:
                print("Creating new admin user...")
                # Create new admin user
                admin_user = User(
                    username='admin',
                    password_hash=generate_password_hash('admin'),
                    role='admin'
                )
                db.session.add(admin_user)
                db.session.commit()
                print("Admin user created successfully!")
                
            # Verify user can login
            test_user = User.query.filter_by(username='admin').first()
            if test_user and test_user.check_password('admin'):
                print("✅ Admin login verification successful!")
            else:
                print("❌ Admin login verification failed!")
                
        except Exception as e:
            print(f"Error: {e}")
            db.session.rollback()
            return False
            
    return True

if __name__ == "__main__":
    if fix_admin_user():
        print("Admin user fix completed successfully!")
        sys.exit(0)
    else:
        print("Failed to fix admin user!")
        sys.exit(1) 