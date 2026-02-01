# ALICE CI/CD Integration Guide

**ALICE runs automatically on every build/PR. Developers don't need to do anything manually.**

---

## GitHub Actions

Copy `.github/workflows/alice.yml` to your repo:

```yaml
name: ALICE Code Analysis

on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main, develop, staging ]

jobs:
  alice-analysis:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install ALICE
        run: npm install -g alice-code-analysis

      - name: Run ALICE Analysis
        env:
          ALICE_API_KEY: ${{ secrets.ALICE_API_KEY }}
          ALICE_DEVELOPER_EMAIL: ${{ github.event.pusher.email }}
          ALICE_DEVELOPER_NAME: ${{ github.event.pusher.name }}
        run: |
          alice init --non-interactive
          alice analyze
```

**Setup:**
1. Go to repo Settings → Secrets → Actions
2. Add secret: `ALICE_API_KEY` (get from dashboard)
3. Commit the workflow file
4. Done - runs on every push/PR

---

## GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
alice_analysis:
  stage: test
  image: node:18
  before_script:
    - npm install -g alice-code-analysis
  script:
    - alice init --non-interactive
    - alice analyze
  variables:
    ALICE_API_KEY: $ALICE_API_KEY
    ALICE_DEVELOPER_EMAIL: $GITLAB_USER_EMAIL
    ALICE_DEVELOPER_NAME: $GITLAB_USER_NAME
  only:
    - main
    - develop
    - merge_requests
```

**Setup:**
1. Go to Settings → CI/CD → Variables
2. Add variable: `ALICE_API_KEY` (masked, protected)
3. Commit the file
4. Done

---

## Bitbucket Pipelines

Add to `bitbucket-pipelines.yml`:

```yaml
image: node:18

pipelines:
  default:
    - step:
        name: ALICE Code Analysis
        script:
          - npm install -g alice-code-analysis
          - export ALICE_DEVELOPER_EMAIL=$(git log -1 --format='%ae')
          - export ALICE_DEVELOPER_NAME=$(git log -1 --format='%an')
          - alice init --non-interactive
          - alice analyze
  branches:
    main:
      - step:
          name: ALICE Code Analysis
          script:
            - npm install -g alice-code-analysis
            - export ALICE_DEVELOPER_EMAIL=$(git log -1 --format='%ae')
            - export ALICE_DEVELOPER_NAME=$(git log -1 --format='%an')
            - alice init --non-interactive
            - alice analyze
  pull-requests:
    '**':
      - step:
          name: ALICE Code Analysis
          script:
            - npm install -g alice-code-analysis
            - export ALICE_DEVELOPER_EMAIL=$(git log -1 --format='%ae')
            - export ALICE_DEVELOPER_NAME=$(git log -1 --format='%an')
            - alice init --non-interactive
            - alice analyze
```

**Setup:**
1. Go to Repository Settings → Pipelines → Repository variables
2. Add variable: `ALICE_API_KEY` (secured)
3. Commit the file
4. Enable Pipelines in Settings → Pipelines → Settings
5. Done

---

## CircleCI

Add to `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  alice-analysis:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run:
          name: Install ALICE
          command: npm install -g alice-code-analysis
      - run:
          name: Run Analysis
          command: |
            export ALICE_DEVELOPER_EMAIL=$(git log -1 --format='%ae')
            export ALICE_DEVELOPER_NAME=$(git log -1 --format='%an')
            alice init --non-interactive
            alice analyze

workflows:
  version: 2
  build-and-analyze:
    jobs:
      - alice-analysis
```

**Setup:**
1. Project Settings → Environment Variables
2. Add: `ALICE_API_KEY`
3. Commit the file
4. Done

---

## Jenkins

Add to `Jenkinsfile`:

```groovy
pipeline {
  agent any

  stages {
    stage('ALICE Analysis') {
      steps {
        nodejs(nodeJSInstallationName: 'Node 18') {
          sh 'npm install -g alice-code-analysis'
          withEnv([
            "ALICE_API_KEY=${env.ALICE_API_KEY}",
            "ALICE_DEVELOPER_EMAIL=${env.GIT_COMMITTER_EMAIL}",
            "ALICE_DEVELOPER_NAME=${env.GIT_COMMITTER_NAME}"
          ]) {
            sh 'alice init --non-interactive'
            sh 'alice analyze'
          }
        }
      }
    }
  }
}
```

**Setup:**
1. Manage Jenkins → Configure System → Global Properties
2. Add environment variable: `ALICE_API_KEY`
3. Commit the file
4. Done

---

## Travis CI

Add to `.travis.yml`:

```yaml
language: node_js
node_js:
  - "18"

before_script:
  - npm install -g alice-code-analysis
  - export ALICE_DEVELOPER_EMAIL=$(git log -1 --format='%ae')
  - export ALICE_DEVELOPER_NAME=$(git log -1 --format='%an')
  - alice init --non-interactive

script:
  - alice analyze

env:
  global:
    - secure: "encrypted_ALICE_API_KEY"
```

**Setup:**
1. `travis encrypt ALICE_API_KEY="your-key" --add`
2. Commit the file
3. Done

---

## Vercel (Pre-deployment)

Add to `vercel.json`:

```json
{
  "buildCommand": "alice analyze && npm run build"
}
```

**Setup:**
1. Vercel dashboard → Project → Settings → Environment Variables
2. Add: `ALICE_API_KEY`
3. Deploy
4. Done - blocks deployment if critical bugs found

---

## Pre-commit Hook (Local)

For developers who want local checks before pushing:

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Run ALICE before commit
alice analyze --silent

if [ $? -ne 0 ]; then
  echo "❌ ALICE found critical issues - commit blocked"
  echo "Fix the issues and try again"
  exit 1
fi

exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## How It Works

1. **Automatic**: Runs on every push/PR/build
2. **Blocking**: Critical bugs = build fails
3. **Emails**: Developer gets technical report, management gets assessment
4. **Zero manual work**: Developers don't run anything manually

---

## Environment Variables

**Required:**
- `ALICE_API_KEY` - Project API key (get from dashboard, set as repo secret)

**Auto-detected from git:**
- `ALICE_DEVELOPER_NAME` - Developer name (from git commit author)
- `ALICE_DEVELOPER_EMAIL` - Developer email (from git commit author)

**Optional:**
- `ALICE_SERVER_URL` - Server URL (defaults to https://alice-server-fawn.vercel.app)
- `CI` - Auto-set by CI systems, triggers non-interactive mode

**How it works:**
1. API key identifies the project (tied to project in database)
2. Developer name/email from git commit metadata
3. ALICE sends technical report to developer email
4. ALICE sends secret assessment to management

---

## Exit Codes

- `0` - Analysis passed, deployment approved
- `1` - Critical bugs found, deployment blocked

CI/CD systems automatically fail the build on exit code 1.
