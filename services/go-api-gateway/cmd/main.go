package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/database"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/grpc"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/handlers"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/middleware"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logrus.Warn("No .env file found, using environment variables")
	}

	// Initialize logger
	logrus.SetFormatter(&logrus.JSONFormatter{})
	logLevel := getEnv("LOG_LEVEL", "info")
	switch logLevel {
	case "debug":
		logrus.SetLevel(logrus.DebugLevel)
	case "warn":
		logrus.SetLevel(logrus.WarnLevel)
	case "error":
		logrus.SetLevel(logrus.ErrorLevel)
	default:
		logrus.SetLevel(logrus.InfoLevel)
	}

	// Initialize Firebase Firestore connection
	firestoreClient, err := database.NewFirestoreClient()
	if err != nil {
		logrus.Fatal("Failed to connect to Firestore: ", err)
	}
	defer firestoreClient.Close()

	// Initialize Firebase Auth client for token verification
	authClient, err := initFirebaseAuth(firestoreClient.ProjectID)
	if err != nil {
		logrus.Fatal("Failed to initialize Firebase Auth: ", err)
	}

	// Initialize gRPC client for AI Engine
	aiEngineClient, err := grpc.NewAIEngineClient()
	if err != nil {
		logrus.Fatal("Failed to connect to AI Engine: ", err)
	}
	defer aiEngineClient.Close()

	// Initialize Gin router
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Add middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(otelgin.Middleware("ceaser-ad-business-api"))
	router.Use(middleware.CORS()) // Use our custom CORS middleware

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "ceaser-ad-business-api",
			"database":  "firestore",
			"auth":      "firebase",
			"timestamp": time.Now().UTC(),
		})
	})

	// Initialize Firebase Auth middleware
	authMiddleware := middleware.NewFirebaseAuthMiddleware(authClient)

	// Initialize handlers with Firestore
	campaignHandler := handlers.NewFirestoreCampaignHandler(firestoreClient, aiEngineClient)
	creativeHandler := handlers.NewFirestoreCreativeHandler(firestoreClient)
	analyticsHandler := handlers.NewFirestoreAnalyticsHandler(firestoreClient)

	// Public API routes (no authentication required)
	public := router.Group("/api/v1/public")
	{
		public.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":   "healthy",
				"database": "firestore",
				"auth":     "firebase",
			})
		})
	}

	// Protected API routes (Firebase authentication required)
	api := router.Group("/api/v1")
	api.Use(authMiddleware.RequireAuth())
	api.Use(authMiddleware.RequireEmailVerified()) // Require verified email
	{
		// Campaign routes
		campaigns := api.Group("/campaigns")
		{
			campaigns.GET("/", campaignHandler.ListCampaigns)
			campaigns.POST("/", campaignHandler.CreateCampaign)
			campaigns.GET("/:id", campaignHandler.GetCampaign)
			campaigns.PUT("/:id", campaignHandler.UpdateCampaign)
			campaigns.DELETE("/:id", campaignHandler.DeleteCampaign)
		}

		// Creative routes
		creatives := api.Group("/creatives")
		{
			creatives.GET("/", creativeHandler.GetCreatives)
			creatives.POST("/", creativeHandler.CreateCreative)
			creatives.GET("/:id", creativeHandler.GetCreative)
			creatives.PUT("/:id", creativeHandler.UpdateCreative)
			creatives.DELETE("/:id", creativeHandler.DeleteCreative)
			creatives.POST("/:id/generate", creativeHandler.GenerateCreative)
			creatives.GET("/:id/performance", creativeHandler.GetCreativePerformance)
		}

		// Analytics routes
		analytics := api.Group("/analytics")
		{
			analytics.POST("/events", analyticsHandler.RecordEvent)
			analytics.GET("/campaigns/:campaign_id", analyticsHandler.GetCampaignAnalytics)
			analytics.GET("/creatives/:creative_id", analyticsHandler.GetCreativeAnalytics)
			analytics.GET("/dashboard", analyticsHandler.GetDashboardAnalytics)
			analytics.GET("/reports", analyticsHandler.GetAnalyticsReport)
		}

		// Agent workflow routes (TODO: Update for Firestore)
		/*
			agent := api.Group("/agent")
			{
				agent.POST("/workflow", handlers.ExecuteAgentWorkflow(aiEngineClient))
				agent.POST("/analyze", handlers.AnalyzeCampaignWithAgent(aiEngineClient))
			}
		*/
	}

	// Start server
	port := getEnv("PORT", "8080")

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		logrus.WithFields(logrus.Fields{
			"port":     port,
			"database": "firestore",
			"auth":     "firebase",
		}).Info("Starting server")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatal("Failed to start server: ", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logrus.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logrus.Fatal("Server forced to shutdown: ", err)
	}

	logrus.Info("Server exited")
}

// initFirebaseAuth initializes Firebase Auth client
func initFirebaseAuth(projectID string) (*auth.Client, error) {
	ctx := context.Background()

	// Create a new Firebase app specifically for Auth
	app, err := database.NewFirebaseApp(projectID)
	if err != nil {
		return nil, err
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	logrus.Info("Firebase Auth client initialized successfully")
	return authClient, nil
}

// getEnv retrieves environment variable or returns default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
