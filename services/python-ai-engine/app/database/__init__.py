"""
Database package for AdGenius AI Engine
Provides Firebase Firestore integration
"""

from .firestore_client import FirestoreClient, get_firestore_client

__all__ = ['FirestoreClient', 'get_firestore_client']
