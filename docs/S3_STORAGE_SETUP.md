# S3 Video Storage Setup Guide

## Overview

CeaserAdvtGenius now stores all generated videos in Amazon S3 with organized folder structure for multi-tenant isolation and efficient management.

## Storage Structure

```
s3://your-bucket-name/
├── videos/                              # Configurable prefix
    ├── {tenant_name}/                   # Tenant isolation
        ├── {timestamp}-{creative_id}-{iteration}.mp4
        └── 20250812_143052-campaign-123-001.mp4
```

## Configuration

### 1. Environment Variables

Add these to your `.env` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=ceaser-advt-genius-videos
S3_VIDEO_PREFIX=videos
```

### 2. S3 Bucket Setup

1. **Create S3 Bucket**:

   ```bash
   aws s3 mb s3://ceaser-advt-genius-videos --region us-east-1
   ```

2. **Set Bucket Policy** (adjust as needed):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::YOUR-ACCOUNT:user/ceaser-video-service"
         },
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::ceaser-advt-genius-videos",
           "arn:aws:s3:::ceaser-advt-genius-videos/*"
         ]
       }
     ]
   }
   ```

3. **Enable Versioning** (recommended):
   ```bash
   aws s3api put-bucket-versioning \
     --bucket ceaser-advt-genius-videos \
     --versioning-configuration Status=Enabled
   ```

### 3. IAM User Setup

Create dedicated IAM user with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::ceaser-advt-genius-videos",
        "arn:aws:s3:::ceaser-advt-genius-videos/*"
      ]
    }
  ]
}
```

## Features

### Automatic Storage

- Videos are automatically downloaded from provider URLs
- Stored with metadata (tenant, creative_id, timestamp)
- Organized by tenant for data isolation

### Metadata Tracking

Each stored video includes:

- `tenant`: Tenant identifier
- `creative_id`: Associated creative/campaign ID
- `iteration`: Variation number
- `original_url`: Provider's original URL
- `uploaded_at`: Upload timestamp

### Security

- Presigned URLs for temporary access
- Tenant-based access control
- Configurable URL expiration

### Management

- List videos by tenant
- Delete videos when campaigns end
- Monitor storage usage and costs

## Testing

Run the S3 storage test suite:

```bash
cd services/python-ai-engine
source venv/bin/activate
python test_s3_storage.py
```

## Fallback Behavior

If S3 is not configured or unavailable:

- Video generation continues normally
- Original provider URLs are returned
- No errors or service interruption
- Warnings logged for monitoring

## Monitoring

Monitor S3 usage with CloudWatch metrics:

- `BucketSizeBytes`: Total storage used
- `NumberOfObjects`: Number of videos stored
- `DataRetrieved`: Bandwidth usage for video access

## Cost Optimization

1. **Lifecycle Policies**: Archive old videos to IA/Glacier
2. **Intelligent Tiering**: Automatic cost optimization
3. **Request Monitoring**: Track GET/PUT requests
4. **Regional Optimization**: Use regions close to users

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check IAM permissions and bucket policy
2. **NoSuchBucket**: Verify bucket name and region
3. **Credentials Error**: Check AWS access keys
4. **Large Video Uploads**: Increase timeout settings

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=DEBUG
```

Check S3 client status:

```python
from app.services.s3_storage import S3VideoStorage
storage = S3VideoStorage()
print(f"S3 Available: {storage.s3_client is not None}")
```

---

For more details, see the [Video Generation Implementation Guide](VIDEO_GENERATION_IMPLEMENTATION.md).
