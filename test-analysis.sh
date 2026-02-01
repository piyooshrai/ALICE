#!/bin/bash
# Test ALICE Analysis Endpoint
# Usage: ./test-analysis.sh YOUR_API_KEY

API_KEY=$1

if [ -z "$API_KEY" ]; then
  echo "Usage: ./test-analysis.sh YOUR_API_KEY"
  echo ""
  echo "Get your API key from: https://alice-chi.vercel.app/projects"
  exit 1
fi

# Sample React code with intentional bugs for testing
cat > /tmp/test-code.tsx << 'EOF'
import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState([]);

  // BUG: Infinite loop - useEffect without deps that calls setState
  useEffect(() => {
    setData([1, 2, 3]);
  });

  // BUG: Expensive operation without memoization
  const sortedData = data.sort((a, b) => b - a);

  // BUG: Missing key prop
  return (
    <div>
      {sortedData.map(item => (
        <div>{item}</div>
      ))}
    </div>
  );
}
EOF

echo "📊 Testing ALICE Analysis..."
echo "API Key: ${API_KEY:0:20}..."
echo ""

# Create JSON payload
PAYLOAD=$(jq -n \
  --arg code "$(cat /tmp/test-code.tsx)" \
  --arg api_key "$API_KEY" \
  '{
    files: [
      {
        path: "src/components/Dashboard.tsx",
        content: $code
      }
    ],
    project_name: "Test Project",
    developer_email: "test@example.com",
    api_key: $api_key
  }')

# Send to analyze endpoint
curl -X POST https://alice-server-fawn.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "$PAYLOAD" \
  | jq '.'

echo ""
echo "✅ Check your email for the analysis report!"
echo "📧 Management assessment sent to: piyoosh.rai@the-algo.com"
