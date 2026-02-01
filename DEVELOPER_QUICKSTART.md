# ALICE Developer Quick Start

## For Developers: How to Use ALICE

### Step 1: Get Your API Key

1. Go to: https://alice-chi.vercel.app/projects
2. Create a new project for your team
3. Copy the API key

### Step 2: Analyze Your Code

**Option A: Using curl (Test Now)**

```bash
# Save your API key
export ALICE_API_KEY="your-api-key-here"

# Analyze a file
curl -X POST https://alice-server-fawn.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ALICE_API_KEY" \
  -d '{
    "files": [
      {
        "path": "src/App.tsx",
        "content": "your code here..."
      }
    ],
    "project_name": "My Project",
    "developer_email": "you@company.com",
    "api_key": "'"$ALICE_API_KEY"'"
  }'
```

**Option B: Using the Test Script**

```bash
# From the ALICE repo
chmod +x test-analysis.sh
./test-analysis.sh YOUR_API_KEY
```

This will:
- Analyze sample buggy React code
- Send you a technical report email
- Send management a confidential assessment
- Return analysis results

### Step 3: Check Your Email

You'll receive an email with:
- Quality score
- Deployment status (APPROVED/BLOCKED/CAUTION)
- List of bugs with fixes
- File and line numbers for each issue

**Management receives a separate confidential email with:**
- Grade (A+, A, B, etc.)
- Role assessment (Senior, Mid-Level, Junior)
- Strengths and weaknesses

---

## SDK Coming Soon

Once published to NPM, you'll be able to install:

```bash
npm install -g alice-code-analysis

# Then run
alice analyze
```

For now, use the curl method or test script above.

---

## What Gets Analyzed?

ALICE checks for:

**CRITICAL Issues (Block Deployment):**
- Infinite loops (useEffect without deps)
- XSS vulnerabilities (dangerouslySetInnerHTML, innerHTML)
- SQL injection
- Hardcoded secrets/API keys
- Code injection (eval)
- Command injection

**HIGH Issues:**
- Missing error handling in async code
- Weak cryptography (MD5, SHA-1)
- Authentication/authorization issues
- Path traversal vulnerabilities

**MEDIUM Issues:**
- Performance issues (expensive operations without memoization)
- Accessibility violations
- Missing key props in React lists
- High code complexity

---

## Scoring

- **Base Score:** 50 points
- **Earn Bonuses:** TypeScript (+15), Security (+15), Error Handling (+10), etc.
- **Penalties:** Critical bugs (-40), XSS (-30), Performance (-15), etc.
- **Deployment:** ANY critical bug blocks deployment

**Grades:**
- A+ (95-100): Excellent
- A (90-94): Great
- B (75-89): Good
- C (60-74): Needs improvement
- D (<60): Requires immediate attention

**Role Assessment:**
- Senior: 90+ score, zero critical bugs
- Mid-Level: 75+ score, zero critical, ≤2 high bugs
- Junior: 60+ score
- Entry-Level: <60 score

---

## Need Help?

Contact: alice@the-algo.com
