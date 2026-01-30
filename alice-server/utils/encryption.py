"""
ALICE Encryption Utilities
Secure encryption for scoring algorithms and sensitive data
"""

import os
import base64
import hashlib
from cryptography.fernet import Fernet
from typing import Any, Dict
import json


class EncryptionManager:
    """Manages encryption and decryption of sensitive data"""

    def __init__(self, encryption_key: str = None):
        """
        Initialize encryption manager

        Args:
            encryption_key: Base64 encoded Fernet key (32 bytes)
        """
        if encryption_key is None:
            encryption_key = os.environ.get('ENCRYPTION_KEY')

        if not encryption_key:
            raise ValueError("ENCRYPTION_KEY environment variable not set")

        self.cipher = Fernet(encryption_key.encode() if isinstance(encryption_key, str) else encryption_key)

    def encrypt(self, data: str) -> str:
        """
        Encrypt string data

        Args:
            data: String to encrypt

        Returns:
            Base64 encoded encrypted string
        """
        encrypted = self.cipher.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()

    def decrypt(self, encrypted_data: str) -> str:
        """
        Decrypt string data

        Args:
            encrypted_data: Base64 encoded encrypted string

        Returns:
            Decrypted string
        """
        decoded = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted = self.cipher.decrypt(decoded)
        return decrypted.decode()

    def encrypt_json(self, data: Dict[str, Any]) -> str:
        """
        Encrypt JSON data

        Args:
            data: Dictionary to encrypt

        Returns:
            Encrypted JSON string
        """
        json_str = json.dumps(data)
        return self.encrypt(json_str)

    def decrypt_json(self, encrypted_data: str) -> Dict[str, Any]:
        """
        Decrypt JSON data

        Args:
            encrypted_data: Encrypted JSON string

        Returns:
            Decrypted dictionary
        """
        json_str = self.decrypt(encrypted_data)
        return json.loads(json_str)

    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """
        Hash API key using SHA-256

        Args:
            api_key: API key to hash

        Returns:
            Hexadecimal hash string
        """
        return hashlib.sha256(api_key.encode()).hexdigest()

    @staticmethod
    def generate_fernet_key() -> str:
        """
        Generate a new Fernet key

        Returns:
            Base64 encoded Fernet key
        """
        return Fernet.generate_key().decode()

    @staticmethod
    def obfuscate_string(data: str) -> str:
        """
        Simple obfuscation using base64

        Args:
            data: String to obfuscate

        Returns:
            Base64 encoded string
        """
        return base64.b64encode(data.encode()).decode()

    @staticmethod
    def deobfuscate_string(obfuscated: str) -> str:
        """
        Deobfuscate base64 string

        Args:
            obfuscated: Base64 encoded string

        Returns:
            Original string
        """
        return base64.b64decode(obfuscated.encode()).decode()


def get_encryption_manager() -> EncryptionManager:
    """Get singleton encryption manager instance"""
    return EncryptionManager()


# Generate key helper for setup
if __name__ == "__main__":
    print("Generated Fernet Key (save to ENCRYPTION_KEY env var):")
    print(EncryptionManager.generate_fernet_key())
