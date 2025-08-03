package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/database"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/grpc"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/handlers"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logrus.Warn("No .env file found, using environment variables")
	}

	// Initialize logger
	logrus.SetFormatter(&logrus.JSONFormatter{})
	logrus.SetLevel(logrus.InfoLevel)

	// Initialize Firestore connection
	firestoreClient, err := database.NewFirestoreClient()
	if err != nil {
		logrus.Fatal("Failed to connect to Firestore: ", err)
	}
	defer firestoreClient.Close()

	// TODO: Initialize Redis when services are ready
	// redisConfig := services.CacheConfig{
	// 	Host:     getEnv("REDIS_HOST", "localhost"),
	// 	Port:     getEnv("REDIS_PORT", "6379"),
	// 	Username: getEnv("REDIS_USERNAME", ""),
	// 	Password: getEnv("REDIS_PASSWORD", ""),
	// 	Database: 0,
	// }
	//
	// redisService, err := services.NewRedisService(redisConfig)
	// if err != nil {
	// 	logrus.Fatal("Failed to connect to Redis: ", err)
	// }

	// Initialize gRPC client for AI Engine
	aiEngineClient, err := grpc.NewAIEngineClient()
	if err != nil {
		logrus.Fatal("Failed to connect to AI Engine: ", err)
	}
	defer aiEngineClient.Close()

	// TODO: Initialize new services when handlers are ready
	// tenantService := services.NewTenantService(mongoClient.Client, redisService)
	// billingService := services.NewBillingService(mongoClient.Database, redisService)
	// analyticsService := services.NewAnalyticsService(mongoClient.Database, redisService)
	// adGenerationService := services.NewAdGenerationService(mongoClient.Database, redisService, aiEngineClient)

	// Initialize Gin router
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Add middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(otelgin.Middleware("ceaser-ad-business-api"))

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	router.Use(func(ctx *gin.Context) {
		c.HandlerFunc(ctx.Writer, ctx.Request)
		ctx.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "ceaser-ad-business-api",
			"timestamp": time.Now().UTC(),
		})
	})

	// Initialize handlers with Firestore
	campaignHandler := handlers.NewFirestoreCampaignHandler(firestoreClient, aiEngineClient)
	creativeHandler := handlers.NewFirestoreCreativeHandler(firestoreClient)
	analyticsHandler := handlers.NewFirestoreAnalyticsHandler(firestoreClient)

	// API routes
	api := router.Group("/api/v1")
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
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		logrus.Infof("Starting server on port %s", port)
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

// getEnv returns the environment variable value or the default value if not set
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
