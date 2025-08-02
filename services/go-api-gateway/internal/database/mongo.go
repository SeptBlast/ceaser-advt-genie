package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoClient struct {
	Client   *mongo.Client
	Database *mongo.Database
}

func NewMongoClient() (*MongoClient, error) {
	// Build connection string
	host := os.Getenv("MONGO_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("MONGO_PORT")
	if port == "" {
		port = "27017"
	}

	username := os.Getenv("MONGO_USERNAME")
	password := os.Getenv("MONGO_PASSWORD")
	authSource := os.Getenv("MONGO_AUTH_SOURCE")
	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "adgenius_public"
	}

	var uri string
	if username != "" && password != "" {
		if authSource == "" {
			authSource = "admin"
		}
		// Atlas connection
		if host != "localhost" && host != "127.0.0.1" {
			uri = fmt.Sprintf("mongodb+srv://%s:%s@%s/%s?retryWrites=true&w=majority&authSource=%s",
				username, password, host, dbName, authSource)
		} else {
			// Local connection with auth
			uri = fmt.Sprintf("mongodb://%s:%s@%s:%s/%s?authSource=%s",
				username, password, host, port, dbName, authSource)
		}
	} else {
		// Local connection without auth
		uri = fmt.Sprintf("mongodb://%s:%s/%s", host, port, dbName)
	}

	logrus.Infof("Connecting to MongoDB at %s:%s", host, port)

	// Set client options
	clientOptions := options.Client().ApplyURI(uri)
	clientOptions.SetMaxPoolSize(100)
	clientOptions.SetMinPoolSize(10)
	clientOptions.SetMaxConnIdleTime(30 * time.Second)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Ping the database
	if err = client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	database := client.Database(dbName)
	logrus.Infof("Successfully connected to MongoDB database: %s", dbName)

	return &MongoClient{
		Client:   client,
		Database: database,
	}, nil
}

func (mc *MongoClient) Disconnect(ctx context.Context) error {
	if mc.Client != nil {
		return mc.Client.Disconnect(ctx)
	}
	return nil
}

// Collection helpers
func (mc *MongoClient) CampaignsCollection() *mongo.Collection {
	return mc.Database.Collection("campaigns")
}

func (mc *MongoClient) CreativesCollection() *mongo.Collection {
	return mc.Database.Collection("creatives")
}

func (mc *MongoClient) TemplatesCollection() *mongo.Collection {
	return mc.Database.Collection("templates")
}

func (mc *MongoClient) GenerationJobsCollection() *mongo.Collection {
	return mc.Database.Collection("generation_jobs")
}

func (mc *MongoClient) AnalyticsCollection() *mongo.Collection {
	return mc.Database.Collection("analytics")
}
