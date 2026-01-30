# ALICE - Automated Logic Inspection & Code Evaluation

Enterprise-grade code quality analysis and developer assessment platform.

## Overview

ALICE is a secure cloud service that provides:

- **Encrypted Scoring**: All assessment logic is encrypted and obfuscated
- **Dual Reporting**: Technical reports for developers, full assessments for management
- **Excellence-Based Scoring**: Start at 50, earn points up to 100
- **High-End Dashboard**: Minimal, professional UI for tracking team performance
- **Serverless Architecture**: Deployed on Vercel for scalability

## Architecture

```
alice-server/          # Python backend (Vercel serverless functions)
├── api/              # API endpoints (analyze, auth, reports)
├── analyzers/        # Code analysis engines
├── database/         # Database models and schema
└── utils/            # Encryption and email utilities

alice-sdk/            # NPM package (CLI tool)
├── src/              # CLI implementation
└── README.md         # SDK documentation

alice-dashboard/      # Next.js dashboard
├── app/              # Dashboard pages
├── components/       # Reusable UI components
└── lib/              # API client and utilities
```

## Quick Start

### 1. Deploy Server to Vercel

```bash
cd alice-server
vercel --prod
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`: PostgreSQL connection string
- `ENCRYPTION_KEY`: Fernet encryption key (generate with script below)
- `EMAIL_HOST`, `EMAIL_PORT`: SMTP settings
- `EMAIL_USER_B64`, `EMAIL_PASS_ENCRYPTED`: Email credentials
- `ADMIN_EMAIL`: Management email address
- `ADMIN_API_KEY`: Admin authentication key

### 2. Deploy Dashboard to Vercel

```bash
cd alice-dashboard
npm install
vercel --prod
```

Set environment variables:
- `API_BASE_URL`: Your ALICE server URL
- `ADMIN_API_KEY`: Same as server admin key

### 3. Install SDK

```bash
cd alice-sdk
npm install -g .
```

Or publish to NPM:
```bash
npm publish --access public
```

## Database Setup

### PostgreSQL Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE alice;
```

2. Run schema:
```bash
psql -U postgres -d alice -f alice-server/database/schema.sql
```

### Vercel Postgres (Recommended)

1. Add Postgres to your Vercel project
2. Copy `DATABASE_URL` to environment variables
3. Run migrations via Vercel CLI:
```bash
vercel env pull
psql $DATABASE_URL -f alice-server/database/schema.sql
```

## Environment Configuration

### Generate Encryption Key

```bash
cd alice-server
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Obfuscate Email Credentials

```bash
# Base64 encode email
python3 -c "import base64; print(base64.b64encode(b'your@email.com').decode())"

# Encrypt password (requires encryption key)
python3 utils/encryption.py
```

### Generate Admin API Key

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Creating Your First Project

### Via API

```bash
curl -X POST https://alice-server.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "admin_key": "your_admin_api_key"
  }'
```

Response:
```json
{
  "project_id": "uuid",
  "api_key": "alice_xxxxx",
  "name": "My Project"
}
```

Save the `api_key` - you'll need it for the SDK.

## Using ALICE

### 1. Configure SDK

```bash
alice init
```

Enter:
- API key (from project creation)
- Developer name and email
- Server URL (your Vercel deployment)

### 2. Analyze Code

```bash
alice analyze
```

### 3. View Results

**Developer receives:**
- Quality score (%)
- Deployment status
- Detailed bug list with fixes
- NO grades or assessments

**Management receives:**
- Full performance assessment
- Letter grade (A+ to D)
- Role level (Senior/Mid/Junior)
- Strengths and weaknesses
- Historical trends

### 4. Access Dashboard

Visit your dashboard URL: `https://alice-dashboard.vercel.app`

Login with admin API key to view:
- All developer grades
- Team analytics
- Quality trends
- Individual developer history

## Excellence-Based Scoring

### Base Score: 50 points

### Bonuses (earn points)
- TypeScript usage: +15
- Error handling: +10
- Accessibility: +10
- Performance optimizations: +10
- Security best practices: +15
- Clean architecture: +10
- Testing patterns: +10
- Documentation: +5

### Penalties (lose points)
- Critical bugs (crashes, infinite loops): -40
- Security vulnerabilities (XSS, SQL injection): -30
- No async error handling: -25
- Performance issues: -15
- Accessibility violations: -10
- High complexity (>300 lines, >25 branches): -15

### Grade Thresholds
- 95-100: A+ (True excellence)
- 90-94: A (Excellent)
- 85-89: A- (Very good)
- 80-84: B+ (Good)
- 75-79: B (Above average)
- 70-74: B- (Average)
- 65-69: C+ (Below average)
- 60-64: C (Needs improvement)
- 55-59: C- (Significant issues)
- 0-54: D (Not production ready)

## Analysis Capabilities

### Frontend Analysis (React/JavaScript/TypeScript)
- Infinite loop detection in useEffect
- XSS vulnerabilities (dangerouslySetInnerHTML, innerHTML)
- Security issues (eval, unsafe window.open)
- Performance (missing useMemo, expensive operations in render)
- Accessibility (missing aria-labels, alt text)
- Hook usage validation
- Code complexity metrics

### Backend Analysis (Node.js/Python)
- SQL injection patterns
- Authentication vulnerabilities
- Missing error handling in async operations
- Hardcoded secrets and API keys
- CORS misconfigurations
- Unsafe database operations

### Security Analysis
- Command injection
- Path traversal
- Weak cryptography (MD5, SHA-1, DES)
- Hardcoded encryption keys
- Weak random number generation
- Unrestricted file uploads

### Content Analysis
- Grammar checking
- Spelling errors in comments
- Documentation completeness

## Dashboard Features

### Main Dashboard
- Total analyses count
- Average quality score
- Active developers
- Deployment blocked count
- Grade distribution chart
- Recent analyses table

### Developers Page
- All developers with current grades
- Performance trends (improving/declining/stable)
- Role level tracking
- Analysis count per developer
- Sortable by score, name, or grade

### Analytics Page
- Quality score trends over time
- Critical bugs timeline
- Grade distribution over time
- Team performance metrics

## Security & Privacy

### Encrypted Scoring
All scoring algorithms are encrypted using Fernet encryption. Only the system owner can decrypt and modify scoring logic.

### Obfuscated Email
Email credentials are base64 encoded and encrypted before storage.

### API Key Hashing
API keys are hashed with SHA-256 before database storage.

### Dual Reporting
Developers never see grades or assessments - only technical bug reports. Management sees full performance reviews.

## Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Database schema deployed
- [ ] Encryption key generated and set
- [ ] Email credentials configured
- [ ] Admin API key generated
- [ ] Server deployed to Vercel
- [ ] Dashboard deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] First project created
- [ ] SDK installed and configured
- [ ] Test analysis completed
- [ ] Email delivery verified

## API Endpoints

### POST /api/analyze
Analyze code archive
- Auth: X-API-Key header
- Body: multipart/form-data (archive, developer_email, developer_name)
- Returns: Technical report only

### POST /api/projects
Create new project (admin only)
- Auth: admin_key in body
- Body: {name, admin_key}
- Returns: {project_id, api_key, name}

### GET /api/dashboard/stats
Dashboard statistics (admin only)
- Auth: X-Admin-Key header
- Returns: Full statistics and analytics

### GET /api/developers
List all developers with grades (admin only)
- Auth: X-Admin-Key header
- Query: ?sort=score&order=desc
- Returns: Array of developers

### GET /api/developers/:id/history
Full assessment history (admin only)
- Auth: X-Admin-Key header
- Returns: All analyses for developer

## Technology Stack

**Backend:**
- Python 3.11
- Flask (serverless functions)
- SQLAlchemy (ORM)
- PostgreSQL (database)
- Cryptography (Fernet encryption)
- SMTP (email)

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts (analytics)
- Axios (API client)

**SDK:**
- Node.js
- Commander (CLI)
- Axios (HTTP)
- Archiver (zip)
- Chalk (terminal colors)
- Inquirer (prompts)

**Infrastructure:**
- Vercel (serverless hosting)
- Vercel Postgres (database)
- SMTP server (email delivery)

## Support

For issues, questions, or feature requests:
- Email: piyoosh.rai@the-algo.com
- GitHub: Create an issue

## License

Proprietary - The Algorithm © 2024

---

Built with excellence for excellence.
