"""
ALICE Authentication API
API key management and project creation
"""

import os
import secrets
from datetime import datetime
from flask import Flask, request, jsonify, make_response
from database.models import DatabaseManager, Project
from utils.encryption import EncryptionManager

app = Flask(__name__)

# Build timestamp for debugging
BUILD_TIMESTAMP = datetime.utcnow().isoformat()

# Initialize database
db_manager = DatabaseManager(os.environ.get('DATABASE_URL', 'postgresql://localhost/alice'))
encryption = EncryptionManager()


def add_cors_headers(response):
    """Add CORS headers to response"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Key, X-Admin-Key'
    response.headers['Access-Control-Max-Age'] = '3600'
    response.headers['X-ALICE-Build'] = BUILD_TIMESTAMP
    return response


def generate_api_key() -> str:
    """Generate secure API key"""
    return f"alice_{secrets.token_urlsafe(32)}"


@app.route('/api/projects', methods=['POST', 'OPTIONS'])
def create_project():
    """
    Create new project and generate API key

    Request body:
        {
            "name": "Project Name",
            "admin_key": "admin_secret_key"
        }

    Returns:
        {
            "project_id": "uuid",
            "api_key": "alice_xxxxx",
            "name": "Project Name"
        }
    """
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        return add_cors_headers(response)

    # Verify admin key
    admin_key = request.json.get('admin_key')
    expected_admin_key = os.environ.get('ADMIN_API_KEY')

    if not admin_key or admin_key != expected_admin_key:
        response = make_response(jsonify({'error': 'Unauthorized - invalid admin key'}), 401)
        return add_cors_headers(response)

    project_name = request.json.get('name')
    if not project_name:
        response = make_response(jsonify({'error': 'Project name required'}), 400)
        return add_cors_headers(response)

    session = db_manager.get_session()

    try:
        # Generate API key
        api_key = generate_api_key()
        api_key_hash = encryption.hash_api_key(api_key)

        # Create project
        project = Project(
            name=project_name,
            api_key=api_key,
            api_key_hash=api_key_hash
        )

        session.add(project)
        session.commit()

        response = make_response(jsonify({
            'project_id': str(project.id),
            'api_key': api_key,
            'name': project.name,
            'created_at': project.created_at.isoformat(),
            '_build': BUILD_TIMESTAMP
        }), 201)
        return add_cors_headers(response)

    except Exception as e:
        session.rollback()
        response = make_response(jsonify({'error': f'Failed to create project: {str(e)}'}), 500)
        return add_cors_headers(response)

    finally:
        session.close()


@app.route('/api/projects/<project_id>/regenerate-key', methods=['POST', 'OPTIONS'])
def regenerate_api_key(project_id: str):
    """
    Regenerate API key for existing project

    Requires admin key in header: X-Admin-Key
    """
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        return add_cors_headers(response)

    admin_key = request.headers.get('X-Admin-Key')
    expected_admin_key = os.environ.get('ADMIN_API_KEY')

    if not admin_key or admin_key != expected_admin_key:
        response = make_response(jsonify({'error': 'Unauthorized'}), 401)
        return add_cors_headers(response)

    session = db_manager.get_session()

    try:
        project = session.query(Project).filter_by(id=project_id).first()

        if not project:
            response = make_response(jsonify({'error': 'Project not found'}), 404)
            return add_cors_headers(response)

        # Generate new API key
        new_api_key = generate_api_key()
        new_api_key_hash = encryption.hash_api_key(new_api_key)

        project.api_key = new_api_key
        project.api_key_hash = new_api_key_hash

        session.commit()

        response = make_response(jsonify({
            'project_id': str(project.id),
            'api_key': new_api_key,
            'message': 'API key regenerated successfully'
        }), 200)
        return add_cors_headers(response)

    except Exception as e:
        session.rollback()
        response = make_response(jsonify({'error': f'Failed to regenerate key: {str(e)}'}), 500)
        return add_cors_headers(response)

    finally:
        session.close()


@app.route('/api/verify', methods=['POST', 'OPTIONS'])
def verify_api_key():
    """
    Verify API key validity

    Header: X-API-Key
    """
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        return add_cors_headers(response)

    api_key = request.headers.get('X-API-Key')

    if not api_key:
        response = make_response(jsonify({'error': 'API key required'}), 401)
        return add_cors_headers(response)

    session = db_manager.get_session()

    try:
        api_key_hash = encryption.hash_api_key(api_key)
        project = session.query(Project).filter_by(api_key_hash=api_key_hash).first()

        if not project:
            response = make_response(jsonify({'valid': False, 'error': 'Invalid API key'}), 401)
            return add_cors_headers(response)

        response = make_response(jsonify({
            'valid': True,
            'project_id': str(project.id),
            'project_name': project.name
        }), 200)
        return add_cors_headers(response)

    finally:
        session.close()


# Vercel serverless handler
def handler(request):
    """Vercel serverless function handler"""
    with app.request_context(request.environ):
        return app.full_dispatch_request()
