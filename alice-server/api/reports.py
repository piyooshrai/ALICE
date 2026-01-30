"""
ALICE Reports & Dashboard API
Admin-only endpoints for viewing grades, assessments, and analytics
"""

import os
from flask import Flask, request, jsonify
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from database.models import DatabaseManager, Analysis, Developer, Project, Bug
from utils.encryption import EncryptionManager

app = Flask(__name__)

# Initialize database
db_manager = DatabaseManager(os.environ.get('DATABASE_URL', 'postgresql://localhost/alice'))
encryption = EncryptionManager()


def verify_admin(request):
    """Verify admin authentication"""
    admin_key = request.headers.get('X-Admin-Key')
    expected_admin_key = os.environ.get('ADMIN_API_KEY')

    if not admin_key or admin_key != expected_admin_key:
        return False
    return True


@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """
    Get dashboard statistics (admin only)

    Returns:
        {
            "total_analyses": int,
            "total_developers": int,
            "average_score": float,
            "deployment_blocked": int,
            "grade_distribution": {...},
            "recent_analyses": [...]
        }
    """
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    session = db_manager.get_session()

    try:
        # Total analyses
        total_analyses = session.query(Analysis).count()

        # Total developers
        total_developers = session.query(Developer).count()

        # Average score
        avg_score = session.query(func.avg(Analysis.quality_score)).scalar() or 0

        # Deployment blocked count
        deployment_blocked = session.query(Analysis).filter_by(deployment_status='BLOCKED').count()

        # Grade distribution
        grade_dist = {}
        for grade in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D']:
            count = session.query(Analysis).filter_by(grade=grade).count()
            grade_dist[grade] = count

        # Recent analyses
        recent = session.query(Analysis).order_by(desc(Analysis.analyzed_at)).limit(10).all()
        recent_list = [{
            'id': str(a.id),
            'project_id': str(a.project_id),
            'developer_id': str(a.developer_id) if a.developer_id else None,
            'grade': a.grade,
            'quality_score': a.quality_score,
            'deployment_status': a.deployment_status,
            'analyzed_at': a.analyzed_at.isoformat()
        } for a in recent]

        return jsonify({
            'total_analyses': total_analyses,
            'total_developers': total_developers,
            'average_score': float(avg_score),
            'deployment_blocked': deployment_blocked,
            'grade_distribution': grade_dist,
            'recent_analyses': recent_list
        }), 200

    finally:
        session.close()


@app.route('/api/developers', methods=['GET'])
def get_developers():
    """
    Get all developers with their current grades (admin only)

    Query params:
        - sort: 'score' | 'name' | 'grade'
        - order: 'asc' | 'desc'
    """
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    session = db_manager.get_session()

    try:
        query = session.query(Developer)

        # Sorting
        sort_by = request.args.get('sort', 'name')
        order = request.args.get('order', 'asc')

        if sort_by == 'score':
            query = query.order_by(Developer.current_score.desc() if order == 'desc' else Developer.current_score)
        elif sort_by == 'grade':
            query = query.order_by(Developer.current_grade.desc() if order == 'desc' else Developer.current_grade)
        else:
            query = query.order_by(Developer.name.desc() if order == 'desc' else Developer.name)

        developers = query.all()

        result = []
        for dev in developers:
            # Get analysis count
            analysis_count = session.query(Analysis).filter_by(developer_id=dev.id).count()

            # Get trend (last 5 analyses)
            recent_scores = session.query(Analysis.quality_score).filter_by(
                developer_id=dev.id
            ).order_by(desc(Analysis.analyzed_at)).limit(5).all()

            trend = 'stable'
            if len(recent_scores) >= 3:
                scores = [s[0] for s in recent_scores]
                if scores[0] > scores[-1] + 5:
                    trend = 'improving'
                elif scores[0] < scores[-1] - 5:
                    trend = 'declining'

            result.append({
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'current_grade': dev.current_grade,
                'current_score': dev.current_score,
                'role_level': dev.role_level,
                'analysis_count': analysis_count,
                'trend': trend,
                'created_at': dev.created_at.isoformat()
            })

        return jsonify({'developers': result}), 200

    finally:
        session.close()


@app.route('/api/developers/<developer_id>/history', methods=['GET'])
def get_developer_history(developer_id: str):
    """
    Get full assessment history for specific developer (admin only)

    Returns all analyses with grades, assessments, trends
    """
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    session = db_manager.get_session()

    try:
        developer = session.query(Developer).filter_by(id=developer_id).first()

        if not developer:
            return jsonify({'error': 'Developer not found'}), 404

        # Get all analyses
        analyses = session.query(Analysis).filter_by(
            developer_id=developer_id
        ).order_by(desc(Analysis.analyzed_at)).all()

        history = []
        for analysis in analyses:
            # Get bugs for this analysis
            bugs = session.query(Bug).filter_by(analysis_id=analysis.id).all()

            history.append({
                'id': str(analysis.id),
                'grade': analysis.grade,
                'quality_score': analysis.quality_score,
                'role_level': analysis.role_level,
                'deployment_status': analysis.deployment_status,
                'total_files': analysis.total_files,
                'critical_bugs': analysis.critical_bugs,
                'high_bugs': analysis.high_bugs,
                'medium_bugs': analysis.medium_bugs,
                'strengths': analysis.strengths,
                'weaknesses': analysis.weaknesses,
                'analyzed_at': analysis.analyzed_at.isoformat(),
                'bug_details': [{
                    'severity': bug.severity,
                    'category': bug.category,
                    'file_path': bug.file_path,
                    'line_number': bug.line_number,
                    'description': bug.description
                } for bug in bugs]
            })

        return jsonify({
            'developer': {
                'id': str(developer.id),
                'name': developer.name,
                'email': developer.email,
                'current_grade': developer.current_grade,
                'current_score': developer.current_score,
                'role_level': developer.role_level
            },
            'history': history,
            'total_analyses': len(history)
        }), 200

    finally:
        session.close()


@app.route('/api/projects/<project_id>/analytics', methods=['GET'])
def get_project_analytics(project_id: str):
    """
    Get analytics for specific project (admin only)

    Query params:
        - days: number of days to analyze (default 30)
    """
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    session = db_manager.get_session()

    try:
        days = int(request.args.get('days', 30))
        since = datetime.utcnow() - timedelta(days=days)

        project = session.query(Project).filter_by(id=project_id).first()
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        # Get analyses for this project
        analyses = session.query(Analysis).filter(
            Analysis.project_id == project_id,
            Analysis.analyzed_at >= since
        ).order_by(Analysis.analyzed_at).all()

        # Calculate trends
        scores = [a.quality_score for a in analyses]
        avg_score = sum(scores) / len(scores) if scores else 0

        # Critical bugs trend
        critical_bugs_total = sum(a.critical_bugs for a in analyses)

        # Grade distribution
        grade_dist = {}
        for analysis in analyses:
            grade = analysis.grade
            grade_dist[grade] = grade_dist.get(grade, 0) + 1

        # Timeline data
        timeline = [{
            'date': a.analyzed_at.isoformat(),
            'score': a.quality_score,
            'grade': a.grade,
            'critical_bugs': a.critical_bugs
        } for a in analyses]

        return jsonify({
            'project': {
                'id': str(project.id),
                'name': project.name
            },
            'period_days': days,
            'total_analyses': len(analyses),
            'average_score': avg_score,
            'critical_bugs_total': critical_bugs_total,
            'grade_distribution': grade_dist,
            'timeline': timeline
        }), 200

    finally:
        session.close()


@app.route('/api/analyses/<analysis_id>', methods=['GET'])
def get_analysis_details(analysis_id: str):
    """
    Get full details of specific analysis (admin only)
    """
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    session = db_manager.get_session()

    try:
        analysis = session.query(Analysis).filter_by(id=analysis_id).first()

        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404

        # Get bugs
        bugs = session.query(Bug).filter_by(analysis_id=analysis_id).all()

        return jsonify({
            'id': str(analysis.id),
            'project_id': str(analysis.project_id),
            'developer_id': str(analysis.developer_id) if analysis.developer_id else None,
            'grade': analysis.grade,
            'quality_score': analysis.quality_score,
            'role_level': analysis.role_level,
            'deployment_status': analysis.deployment_status,
            'total_files': analysis.total_files,
            'critical_bugs': analysis.critical_bugs,
            'high_bugs': analysis.high_bugs,
            'medium_bugs': analysis.medium_bugs,
            'low_bugs': analysis.low_bugs,
            'strengths': analysis.strengths,
            'weaknesses': analysis.weaknesses,
            'analyzed_at': analysis.analyzed_at.isoformat(),
            'bugs': [{
                'severity': bug.severity,
                'category': bug.category,
                'file_path': bug.file_path,
                'line_number': bug.line_number,
                'description': bug.description,
                'impact': bug.impact,
                'fix_suggestion': bug.fix_suggestion
            } for bug in bugs],
            'raw_data': analysis.raw_data
        }), 200

    finally:
        session.close()


# Vercel serverless handler
def handler(request):
    """Vercel serverless function handler"""
    with app.request_context(request.environ):
        return app.full_dispatch_request()
