"""
ALICE Scoring System
Excellence-based scoring with encrypted algorithms
All scoring logic is obfuscated and encrypted (only owner can read)
"""

import os
from typing import Dict, List, Any, Tuple
from utils.encryption import get_encryption_manager


class ScoringEngine:
    """
    Excellence-based scoring system
    Base: 50 points (must earn points to reach 100)
    """

    def __init__(self):
        self.encryption = get_encryption_manager()
        self.BASE_SCORE = 50

        # Encrypted scoring weights (obfuscated for security)
        self._bonus_weights = self._load_encrypted_bonuses()
        self._penalty_weights = self._load_encrypted_penalties()

    def _load_encrypted_bonuses(self) -> Dict[str, int]:
        """Load bonus scoring weights (would be encrypted in production)"""
        # In production, this would be encrypted and stored securely
        # For now, defining the excellence-based bonus system
        return {
            'typescript_usage': 15,
            'error_handling': 10,
            'accessibility': 10,
            'performance_optimizations': 10,
            'security_best_practices': 15,
            'clean_architecture': 10,
            'testing_patterns': 10,
            'documentation': 5,
            'input_validation': 5,
            'proper_authentication': 10,
            'proper_authorization': 5
        }

    def _load_encrypted_penalties(self) -> Dict[str, int]:
        """Load penalty scoring weights (would be encrypted in production)"""
        return {
            'critical_bug': 40,
            'security_vulnerability': 30,
            'no_error_handling_async': 25,
            'performance_issue': 15,
            'accessibility_violation': 10,
            'high_complexity': 15,
            'sql_injection': 30,
            'xss_vulnerability': 30,
            'hardcoded_secrets': 25,
            'no_input_validation': 15,
            'missing_authentication': 20,
            'weak_cryptography': 20
        }

    def calculate_score(
        self,
        bugs: List[Dict[str, Any]],
        frontend_metrics: Dict[str, Any],
        backend_metrics: Dict[str, Any],
        security_metrics: Dict[str, Any],
        content_metrics: Dict[str, Any]
    ) -> Tuple[int, str, str, List[str], List[str]]:
        """
        Calculate excellence-based quality score

        Args:
            bugs: List of all bugs found
            frontend_metrics: Frontend analysis metrics
            backend_metrics: Backend analysis metrics
            security_metrics: Security analysis metrics
            content_metrics: Content analysis metrics

        Returns:
            Tuple of (score, grade, role_level, strengths, weaknesses)
        """
        score = self.BASE_SCORE

        # Track strengths and weaknesses
        strengths = []
        weaknesses = []

        # Apply bonuses for excellence
        if frontend_metrics.get('has_typescript'):
            score += self._bonus_weights['typescript_usage']
            strengths.append('Excellent use of TypeScript for type safety')

        if frontend_metrics.get('has_error_handling') or backend_metrics.get('has_error_handling'):
            score += self._bonus_weights['error_handling']
            strengths.append('Proper error handling implemented')

        if frontend_metrics.get('has_accessibility'):
            score += self._bonus_weights['accessibility']
            strengths.append('Good accessibility practices')

        if frontend_metrics.get('has_performance_optimizations'):
            score += self._bonus_weights['performance_optimizations']
            strengths.append('Performance optimizations applied')

        if not frontend_metrics.get('has_security_issues') and security_metrics.get('total_vulnerabilities', 0) == 0:
            score += self._bonus_weights['security_best_practices']
            strengths.append('Strong security practices')

        if backend_metrics.get('has_authentication'):
            score += self._bonus_weights['proper_authentication']
            strengths.append('Proper authentication implemented')

        if backend_metrics.get('has_input_validation'):
            score += self._bonus_weights['input_validation']
            strengths.append('Input validation implemented')

        if content_metrics.get('has_documentation'):
            score += self._bonus_weights['documentation']
            strengths.append('Well-documented code')

        # Check for clean architecture
        total_files = frontend_metrics.get('total_files', 0) + backend_metrics.get('total_files', 0)
        avg_lines = frontend_metrics.get('total_lines', 0) / max(frontend_metrics.get('total_files', 1), 1)
        if avg_lines < 200 and total_files > 3:
            score += self._bonus_weights['clean_architecture']
            strengths.append('Clean architecture with well-organized components')

        # Apply penalties for issues
        critical_count = 0
        high_count = 0
        medium_count = 0

        for bug in bugs:
            severity = bug.get('severity', 'LOW')
            category = bug.get('category', '')

            if severity == 'CRITICAL':
                critical_count += 1

                # Apply category-specific penalties
                if 'Infinite Loop' in category or 'crash' in bug.get('description', '').lower():
                    score -= self._penalty_weights['critical_bug']
                    weaknesses.append(f'Critical bug found: {category}')

                elif 'XSS' in category or 'injection' in category.lower():
                    score -= self._penalty_weights['xss_vulnerability']
                    weaknesses.append(f'Security vulnerability: {category}')

                elif 'SQL Injection' in category:
                    score -= self._penalty_weights['sql_injection']
                    weaknesses.append('SQL injection vulnerability')

                elif 'Secrets' in category or 'Exposed' in category:
                    score -= self._penalty_weights['hardcoded_secrets']
                    weaknesses.append('Hardcoded secrets in source code')

                else:
                    score -= self._penalty_weights['security_vulnerability']
                    weaknesses.append(f'Critical issue: {category}')

            elif severity == 'HIGH':
                high_count += 1

                if 'Error Handling' in category:
                    score -= self._penalty_weights['no_error_handling_async']
                    weaknesses.append('Missing error handling in async operations')

                elif 'Authentication' in category or 'Authorization' in category:
                    score -= self._penalty_weights['missing_authentication']
                    weaknesses.append('Authentication/authorization issues')

                elif 'Weak Cryptography' in category:
                    score -= self._penalty_weights['weak_cryptography']
                    weaknesses.append('Weak cryptographic algorithms used')

                else:
                    score -= 15
                    weaknesses.append(f'High severity issue: {category}')

            elif severity == 'MEDIUM':
                medium_count += 1

                if 'Complexity' in category:
                    score -= self._penalty_weights['high_complexity']
                    weaknesses.append('High code complexity')

                elif 'Performance' in category:
                    score -= self._penalty_weights['performance_issue']
                    weaknesses.append('Performance issues detected')

                elif 'Accessibility' in category:
                    score -= self._penalty_weights['accessibility_violation']
                    weaknesses.append('Accessibility violations')

                else:
                    score -= 10

        # Ensure score is within bounds
        score = max(0, min(100, score))

        # Determine grade
        grade = self._calculate_grade(score)

        # Determine role level based on score
        role_level = self._determine_role_level(score, critical_count, high_count)

        # Ensure we have at least some feedback
        if not strengths:
            strengths.append('Code submitted for review')

        if not weaknesses and score < 85:
            weaknesses.append('Room for improvement in code quality and best practices')

        return score, grade, role_level, strengths, weaknesses

    def _calculate_grade(self, score: int) -> str:
        """
        Calculate letter grade from score

        Args:
            score: Numeric score (0-100)

        Returns:
            Letter grade
        """
        if score >= 95:
            return 'A+'
        elif score >= 90:
            return 'A'
        elif score >= 85:
            return 'A-'
        elif score >= 80:
            return 'B+'
        elif score >= 75:
            return 'B'
        elif score >= 70:
            return 'B-'
        elif score >= 65:
            return 'C+'
        elif score >= 60:
            return 'C'
        elif score >= 55:
            return 'C-'
        else:
            return 'D'

    def _determine_role_level(self, score: int, critical_bugs: int, high_bugs: int) -> str:
        """
        Determine developer role level based on performance

        Args:
            score: Quality score
            critical_bugs: Number of critical bugs
            high_bugs: Number of high severity bugs

        Returns:
            Role level assessment
        """
        if score >= 90 and critical_bugs == 0:
            return 'Senior'
        elif score >= 75 and critical_bugs == 0 and high_bugs <= 2:
            return 'Mid-Level'
        elif score >= 60:
            return 'Junior'
        else:
            return 'Entry-Level'

    def determine_deployment_status(self, score: int, critical_bugs: int, high_bugs: int) -> str:
        """
        Determine if code is safe for deployment

        Args:
            score: Quality score
            critical_bugs: Number of critical bugs
            high_bugs: Number of high severity bugs

        Returns:
            Deployment status: APPROVED, BLOCKED, or CAUTION
        """
        if critical_bugs > 0:
            return 'BLOCKED'
        elif high_bugs > 3 or score < 60:
            return 'CAUTION'
        else:
            return 'APPROVED'

    def generate_encrypted_report(self, assessment_data: Dict[str, Any]) -> str:
        """
        Generate encrypted assessment report (management only)

        Args:
            assessment_data: Full assessment data

        Returns:
            Encrypted report string
        """
        return self.encryption.encrypt_json(assessment_data)

    def decrypt_report(self, encrypted_report: str) -> Dict[str, Any]:
        """
        Decrypt assessment report

        Args:
            encrypted_report: Encrypted report string

        Returns:
            Decrypted assessment data
        """
        return self.encryption.decrypt_json(encrypted_report)


def get_scoring_engine() -> ScoringEngine:
    """Get scoring engine instance"""
    return ScoringEngine()
