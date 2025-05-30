#!/usr/bin/env python3
"""
Script to create or update admin user with простые логин/пароль
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import User

def create_or_update_admin():
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Create or update admin user with simple admin/admin credentials
        admin_user = User.query.filter_by(username='admin').first()
        
        if admin_user:
            print("Updating existing admin user...")
            admin_user.set_password('admin')
            admin_user.role = 'admin'
        else:
            print("Creating new admin user...")
            admin_user = User(username='admin', role='admin')
            admin_user.set_password('admin')
            db.session.add(admin_user)
        
        # Also ensure doctor and operator users exist with simple passwords
        doctor_user = User.query.filter_by(username='doctor').first()
        if doctor_user:
            print("Updating doctor user...")
            doctor_user.set_password('doctor')
        else:
            print("Creating doctor user...")
            doctor_user = User(username='doctor', role='doctor')
            doctor_user.set_password('doctor')
            db.session.add(doctor_user)
        
        operator_user = User.query.filter_by(username='operator').first()
        if operator_user:
            print("Updating operator user...")
            operator_user.set_password('operator')
        else:
            print("Creating operator user...")
            operator_user = User(username='operator', role='operator')
            operator_user.set_password('operator')
            db.session.add(operator_user)
        
        try:
            db.session.commit()
            print("✅ Users created/updated successfully!")
            print("🔑 Login credentials:")
            print("   Admin: admin / admin")
            print("   Doctor: doctor / doctor")
            print("   Operator: operator / operator")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating/updating users: {e}")
            return False
        
        return True

if __name__ == '__main__':
    success = create_or_update_admin()
    sys.exit(0 if success else 1) 