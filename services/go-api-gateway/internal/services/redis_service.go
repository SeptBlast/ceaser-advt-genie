package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisService handles Redis caching operations following the multi-layered caching strategy
type RedisService struct {
	client *redis.Client
}

// CacheConfig holds Redis configuration
type CacheConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	Database int
}

// NewRedisService creates a new Redis service connection
func NewRedisService(config CacheConfig) (*RedisService, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", config.Host, config.Port),
		Username: config.Username,
		Password: config.Password,
		DB:       config.Database,
	})

	// Test the connection
	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &RedisService{client: rdb}, nil
}

// Set stores a value in Redis with TTL
func (rs *RedisService) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	jsonValue, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("error marshaling value: %w", err)
	}

	err = rs.client.Set(ctx, key, jsonValue, ttl).Err()
	if err != nil {
		return fmt.Errorf("error setting key %s: %w", key, err)
	}

	return nil
}

// Get retrieves a value from Redis
func (rs *RedisService) Get(ctx context.Context, key string, dest interface{}) error {
	val, err := rs.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("key not found: %s", key)
		}
		return fmt.Errorf("error getting key %s: %w", key, err)
	}

	err = json.Unmarshal([]byte(val), dest)
	if err != nil {
		return fmt.Errorf("error unmarshaling value: %w", err)
	}

	return nil
}

// Delete removes a key from Redis
func (rs *RedisService) Delete(ctx context.Context, key string) error {
	err := rs.client.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("error deleting key %s: %w", key, err)
	}
	return nil
}

// SetMultiple stores multiple key-value pairs
func (rs *RedisService) SetMultiple(ctx context.Context, pairs map[string]interface{}, ttl time.Duration) error {
	pipe := rs.client.Pipeline()

	for key, value := range pairs {
		jsonValue, err := json.Marshal(value)
		if err != nil {
			return fmt.Errorf("error marshaling value for key %s: %w", key, err)
		}
		pipe.Set(ctx, key, jsonValue, ttl)
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		return fmt.Errorf("error executing pipeline: %w", err)
	}

	return nil
}

// GetMultiple retrieves multiple values from Redis
func (rs *RedisService) GetMultiple(ctx context.Context, keys []string) (map[string]interface{}, error) {
	pipe := rs.client.Pipeline()

	for _, key := range keys {
		pipe.Get(ctx, key)
	}

	results, err := pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		return nil, fmt.Errorf("error executing pipeline: %w", err)
	}

	values := make(map[string]interface{})
	for i, result := range results {
		if cmd, ok := result.(*redis.StringCmd); ok {
			val, err := cmd.Result()
			if err == nil {
				var jsonValue interface{}
				if json.Unmarshal([]byte(val), &jsonValue) == nil {
					values[keys[i]] = jsonValue
				}
			}
		}
	}

	return values, nil
}

// Exists checks if a key exists in Redis
func (rs *RedisService) Exists(ctx context.Context, key string) (bool, error) {
	result, err := rs.client.Exists(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("error checking key existence %s: %w", key, err)
	}
	return result > 0, nil
}

// Increment increments a numeric value in Redis (useful for rate limiting)
func (rs *RedisService) Increment(ctx context.Context, key string, ttl time.Duration) (int64, error) {
	pipe := rs.client.Pipeline()

	incrCmd := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, ttl)

	_, err := pipe.Exec(ctx)
	if err != nil {
		return 0, fmt.Errorf("error incrementing key %s: %w", key, err)
	}

	return incrCmd.Val(), nil
}

// SetIfNotExists sets a key only if it doesn't exist (useful for distributed locks)
func (rs *RedisService) SetIfNotExists(ctx context.Context, key string, value interface{}, ttl time.Duration) (bool, error) {
	jsonValue, err := json.Marshal(value)
	if err != nil {
		return false, fmt.Errorf("error marshaling value: %w", err)
	}

	result, err := rs.client.SetNX(ctx, key, jsonValue, ttl).Result()
	if err != nil {
		return false, fmt.Errorf("error setting key %s: %w", key, err)
	}

	return result, nil
}

// GetTTL returns the time-to-live of a key
func (rs *RedisService) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	ttl, err := rs.client.TTL(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("error getting TTL for key %s: %w", key, err)
	}
	return ttl, nil
}

// FlushDB clears all keys in the current database (use with caution)
func (rs *RedisService) FlushDB(ctx context.Context) error {
	err := rs.client.FlushDB(ctx).Err()
	if err != nil {
		return fmt.Errorf("error flushing database: %w", err)
	}
	return nil
}

// Close closes the Redis connection
func (rs *RedisService) Close() error {
	return rs.client.Close()
}

// Health checks Redis connectivity
func (rs *RedisService) Health(ctx context.Context) error {
	_, err := rs.client.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("Redis health check failed: %w", err)
	}
	return nil
}

// CacheAnalyticsReport caches aggregated analytics data with tenant prefix
func (rs *RedisService) CacheAnalyticsReport(ctx context.Context, tenantID, reportType string, data interface{}, ttl time.Duration) error {
	key := fmt.Sprintf("analytics:%s:%s", tenantID, reportType)
	return rs.Set(ctx, key, data, ttl)
}

// GetAnalyticsReport retrieves cached analytics data
func (rs *RedisService) GetAnalyticsReport(ctx context.Context, tenantID, reportType string, dest interface{}) error {
	key := fmt.Sprintf("analytics:%s:%s", tenantID, reportType)
	return rs.Get(ctx, key, dest)
}

// CacheAPIResponse caches API responses for expensive queries
func (rs *RedisService) CacheAPIResponse(ctx context.Context, endpoint, queryHash string, response interface{}, ttl time.Duration) error {
	key := fmt.Sprintf("api:%s:%s", endpoint, queryHash)
	return rs.Set(ctx, key, response, ttl)
}

// GetCachedAPIResponse retrieves cached API response
func (rs *RedisService) GetCachedAPIResponse(ctx context.Context, endpoint, queryHash string, dest interface{}) error {
	key := fmt.Sprintf("api:%s:%s", endpoint, queryHash)
	return rs.Get(ctx, key, dest)
}
