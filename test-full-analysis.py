#!/usr/bin/env python3
"""
Test ALICE Full Analysis Flow
Sends sample code to analyze endpoint and displays results
"""

import requests
import json
import sys
import os

# Sample React code with intentional bugs
SAMPLE_CODE = """
import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState([]);

  // BUG: Infinite loop - useEffect without deps that calls setState
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  });

  // BUG: Expensive operation without memoization
  const sortedData = data.sort((a, b) => b - a);

  // BUG: Missing key prop
  return (
    <div>
      <h1>Dashboard</h1>
      {sortedData.map(item => (
        <div>{item.name}</div>
      ))}

      {/* BUG: XSS vulnerability */}
      <div dangerouslySetInnerHTML={{__html: data.description}} />
    </div>
  );
}
"""

def test_analysis(api_key: str, developer_email: str = "test@example.com"):
    """Test ALICE analysis endpoint"""

    print("=" * 80)
    print("ALICE Full Analysis Test")
    print("=" * 80)
    print()

    # Prepare payload
    payload = {
        "files": [
            {
                "path": "src/components/Dashboard.tsx",
                "content": SAMPLE_CODE
            }
        ],
        "project_name": "Test Project",
        "developer_email": developer_email,
        "api_key": api_key
    }

    print(f"📤 Sending code for analysis...")
    print(f"   API Key: {api_key[:20]}...")
    print(f"   Developer: {developer_email}")
    print(f"   Files: 1")
    print()

    # Send request
    try:
        response = requests.post(
            "https://alice-server-fawn.vercel.app/api/analyze",
            headers={
                "Content-Type": "application/json",
                "X-API-Key": api_key
            },
            json=payload,
            timeout=30
        )

        print(f"📥 Response Status: {response.status_code}")
        print()

        if response.status_code == 200:
            result = response.json()

            print("✅ Analysis Complete!")
            print("=" * 80)
            print()

            # Display results
            print(f"Quality Score: {result.get('quality_score', 'N/A')}%")
            print(f"Grade: {result.get('grade', 'N/A')}")
            print(f"Role Level: {result.get('role_level', 'N/A')}")
            print(f"Deployment Status: {result.get('deployment_status', 'N/A')}")
            print()

            # Show bugs
            bugs = result.get('bugs', [])
            if bugs:
                print(f"🐛 Issues Found: {len(bugs)}")
                print("-" * 80)

                for i, bug in enumerate(bugs, 1):
                    print(f"\n{i}. [{bug['severity']}] {bug['category']}")
                    print(f"   Location: {bug['file_path']}:{bug.get('line_number', 'N/A')}")
                    print(f"   {bug['description']}")
                    if bug.get('fix_suggestion'):
                        print(f"   Fix: {bug['fix_suggestion']}")
            else:
                print("✅ No issues found!")

            print()
            print("=" * 80)
            print("📧 Emails Sent:")
            print(f"   - Technical report to: {developer_email}")
            print(f"   - Management assessment to: piyoosh.rai@the-algo.com")
            print()
            print("💾 Analysis stored in database")
            print()

            # Show full response
            print("=" * 80)
            print("Full Response:")
            print("=" * 80)
            print(json.dumps(result, indent=2))

        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

    return True


def main():
    """Main test function"""

    if len(sys.argv) < 2:
        print("Usage: python test-full-analysis.py YOUR_API_KEY [developer@email.com]")
        print()
        print("Get your API key from: https://alice-chi.vercel.app/projects")
        sys.exit(1)

    api_key = sys.argv[1]
    developer_email = sys.argv[2] if len(sys.argv) > 2 else "test@example.com"

    success = test_analysis(api_key, developer_email)

    if success:
        print()
        print("=" * 80)
        print("✅ Test completed successfully!")
        print()
        print("Next steps:")
        print("  1. Check your email for the technical report")
        print("  2. Check piyoosh.rai@the-algo.com for the management assessment")
        print("  3. View analysis in dashboard: https://alice-chi.vercel.app")
        print("=" * 80)
    else:
        print()
        print("❌ Test failed. Check the error above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
