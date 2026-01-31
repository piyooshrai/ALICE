#!/usr/bin/env python3
"""
Test Email Generator for ALICE
Generates sample emails to show what developers and management receive
"""

import sys
from datetime import datetime

# Sample analysis data
sample_project = "ALICE Platform"
sample_developer = "John Developer"
sample_developer_email = "piyoosh.rai@the-algo.com"

# Sample analysis results
sample_quality_score = 88
sample_grade = "A"
sample_role_level = "Senior"
sample_deployment_status = "APPROVED"

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

sample_metrics = {
    'total_files': 23,
    'critical_bugs': 0,
    'high_bugs': 0,
    'medium_bugs': 2,
    'test_failure_rate': 7
}

def generate_developer_email():
    """Generate technical report email (no grades, just bugs)"""

    subject = f"Code Analysis Report - {sample_project}"

    body = f"""
{sample_project} Analysis Results
{'=' * 60}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}

Quality Score: {sample_quality_score}%
Deployment Status: {sample_deployment_status}

Summary
-------
Files Analyzed: {sample_summary['total_files']}
Tests Passed: {sample_summary['tests_passed']}
Tests Failed: {sample_summary['tests_failed']}
Critical Issues: {sample_summary['critical_bugs']}
High Priority Issues: {sample_summary['high_bugs']}
Medium Priority Issues: {sample_summary['medium_bugs']}

"""

    if sample_deployment_status == 'BLOCKED':
        body += """
╔════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT BLOCKED                      ║
║  Critical issues must be resolved before production deployment  ║
╚════════════════════════════════════════════════════════════╝

"""
    else:
        body += """
✅ DEPLOYMENT APPROVED
Quality standards met. Code is ready for production.

"""

    # Add bug details
    if sample_bugs:
        body += "\nIssues Found\n" + ("=" * 60) + "\n\n"

        for i, bug in enumerate(sample_bugs, 1):
            body += f"{i}. [{bug['severity']}] {bug['category']}\n"
            body += f"   Location: {bug['file_path']}:{bug['line_number']}\n"
            body += f"   Description: {bug['description']}\n"
            if bug.get('impact'):
                body += f"   Impact: {bug['impact']}\n"
            if bug.get('fix_suggestion'):
                body += f"   Required Fix: {bug['fix_suggestion']}\n"
            body += "\n"
    else:
        body += "\nNo critical issues found. Code quality looks good!\n"

    body += f"""
---
Questions? Contact: piyoosh.rai@the-algo.com
This is an automated code quality report from ALICE.
"""

    return subject, body


def generate_management_email():
    """Generate management assessment email (with grades, confidential)"""

    subject = f"Developer Assessment - {sample_developer} - Grade {sample_grade} - {datetime.now().strftime('%Y-%m-%d')}"

    # Determine performance rating
    if sample_quality_score >= 90:
        performance_rating = "EXCELLENT PERFORMANCE"
    elif sample_quality_score >= 75:
        performance_rating = "MEETS EXPECTATIONS"
    elif sample_quality_score >= 60:
        performance_rating = "NEEDS IMPROVEMENT"
    else:
        performance_rating = "IMMEDIATE ACTION REQUIRED"

    body = f"""
Developer Performance Assessment
{'=' * 60}

CONFIDENTIAL - MANAGEMENT ONLY

Project: {sample_project}
Developer: {sample_developer} ({sample_developer_email})
Date: {datetime.now().strftime('%Y-%m-%d')}
Grade: {sample_grade}
Role Level: {sample_role_level}

Code Quality Metrics
--------------------
Quality Score: {sample_quality_score}%
Files Analyzed: {sample_metrics['total_files']}
Critical Issues: {sample_metrics['critical_bugs']}
High Issues: {sample_metrics['high_bugs']}
Medium Issues: {sample_metrics['medium_bugs']}
Test Failure Rate: {sample_metrics['test_failure_rate']}%

Strengths
---------
"""
    for strength in sample_strengths:
        body += f"- {strength}\n"

    body += f"""
Areas for Improvement
---------------------
"""
    for weakness in sample_weaknesses:
        body += f"- {weakness}\n"

    body += f"""
Performance Rating
------------------
{performance_rating}

"""

    if performance_rating == "IMMEDIATE ACTION REQUIRED":
        body += """
⚠️  ALERT: This assessment indicates serious quality concerns.
Recommend immediate one-on-one discussion and performance improvement plan.

"""

    body += f"""
---
This is a confidential assessment generated by ALICE.
Distribution restricted to management only.
Contact: piyoosh.rai@the-algo.com
"""

    return subject, body


def main():
    print("=" * 80)
    print("ALICE EMAIL PREVIEW - Test Email Generator")
    print("=" * 80)
    print("\nThis shows what emails developers and management will receive.")
    print("To actually send emails, AWS SES credentials must be configured.\n")

    # Generate developer email
    print("\n" + "=" * 80)
    print("EMAIL #1: TECHNICAL REPORT (Sent to Developer)")
    print("=" * 80)
    print("TO: developer@company.com")

    dev_subject, dev_body = generate_developer_email()
    print(f"SUBJECT: {dev_subject}")
    print("\nBODY:")
    print("-" * 80)
    print(dev_body)
    print("-" * 80)

    # Generate management email
    print("\n\n" + "=" * 80)
    print("EMAIL #2: MANAGEMENT ASSESSMENT (Sent to Management - CONFIDENTIAL)")
    print("=" * 80)
    print("TO: piyoosh.rai@the-algo.com")

    mgmt_subject, mgmt_body = generate_management_email()
    print(f"SUBJECT: {mgmt_subject}")
    print("\nBODY:")
    print("-" * 80)
    print(mgmt_body)
    print("-" * 80)

    print("\n\n" + "=" * 80)
    print("IMPORTANT NOTES:")
    print("=" * 80)
    print("""
1. DEVELOPER EMAIL (Technical Report):
   - Shows bugs and fixes (no grades, no assessments)
   - Focuses on technical details
   - Helps developer improve code
   - Sent to: developer's email

2. MANAGEMENT EMAIL (Confidential Assessment):
   - Shows grade (A+, A, B, etc.)
   - Shows role level (Senior, Mid-Level, Junior)
   - Shows strengths and weaknesses
   - Performance rating
   - Sent to: piyoosh.rai@the-algo.com
   - NEVER sent to developer

3. To actually send emails via AWS SES:
   - Set AWS_ACCESS_KEY_ID in Vercel environment variables
   - Set AWS_SECRET_ACCESS_KEY in Vercel environment variables
   - Set AWS_REGION (e.g., us-east-1)
   - Verify sender email in AWS SES console

4. Developer gets EVERY analysis (after each code submission)
5. Management gets EVERY assessment (secretly tracked)
""")


if __name__ == "__main__":
    main()
