# ALICE SDK

Automated Logic Inspection & Code Evaluation - Command Line Interface

## Installation

```bash
npm install -g @the-algorithm/alice
```

## Quick Start

### 1. Initialize Configuration

```bash
alice init
```

You'll be prompted for:
- ALICE API key (from your project dashboard)
- Server URL (default: https://alice-server.vercel.app)
- Your name and email

### 2. Analyze Your Code

```bash
# Analyze current directory
alice analyze

# Analyze specific directory
alice analyze ./my-project
```

### 3. Check Configuration

```bash
alice status
```

## Commands

### `alice init`

Interactive setup wizard to configure the SDK.

### `alice analyze [path]`

Analyze code in the specified directory (or current directory if no path provided).

**Options:**
- `-s, --silent`: Suppress detailed output (useful for CI/CD)

**Example:**
```bash
alice analyze ./src
```

### `alice status`

Display current SDK configuration (API key, server URL, developer info).

### `alice config`

Manage configuration settings.

**Options:**
- `--set-key <apiKey>`: Update API key
- `--set-server <url>`: Update server URL
- `--show`: Display current configuration

**Example:**
```bash
alice config --set-key alice_new_key_here
```

## Git Hook Integration

### Pre-commit Hook

Automatically run ALICE analysis before each commit:

1. Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
alice analyze --silent || exit 1
```

2. Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

Now ALICE will automatically analyze your code before each commit and block the commit if critical issues are found.

## Analysis Results

ALICE provides:

### Technical Report (Developer View)
- Quality score (0-100)
- Deployment status (APPROVED, CAUTION, BLOCKED)
- Detailed bug reports with:
  - Severity (CRITICAL, HIGH, MEDIUM, LOW)
  - File location and line number
  - Description of the issue
  - Impact analysis
  - Fix suggestions

### Email Reports

Two separate emails are sent:

1. **Technical Report** (to developer)
   - Bug list with fixes
   - No grades or assessments
   - Deployment status

2. **Management Assessment** (to management)
   - Full performance review
   - Letter grade (A+ to D)
   - Role level assessment
   - Strengths and weaknesses
   - Historical tracking

## Exit Codes

- `0`: Analysis successful, no critical issues
- `1`: Analysis failed or deployment blocked (critical issues found)

## What ALICE Analyzes

### Frontend (React/JavaScript/TypeScript)
- Infinite loops in useEffect
- XSS vulnerabilities
- Performance issues
- Accessibility violations
- Missing error handling
- Code complexity

### Backend (Node.js/Python)
- SQL injection vulnerabilities
- Authentication issues
- Exposed secrets
- Missing error handling
- CORS misconfigurations
- Unsafe operations

### Security
- Code injection vulnerabilities
- Weak cryptography
- Hardcoded credentials
- Path traversal risks
- Unrestricted file uploads

### Content Quality
- Grammar and spelling in comments
- Documentation completeness
- Code comment quality

## Excellence-Based Scoring

ALICE uses an excellence-based scoring system:

- **Base Score**: 50 points
- **Earn points** for best practices:
  - TypeScript usage: +15
  - Proper error handling: +10
  - Accessibility: +10
  - Performance optimizations: +10
  - Security best practices: +15
  - Clean architecture: +10
  - Testing patterns: +10
  - Documentation: +5

- **Lose points** for issues:
  - Critical bugs: -40
  - Security vulnerabilities: -30
  - Missing async error handling: -25
  - Performance issues: -15
  - Accessibility violations: -10
  - High complexity: -15

## Grade Thresholds

- **95-100**: A+ (True excellence)
- **90-94**: A (Excellent)
- **85-89**: A- (Very good)
- **80-84**: B+ (Good)
- **75-79**: B (Above average)
- **70-74**: B- (Average)
- **65-69**: C+ (Below average)
- **60-64**: C (Needs improvement)
- **55-59**: C- (Significant issues)
- **0-54**: D (Not production ready)

## CI/CD Integration

### GitHub Actions

```yaml
name: ALICE Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @the-algorithm/alice
      - run: alice config --set-key ${{ secrets.ALICE_API_KEY }}
      - run: alice analyze --silent
```

### GitLab CI

```yaml
alice:
  stage: test
  script:
    - npm install -g @the-algorithm/alice
    - alice config --set-key $ALICE_API_KEY
    - alice analyze --silent
```

## Support

For issues or questions:
- GitHub: https://github.com/the-algorithm/alice
- Email: support@the-algo.com

## License

MIT
