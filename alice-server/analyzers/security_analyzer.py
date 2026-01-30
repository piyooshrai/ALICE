"""
ALICE Security Analyzer
Specialized security vulnerability scanner
"""

import re
from typing import List, Dict, Any


class SecurityAnalyzer:
    """Dedicated security vulnerability scanner"""

    def __init__(self):
        self.vulnerabilities = []
        self.metrics = {
            'total_vulnerabilities': 0,
            'critical_vulns': 0,
            'high_vulns': 0,
            'medium_vulns': 0
        }

    def analyze_file(self, file_path: str, content: str) -> List[Dict[str, Any]]:
        """
        Scan file for security vulnerabilities

        Args:
            file_path: Path to file
            content: File content

        Returns:
            List of vulnerabilities found
        """
        file_vulns = []
        lines = content.split('\n')

        # Check for common vulnerability patterns
        file_vulns.extend(self._check_injection_vulnerabilities(file_path, content, lines))
        file_vulns.extend(self._check_crypto_issues(file_path, content, lines))
        file_vulns.extend(self._check_file_operations(file_path, content, lines))
        file_vulns.extend(self._check_dependency_vulnerabilities(file_path, content, lines))

        # Update metrics
        for vuln in file_vulns:
            self.metrics['total_vulnerabilities'] += 1
            if vuln['severity'] == 'CRITICAL':
                self.metrics['critical_vulns'] += 1
            elif vuln['severity'] == 'HIGH':
                self.metrics['high_vulns'] += 1
            elif vuln['severity'] == 'MEDIUM':
                self.metrics['medium_vulns'] += 1

        self.vulnerabilities.extend(file_vulns)
        return file_vulns

    def _check_injection_vulnerabilities(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for injection vulnerabilities"""
        vulns = []

        # Command injection
        command_patterns = [
            (r'exec\([^)]*\+', 'Command injection via exec'),
            (r'spawn\([^)]*\+', 'Command injection via spawn'),
            (r'system\([^)]*\+', 'Command injection via system'),
            (r'subprocess\.[a-z]+\([^)]*\+', 'Command injection via subprocess'),
            (r'os\.system\([^)]*\+', 'Command injection via os.system')
        ]

        for pattern, description in command_patterns:
            for match in re.finditer(pattern, content):
                line_num = content[:match.start()].count('\n') + 1
                vulns.append({
                    'severity': 'CRITICAL',
                    'category': 'Command Injection',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': description,
                    'impact': 'Attacker can execute arbitrary system commands on the server',
                    'fix_suggestion': 'Use parameterized commands and validate/sanitize all input'
                })

        # Path traversal
        path_patterns = [
            (r'open\([^)]*\+', 'Path traversal in file open'),
            (r'readFile\([^)]*\+', 'Path traversal in readFile'),
            (r'fs\.[a-z]+\([^)]*\+', 'Path traversal in filesystem operation')
        ]

        for pattern, description in path_patterns:
            for match in re.finditer(pattern, content):
                line_num = content[:match.start()].count('\n') + 1
                # Check if path validation exists nearby
                context = content[max(0, match.start()-200):match.end()+200]
                if 'path.resolve' not in context and 'normalize' not in context:
                    vulns.append({
                        'severity': 'HIGH',
                        'category': 'Path Traversal',
                        'file_path': file_path,
                        'line_number': line_num,
                        'description': description,
                        'impact': 'Attacker can read/write files outside intended directory',
                        'fix_suggestion': 'Validate paths: use path.resolve() and check if result is within allowed directory'
                    })

        # LDAP injection
        if 'ldap' in content.lower():
            for match in re.finditer(r'search\([^)]*\+', content):
                line_num = content[:match.start()].count('\n') + 1
                vulns.append({
                    'severity': 'HIGH',
                    'category': 'LDAP Injection',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': 'LDAP query with string concatenation',
                    'impact': 'Attacker can manipulate LDAP queries to bypass authentication',
                    'fix_suggestion': 'Use parameterized LDAP queries and escape special characters'
                })

        return vulns

    def _check_crypto_issues(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for cryptography issues"""
        vulns = []

        # Weak crypto algorithms
        weak_algorithms = [
            (r'\bMD5\b', 'MD5', 'Use SHA-256 or stronger'),
            (r'\bSHA1\b', 'SHA-1', 'Use SHA-256 or stronger'),
            (r'\bDES\b', 'DES', 'Use AES-256'),
            (r'\bRC4\b', 'RC4', 'Use AES-256')
        ]

        for pattern, algorithm, fix in weak_algorithms:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                line_num = content[:match.start()].count('\n') + 1
                vulns.append({
                    'severity': 'HIGH',
                    'category': 'Weak Cryptography',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': f'Use of weak cryptographic algorithm: {algorithm}',
                    'impact': 'Encrypted data can be compromised through cryptographic attacks',
                    'fix_suggestion': fix
                })

        # Hardcoded encryption keys
        if re.search(r'key\s*=\s*["\'][a-zA-Z0-9+/=]{16,}["\']', content):
            for match in re.finditer(r'key\s*=\s*["\'][a-zA-Z0-9+/=]{16,}["\']', content):
                line_num = content[:match.start()].count('\n') + 1
                vulns.append({
                    'severity': 'CRITICAL',
                    'category': 'Hardcoded Encryption Key',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': 'Encryption key hardcoded in source code',
                    'impact': 'Compromised key exposes all encrypted data',
                    'fix_suggestion': 'Store encryption keys in secure key management system or environment variables'
                })

        # Random number generation issues
        weak_random = [
            (r'Math\.random\(\)', 'Math.random()', 'Use crypto.randomBytes() or crypto.getRandomValues()'),
            (r'random\.random\(\)', 'random.random()', 'Use secrets module: secrets.token_bytes()')
        ]

        for pattern, method, fix in weak_random:
            if re.search(pattern, content):
                # Check if used for security purposes
                context_keywords = ['token', 'password', 'secret', 'key', 'session', 'nonce']
                if any(keyword in content.lower() for keyword in context_keywords):
                    for match in re.finditer(pattern, content):
                        line_num = content[:match.start()].count('\n') + 1
                        vulns.append({
                            'severity': 'HIGH',
                            'category': 'Weak Randomness',
                            'file_path': file_path,
                            'line_number': line_num,
                            'description': f'Cryptographically weak random number generator: {method}',
                            'impact': 'Predictable random values compromise security',
                            'fix_suggestion': fix
                        })

        return vulns

    def _check_file_operations(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for unsafe file operations"""
        vulns = []

        # Unrestricted file upload
        upload_patterns = [
            r'multer\(',
            r'upload\.',
            r'FileField',
            r'request\.files'
        ]

        for pattern in upload_patterns:
            for match in re.finditer(pattern, content):
                line_num = content[:match.start()].count('\n') + 1
                # Check for file type validation
                context = content[match.start():match.start()+500]
                if 'fileFilter' not in context and 'mimetype' not in context and 'extension' not in context:
                    vulns.append({
                        'severity': 'HIGH',
                        'category': 'Unrestricted File Upload',
                        'file_path': file_path,
                        'line_number': line_num,
                        'description': 'File upload without type validation',
                        'impact': 'Attacker can upload malicious files (shells, malware)',
                        'fix_suggestion': 'Validate file types, limit file size, sanitize filenames, scan for malware'
                    })
                    break

        return vulns

    def _check_dependency_vulnerabilities(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for known vulnerable dependencies"""
        vulns = []

        # Check package.json or requirements.txt for outdated packages
        if file_path.endswith('package.json') or file_path.endswith('requirements.txt'):
            vulns.append({
                'severity': 'MEDIUM',
                'category': 'Dependency Management',
                'file_path': file_path,
                'line_number': 1,
                'description': 'Dependency file detected - run security audit',
                'impact': 'Outdated dependencies may contain known vulnerabilities',
                'fix_suggestion': 'Run: npm audit fix (Node.js) or pip-audit (Python) to check for vulnerabilities'
            })

        return vulns

    def get_metrics(self) -> Dict[str, Any]:
        """Get security metrics"""
        return self.metrics

    def get_vulnerabilities(self) -> List[Dict[str, Any]]:
        """Get all vulnerabilities found"""
        return self.vulnerabilities
