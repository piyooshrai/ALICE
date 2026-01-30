"""
ALICE Analysis API
Main endpoint for code analysis
"""

import os
import json
import tempfile
import zipfile
import shutil
from datetime import datetime
from typing import Dict, Any, List
from flask import Flask, request, jsonify
from pathlib import Path

# Import analyzers
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analyzers.frontend_analyzer import FrontendAnalyzer
from analyzers.backend_analyzer import BackendAnalyzer
from analyzers.security_analyzer import SecurityAnalyzer
from analyzers.content_analyzer import ContentAnalyzer
from api.scoring import get_scoring_engine
from utils.email_client import get_email_client
from database.models import DatabaseManager, Analysis, Bug, Report, Developer, Project
from utils.encryption import EncryptionManager

app = Flask(__name__)

# Initialize database
db_manager = DatabaseManager(os.environ.get('DATABASE_URL', 'postgresql://localhost/alice'))


def analyze_codebase(archive_path: str, project_id: str, developer_email: str = None) -> Dict[str, Any]:
    """
    Analyze uploaded code archive

    Args:
        archive_path: Path to uploaded zip file
        project_id: Project ID
        developer_email: Optional developer email

    Returns:
        Analysis results
    """
    # Extract archive
    temp_dir = tempfile.mkdtemp()

    try:
        with zipfile.ZipFile(archive_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        # Initialize analyzers
        frontend_analyzer = FrontendAnalyzer()
        backend_analyzer = BackendAnalyzer()
        security_analyzer = SecurityAnalyzer()
        content_analyzer = ContentAnalyzer()

        all_bugs = []

        # Analyze all files
        for root, dirs, files in os.walk(temp_dir):
            # Skip node_modules, venv, etc.
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'venv', '.git', 'dist', 'build', '__pycache__']]

            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, temp_dir)

                # Skip binary files and dependencies
                if file.endswith(('.pyc', '.png', '.jpg', '.gif', '.svg', '.lock', '.map')):
                    continue

                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()

                    # Determine file type and analyze
                    if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                        bugs = frontend_analyzer.analyze_file(relative_path, content)
                        all_bugs.extend(bugs)

                    if file.endswith(('.py', '.js', '.ts')):
                        bugs = backend_analyzer.analyze_file(relative_path, content)
                        all_bugs.extend(bugs)

                    # Security analysis for all code files
                    if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx')):
                        vulns = security_analyzer.analyze_file(relative_path, content)
                        all_bugs.extend(vulns)

                    # Content analysis for all files
                    issues = content_analyzer.analyze_file(relative_path, content)
                    all_bugs.extend(issues)

                except Exception as e:
                    print(f"Error analyzing {relative_path}: {e}")

        # Get metrics
        frontend_metrics = frontend_analyzer.get_metrics()
        backend_metrics = backend_analyzer.get_metrics()
        security_metrics = security_analyzer.get_metrics()
        content_metrics = content_analyzer.get_metrics()

        # Calculate score
        scoring_engine = get_scoring_engine()
        score, grade, role_level, strengths, weaknesses = scoring_engine.calculate_score(
            all_bugs,
            frontend_metrics,
            backend_metrics,
            security_metrics,
            content_metrics
        )

        # Count bugs by severity
        critical_bugs = len([b for b in all_bugs if b.get('severity') == 'CRITICAL'])
        high_bugs = len([b for b in all_bugs if b.get('severity') == 'HIGH'])
        medium_bugs = len([b for b in all_bugs if b.get('severity') == 'MEDIUM'])
        low_bugs = len([b for b in all_bugs if b.get('severity') == 'LOW'])

        # Determine deployment status
        deployment_status = scoring_engine.determine_deployment_status(score, critical_bugs, high_bugs)

        # Build result
        result = {
            'quality_score': score,
            'grade': grade,
            'role_level': role_level,
            'deployment_status': deployment_status,
            'total_files': frontend_metrics.get('total_files', 0) + backend_metrics.get('total_files', 0),
            'critical_bugs': critical_bugs,
            'high_bugs': high_bugs,
            'medium_bugs': medium_bugs,
            'low_bugs': low_bugs,
            'total_bugs': len(all_bugs),
            'bugs': all_bugs,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'metrics': {
                'frontend': frontend_metrics,
                'backend': backend_metrics,
                'security': security_metrics,
                'content': content_metrics
            },
            'analyzed_at': datetime.utcnow().isoformat()
        }

        return result

    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)


@app.route('/api/analyze', methods=['POST'])
def analyze_endpoint():
    """
    Main analysis endpoint

    Accepts: multipart/form-data with code archive
    Returns: Technical report only (no grades)
    """
    # Verify API key
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401

    # Get project from API key
    session = db_manager.get_session()
    encryption = EncryptionManager()

    try:
        api_key_hash = encryption.hash_api_key(api_key)
        project = session.query(Project).filter_by(api_key_hash=api_key_hash).first()

        if not project:
            return jsonify({'error': 'Invalid API key'}), 401

        # Get uploaded file
        if 'archive' not in request.files:
            return jsonify({'error': 'No archive file provided'}), 400

        archive = request.files['archive']
        developer_email = request.form.get('developer_email')
        developer_name = request.form.get('developer_name', 'Unknown Developer')

        # Save uploaded file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        archive.save(temp_file.name)
        temp_file.close()

        # Analyze codebase
        result = analyze_codebase(temp_file.name, str(project.id), developer_email)

        # Get or create developer
        developer = None
        if developer_email:
            developer = session.query(Developer).filter_by(email=developer_email).first()
            if not developer:
                developer = Developer(
                    name=developer_name,
                    email=developer_email,
                    current_grade=result['grade'],
                    current_score=result['quality_score'],
                    role_level=result['role_level']
                )
                session.add(developer)
            else:
                developer.current_grade = result['grade']
                developer.current_score = result['quality_score']
                developer.role_level = result['role_level']

        # Store analysis in database
        analysis = Analysis(
            project_id=project.id,
            developer_id=developer.id if developer else None,
            quality_score=result['quality_score'],
            grade=result['grade'],
            role_level=result['role_level'],
            total_files=result['total_files'],
            critical_bugs=result['critical_bugs'],
            high_bugs=result['high_bugs'],
            medium_bugs=result['medium_bugs'],
            low_bugs=result['low_bugs'],
            deployment_status=result['deployment_status'],
            strengths=result['strengths'],
            weaknesses=result['weaknesses'],
            raw_data=result
        )
        session.add(analysis)
        session.flush()

        # Store bugs
        for bug in result['bugs']:
            bug_record = Bug(
                analysis_id=analysis.id,
                severity=bug.get('severity', 'LOW'),
                category=bug.get('category', 'Unknown'),
                file_path=bug.get('file_path'),
                line_number=bug.get('line_number'),
                description=bug.get('description', ''),
                impact=bug.get('impact', ''),
                fix_suggestion=bug.get('fix_suggestion', '')
            )
            session.add(bug_record)

        session.commit()

        # Send emails
        email_client = get_email_client()

        # Technical report to developer
        if developer_email:
            summary = {
                'total_files': result['total_files'],
                'tests_passed': max(0, result['total_files'] - result['critical_bugs']),
                'tests_failed': result['critical_bugs'],
                'critical_bugs': result['critical_bugs'],
                'high_bugs': result['high_bugs'],
                'medium_bugs': result['medium_bugs']
            }

            email_client.send_technical_report(
                developer_email,
                project.name,
                result['quality_score'],
                result['deployment_status'],
                result['bugs'],
                summary
            )

            # Management assessment
            email_client.send_management_assessment(
                developer_name,
                developer_email,
                project.name,
                result['grade'],
                result['quality_score'],
                result['role_level'],
                {
                    'total_files': result['total_files'],
                    'critical_bugs': result['critical_bugs'],
                    'high_bugs': result['high_bugs'],
                    'medium_bugs': result['medium_bugs'],
                    'test_failure_rate': (result['critical_bugs'] / max(result['total_files'], 1)) * 100
                },
                result['strengths'],
                result['weaknesses']
            )

        # Return technical report only (no grades/assessments)
        technical_response = {
            'status': 'success',
            'analysis_id': str(analysis.id),
            'quality_score': result['quality_score'],
            'deployment_status': result['deployment_status'],
            'total_files': result['total_files'],
            'issues': {
                'critical': result['critical_bugs'],
                'high': result['high_bugs'],
                'medium': result['medium_bugs'],
                'low': result['low_bugs']
            },
            'bugs': result['bugs'],
            'analyzed_at': result['analyzed_at']
        }

        return jsonify(technical_response), 200

    except Exception as e:
        session.rollback()
        print(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

    finally:
        session.close()
        # Cleanup temp file
        try:
            os.unlink(temp_file.name)
        except:
            pass


# Vercel serverless handler
def handler(request):
    """Vercel serverless function handler"""
    with app.request_context(request.environ):
        return app.full_dispatch_request()
