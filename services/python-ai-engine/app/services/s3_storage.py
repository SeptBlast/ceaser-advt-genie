import os
import tempfile
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse

import boto3
import httpx
import structlog
from botocore.exceptions import ClientError, NoCredentialsError

logger = structlog.get_logger()


class S3VideoStorage:
    """
    Service for storing generated videos in S3 with organized folder structure.
    
    Storage structure: s3://bucket/{tenant_name}/{timestamp}-{creative_id}-{iteration}
    """

    def __init__(self):
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "ceaser-advt-genius-videos")
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.prefix = os.getenv("S3_VIDEO_PREFIX", "videos")
        
        # Initialize S3 client
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=self.region
            )
            # Test connection
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info("S3 client initialized successfully", bucket=self.bucket_name)
        except NoCredentialsError:
            logger.warning("AWS credentials not found, S3 storage disabled")
            self.s3_client = None
        except ClientError as e:
            logger.warning("S3 bucket access failed, S3 storage disabled", 
                         bucket=self.bucket_name, error=str(e))
            self.s3_client = None
        except Exception as e:
            logger.warning("S3 initialization failed, S3 storage disabled", error=str(e))
            self.s3_client = None

    def _generate_s3_key(self, tenant_name: str, creative_id: str, iteration: int = 1) -> str:
        """
        Generate S3 key following the pattern: 
        {prefix}/{tenant_name}/{timestamp}-{creative_id}-{iteration}.mp4
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}-{creative_id}-{iteration:03d}.mp4"
        return f"{self.prefix}/{tenant_name}/{filename}"

    async def download_and_store_video(
        self, 
        video_url: str, 
        tenant_name: str, 
        creative_id: str,
        iteration: int = 1,
        content_type: str = "video/mp4"
    ) -> Optional[str]:
        """
        Download video from provider URL and store in S3.
        
        Args:
            video_url: URL of the generated video from provider
            tenant_name: Tenant identifier for folder organization
            creative_id: Creative ID for file naming
            iteration: Iteration number for multiple variations
            content_type: MIME type of the video
            
        Returns:
            S3 URL of stored video or None if storage failed
        """
        if not self.s3_client:
            logger.warning("S3 client not available, skipping video storage")
            return None
            
        if not video_url or "example" in video_url:
            logger.info("Mock video URL detected, skipping S3 storage", url=video_url)
            return None

        try:
            # Generate S3 key
            s3_key = self._generate_s3_key(tenant_name, creative_id, iteration)
            
            # Download video from provider
            async with httpx.AsyncClient(timeout=300.0) as client:  # 5 min timeout for large videos
                logger.info("Downloading video from provider", url=video_url)
                response = await client.get(video_url, follow_redirects=True)
                response.raise_for_status()
                
                video_data = response.content
                if len(video_data) == 0:
                    logger.error("Downloaded video is empty", url=video_url)
                    return None
                
                logger.info("Video downloaded successfully", 
                          size_mb=len(video_data) / (1024 * 1024))

            # Upload to S3
            logger.info("Uploading video to S3", s3_key=s3_key, bucket=self.bucket_name)
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=video_data,
                ContentType=content_type,
                Metadata={
                    'tenant': tenant_name,
                    'creative_id': creative_id,
                    'iteration': str(iteration),
                    'original_url': video_url,
                    'uploaded_at': datetime.utcnow().isoformat()
                }
            )
            
            # Generate S3 URL
            s3_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
            
            logger.info("Video stored successfully in S3", 
                       s3_url=s3_url, 
                       size_mb=len(video_data) / (1024 * 1024))
            
            return s3_url
            
        except httpx.HTTPError as e:
            logger.error("Failed to download video from provider", 
                        url=video_url, error=str(e))
            return None
        except ClientError as e:
            logger.error("Failed to upload video to S3", 
                        s3_key=s3_key, error=str(e))
            return None
        except Exception as e:
            logger.error("Unexpected error during video storage", 
                        url=video_url, error=str(e))
            return None

    def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for private video access.
        
        Args:
            s3_key: S3 key of the video
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            Presigned URL or None if generation failed
        """
        if not self.s3_client:
            return None
            
        try:
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return presigned_url
        except ClientError as e:
            logger.error("Failed to generate presigned URL", s3_key=s3_key, error=str(e))
            return None

    def delete_video(self, s3_key: str) -> bool:
        """
        Delete video from S3.
        
        Args:
            s3_key: S3 key of the video to delete
            
        Returns:
            True if deletion successful, False otherwise
        """
        if not self.s3_client:
            return False
            
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info("Video deleted from S3", s3_key=s3_key)
            return True
        except ClientError as e:
            logger.error("Failed to delete video from S3", s3_key=s3_key, error=str(e))
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
        if not self.s3_client:
            return []
            
        try:
            prefix = f"{self.prefix}/{tenant_name}/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=limit
            )
            
            videos = []
            for obj in response.get('Contents', []):
                # Get object metadata
                try:
                    metadata_response = self.s3_client.head_object(
                        Bucket=self.bucket_name,
                        Key=obj['Key']
                    )
                    metadata = metadata_response.get('Metadata', {})
                    
                    videos.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'creative_id': metadata.get('creative_id'),
                        'iteration': metadata.get('iteration'),
                        'original_url': metadata.get('original_url'),
                        'uploaded_at': metadata.get('uploaded_at')
                    })
                except ClientError:
                    # Skip if metadata can't be retrieved
                    continue
                    
            return videos
            
        except ClientError as e:
            logger.error("Failed to list tenant videos", 
                        tenant=tenant_name, error=str(e))
            return []
