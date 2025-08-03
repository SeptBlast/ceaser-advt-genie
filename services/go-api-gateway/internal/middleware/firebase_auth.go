package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/models"
)

type FirebaseAuthMiddleware struct {
	authClient *auth.Client
}

func NewFirebaseAuthMiddleware(authClient *auth.Client) *FirebaseAuthMiddleware {
	return &FirebaseAuthMiddleware{
		authClient: authClient,
	}
}

// RequireAuth middleware validates Firebase ID tokens and sets user context
func (m *FirebaseAuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "Invalid authorization header format. Expected: Bearer <token>",
			})
			c.Abort()
			return
		}

		idToken := tokenParts[1]

		// Verify the ID token
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		token, err := m.authClient.VerifyIDToken(ctx, idToken)
		if err != nil {
			logrus.WithError(err).Warn("Failed to verify Firebase ID token")
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user information in context
		c.Set("user_id", token.UID)
		c.Set("email", token.Claims["email"])
		c.Set("email_verified", token.Claims["email_verified"])
		c.Set("firebase_token", token)

		// Log successful authentication
		logrus.WithFields(logrus.Fields{
			"user_id": token.UID,
			"email":   token.Claims["email"],
		}).Debug("User authenticated successfully")

		c.Next()
	}
}

// OptionalAuth middleware validates Firebase ID tokens if present but doesn't require them
func (m *FirebaseAuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		// Extract token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		idToken := tokenParts[1]

		// Verify the ID token
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		token, err := m.authClient.VerifyIDToken(ctx, idToken)
		if err != nil {
			logrus.WithError(err).Debug("Failed to verify Firebase ID token in optional auth")
			c.Next()
			return
		}

		// Set user information in context
		c.Set("user_id", token.UID)
		c.Set("email", token.Claims["email"])
		c.Set("email_verified", token.Claims["email_verified"])
		c.Set("firebase_token", token)

		c.Next()
	}
}

// RequireEmailVerified middleware ensures the user's email is verified
func (m *FirebaseAuthMiddleware) RequireEmailVerified() gin.HandlerFunc {
	return func(c *gin.Context) {
		emailVerified, exists := c.Get("email_verified")
		if !exists {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "Authentication required",
			})
			c.Abort()
			return
		}

		if verified, ok := emailVerified.(bool); !ok || !verified {
			c.JSON(http.StatusForbidden, models.APIResponse{
				Success: false,
				Error:   "Email verification required",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetUserFromContext is a helper function to extract user information from context
func GetUserFromContext(c *gin.Context) (userID string, email string, ok bool) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		return "", "", false
	}

	emailValue, _ := c.Get("email")

	userID, userOk := userIDValue.(string)
	email, _ = emailValue.(string)

	return userID, email, userOk
}
