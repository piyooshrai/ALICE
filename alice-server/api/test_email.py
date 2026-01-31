"""
Test Email Endpoint
Sends sample emails to demonstrate developer and management notifications
"""

from flask import Flask, jsonify, request, make_response
from utils.email_client import get_email_client
import os

app = Flask(__name__)

# Sample test data
sample_bugs = [
    {
        'severity': 'MEDIUM',
        'category': 'Performance',
        'file_path': 'src/components/Dashboard.tsx',
        'line_number': 45,
        'description': 'Expensive array sorting operation in render without memoization',
        'impact': 'Component re-renders trigger expensive recalculations',
        'fix_suggestion': 'Wrap in useMemo: const sorted = useMemo(() => data.sort(...), [data])'
    },
    {
        'severity': 'MEDIUM',
        'category': 'Accessibility',
        'file_path': 'src/components/Button.tsx',
        'line_number': 12,
        'description': 'Interactive element <button> missing aria-label',
        'impact': 'Screen readers cannot describe element to visually impaired users',
        'fix_suggestion': 'Add aria-label: <button aria-label="Submit form">'
    },
    {
        'severity': 'LOW',
        'category': 'React Best Practice',
        'file_path': 'src/components/List.tsx',
        'line_number': 28,
        'description': 'Missing key prop in mapped component',
        'impact': 'Poor rendering performance, potential bugs with component state',
        'fix_suggestion': 'Add unique key prop: .map(item => <Component key={item.id} />)'
    }
]

sample_summary = {
    'total_files': 23,
    'tests_passed': 42,
    'tests_failed': 3,
    'critical_bugs': 0,
    'high_bugs': 0,
    'medium_bugs': 2,
    'low_bugs': 1
}

sample_metrics = {
    'total_files': 23,
    'critical_bugs': 0,
    'high_bugs': 0,
    'medium_bugs': 2,
    'test_failure_rate': 7
}

sample_strengths = [
    'Good code quality',
    'Solid React knowledge',
    'Generally follows patterns',
    'Proper error handling implemented'
]

sample_weaknesses = [
    'Minor test failures',
    'Some performance optimizations needed'
]


@app.route('/api/test-email', methods=['POST', 'OPTIONS'])
def send_test_email():
    """Send test emails via AWS SES"""

    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key')
        return response

    # Verify admin key
    admin_key = request.headers.get('X-Admin-Key')
    expected_admin_key = os.environ.get('ADMIN_API_KEY')

    if not admin_key or admin_key != expected_admin_key:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        # Initialize email client
        email_client = get_email_client()

        # Recipient email
        recipient = "piyoosh.rai@the-algo.com"

        # Send Email #1: Technical Report
        success1 = email_client.send_technical_report(
            to_email=recipient,
            project_name="ALICE Platform (Test)",
            quality_score=88,
            deployment_status='APPROVED',
            bugs=sample_bugs,
            summary=sample_summary
        )

        # Send Email #2: Management Assessment
        success2 = email_client.send_management_assessment(
            developer_name="Sample Developer",
            developer_email=recipient,
            project_name="ALICE Platform (Test)",
            grade='A',
            quality_score=88,
            role_level='Senior',
            metrics=sample_metrics,
            strengths=sample_strengths,
            weaknesses=sample_weaknesses
        )

        response = make_response(jsonify({
            'message': 'Test emails sent',
            'recipient': recipient,
            'technical_report': 'sent' if success1 else 'failed',
            'management_assessment': 'sent' if success2 else 'failed',
            'success': success1 and success2
        }), 200 if (success1 and success2) else 500)

        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    except Exception as e:
        response = make_response(jsonify({
            'error': str(e),
            'details': 'Check AWS SES credentials in environment variables'
        }), 500)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


if __name__ == '__main__':
    app.run(debug=True)
