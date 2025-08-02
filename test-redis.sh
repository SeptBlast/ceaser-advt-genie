#!/bin/bash

# Redis Cloud Connection Test Script
# Tests Redis Cloud connectivity using Python from Docker

echo "🔴 Testing Redis Cloud Connection"
echo "================================"

REDIS_URL="redis://default:CRxqRlrx7wB6srqs1cFfBE6lM3X7ISS4@redis-11552.c301.ap-south-1-1.ec2.redns.redis-cloud.com:11552"

echo "Testing Redis Cloud connection..."
echo "URL: $REDIS_URL"
echo

# Test using Python redis library in a temporary container
docker run --rm python:3.13-slim bash -c "
pip install redis > /dev/null 2>&1
python3 -c \"
import redis
import sys

redis_url = '$REDIS_URL'
print('Connecting to Redis Cloud...')

try:
    r = redis.from_url(redis_url)
    
    # Test basic connectivity
    response = r.ping()
    print(f'✅ PING: {response}')
    
    # Test set/get operations
    r.set('test_key', 'Hello from Ceaser Ad Business!')
    value = r.get('test_key').decode('utf-8')
    print(f'✅ SET/GET: {value}')
    
    # Test Redis info
    info = r.info('server')
    print(f'✅ Redis Server Version: {info.get(\"redis_version\", \"Unknown\")}')
    
    # Clean up
    r.delete('test_key')
    print('✅ Connection test successful!')
    
except redis.ConnectionError as e:
    print(f'❌ Connection failed: {e}')
    sys.exit(1)
except redis.AuthenticationError as e:
    print(f'❌ Authentication failed: {e}')
    sys.exit(1)
except Exception as e:
    print(f'❌ Error: {e}')
    sys.exit(1)
\"
"

echo
echo "If the test passed, your Redis Cloud configuration is working correctly!"
echo "You can now start your polyglot services with: make start"
