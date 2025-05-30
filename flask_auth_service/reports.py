# Reports module for doctor's reports management
import json
import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from functools import wraps
from models import db, User, AuditLog
from auth import token_required, role_required
import hashlib
import uuid

reports_bp = Blueprint('reports', __name__)

# Reports storage directory
REPORTS_DIR = '/app/data/reports'
os.makedirs(REPORTS_DIR, exist_ok=True)

class Report:
    """Report model for storing doctor's reports"""
    
    def __init__(self, study_uid, author_id, content, report_type='medical'):
        self.id = str(uuid.uuid4())
        self.study_uid = study_uid
        self.author_id = author_id
        self.content = content
        self.report_type = report_type
        self.created_at = datetime.utcnow().isoformat()
        self.updated_at = self.created_at
        self.version = 1
        self.status = 'draft'
        self.signature_hash = None
        
    def to_dict(self):
        return {
            'id': self.id,
            'study_uid': self.study_uid,
            'author_id': self.author_id,
            'content': self.content,
            'report_type': self.report_type,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'version': self.version,
            'status': self.status,
            'signature_hash': self.signature_hash
        }
    
    def sign(self, author_name):
        """Generate digital signature for the report"""
        signature_data = f"{self.id}:{self.study_uid}:{self.content}:{author_name}:{self.created_at}"
        self.signature_hash = hashlib.sha256(signature_data.encode()).hexdigest()
        self.status = 'signed'
        
    def save(self):
        """Save report to filesystem"""
        # Create directory structure: /reports/study_uid/
        study_dir = os.path.join(REPORTS_DIR, self.study_uid)
        os.makedirs(study_dir, exist_ok=True)
        
        # Save report as JSON
        report_file = os.path.join(study_dir, f"{self.id}.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)
            
        # Save version history
        history_dir = os.path.join(study_dir, 'history')
        os.makedirs(history_dir, exist_ok=True)
        history_file = os.path.join(history_dir, f"{self.id}_v{self.version}.json")
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)
            
        return report_file
    
    @staticmethod
    def load(study_uid, report_id):
        """Load report from filesystem"""
        report_file = os.path.join(REPORTS_DIR, study_uid, f"{report_id}.json")
        if not os.path.exists(report_file):
            return None
            
        with open(report_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        report = Report(data['study_uid'], data['author_id'], data['content'])
        report.id = data['id']
        report.created_at = data['created_at']
        report.updated_at = data['updated_at']
        report.version = data['version']
        report.status = data['status']
        report.signature_hash = data.get('signature_hash')
        report.report_type = data.get('report_type', 'medical')
        
        return report
    
    @staticmethod
    def list_by_study(study_uid):
        """List all reports for a study"""
        study_dir = os.path.join(REPORTS_DIR, study_uid)
        if not os.path.exists(study_dir):
            return []
            
        reports = []
        for filename in os.listdir(study_dir):
            if filename.endswith('.json'):
                report_id = filename[:-5]  # Remove .json extension
                report = Report.load(study_uid, report_id)
                if report:
                    reports.append(report)
                    
        return sorted(reports, key=lambda r: r.created_at, reverse=True)

@reports_bp.route('/reports/<study_uid>', methods=['GET'])
@token_required
def get_reports(current_user, study_uid):
    """Get all reports for a study"""
    try:
        # Log access
        audit = AuditLog(
            user_id=current_user.id,
            action='view_reports',
            resource_type='study',
            resource_id=study_uid,
            details=f"Viewed reports for study {study_uid}"
        )
        db.session.add(audit)
        db.session.commit()
        
        reports = Report.list_by_study(study_uid)
        return jsonify({
            'success': True,
            'reports': [r.to_dict() for r in reports]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@reports_bp.route('/reports/<study_uid>/<report_id>', methods=['GET'])
@token_required
def get_report(current_user, study_uid, report_id):
    """Get specific report"""
    try:
        report = Report.load(study_uid, report_id)
        if not report:
            return jsonify({
                'success': False,
                'message': 'Report not found'
            }), 404
            
        # Log access
        audit = AuditLog(
            user_id=current_user.id,
            action='view_report',
            resource_type='report',
            resource_id=report_id,
            details=f"Viewed report {report_id}"
        )
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@reports_bp.route('/reports', methods=['POST'])
@token_required
@role_required(['doctor', 'admin'])
def create_report(current_user):
    """Create new report"""
    try:
        data = request.get_json()
        
        if not data or 'study_uid' not in data or 'content' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
            
        report = Report(
            study_uid=data['study_uid'],
            author_id=current_user.id,
            content=data['content'],
            report_type=data.get('report_type', 'medical')
        )
        
        # Auto-sign if requested
        if data.get('sign', False):
            report.sign(current_user.username)
            
        report.save()
        
        # Log creation
        audit = AuditLog(
            user_id=current_user.id,
            action='create_report',
            resource_type='report',
            resource_id=report.id,
            details=f"Created report for study {report.study_uid}"
        )
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'report': report.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@reports_bp.route('/reports/<study_uid>/<report_id>', methods=['PUT'])
@token_required
@role_required(['doctor', 'admin'])
def update_report(current_user, study_uid, report_id):
    """Update existing report"""
    try:
        report = Report.load(study_uid, report_id)
        if not report:
            return jsonify({
                'success': False,
                'message': 'Report not found'
            }), 404
            
        # Check if user is the author or admin
        if report.author_id != current_user.id and current_user.role != 'admin':
            return jsonify({
                'success': False,
                'message': 'Unauthorized to edit this report'
            }), 403
            
        data = request.get_json()
        
        # Update content
        if 'content' in data:
            report.content = data['content']
            report.version += 1
            report.updated_at = datetime.utcnow().isoformat()
            
            # Re-sign if requested
            if data.get('sign', False):
                report.sign(current_user.username)
            else:
                report.status = 'draft'
                report.signature_hash = None
                
        report.save()
        
        # Log update
        audit = AuditLog(
            user_id=current_user.id,
            action='update_report',
            resource_type='report',
            resource_id=report.id,
            details=f"Updated report {report_id} to version {report.version}"
        )
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@reports_bp.route('/reports/<study_uid>/<report_id>/versions', methods=['GET'])
@token_required
def get_report_versions(current_user, study_uid, report_id):
    """Get version history of a report"""
    try:
        history_dir = os.path.join(REPORTS_DIR, study_uid, 'history')
        if not os.path.exists(history_dir):
            return jsonify({
                'success': True,
                'versions': []
            }), 200
            
        versions = []
        for filename in os.listdir(history_dir):
            if filename.startswith(f"{report_id}_v"):
                with open(os.path.join(history_dir, filename), 'r', encoding='utf-8') as f:
                    version_data = json.load(f)
                    versions.append({
                        'version': version_data['version'],
                        'updated_at': version_data['updated_at'],
                        'status': version_data['status']
                    })
                    
        versions.sort(key=lambda v: v['version'], reverse=True)
        
        return jsonify({
            'success': True,
            'versions': versions
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@reports_bp.route('/reports/export/<study_uid>/<report_id>', methods=['GET'])
@token_required
def export_report(current_user, study_uid, report_id):
    """Export report data for PDF generation"""
    try:
        report = Report.load(study_uid, report_id)
        if not report:
            return jsonify({
                'success': False,
                'message': 'Report not found'
            }), 404
            
        # Get author information
        author = User.query.get(report.author_id)
        
        # Prepare export data
        export_data = {
            'report': report.to_dict(),
            'author': {
                'name': author.username if author else 'Unknown',
                'role': author.role if author else 'Unknown'
            },
            'export_date': datetime.utcnow().isoformat(),
            'institution': 'Klinika Pro'
        }
        
        # Log export
        audit = AuditLog(
            user_id=current_user.id,
            action='export_report',
            resource_type='report',
            resource_id=report_id,
            details=f"Exported report {report_id} for PDF generation"
        )
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'export_data': export_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500 