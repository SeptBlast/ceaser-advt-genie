package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// TenantMiddleware extracts and validates tenant information from requests
func TenantMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Try to get tenant ID from header first
		tenantID := c.GetHeader("X-Tenant-ID")

		// If not in header, try to get from subdomain
		if tenantID == "" {
			host := c.GetHeader("Host")
			if host != "" {
				parts := strings.Split(host, ".")
				if len(parts) > 2 && parts[0] != "www" && parts[0] != "api" {
					tenantID = parts[0]
				}
			}
		}

		// If still not found, try to get from query parameter
		if tenantID == "" {
			tenantID = c.Query("tenant_id")
		}

		// For now, we'll allow requests without tenant ID to pass through
		// In production, you might want to return an error for missing tenant ID
		// based on your multi-tenancy requirements
		if tenantID != "" {
			c.Set("tenant_id", tenantID)
		}

		c.Next()
	})
}

// RequireTenant middleware ensures that a tenant ID is present
func RequireTenant() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		tenantID, exists := c.Get("tenant_id")
		if !exists || tenantID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Tenant ID is required",
				"code":  "MISSING_TENANT_ID",
			})
			c.Abort()
			return
		}

		c.Next()
	})
}

// CORS middleware for handling cross-origin requests
func CORS() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Allow specific origins or all origins (configure as needed)
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			"http://localhost:4173",
			"https://app.adgenius.com",
		}

		isAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				isAllowed = true
				break
			}
		}

		// Always set CORS headers for proper handling
		if isAllowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else if origin == "" {
			// For requests without origin (like direct API calls), allow all
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		} else {
			// For disallowed origins, still set headers but deny the origin
			c.Writer.Header().Set("Access-Control-Allow-Origin", "null")
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, X-Tenant-ID, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
}

// AuthMiddleware for JWT token validation (placeholder implementation)
func AuthMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
				"code":  "MISSING_AUTH_HEADER",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>" format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization header format",
				"code":  "INVALID_AUTH_FORMAT",
			})
			c.Abort()
			return
		}

		token := parts[1]

		// TODO: Implement actual JWT validation here
		// For now, we'll just check for a placeholder token
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
				"code":  "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		// Set user context (in production, extract from valid JWT)
		c.Set("user_id", "placeholder-user-id")
		c.Set("user_role", "admin")

		c.Next()
	})
}

// RateLimitMiddleware for basic rate limiting (placeholder implementation)
func RateLimitMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// TODO: Implement actual rate limiting here
		// This could use Redis for distributed rate limiting

		c.Next()
	})
}
