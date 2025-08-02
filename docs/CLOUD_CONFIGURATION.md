# Cloud Configuration Guide

This guide explains how to configure the Ceaser Ad Business polyglot architecture to use cloud services instead of local databases.

## 🔴 Redis Cloud Configuration

### 1. Redis Cloud Setup

1. **Create Redis Cloud Account**

   - Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
   - Sign up for a free account (30MB free tier available)

2. **Create a Database**

   - Click "New Database"
   - Choose your cloud provider (AWS, Azure, GCP)
   - Select region closest to your deployment
   - Choose subscription plan (Free tier is sufficient for development)

3. **Get Connection Details**
   - After database creation, go to "Database" tab
   - Note down the following:
     - **Endpoint**: `redis-xxxxx.c1.us-east-1-2.ec2.cloud.redislabs.com`
     - **Port**: Usually `10691` or similar
     - **Password**: Auto-generated password

### 2. Configure Redis Cloud in Services

Update your environment files with Redis Cloud credentials:

#### For Python AI Engine (`services/python-ai-engine/.env`):

```bash
# Redis Configuration (Redis Cloud)
REDIS_URL=redis://[USERNAME]:[PASSWORD]@[ENDPOINT]:[PORT]

# Example with username and password:
# REDIS_URL=redis://default:CRxqRlrx7wB6srqs1cFfBE6lM3X7ISS4@redis-11552.c301.ap-south-1-1.ec2.redns.redis-cloud.com:11552

# Alternative format (some Redis Cloud instances):
# REDIS_URL=redis://default:abc123xyz@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:10691
```

#### For Go API Gateway (`services/go-api-gateway/.env`):

```bash
# Redis Configuration (Redis Cloud)
REDIS_URL=redis://[USERNAME]:[PASSWORD]@[ENDPOINT]:[PORT]

# Example with username and password:
# REDIS_URL=redis://default:CRxqRlrx7wB6srqs1cFfBE6lM3X7ISS4@redis-11552.c301.ap-south-1-1.ec2.redns.redis-cloud.com:11552
```

### 3. Redis Cloud Security Settings

1. **IP Allowlist** (if enabled):

   - Add your deployment server's IP
   - For Docker development: Add `0.0.0.0/0` (development only)
   - For production: Add specific server IPs

2. **SSL/TLS**:
   - Redis Cloud provides SSL by default
   - Use `rediss://` (with 's') for SSL connections:
   ```bash
   REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT]:[PORT]
   ```

## 🍃 MongoDB Atlas Configuration

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free (512MB free tier available)

2. **Create a Cluster**

   - Choose "Build a Database"
   - Select "Shared" for free tier
   - Choose cloud provider and region
   - Create cluster (takes 3-5 minutes)

3. **Database Access**

   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Create username and password
   - Assign "Atlas admin" role (or custom role)

4. **Network Access**
   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - For development: Add `0.0.0.0/0` (allows all IPs)
   - For production: Add specific server IPs

### 2. Get Connection String

1. **Get Connection Details**

   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Select "Go" driver version 1.13 or later
   - Copy the connection string

2. **Parse Connection String**
   From a connection string like:

   ```
   mongodb+srv://developer:A3n3l43wMtVCUn8m@ceaser-ad-gini.jokuuab.mongodb.net/?retryWrites=true&w=majority
   ```

   Extract:

   - **Host**: `ceaser-ad-gini.jokuuab.mongodb.net`
   - **Username**: `developer`
   - **Password**: `A3n3l43wMtVCUn8m`
   - **Database**: `ceaser-advt-genie` (create this in Atlas)

### 3. MongoDB Atlas Configuration in Services

Your current configuration looks correct! The services are already configured for MongoDB Atlas:

#### For Both Services:

```bash
# MongoDB Configuration (MongoDB Atlas)
MONGO_HOST=ceaser-ad-gini.jokuuab.mongodb.net
MONGO_PORT=27017
MONGO_DB_NAME=ceaser-advt-genie
MONGO_USERNAME=developer
MONGO_PASSWORD=A3n3l43wMtVCUn8m
MONGO_AUTH_SOURCE=admin
```

### 4. Create Database and Collections

1. **Create Database**:

   - In MongoDB Atlas console, go to "Browse Collections"
   - Click "Create Database"
   - Database name: `ceaser-advt-genie`
   - Collection name: `campaigns` (initial collection)

2. **Required Collections**:
   The services will auto-create these collections, but you can pre-create them:
   - `campaigns`
   - `creatives`
   - `generation_jobs`
   - `templates`
   - `analytics`

## 🚀 Updated Docker Compose

The `docker-compose.polyglot.yml` has been updated to remove local Redis and MongoDB services. Key changes:

1. **Removed Services**:

   - `redis` service (using Redis Cloud)
   - `mongodb` service (using MongoDB Atlas)

2. **Updated Dependencies**:

   - AI Engine no longer depends on local Redis
   - Services connect directly to cloud providers

3. **Environment Variables**:
   - Redis URLs now expect cloud connection strings
   - MongoDB configuration points to Atlas

## 🔧 Development Workflow

### 1. Configure Environment

1. **Copy Example Environment Files**:

   ```bash
   cp services/go-api-gateway/.env.example services/go-api-gateway/.env
   cp services/python-ai-engine/.env.example services/python-ai-engine/.env
   ```

2. **Update Redis Cloud URLs**:

   ```bash
   # Edit both .env files
   nano services/go-api-gateway/.env
   nano services/python-ai-engine/.env

   # Add your Redis Cloud URL:
   REDIS_URL=redis://default:your-password@your-endpoint:port
   ```

3. **Verify MongoDB Atlas**:
   - Your MongoDB Atlas configuration is already set
   - Ensure the cluster is running and accessible

### 2. Test Connections

```bash
# Test Redis Cloud connection
redis-cli -h your-endpoint -p your-port -a your-password ping

# Test MongoDB Atlas connection
mongosh "mongodb+srv://developer:A3n3l43wMtVCUn8m@ceaser-ad-gini.jokuuab.mongodb.net/ceaser-advt-genie"
```

### 3. Start Services

```bash
# Start the polyglot architecture
make start

# Check service health
make health

# View logs
make logs
```

## 🔒 Security Best Practices

### Redis Cloud Security

1. **Use Strong Passwords**: Auto-generated passwords are recommended
2. **Enable IP Allowlist**: Restrict access to known IPs
3. **Use SSL/TLS**: Always use `rediss://` in production
4. **Regular Key Rotation**: Rotate passwords periodically

### MongoDB Atlas Security

1. **Database User Roles**: Use least-privilege principle
2. **IP Allowlist**: Restrict to known IP addresses
3. **Connection String Security**: Keep credentials in environment variables
4. **Enable Auditing**: Monitor database access in production

## 🚨 Troubleshooting

### Redis Cloud Issues

1. **Connection Timeouts**:

   ```bash
   # Test connectivity
   telnet your-redis-endpoint your-port
   ```

2. **Authentication Errors**:

   ```bash
   # Verify credentials
   redis-cli -h endpoint -p port -a password ping
   ```

3. **SSL Certificate Issues**:
   ```bash
   # For SSL connections, ensure proper certificate handling
   REDIS_URL=rediss://default:password@endpoint:port
   ```

### MongoDB Atlas Issues

1. **IP Allowlist**:

   - Ensure your deployment IP is allowlisted
   - Check current IP: `curl ifconfig.me`

2. **Database User Permissions**:

   - Verify user has read/write access to database
   - Check user roles in Atlas console

3. **Connection String**:
   ```bash
   # Test connection
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/database"
   ```

## 💰 Cost Optimization

### Redis Cloud

- **Free Tier**: 30MB storage, suitable for development
- **Paid Plans**: Start at $5/month for production workloads
- **Optimization**: Use appropriate eviction policies, monitor memory usage

### MongoDB Atlas

- **Free Tier**: 512MB storage, suitable for development
- **Paid Plans**: Start at $9/month for production workloads
- **Optimization**: Create appropriate indexes, monitor query performance

## 📊 Monitoring Cloud Services

### Redis Cloud Monitoring

1. **Redis Cloud Console**:

   - View real-time metrics
   - Monitor memory usage
   - Track connection counts

2. **Application Monitoring**:
   ```bash
   # Check Redis connection in logs
   docker-compose -f docker-compose.polyglot.yml logs ai-engine | grep redis
   ```

### MongoDB Atlas Monitoring

1. **Atlas Console**:

   - Real-time performance advisor
   - Query profiler
   - Connection monitoring

2. **Application Monitoring**:
   ```bash
   # Check MongoDB connection in logs
   docker-compose -f docker-compose.polyglot.yml logs api-gateway | grep mongo
   ```

---

This configuration enables your polyglot architecture to leverage cloud-native databases for better scalability, reliability, and global availability. 🌟
