#!/usr/bin/env python3
"""
Send Test Emails via AWS SES
Sends actual sample emails to demonstrate what developers and management receive
"""

import sys
import os

# Add alice-server to path so we can import the email client
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'alice-server'))

from utils.email_client import get_email_client

# Sample test data
test_developer_email = "piyoosh.rai@the-algo.com"
test_project = "ALICE Platform (Test)"
test_developer_name = "Sample Developer"

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

def main():
    print("=" * 80)
    print("SENDING TEST EMAILS VIA AWS SES")
    print("=" * 80)
    print(f"\nRecipient: {test_developer_email}")
    print("Both emails will be sent to this address for testing.\n")

    try:
        # Initialize email client
        print("Initializing AWS SES email client...")
        email_client = get_email_client()
        print("✅ Email client initialized\n")

        # Send Email #1: Technical Report
        print("=" * 80)
        print("Sending Email #1: TECHNICAL REPORT (Developer Email)")
        print("=" * 80)

        success1 = email_client.send_technical_report(
            to_email=test_developer_email,
            project_name=test_project,
            quality_score=88,
            deployment_status='APPROVED',
            bugs=sample_bugs,
            summary=sample_summary
        )

        if success1:
            print("✅ Technical report sent successfully!\n")
        else:
            print("❌ Failed to send technical report\n")

        # Send Email #2: Management Assessment
        print("=" * 80)
        print("Sending Email #2: MANAGEMENT ASSESSMENT (Confidential)")
        print("=" * 80)

        success2 = email_client.send_management_assessment(
            developer_name=test_developer_name,
            developer_email=test_developer_email,
            project_name=test_project,
            grade='A',
            quality_score=88,
            role_level='Senior',
            metrics=sample_metrics,
            strengths=sample_strengths,
            weaknesses=sample_weaknesses
        )

        if success2:
            print("✅ Management assessment sent successfully!\n")
        else:
            print("❌ Failed to send management assessment\n")

        # Summary
        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)

        if success1 and success2:
            print(f"""
✅ Both emails sent successfully to {test_developer_email}

Check your inbox for:
1. "Code Analysis Report - ALICE Platform (Test)"
   - Technical details, bugs, fixes (no grades)

2. "Developer Assessment - Sample Developer - Grade A - [today's date]"
   - Confidential assessment with grade, role, strengths/weaknesses

Note: If you don't see the emails in a few minutes:
- Check spam/junk folder
- Verify sender email is verified in AWS SES
- Check AWS SES sending limits (might be in sandbox mode)
""")
        else:
            print(f"""
⚠️  Some emails failed to send.

Check:
1. AWS SES credentials in environment variables:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION

2. Sender email verified in AWS SES console

3. AWS SES not in sandbox mode (or recipient email verified)
""")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print(f"\nFull error details:")
        import traceback
        traceback.print_exc()
        print(f"""
Troubleshooting:
1. Check if AWS credentials are set:
   echo $AWS_ACCESS_KEY_ID
   echo $AWS_SECRET_ACCESS_KEY
   echo $AWS_REGION

2. Verify sender email in AWS SES console

3. If in sandbox mode, verify recipient email in AWS SES
""")

if __name__ == "__main__":
    main()
