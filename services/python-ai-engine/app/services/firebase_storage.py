import os
import tempfile
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlparse

import firebase_admin
import httpx
import structlog
from firebase_admin import credentials, storage
from google.cloud.exceptions import GoogleCloudError

logger = structlog.get_logger()


class FirebaseVideoStorage:
    """
    Service for storing generated videos in Firebase Storage with organized folder structure.

    Storage structure: gs://bucket/{tenant_name}/{timestamp}-{creative_id}-{iteration}
    """

    def __init__(self):
        self.bucket_name = os.getenv(
            "FIREBASE_STORAGE_BUCKET", "ceaser-advt-genius.appspot.com"
        )
        self.prefix = os.getenv("FIREBASE_VIDEO_PREFIX", "videos")

        # Initialize Firebase Admin SDK
        try:
            # Check if Firebase app is already initialized
            try:
                app = firebase_admin.get_app()
                logger.info("Using existing Firebase app")
            except ValueError:
                # Initialize Firebase Admin SDK with service account
                service_account_path = os.getenv(
                    "FIREBASE_SERVICE_ACCOUNT", "./firebase/service-account.json"
                )

                if os.path.exists(service_account_path):
                    cred = credentials.Certificate(service_account_path)
                    app = firebase_admin.initialize_app(
                        cred, {"storageBucket": self.bucket_name}
                    )
                    logger.info("Firebase Admin SDK initialized with service account")
                else:
                    # Try to initialize with default credentials (useful for deployed environments)
                    app = firebase_admin.initialize_app(
                        options={"storageBucket": self.bucket_name}
                    )
                    logger.info(
                        "Firebase Admin SDK initialized with default credentials"
                    )

            # Get storage bucket
            self.bucket = storage.bucket(app=app)
            logger.info(
                "Firebase Storage initialized successfully", bucket=self.bucket_name
            )

        except Exception as e:
            logger.warning(
                "Firebase Storage initialization failed, storage disabled", error=str(e)
            )
            self.bucket = None

    def _generate_firebase_path(
        self, tenant_name: str, creative_id: str, iteration: int = 1
    ) -> str:
        """
        Generate Firebase Storage path following the pattern:
        {prefix}/{tenant_name}/{timestamp}-{creative_id}-{iteration}.mp4
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}-{creative_id}-{iteration:03d}.mp4"
        return f"{self.prefix}/{tenant_name}/{filename}"

    def _get_blob_url(self, blob) -> Optional[str]:
        """
        Get the best available URL for a blob (public URL or signed URL).
        """
        try:
            # Try to get public URL first
            if blob.public_url:
                return blob.public_url
        except Exception:
            pass

        try:
            # Generate a long-lived signed URL as fallback
            expiration_time = datetime.utcnow() + timedelta(days=365)  # 1 year
            return blob.generate_signed_url(expiration=expiration_time, method="GET")
        except Exception as e:
            logger.warning(
                "Could not generate URL for blob", blob_name=blob.name, error=str(e)
            )
            return None

    async def download_and_store_video(
        self,
        video_url: str,
        tenant_name: str,
        creative_id: str,
        iteration: int = 1,
        content_type: str = "video/mp4",
    ) -> Optional[str]:
        """
        Download video from provider URL and store in Firebase Storage.

        Args:
            video_url: URL of the generated video from provider
            tenant_name: Tenant identifier for folder organization
            creative_id: Creative ID for file naming
            iteration: Iteration number for multiple variations
            content_type: MIME type of the video

        Returns:
            Firebase Storage download URL or None if storage failed
        """
        if not self.bucket:
            logger.warning("Firebase Storage not available, skipping video storage")
            return None

        if not video_url or "example" in video_url:
            logger.info(
                "Mock video URL detected, skipping Firebase storage", url=video_url
            )
            return None

        try:
            # Generate Firebase Storage path
            firebase_path = self._generate_firebase_path(
                tenant_name, creative_id, iteration
            )

            # Download video from provider
            async with httpx.AsyncClient(
                timeout=300.0
            ) as client:  # 5 min timeout for large videos
                logger.info("Downloading video from provider", url=video_url)
                response = await client.get(video_url, follow_redirects=True)
                response.raise_for_status()

                video_data = response.content
                if len(video_data) == 0:
                    logger.error("Downloaded video is empty", url=video_url)
                    return None

                logger.info(
                    "Video downloaded successfully",
                    size_mb=len(video_data) / (1024 * 1024),
                )

            # Upload to Firebase Storage
            logger.info(
                "Uploading video to Firebase Storage",
                path=firebase_path,
                bucket=self.bucket_name,
            )

            blob = self.bucket.blob(firebase_path)
            blob.upload_from_string(video_data, content_type=content_type)

            # Set custom metadata
            blob.metadata = {
                "tenant": tenant_name,
                "creative_id": creative_id,
                "iteration": str(iteration),
                "original_url": video_url,
                "uploaded_at": datetime.utcnow().isoformat(),
            }
            blob.patch()

            # Try to make the blob publicly readable
            # Note: This may fail if uniform bucket-level access is enabled
            try:
                blob.make_public()
                firebase_url = blob.public_url
            except Exception as e:
                logger.warning(
                    "Could not make blob public, generating signed URL instead",
                    error=str(e),
                )
                # Generate a long-lived signed URL as fallback
                expiration_time = datetime.utcnow() + timedelta(days=365)  # 1 year
                firebase_url = blob.generate_signed_url(
                    expiration=expiration_time, method="GET"
                )

            logger.info(
                "Video stored successfully in Firebase Storage",
                firebase_url=firebase_url,
                size_mb=len(video_data) / (1024 * 1024),
            )

            return firebase_url

        except httpx.HTTPError as e:
            logger.error(
                "Failed to download video from provider", url=video_url, error=str(e)
            )
            return None
        except GoogleCloudError as e:
            logger.error(
                "Failed to upload video to Firebase Storage",
                path=firebase_path,
                error=str(e),
            )
            return None
        except Exception as e:
            logger.error(
                "Unexpected error during video storage", url=video_url, error=str(e)
            )
            return None

    def generate_signed_url(
        self, firebase_path: str, expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate a signed URL for private video access.

        Args:
            firebase_path: Firebase Storage path of the video
            expiration: URL expiration time in seconds (default: 1 hour)

        Returns:
            Signed URL or None if generation failed
        """
        if not self.bucket:
            return None

        try:
            blob = self.bucket.blob(firebase_path)
            expiration_time = datetime.utcnow() + timedelta(seconds=expiration)

            signed_url = blob.generate_signed_url(
                expiration=expiration_time, method="GET"
            )
            return signed_url
        except GoogleCloudError as e:
            logger.error(
                "Failed to generate signed URL", path=firebase_path, error=str(e)
            )
            return None

    def delete_video(self, firebase_path: str) -> bool:
        """
        Delete video from Firebase Storage.

        Args:
            firebase_path: Firebase Storage path of the video to delete

        Returns:
            True if deletion successful, False otherwise
        """
        if not self.bucket:
            return False

        try:
            blob = self.bucket.blob(firebase_path)
            blob.delete()
            logger.info("Video deleted from Firebase Storage", path=firebase_path)
            return True
        except GoogleCloudError as e:
            logger.error(
                "Failed to delete video from Firebase Storage",
                path=firebase_path,
                error=str(e),
            )
            return False

    def list_tenant_videos(self, tenant_name: str, limit: int = 100) -> list:
        """
        List all videos for a specific tenant.

        Args:
            tenant_name: Tenant identifier
            limit: Maximum number of videos to return

        Returns:
            List of video metadata dictionaries
        """
        if not self.bucket:
            return []

        try:
            prefix = f"{self.prefix}/{tenant_name}/"
            blobs = self.bucket.list_blobs(prefix=prefix, max_results=limit)

            videos = []
            for blob in blobs:
                try:
                    # Reload blob to get metadata
                    blob.reload()
                    metadata = blob.metadata or {}

                    videos.append(
                        {
                            "path": blob.name,
                            "public_url": self._get_blob_url(blob),
                            "size": blob.size,
                            "created": blob.time_created,
                            "updated": blob.updated,
                            "content_type": blob.content_type,
                            "creative_id": metadata.get("creative_id"),
                            "iteration": metadata.get("iteration"),
                            "original_url": metadata.get("original_url"),
                            "uploaded_at": metadata.get("uploaded_at"),
                        }
                    )
                except GoogleCloudError:
                    # Skip if metadata can't be retrieved
                    continue

            return videos

        except GoogleCloudError as e:
            logger.error(
                "Failed to list tenant videos", tenant=tenant_name, error=str(e)
            )
            return []

    def get_video_metadata(self, firebase_path: str) -> Optional[dict]:
        """
        Get metadata for a specific video.

        Args:
            firebase_path: Firebase Storage path of the video

        Returns:
            Video metadata dictionary or None if not found
        """
        if not self.bucket:
            return None

        try:
            blob = self.bucket.blob(firebase_path)
            blob.reload()

            metadata = blob.metadata or {}

            return {
                "path": blob.name,
                "public_url": self._get_blob_url(blob),
                "size": blob.size,
                "created": blob.time_created,
                "updated": blob.updated,
                "content_type": blob.content_type,
                "creative_id": metadata.get("creative_id"),
                "iteration": metadata.get("iteration"),
                "original_url": metadata.get("original_url"),
                "uploaded_at": metadata.get("uploaded_at"),
            }

        except GoogleCloudError as e:
            logger.error(
                "Failed to get video metadata", path=firebase_path, error=str(e)
            )
            return None
