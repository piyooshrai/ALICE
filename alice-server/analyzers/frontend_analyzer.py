"""
ALICE Frontend Analyzer
Analyzes React/JavaScript code for bugs, security issues, and best practices
"""

import re
import ast
from typing import List, Dict, Any, Tuple
import esprima
from pathlib import Path


class FrontendAnalyzer:
    """Analyzes frontend code (React, JavaScript, TypeScript)"""

    def __init__(self):
        self.bugs = []
        self.metrics = {
            'has_typescript': False,
            'has_error_handling': False,
            'has_accessibility': False,
            'has_performance_optimizations': False,
            'has_security_issues': False,
            'complexity_score': 0,
            'total_lines': 0,
            'total_files': 0
        }

    def analyze_file(self, file_path: str, content: str) -> List[Dict[str, Any]]:
        """
        Analyze a single frontend file

        Args:
            file_path: Path to file
            content: File content

        Returns:
            List of bugs found
        """
        file_bugs = []

        # Check file type
        is_typescript = file_path.endswith(('.ts', '.tsx'))
        is_react = '.tsx' in file_path or '.jsx' in file_path or 'react' in content.lower()

        if is_typescript:
            self.metrics['has_typescript'] = True

        # Count lines
        lines = content.split('\n')
        self.metrics['total_lines'] += len(lines)
        self.metrics['total_files'] += 1

        # Check complexity
        if len(lines) > 300:
            file_bugs.append({
                'severity': 'MEDIUM',
                'category': 'Code Complexity',
                'file_path': file_path,
                'line_number': 1,
                'description': f'File has {len(lines)} lines (>300), consider breaking into smaller components',
                'impact': 'Reduced maintainability and readability',
                'fix_suggestion': 'Split into smaller, focused components with single responsibilities'
            })

        # Analyze React-specific patterns
        if is_react:
            file_bugs.extend(self._check_react_patterns(file_path, content, lines))

        # Check for security vulnerabilities
        file_bugs.extend(self._check_security_issues(file_path, content, lines))

        # Check for performance issues
        file_bugs.extend(self._check_performance_issues(file_path, content, lines))

        # Check accessibility
        file_bugs.extend(self._check_accessibility(file_path, content, lines))

        # Check error handling
        if self._has_error_handling(content):
            self.metrics['has_error_handling'] = True

        self.bugs.extend(file_bugs)
        return file_bugs

    def _check_react_patterns(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for React-specific issues"""
        bugs = []

        # Check for infinite loop in useEffect
        useeffect_pattern = r'useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([^}]*)\}'
        matches = re.finditer(useeffect_pattern, content, re.DOTALL)

        for match in matches:
            effect_body = match.group(1)
            line_num = content[:match.start()].count('\n') + 1

            # Check if dependency array is missing or empty
            deps_pattern = r'\}\s*,\s*\[(.*?)\]'
            deps_match = re.search(deps_pattern, content[match.end():match.end()+100])

            if not deps_match:
                # No dependency array - runs on every render
                if 'setState' in effect_body or 'set' in effect_body.lower():
                    bugs.append({
                        'severity': 'CRITICAL',
                        'category': 'Infinite Loop',
                        'file_path': file_path,
                        'line_number': line_num,
                        'description': 'useEffect without dependency array that calls setState creates infinite loop',
                        'impact': 'Application crash, browser freeze, poor user experience',
                        'fix_suggestion': 'Add dependency array to useEffect: useEffect(() => { ... }, [dependencies])'
                    })

        # Check for missing key prop in lists
        map_pattern = r'\.map\s*\([^)]*\)\s*=>\s*<'
        for match in re.finditer(map_pattern, content):
            line_num = content[:match.start()].count('\n') + 1
            # Look ahead for key prop
            next_100_chars = content[match.end():match.end()+100]
            if 'key=' not in next_100_chars:
                bugs.append({
                    'severity': 'MEDIUM',
                    'category': 'React Best Practice',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': 'Missing key prop in mapped component',
                    'impact': 'Poor rendering performance, potential bugs with component state',
                    'fix_suggestion': 'Add unique key prop: .map(item => <Component key={item.id} />)'
                })

        # Check for expensive operations in render (outside useMemo/useCallback)
        expensive_operations = [
            (r'\.sort\(', 'array sorting'),
            (r'\.filter\(', 'array filtering'),
            (r'\.map\(.*\.map\(', 'nested array mapping'),
            (r'new Date\(', 'date creation')
        ]

        for pattern, operation in expensive_operations:
            for match in re.finditer(pattern, content):
                line_num = content[:match.start()].count('\n') + 1
                # Check if inside useMemo or useCallback
                before_context = content[max(0, match.start()-200):match.start()]
                if 'useMemo' not in before_context and 'useCallback' not in before_context:
                    # Check if in component body (not in useEffect)
                    if 'return (' in content[match.start():match.start()+500]:
                        bugs.append({
                            'severity': 'MEDIUM',
                            'category': 'Performance',
                            'file_path': file_path,
                            'line_number': line_num,
                            'description': f'Expensive {operation} operation in render without memoization',
                            'impact': 'Component re-renders trigger expensive recalculations',
                            'fix_suggestion': f'Wrap in useMemo: const result = useMemo(() => {operation}, [deps])'
                        })
                        self.metrics['has_performance_optimizations'] = True
                        break

        return bugs

    def _check_security_issues(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for security vulnerabilities"""
        bugs = []

        # Check for dangerouslySetInnerHTML
        if 'dangerouslySetInnerHTML' in content:
            for i, line in enumerate(lines, 1):
                if 'dangerouslySetInnerHTML' in line:
                    bugs.append({
                        'severity': 'CRITICAL',
                        'category': 'XSS Vulnerability',
                        'file_path': file_path,
                        'line_number': i,
                        'description': 'Using dangerouslySetInnerHTML without sanitization',
                        'impact': 'Cross-Site Scripting (XSS) attack vector - malicious scripts can be injected',
                        'fix_suggestion': 'Use DOMPurify to sanitize HTML: dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(html)}}'
                    })
                    self.metrics['has_security_issues'] = True

        # Check for innerHTML usage
        if 'innerHTML' in content and 'dangerouslySetInnerHTML' not in content:
            for i, line in enumerate(lines, 1):
                if 'innerHTML' in line:
                    bugs.append({
                        'severity': 'CRITICAL',
                        'category': 'XSS Vulnerability',
                        'file_path': file_path,
                        'line_number': i,
                        'description': 'Direct innerHTML manipulation detected',
                        'impact': 'XSS vulnerability - user input can execute malicious scripts',
                        'fix_suggestion': 'Use textContent or React rendering instead, or sanitize with DOMPurify'
                    })
                    self.metrics['has_security_issues'] = True

        # Check for eval usage
        if re.search(r'\beval\s*\(', content):
            for i, line in enumerate(lines, 1):
                if 'eval(' in line:
                    bugs.append({
                        'severity': 'CRITICAL',
                        'category': 'Code Injection',
                        'file_path': file_path,
                        'line_number': i,
                        'description': 'Use of eval() detected',
                        'impact': 'Arbitrary code execution vulnerability',
                        'fix_suggestion': 'Remove eval() and use safe alternatives like JSON.parse or function constructors'
                    })
                    self.metrics['has_security_issues'] = True

        # Check for window.open without validation
        if 'window.open' in content:
            for i, line in enumerate(lines, 1):
                if 'window.open' in line and 'noopener' not in line:
                    bugs.append({
                        'severity': 'HIGH',
                        'category': 'Security',
                        'file_path': file_path,
                        'line_number': i,
                        'description': 'window.open without noopener/noreferrer',
                        'impact': 'Tabnabbing vulnerability - opened window can access parent window',
                        'fix_suggestion': 'Add rel="noopener noreferrer" to prevent access to window.opener'
                    })
                    self.metrics['has_security_issues'] = True

        # Check for hardcoded secrets/API keys
        secret_patterns = [
            (r'api[_-]?key\s*=\s*["\'][^"\']+["\']', 'API key'),
            (r'secret\s*=\s*["\'][^"\']+["\']', 'secret'),
            (r'password\s*=\s*["\'][^"\']+["\']', 'password'),
            (r'token\s*=\s*["\'][^"\']+["\']', 'token')
        ]

        for pattern, secret_type in secret_patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                line_num = content[:match.start()].count('\n') + 1
                bugs.append({
                    'severity': 'CRITICAL',
                    'category': 'Exposed Secrets',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': f'Hardcoded {secret_type} detected in source code',
                    'impact': 'Credential exposure - secrets visible in version control and deployments',
                    'fix_suggestion': f'Move to environment variables: process.env.{secret_type.upper()}'
                })
                self.metrics['has_security_issues'] = True

        return bugs

    def _check_performance_issues(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for performance issues"""
        bugs = []

        # Check for missing React.memo on exported components
        if 'export' in content and 'const' in content:
            if 'React.memo' not in content and 'memo(' not in content:
                # Check if it's a component (returns JSX)
                if 'return (' in content or 'return <' in content:
                    bugs.append({
                        'severity': 'LOW',
                        'category': 'Performance',
                        'file_path': file_path,
                        'line_number': 1,
                        'description': 'Component could benefit from React.memo to prevent unnecessary re-renders',
                        'impact': 'Component re-renders even when props haven\'t changed',
                        'fix_suggestion': 'Wrap component with React.memo: export default React.memo(Component)'
                    })

        return bugs

    def _check_accessibility(self, file_path: str, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for accessibility issues"""
        bugs = []

        # Check for interactive elements without aria-label
        interactive_elements = ['<button', '<input', '<a ', '<select']

        for element in interactive_elements:
            for match in re.finditer(element, content):
                line_num = content[:match.start()].count('\n') + 1
                # Look ahead for aria-label or children text
                next_200_chars = content[match.start():match.start()+200]
                if 'aria-label' not in next_200_chars and 'aria-labelledby' not in next_200_chars:
                    # Check if it's likely to have no visible text
                    if element == '<button' and '>' in next_200_chars:
                        icon_indicators = ['Icon', 'icon', 'svg', 'SVG']
                        if any(indicator in next_200_chars for indicator in icon_indicators):
                            bugs.append({
                                'severity': 'MEDIUM',
                                'category': 'Accessibility',
                                'file_path': file_path,
                                'line_number': line_num,
                                'description': f'Interactive element {element} missing aria-label',
                                'impact': 'Screen readers cannot describe element to visually impaired users',
                                'fix_suggestion': f'Add aria-label: {element} aria-label="description">'
                            })
                            self.metrics['has_accessibility'] = True

        # Check for images without alt text
        for match in re.finditer(r'<img\s+', content):
            line_num = content[:match.start()].count('\n') + 1
            next_100_chars = content[match.start():match.start()+100]
            if 'alt=' not in next_100_chars:
                bugs.append({
                    'severity': 'MEDIUM',
                    'category': 'Accessibility',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': 'Image missing alt attribute',
                    'impact': 'Screen readers cannot describe image content',
                    'fix_suggestion': 'Add alt text: <img alt="descriptive text" />'
                })
                self.metrics['has_accessibility'] = True

        return bugs

    def _has_error_handling(self, content: str) -> bool:
        """Check if file has error handling"""
        error_handling_indicators = [
            'try {',
            'catch (',
            '.catch(',
            'ErrorBoundary',
            'onError'
        ]
        return any(indicator in content for indicator in error_handling_indicators)

    def get_metrics(self) -> Dict[str, Any]:
        """Get analysis metrics"""
        return self.metrics

    def get_bugs(self) -> List[Dict[str, Any]]:
        """Get all bugs found"""
        return self.bugs
