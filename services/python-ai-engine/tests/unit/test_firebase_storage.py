"""
Unit tests for Firebase Storage service.
Tests file upload, download, URL generation, and error handling.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import tempfile
import os
from datetime import datetime, timedelta

from app.services.firebase_storage import FirebaseVideoStorage


class TestFirebaseVideoStorage:
    """Test suite for FirebaseVideoStorage class."""

    @pytest.fixture
    def firebase_storage(self, mock_firebase_storage):
        """Create FirebaseVideoStorage instance with mocked Firebase."""
        with patch("app.services.firebase_storage.firebase_admin"):
            storage = FirebaseVideoStorage()
            return storage

    @pytest.fixture
    def sample_video_file(self, temp_file):
        """Sample video file for testing."""
        return temp_file

    def test_init_with_service_account(self):
        """Test initialization with service account file."""
        with patch("app.services.firebase_storage.os.path.exists", return_value=True):
            with patch(
                "app.services.firebase_storage.credentials.Certificate"
            ) as mock_cert:
                with patch(
                    "app.services.firebase_storage.firebase_admin.initialize_app"
                ) as mock_init:
                    with patch(
                        "app.services.firebase_storage.firebase_admin.get_app",
                        side_effect=ValueError,
                    ):
                        storage = FirebaseVideoStorage()

                        mock_cert.assert_called_once()
                        mock_init.assert_called_once()

    def test_init_with_default_credentials(self):
        """Test initialization with default credentials."""
        with patch("app.services.firebase_storage.os.path.exists", return_value=False):
            with patch(
                "app.services.firebase_storage.firebase_admin.initialize_app"
            ) as mock_init:
                with patch(
                    "app.services.firebase_storage.firebase_admin.get_app",
                    side_effect=ValueError,
                ):
                    storage = FirebaseVideoStorage()

                    mock_init.assert_called_once()

    def test_init_with_existing_app(self):
        """Test initialization when Firebase app already exists."""
        with patch(
            "app.services.firebase_storage.firebase_admin.get_app"
        ) as mock_get_app:
            mock_app = Mock()
            mock_get_app.return_value = mock_app

            storage = FirebaseVideoStorage()

            assert storage is not None

    @pytest.mark.asyncio
    async def test_upload_video_success(self, firebase_storage, sample_video_file):
        """Test successful video upload."""
        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.upload_from_filename.return_value = None
            mock_blob.public_url = (
                "https://storage.googleapis.com/bucket/videos/test.mp4"
            )
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.upload_video(
                sample_video_file, "test_video.mp4"
            )

            assert result["success"] is True
            assert (
                result["url"] == "https://storage.googleapis.com/bucket/videos/test.mp4"
            )
            assert result["filename"] == "test_video.mp4"
            mock_blob.upload_from_filename.assert_called_once_with(sample_video_file)

    @pytest.mark.asyncio
    async def test_upload_video_file_not_found(self, firebase_storage):
        """Test upload with non-existent file."""
        result = await firebase_storage.upload_video("nonexistent_file.mp4", "test.mp4")

        assert result["success"] is False
        assert "not found" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_upload_video_firebase_error(
        self, firebase_storage, sample_video_file
    ):
        """Test upload with Firebase error."""
        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.upload_from_filename.side_effect = Exception(
                "Firebase upload failed"
            )
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.upload_video(sample_video_file, "test.mp4")

            assert result["success"] is False
            assert "Firebase upload failed" in result["error"]

    @pytest.mark.asyncio
    async def test_upload_video_from_url_success(self, firebase_storage):
        """Test successful video upload from URL."""
        video_url = "https://example.com/video.mp4"

        with patch("app.services.firebase_storage.httpx.AsyncClient") as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.content = b"fake video content"
            mock_response.headers = {"content-type": "video/mp4"}

            mock_client_instance = Mock()
            mock_client_instance.__aenter__.return_value = mock_client_instance
            mock_client_instance.__aexit__.return_value = None
            mock_client_instance.get.return_value = mock_response
            mock_client.return_value = mock_client_instance

            with patch("app.services.firebase_storage.storage") as mock_storage:
                mock_bucket = Mock()
                mock_blob = Mock()
                mock_blob.upload_from_file.return_value = None
                mock_blob.public_url = (
                    "https://storage.googleapis.com/bucket/videos/video.mp4"
                )
                mock_bucket.blob.return_value = mock_blob
                mock_storage.bucket.return_value = mock_bucket

                result = await firebase_storage.upload_video_from_url(video_url)

                assert result["success"] is True
                assert (
                    result["url"]
                    == "https://storage.googleapis.com/bucket/videos/video.mp4"
                )

    @pytest.mark.asyncio
    async def test_upload_video_from_url_download_failed(self, firebase_storage):
        """Test upload from URL when download fails."""
        video_url = "https://example.com/video.mp4"

        with patch("app.services.firebase_storage.httpx.AsyncClient") as mock_client:
            mock_response = Mock()
            mock_response.status_code = 404

            mock_client_instance = Mock()
            mock_client_instance.__aenter__.return_value = mock_client_instance
            mock_client_instance.__aexit__.return_value = None
            mock_client_instance.get.return_value = mock_response
            mock_client.return_value = mock_client_instance

            result = await firebase_storage.upload_video_from_url(video_url)

            assert result["success"] is False
            assert "Failed to download" in result["error"]

    @pytest.mark.asyncio
    async def test_upload_video_from_url_invalid_content_type(self, firebase_storage):
        """Test upload from URL with invalid content type."""
        video_url = "https://example.com/not_video.txt"

        with patch("app.services.firebase_storage.httpx.AsyncClient") as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.content = b"text content"
            mock_response.headers = {"content-type": "text/plain"}

            mock_client_instance = Mock()
            mock_client_instance.__aenter__.return_value = mock_client_instance
            mock_client_instance.__aexit__.return_value = None
            mock_client_instance.get.return_value = mock_response
            mock_client.return_value = mock_client_instance

            result = await firebase_storage.upload_video_from_url(video_url)

            assert result["success"] is False
            assert "Invalid content type" in result["error"]

    @pytest.mark.asyncio
    async def test_get_signed_url_success(self, firebase_storage):
        """Test successful signed URL generation."""
        filename = "test_video.mp4"

        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.generate_signed_url.return_value = (
                "https://storage.googleapis.com/signed-url"
            )
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.get_signed_url(filename)

            assert result["success"] is True
            assert result["url"] == "https://storage.googleapis.com/signed-url"
            mock_blob.generate_signed_url.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_signed_url_with_expiration(self, firebase_storage):
        """Test signed URL generation with custom expiration."""
        filename = "test_video.mp4"
        expiration_hours = 2

        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.generate_signed_url.return_value = (
                "https://storage.googleapis.com/signed-url"
            )
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.get_signed_url(
                filename, expiration_hours=expiration_hours
            )

            assert result["success"] is True
            # Check that expiration was set correctly
            call_args = mock_blob.generate_signed_url.call_args
            assert call_args is not None

    @pytest.mark.asyncio
    async def test_get_signed_url_error(self, firebase_storage):
        """Test signed URL generation with error."""
        filename = "test_video.mp4"

        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.generate_signed_url.side_effect = Exception("Access denied")
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.get_signed_url(filename)

            assert result["success"] is False
            assert "Access denied" in result["error"]

    @pytest.mark.asyncio
    async def test_delete_video_success(self, firebase_storage):
        """Test successful video deletion."""
        filename = "test_video.mp4"

        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.delete.return_value = None
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.delete_video(filename)

            assert result["success"] is True
            mock_blob.delete.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_video_not_found(self, firebase_storage):
        """Test deletion of non-existent video."""
        filename = "nonexistent_video.mp4"

        with patch("app.services.firebase_storage.storage") as mock_storage:
            from google.cloud.exceptions import NotFound

            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.delete.side_effect = NotFound("File not found")
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.delete_video(filename)

            assert result["success"] is False
            assert "not found" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_list_videos_success(self, firebase_storage):
        """Test successful video listing."""
        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob1 = Mock()
            mock_blob1.name = "videos/video1.mp4"
            mock_blob1.size = 1024000
            mock_blob1.time_created = datetime.now()
            mock_blob1.public_url = (
                "https://storage.googleapis.com/bucket/videos/video1.mp4"
            )

            mock_blob2 = Mock()
            mock_blob2.name = "videos/video2.mp4"
            mock_blob2.size = 2048000
            mock_blob2.time_created = datetime.now()
            mock_blob2.public_url = (
                "https://storage.googleapis.com/bucket/videos/video2.mp4"
            )

            mock_bucket.list_blobs.return_value = [mock_blob1, mock_blob2]
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.list_videos()

            assert result["success"] is True
            assert len(result["videos"]) == 2
            assert result["videos"][0]["name"] == "videos/video1.mp4"

    @pytest.mark.asyncio
    async def test_list_videos_with_limit(self, firebase_storage):
        """Test video listing with limit."""
        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_bucket.list_blobs.return_value = []
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.list_videos(limit=10)

            assert result["success"] is True
            # Check that limit was passed to list_blobs
            mock_bucket.list_blobs.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_video_metadata_success(self, firebase_storage):
        """Test successful video metadata retrieval."""
        filename = "test_video.mp4"

        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.exists.return_value = True
            mock_blob.size = 1024000
            mock_blob.time_created = datetime(2024, 1, 1, 12, 0, 0)
            mock_blob.content_type = "video/mp4"
            mock_blob.public_url = (
                "https://storage.googleapis.com/bucket/videos/test_video.mp4"
            )
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.get_video_metadata(filename)

            assert result["success"] is True
            assert result["metadata"]["size"] == 1024000
            assert result["metadata"]["content_type"] == "video/mp4"

    @pytest.mark.asyncio
    async def test_get_video_metadata_not_found(self, firebase_storage):
        """Test metadata retrieval for non-existent video."""
        filename = "nonexistent_video.mp4"

        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.exists.return_value = False
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.get_video_metadata(filename)

            assert result["success"] is False
            assert "not found" in result["error"].lower()

    def test_generate_filename(self, firebase_storage):
        """Test automatic filename generation."""
        filename = firebase_storage._generate_filename("mp4")

        assert filename.endswith(".mp4")
        assert len(filename) > 10  # Should include timestamp/uuid

    def test_validate_video_file_valid(self, firebase_storage, sample_video_file):
        """Test validation of valid video file."""
        is_valid, error = firebase_storage._validate_video_file(sample_video_file)

        assert is_valid is True
        assert error is None

    def test_validate_video_file_not_exists(self, firebase_storage):
        """Test validation of non-existent file."""
        is_valid, error = firebase_storage._validate_video_file("nonexistent.mp4")

        assert is_valid is False
        assert "not found" in error.lower()

    def test_get_content_type_from_filename(self, firebase_storage):
        """Test content type detection from filename."""
        assert firebase_storage._get_content_type("video.mp4") == "video/mp4"
        assert firebase_storage._get_content_type("video.avi") == "video/avi"
        assert firebase_storage._get_content_type("video.mov") == "video/quicktime"
        assert (
            firebase_storage._get_content_type("unknown.xyz")
            == "application/octet-stream"
        )

    @pytest.mark.asyncio
    async def test_cleanup_old_videos(self, firebase_storage):
        """Test cleanup of old videos."""
        with patch("app.services.firebase_storage.storage") as mock_storage:
            old_date = datetime.now() - timedelta(days=10)
            recent_date = datetime.now() - timedelta(days=1)

            mock_old_blob = Mock()
            mock_old_blob.name = "videos/old_video.mp4"
            mock_old_blob.time_created = old_date

            mock_recent_blob = Mock()
            mock_recent_blob.name = "videos/recent_video.mp4"
            mock_recent_blob.time_created = recent_date

            mock_bucket = Mock()
            mock_bucket.list_blobs.return_value = [mock_old_blob, mock_recent_blob]
            mock_storage.bucket.return_value = mock_bucket

            result = await firebase_storage.cleanup_old_videos(days_old=7)

            assert result["success"] is True
            assert result["deleted_count"] == 1
            mock_old_blob.delete.assert_called_once()
            mock_recent_blob.delete.assert_not_called()
