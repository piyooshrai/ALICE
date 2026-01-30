# ALICE Test Project

This is a test React application with intentional code quality issues to demonstrate ALICE's analysis capabilities.

## Intentional Issues

This project contains:

1. **Critical Issues:**
   - Infinite loop in useEffect
   - XSS vulnerability (dangerouslySetInnerHTML)
   - Hardcoded API key

2. **High Priority:**
   - Missing error handling in async operations
   - No authentication on API endpoint

3. **Medium Priority:**
   - Missing accessibility attributes
   - Performance issues (expensive operations in render)
   - High code complexity

4. **Low Priority:**
   - Spelling errors in comments
   - Missing documentation

## Expected ALICE Score

Expected score: **20-30 / 100** (Grade D)

This should trigger:
- DEPLOYMENT BLOCKED status
- Multiple critical bug reports
- Detailed fix suggestions

## Running the Test

```bash
# Initialize ALICE SDK
alice init

# Analyze this project
alice analyze .
```

## Expected Results

ALICE should detect and report:
- 3+ critical issues
- 2+ high priority issues
- 5+ medium/low priority issues
- Deployment status: BLOCKED
- Grade: D
- Role assessment: Entry-Level
