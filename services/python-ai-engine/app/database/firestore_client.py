"""
Firebase Firestore client for AdGenius AI Engine
Replaces MongoDB functionality with Firebase Firestore
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import structlog

logger = structlog.get_logger(__name__)


class FirestoreClient:
    """Firebase Firestore client for AdGenius AI Engine"""

    def __init__(self):
        self.db = None
        self.project_id = None
        self.database_id = None
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Get Firebase project configuration
            self.project_id = os.getenv("FIREBASE_PROJECT_ID")
            if not self.project_id:
                raise ValueError("FIREBASE_PROJECT_ID environment variable is required")

            # Get Firebase database ID (optional, defaults to "(default)")
            self.database_id = os.getenv("FIREBASE_DATABASE_ID", "(default)")

            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Check for service account key file (production)
                service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

                if service_account_path and os.path.exists(service_account_path):
                    # Production: use service account key file
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(
                        cred,
                        {
                            "projectId": self.project_id,
                            "databaseId": (
                                self.database_id
                                if self.database_id != "(default)"
                                else None
                            ),
                        },
                    )
                    logger.info(
                        "Firebase initialized with service account",
                        project_id=self.project_id,
                        database_id=self.database_id,
                    )
                else:
                    # Initialize with default credentials
                    firebase_admin.initialize_app(
                        options={
                            "projectId": self.project_id,
                            "databaseId": (
                                self.database_id
                                if self.database_id != "(default)"
                                else None
                            ),
                        }
                    )
                    logger.info(
                        "Firebase initialized with default credentials",
                        project_id=self.project_id,
                        database_id=self.database_id,
                    )

            # Get Firestore client for specific database
            if self.database_id and self.database_id != "(default)":
                self.db = firestore.client(database=self.database_id)
                logger.info(
                    "Successfully connected to Firestore database",
                    database_id=self.database_id,
                )
            else:
                self.db = firestore.client()
                logger.info("Successfully connected to default Firestore database")

        except Exception as e:
            logger.error("Failed to initialize Firebase", error=str(e))
            raise

    def get_collection(self, collection_name: str):
        """Get a Firestore collection reference"""
        return self.db.collection(collection_name)

    # Campaign operations
    async def get_campaigns(
        self,
        user_id: str,
        tenant_id: str = "default",
        is_active: Optional[bool] = None,
        limit: int = 50,
    ) -> List[Dict]:
        """Get campaigns for a user"""
        try:
            query = self.get_collection("campaigns").where("user_id", "==", user_id)
            query = query.where("tenant_id", "==", tenant_id)

            if is_active is not None:
                query = query.where("is_active", "==", is_active)

            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)

            docs = query.stream()
            campaigns = []

            for doc in docs:
                campaign_data = doc.to_dict()
                campaign_data["id"] = doc.id
                campaigns.append(campaign_data)

            logger.info("Retrieved campaigns", user_id=user_id, count=len(campaigns))
            return campaigns

        except Exception as e:
            logger.error("Error retrieving campaigns", user_id=user_id, error=str(e))
            raise

    async def get_campaign(self, campaign_id: str, user_id: str) -> Optional[Dict]:
        """Get a specific campaign"""
        try:
            doc_ref = self.get_collection("campaigns").document(campaign_id)
            doc = doc_ref.get()

            if not doc.exists:
                return None

            campaign_data = doc.to_dict()

            # Verify user ownership
            if campaign_data.get("user_id") != user_id:
                logger.warning(
                    "Access denied to campaign",
                    campaign_id=campaign_id,
                    user_id=user_id,
                )
                return None

            campaign_data["id"] = doc.id
            return campaign_data

        except Exception as e:
            logger.error(
                "Error retrieving campaign",
                campaign_id=campaign_id,
                user_id=user_id,
                error=str(e),
            )
            raise

    async def create_campaign(self, campaign_data: Dict) -> str:
        """Create a new campaign"""
        try:
            # Add timestamps
            now = datetime.utcnow()
            campaign_data.update(
                {
                    "created_at": now,
                    "updated_at": now,
                    "is_active": True,
                    "creatives_count": 0,
                    "performance_summary": {
                        "total_impressions": 0,
                        "total_clicks": 0,
                        "average_ctr": 0.0,
                        "total_conversions": 0,
                        "total_spend": 0.0,
                    },
                }
            )

            # Add to Firestore
            doc_ref = self.get_collection("campaigns").add(campaign_data)
            campaign_id = doc_ref[1].id

            logger.info(
                "Created campaign",
                campaign_id=campaign_id,
                user_id=campaign_data.get("user_id"),
            )
            return campaign_id

        except Exception as e:
            logger.error("Error creating campaign", error=str(e))
            raise

    # Creative operations
    async def get_creatives(
        self, campaign_id: str, user_id: str, limit: int = 50
    ) -> List[Dict]:
        """Get creatives for a campaign"""
        try:
            query = self.get_collection("creatives").where(
                "campaign_id", "==", campaign_id
            )
            query = query.where("user_id", "==", user_id)
            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)

            docs = query.stream()
            creatives = []

            for doc in docs:
                creative_data = doc.to_dict()
                creative_data["id"] = doc.id
                creatives.append(creative_data)

            logger.info(
                "Retrieved creatives", campaign_id=campaign_id, count=len(creatives)
            )
            return creatives

        except Exception as e:
            logger.error(
                "Error retrieving creatives", campaign_id=campaign_id, error=str(e)
            )
            raise

    async def create_creative(self, creative_data: Dict) -> str:
        """Create a new creative"""
        try:
            # Add timestamps
            now = datetime.utcnow()
            creative_data.update(
                {
                    "created_at": now,
                    "updated_at": now,
                    "is_active": True,
                    "status": "draft",
                    "variations": [],
                    "selected_variation_id": "",
                    "performance_metrics": {
                        "impressions": 0,
                        "clicks": 0,
                        "ctr": 0.0,
                        "conversions": 0,
                        "cost_per_click": 0.0,
                        "roas": 0.0,
                        "spend": 0.0,
                        "custom_metrics": {},
                    },
                }
            )

            # Add to Firestore
            doc_ref = self.get_collection("creatives").add(creative_data)
            creative_id = doc_ref[1].id

            logger.info(
                "Created creative",
                creative_id=creative_id,
                campaign_id=creative_data.get("campaign_id"),
            )
            return creative_id

        except Exception as e:
            logger.error("Error creating creative", error=str(e))
            raise

    # Generation job operations
    async def create_generation_job(self, job_data: Dict) -> str:
        """Create a new generation job"""
        try:
            # Add timestamps
            now = datetime.utcnow()
            job_data.update(
                {
                    "created_at": now,
                    "updated_at": now,
                    "started_at": now,
                    "status": "running",
                    "results": {},
                    "error_message": "",
                    "processing_time": 0.0,
                }
            )

            # Add to Firestore
            doc_ref = self.get_collection("generation_jobs").add(job_data)
            job_id = doc_ref[1].id

            logger.info(
                "Created generation job",
                job_id=job_id,
                job_type=job_data.get("job_type"),
            )
            return job_id

        except Exception as e:
            logger.error("Error creating generation job", error=str(e))
            raise

    async def update_generation_job(self, job_id: str, updates: Dict):
        """Update a generation job"""
        try:
            updates["updated_at"] = datetime.utcnow()

            doc_ref = self.get_collection("generation_jobs").document(job_id)
            doc_ref.update(updates)

            logger.info(
                "Updated generation job", job_id=job_id, status=updates.get("status")
            )

        except Exception as e:
            logger.error("Error updating generation job", job_id=job_id, error=str(e))
            raise

    # User profile operations
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile"""
        try:
            doc_ref = self.get_collection("user_profiles").document(user_id)
            doc = doc_ref.get()

            if not doc.exists:
                return None

            profile_data = doc.to_dict()
            profile_data["uid"] = doc.id
            return profile_data

        except Exception as e:
            logger.error("Error retrieving user profile", user_id=user_id, error=str(e))
            raise

    async def create_or_update_user_profile(self, user_id: str, profile_data: Dict):
        """Create or update user profile"""
        try:
            profile_data["updated_at"] = datetime.utcnow()

            doc_ref = self.get_collection("user_profiles").document(user_id)
            doc_ref.set(profile_data, merge=True)

            logger.info("Updated user profile", user_id=user_id)

        except Exception as e:
            logger.error("Error updating user profile", user_id=user_id, error=str(e))
            raise

    # Analytics operations
    async def save_analytics_data(self, analytics_data: Dict) -> str:
        """Save analytics data"""
        try:
            analytics_data.update(
                {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
            )

            # Add to Firestore
            doc_ref = self.get_collection("analytics").add(analytics_data)
            analytics_id = doc_ref[1].id

            logger.info("Saved analytics data", analytics_id=analytics_id)
            return analytics_id

        except Exception as e:
            logger.error("Error saving analytics data", error=str(e))
            raise

    # Generic operations
    async def batch_write(self, operations: List[Dict]):
        """Perform batch write operations"""
        try:
            batch = self.db.batch()

            for operation in operations:
                op_type = operation.get("type")
                collection = operation.get("collection")
                doc_id = operation.get("doc_id")
                data = operation.get("data", {})

                doc_ref = (
                    self.get_collection(collection).document(doc_id)
                    if doc_id
                    else self.get_collection(collection).document()
                )

                if op_type == "set":
                    batch.set(doc_ref, data)
                elif op_type == "update":
                    batch.update(doc_ref, data)
                elif op_type == "delete":
                    batch.delete(doc_ref)

            batch.commit()
            logger.info("Batch write completed", operations_count=len(operations))

        except Exception as e:
            logger.error("Error in batch write", error=str(e))
            raise

    def close(self):
        """Close the Firestore client (cleanup if needed)"""
        # Firestore client doesn't need explicit closing
        logger.info("Firestore client connection closed")


# Global Firestore client instance
_firestore_client = None


def get_firestore_client() -> FirestoreClient:
    """Get singleton Firestore client instance"""
    global _firestore_client
    if _firestore_client is None:
        _firestore_client = FirestoreClient()
    return _firestore_client
