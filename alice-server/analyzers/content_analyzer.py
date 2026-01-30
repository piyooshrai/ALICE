"""
ALICE Content Analyzer
Analyzes code comments, documentation, and text content for grammar and spelling
"""

import re
from typing import List, Dict, Any


class ContentAnalyzer:
    """Analyzes text content for grammar, spelling, and documentation quality"""

    def __init__(self):
        self.issues = []
        self.metrics = {
            'has_documentation': False,
            'documentation_quality': 0,
            'comment_count': 0,
            'spelling_errors': 0,
            'grammar_issues': 0
        }

        # Common technical terms that should be ignored in spell check
        self.technical_terms = {
            'api', 'url', 'http', 'https', 'json', 'xml', 'html', 'css', 'js',
            'async', 'await', 'const', 'var', 'let', 'typeof', 'instanceof',
            'boolean', 'nullable', 'auth', 'auth0', 'oauth', 'jwt', 'csrf',
            'cors', 'sql', 'nosql', 'postgres', 'mongodb', 'redis', 'npm',
            'middleware', 'axios', 'uuid', 'enum', 'dto', 'orm', 'cli'
        }

        # Common misspellings in code comments
        self.common_misspellings = {
            'recieve': 'receive',
            'occured': 'occurred',
            'seperate': 'separate',
            'definately': 'definitely',
            'wich': 'which',
            'thier': 'their',
            'teh': 'the',
            'recieved': 'received',
            'occurance': 'occurrence',
            'sucessful': 'successful',
            'sucessfully': 'successfully',
            'begining': 'beginning',
            'comming': 'coming',
            'compatability': 'compatibility',
            'enviroment': 'environment',
            'langauge': 'language',
            'mesage': 'message',
            'necesary': 'necessary',
            'occassion': 'occasion',
            'recomend': 'recommend',
            'refered': 'referred',
            'seperated': 'separated',
            'succesful': 'successful',
            'temperary': 'temporary',
            'usualy': 'usually'
        }

    def analyze_file(self, file_path: str, content: str) -> List[Dict[str, Any]]:
        """
        Analyze content in a file

        Args:
            file_path: Path to file
            content: File content

        Returns:
            List of content issues found
        """
        file_issues = []
        lines = content.split('\n')

        # Extract comments and documentation
        comments = self._extract_comments(content, file_path)

        # Analyze each comment
        for comment_info in comments:
            comment_text = comment_info['text']
            line_num = comment_info['line']

            # Check spelling
            spelling_issues = self._check_spelling(comment_text, file_path, line_num)
            file_issues.extend(spelling_issues)

            # Check grammar patterns
            grammar_issues = self._check_grammar(comment_text, file_path, line_num)
            file_issues.extend(grammar_issues)

        # Check for documentation presence
        has_docs = self._check_documentation(content, file_path)
        if has_docs:
            self.metrics['has_documentation'] = True

        # Update metrics
        self.metrics['comment_count'] += len(comments)

        self.issues.extend(file_issues)
        return file_issues

    def _extract_comments(self, content: str, file_path: str) -> List[Dict[str, str]]:
        """Extract comments from code"""
        comments = []

        # Determine file type
        is_python = file_path.endswith('.py')
        is_js_family = file_path.endswith(('.js', '.ts', '.jsx', '.tsx'))

        if is_python:
            # Python comments and docstrings
            # Single line comments
            for match in re.finditer(r'#\s*(.+)$', content, re.MULTILINE):
                line_num = content[:match.start()].count('\n') + 1
                comments.append({
                    'text': match.group(1).strip(),
                    'line': line_num
                })

            # Docstrings
            for match in re.finditer(r'"""(.+?)"""', content, re.DOTALL):
                line_num = content[:match.start()].count('\n') + 1
                comments.append({
                    'text': match.group(1).strip(),
                    'line': line_num
                })

        if is_js_family:
            # JavaScript/TypeScript comments
            # Single line comments
            for match in re.finditer(r'//\s*(.+)$', content, re.MULTILINE):
                line_num = content[:match.start()].count('\n') + 1
                comments.append({
                    'text': match.group(1).strip(),
                    'line': line_num
                })

            # Multi-line comments
            for match in re.finditer(r'/\*(.+?)\*/', content, re.DOTALL):
                line_num = content[:match.start()].count('\n') + 1
                comments.append({
                    'text': match.group(1).strip(),
                    'line': line_num
                })

        return comments

    def _check_spelling(self, text: str, file_path: str, line_num: int) -> List[Dict[str, Any]]:
        """Check for spelling errors"""
        issues = []

        # Extract words (ignore code-like patterns)
        words = re.findall(r'\b[a-z]+\b', text.lower())

        for word, correction in self.common_misspellings.items():
            if word in words:
                issues.append({
                    'severity': 'LOW',
                    'category': 'Spelling',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': f'Misspelled word: "{word}" should be "{correction}"',
                    'impact': 'Reduced code professionalism and clarity',
                    'fix_suggestion': f'Correct spelling to: {correction}'
                })
                self.metrics['spelling_errors'] += 1

        return issues

    def _check_grammar(self, text: str, file_path: str, line_num: int) -> List[Dict[str, Any]]:
        """Check for common grammar issues"""
        issues = []

        # Common grammar patterns
        grammar_patterns = [
            (r'\bit\'s\b', 'its', 'Possessive "its" doesn\'t have an apostrophe'),
            (r'\byour\s+welcome\b', 'you\'re welcome', 'Should be "you\'re" (you are)'),
            (r'\bshould\s+of\b', 'should have', 'Should be "should have" not "should of"'),
            (r'\bcould\s+of\b', 'could have', 'Should be "could have" not "could of"'),
            (r'\bwould\s+of\b', 'would have', 'Should be "would have" not "would of"')
        ]

        for pattern, correction, explanation in grammar_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                issues.append({
                    'severity': 'LOW',
                    'category': 'Grammar',
                    'file_path': file_path,
                    'line_number': line_num,
                    'description': f'Grammar issue: {explanation}',
                    'impact': 'Reduced code professionalism',
                    'fix_suggestion': f'Use: {correction}'
                })
                self.metrics['grammar_issues'] += 1

        return issues

    def _check_documentation(self, content: str, file_path: str) -> bool:
        """Check if file has proper documentation"""
        # Check for README or documentation files
        if 'readme' in file_path.lower() or file_path.endswith('.md'):
            return True

        # Check for docstrings or JSDoc
        has_docstrings = '"""' in content or "'''" in content
        has_jsdoc = '/**' in content and '*/' in content

        return has_docstrings or has_jsdoc

    def get_metrics(self) -> Dict[str, Any]:
        """Get content analysis metrics"""
        # Calculate documentation quality score
        if self.metrics['comment_count'] > 0:
            error_rate = (self.metrics['spelling_errors'] + self.metrics['grammar_issues']) / self.metrics['comment_count']
            self.metrics['documentation_quality'] = max(0, 100 - int(error_rate * 100))
        else:
            self.metrics['documentation_quality'] = 50  # Neutral if no comments

        return self.metrics

    def get_issues(self) -> List[Dict[str, Any]]:
        """Get all content issues found"""
        return self.issues
