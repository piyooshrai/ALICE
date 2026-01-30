"""
ALICE Backend Analyzer
Analyzes backend code (Node.js, Python, APIs) for security and quality issues
"""

import re
from typing import List, Dict, Any


class BackendAnalyzer:
    """Analyzes backend code for security, performance, and best practices"""

    def __init__(self):
        self.bugs = []
        self.metrics = {
            'has_authentication': False,
            'has_authorization': False,
            'has_input_validation': False,
            'has_error_handling': False,
            'has_sql_injection_risk': False,
            'has_secrets_exposure': False,
            'total_endpoints': 0,
            'total_files': 0
        }

    def analyze_file(self, file_path: str, content: str) -> List[Dict[str, Any]]:
        """
        Analyze a single backend file

        Args:
            file_path: Path to file
            content: File content

        Returns:
            List of bugs found
        """
        file_bugs = []
        lines = content.split('\n')
        self.metrics['total_files'] += 1

        # Determine file type
        is_python = file_path.endswith('.py')
        is_javascript = file_path.endswith(('.js', '.ts'))

        # Check for SQL injection vulnerabilities
        file_bugs.extend(self._check_sql_injection(file_path, content, lines, is_python))

        # Check for authentication issues
        file_bugs.extend(self._check_authentication(file_path, content, lines))

        # Check for secrets exposure
        file_bugs.extend(self._check_secrets(file_path, content, lines))

        # Check for error handling
        file_bugs.extend(self._check_error_handling(file_path, content, lines, is_python, is_javascript))

        # Check for CORS misconfigurations
        file_bugs.extend(self._check_cors(file_path, content, lines))

        # Check for unsafe operations
        file_bugs.extend(self._check_unsafe_operations(file_path, content, lines, is_python))

        # Count endpoints
        self.metrics['total_endpoints'] += self._count_endpoints(content, is_python, is_javascript)

        self.bugs.extend(file_bugs)
        return file_bugs

    def _check_sql_injection(self, file_path: str, content: str, lines: List[str], is_python: bool) -> List[Dict[str, Any]]:
        """Check for SQL injection vulnerabilities"""
        bugs = []

        # Dangerous SQL patterns
        if is_python:
            # Python string formatting in SQL
            sql_patterns = [
                (r'execute\s*\(\s*f["\']', 'f-string in execute()'),
                (r'execute\s*\(\s*["\'].*%s.*["\'].*%', '% formatting in SQL'),
                (r'execute\s*\(\s*["\'].*(\.format\()', '.format() in SQL'),
                (r'cursor\.execute\s*\([^)]*\+', 'string concatenation in SQL')
            ]
        else:
            # JavaScript/TypeScript SQL patterns
            sql_patterns = [
                (r'query\s*\(\s*`.*\$\{', 'template literal in query'),
                (r'query\s*\([^)]*\+.*\)', 'string concatenation in query'),
                (r'execute\s*\([^)]*\+.*\)', 'string concatenation in execute')
            ]

        for pattern, description in sql_patterns:
            for match in re.finditer(pattern, content):
                line_num = content[:match.start()].count('\n') + 1
                bugs.append({
                    'severity': 'CRITICAL',
                    'category': 'SQL Injection',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': f'SQL injection vulnerability: {description}',
                    'impact': 'Attackers can execute arbitrary SQL commands, steal/modify/delete data',
                    'fix_suggestion': 'Use parameterized queries: execute("SELECT * FROM users WHERE id = ?", [user_id])'
                })
                self.metrics['has_sql_injection_risk'] = True

        # Check for raw SQL without parameterization
        raw_sql_keywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP']
        for keyword in raw_sql_keywords:
            pattern = rf'["\'].*{keyword}.*WHERE.*["\'].*\+'
            for match in re.finditer(pattern, content, re.IGNORECASE):
                line_num = content[:match.start()].count('\n') + 1
                bugs.append({
                    'severity': 'CRITICAL',
                    'category': 'SQL Injection',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': f'{keyword} query with string concatenation',
                    'impact': 'SQL injection vulnerability - user input can manipulate query structure',
                    'fix_suggestion': 'Use parameterized queries with placeholders instead of string concatenation'
                })
                self.metrics['has_sql_injection_risk'] = True

        return bugs

    def _check_authentication(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for authentication and authorization issues"""
        bugs = []

        # Check for plaintext password storage
        password_patterns = [
            (r'password\s*=\s*request\.(body|data|params)', 'storing plaintext password'),
            (r'\.save\(\{[^}]*password:', 'saving plaintext password to database')
        ]

        for pattern, description in password_patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                line_num = content[:match.start()].count('\n') + 1
                # Check if hashing is mentioned nearby
                context = content[max(0, match.start()-300):match.end()+300]
                if 'bcrypt' not in context and 'hash' not in context.lower() and 'argon' not in context:
                    bugs.append({
                        'severity': 'CRITICAL',
                        'category': 'Authentication',
                        'file_path': file_path,
                        'line_number': line_num,
                        'description': f'Password stored in plaintext: {description}',
                        'impact': 'Passwords exposed in database - catastrophic security breach if compromised',
                        'fix_suggestion': 'Hash passwords with bcrypt: await bcrypt.hash(password, 10)'
                    })

        # Check for missing authentication on endpoints
        if 'app.post' in content or 'app.put' in content or 'app.delete' in content or '@app.route' in content:
            auth_indicators = ['authenticate', 'auth', 'verify', 'token', 'jwt', 'session']
            if not any(indicator in content.lower() for indicator in auth_indicators):
                bugs.append({
                    'severity': 'HIGH',
                    'category': 'Authorization',
                    'file_path': file_path,
                    'line_number': 1,
                    'description': 'API endpoints without authentication middleware',
                    'impact': 'Unauthorized users can access protected resources',
                    'fix_suggestion': 'Add authentication middleware: app.post("/api/resource", authenticate, handler)'
                })
            else:
                self.metrics['has_authentication'] = True

        # Check for JWT without expiration
        if 'jwt.sign' in content or 'encode(' in content:
            for match in re.finditer(r'jwt\.sign|encode\(', content):
                line_num = content[:match.start()].count('\n') + 1
                context = content[match.start():match.start()+200]
                if 'expiresIn' not in context and 'exp' not in context:
                    bugs.append({
                        'severity': 'HIGH',
                        'category': 'Authentication',
                        'file_path': file_path,
                        'line_number': line_num,
                        'description': 'JWT token created without expiration',
                        'impact': 'Tokens remain valid indefinitely, cannot revoke compromised tokens',
                        'fix_suggestion': 'Add expiration: jwt.sign(payload, secret, { expiresIn: "1h" })'
                    })

        return bugs

    def _check_secrets(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for exposed secrets"""
        bugs = []

        # Hardcoded secrets patterns
        secret_patterns = [
            (r'api_key\s*=\s*["\'][a-zA-Z0-9_-]{20,}["\']', 'API key'),
            (r'secret_key\s*=\s*["\'][^"\']{16,}["\']', 'secret key'),
            (r'private_key\s*=\s*["\']-----BEGIN', 'private key'),
            (r'aws_secret_access_key\s*=\s*["\'][^"\']+["\']', 'AWS secret key'),
            (r'database_url\s*=\s*["\'].*://.*:.*@', 'database URL with credentials')
        ]

        for pattern, secret_type in secret_patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                line_num = content[:match.start()].count('\n') + 1
                bugs.append({
                    'severity': 'CRITICAL',
                    'category': 'Exposed Secrets',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': f'Hardcoded {secret_type} in source code',
                    'impact': 'Credentials exposed in version control, accessible to anyone with code access',
                    'fix_suggestion': f'Move to environment variables: os.environ.get("{secret_type.upper().replace(" ", "_")}")'
                })
                self.metrics['has_secrets_exposure'] = True

        return bugs

    def _check_error_handling(self, file_path: str, content: str, lines: List[str], is_python: bool, is_javascript: bool) -> List[Dict[str, Any]]:
        """Check for missing error handling"""
        bugs = []

        if is_python:
            # Check for async operations without try/except
            async_patterns = [r'await ', r'async def']
            for pattern in async_patterns:
                for match in re.finditer(pattern, content):
                    line_num = content[:match.start()].count('\n') + 1
                    # Check if within try block
                    before_context = content[max(0, match.start()-500):match.start()]
                    if 'try:' not in before_context:
                        bugs.append({
                            'severity': 'HIGH',
                            'category': 'Error Handling',
                            'file_path': file_path,
                            'line_number': line_num,
                            'description': 'Async operation without try/except block',
                            'impact': 'Unhandled exceptions crash the application',
                            'fix_suggestion': 'Wrap in try/except: try: await operation() except Exception as e: handle_error(e)'
                        })
                        break
                    else:
                        self.metrics['has_error_handling'] = True

        if is_javascript:
            # Check for promises without .catch()
            promise_patterns = [r'\.then\([^)]+\)(?!\s*\.catch)', r'await [a-zA-Z_][a-zA-Z0-9_]*\(']
            for pattern in promise_patterns:
                for match in re.finditer(pattern, content):
                    line_num = content[:match.start()].count('\n') + 1
                    # Check if within try block
                    before_context = content[max(0, match.start()-500):match.start()]
                    if 'try {' not in before_context and '.catch' not in content[match.end():match.end()+50]:
                        bugs.append({
                            'severity': 'HIGH',
                            'category': 'Error Handling',
                            'file_path': file_path,
                            'line_number': line_num,
                            'description': 'Async operation without error handling',
                            'impact': 'Unhandled promise rejections can crash Node.js process',
                            'fix_suggestion': 'Add error handling: try { await operation() } catch (error) { handleError(error) }'
                        })
                        break
                    else:
                        self.metrics['has_error_handling'] = True

        return bugs

    def _check_cors(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for CORS misconfigurations"""
        bugs = []

        # Check for overly permissive CORS
        if 'Access-Control-Allow-Origin' in content or 'cors(' in content:
            for match in re.finditer(r'Access-Control-Allow-Origin.*["\']?\*["\']?', content):
                line_num = content[:match.start()].count('\n') + 1
                bugs.append({
                    'severity': 'HIGH',
                    'category': 'CORS Misconfiguration',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': 'CORS configured to allow all origins (*)',
                    'impact': 'Any website can make requests to your API, potential CSRF attacks',
                    'fix_suggestion': 'Restrict CORS to specific origins: Access-Control-Allow-Origin: https://yourdomain.com'
                })

        return bugs

    def _check_unsafe_operations(self, file_path: str, content: str, lines: List[str], is_python: bool) -> List[Dict[str, Any]]:
        """Check for unsafe operations"""
        bugs = []

        # Check for unsafe delete operations
        if 'DELETE FROM' in content.upper() or '.delete(' in content:
            delete_patterns = [r'DELETE FROM \w+(?!\s+WHERE)', r'\.delete\(\)(?!\s*\.where)']
            for pattern in delete_patterns:
                for match in re.finditer(pattern, content, re.IGNORECASE):
                    line_num = content[:match.start()].count('\n') + 1
                    bugs.append({
                        'severity': 'CRITICAL',
                        'category': 'Unsafe Operation',
                        'file_path': file_path,
                        'line_number': line_num,
                        'description': 'DELETE operation without WHERE clause',
                        'impact': 'All data in table will be deleted - catastrophic data loss',
                        'fix_suggestion': 'Add WHERE clause to limit deletion: DELETE FROM table WHERE id = ?'
                    })

        # Check for eval in Python/JavaScript
        if re.search(r'\beval\s*\(', content):
            for match in re.finditer(r'\beval\s*\(', content):
                line_num = content[:match.start()].count('\n') + 1
                bugs.append({
                    'severity': 'CRITICAL',
                    'category': 'Code Injection',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': 'Use of eval() function',
                    'impact': 'Arbitrary code execution - attacker can run any code',
                    'fix_suggestion': 'Remove eval() and use safe alternatives like JSON.parse()'
                })

        # Check for exec in Python
        if is_python and re.search(r'\bexec\s*\(', content):
            for match in re.finditer(r'\bexec\s*\(', content):
                line_num = content[:match.start()].count('\n') + 1
                bugs.append({
                    'severity': 'CRITICAL',
                    'category': 'Code Injection',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': 'Use of exec() function',
                    'impact': 'Arbitrary code execution vulnerability',
                    'fix_suggestion': 'Remove exec() and refactor to use safe alternatives'
                })

        return bugs

    def _count_endpoints(self, content: str, is_python: bool, is_javascript: bool) -> int:
        """Count API endpoints in file"""
        count = 0

        if is_python:
            # Flask/FastAPI routes
            count += len(re.findall(r'@app\.(get|post|put|delete|patch)', content))
            count += len(re.findall(r'@router\.(get|post|put|delete|patch)', content))

        if is_javascript:
            # Express routes
            count += len(re.findall(r'app\.(get|post|put|delete|patch)\(', content))
            count += len(re.findall(r'router\.(get|post|put|delete|patch)\(', content))

        return count

    def get_metrics(self) -> Dict[str, Any]:
        """Get analysis metrics"""
        return self.metrics

    def get_bugs(self) -> List[Dict[str, Any]]:
        """Get all bugs found"""
        return self.bugs
