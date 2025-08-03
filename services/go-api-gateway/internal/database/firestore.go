package database

import (
	"context"
	"fmt"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"github.com/sirupsen/logrus"
	"google.golang.org/api/option"
)

type FirestoreClient struct {
	Client     *firestore.Client
	ProjectID  string
	Collection CollectionRefs
}

type CollectionRefs struct {
	Campaigns      *firestore.CollectionRef
	Creatives      *firestore.CollectionRef
	Templates      *firestore.CollectionRef
	GenerationJobs *firestore.CollectionRef
	Analytics      *firestore.CollectionRef
	UserProfiles   *firestore.CollectionRef
}

// NewFirebaseApp creates a new Firebase app instance
func NewFirebaseApp(projectID string) (*firebase.App, error) {
	ctx := context.Background()

	var app *firebase.App
	var err error

	// Check if we're running with a service account key file
	serviceAccountPath := os.Getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
	if serviceAccountPath != "" {
		// Production: use service account key file
		opt := option.WithCredentialsFile(serviceAccountPath)
		config := &firebase.Config{ProjectID: projectID}
		app, err = firebase.NewApp(ctx, config, opt)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize Firebase app with service account: %w", err)
		}
		logrus.Infof("Firebase app initialized with service account for project: %s", projectID)
	} else {
		// Development: check for emulator
		emulatorHost := os.Getenv("FIRESTORE_EMULATOR_HOST")
		if emulatorHost != "" {
			logrus.Infof("Using Firestore emulator at: %s", emulatorHost)
		}

		// Initialize with default credentials (Application Default Credentials)
		config := &firebase.Config{ProjectID: projectID}
		app, err = firebase.NewApp(ctx, config)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
		}
		logrus.Infof("Firebase app initialized with default credentials for project: %s", projectID)
	}

	return app, nil
}

func NewFirestoreClient() (*FirestoreClient, error) {
	ctx := context.Background()

	// Get Firebase project configuration
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	if projectID == "" {
		return nil, fmt.Errorf("FIREBASE_PROJECT_ID environment variable is required")
	}

	// Initialize Firebase app
	app, err := NewFirebaseApp(projectID)
	if err != nil {
		return nil, err
	}

	// Get Firestore client
	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create Firestore client: %w", err)
	}

	// Initialize collection references
	collections := CollectionRefs{
		Campaigns:      client.Collection("campaigns"),
		Creatives:      client.Collection("creatives"),
		Templates:      client.Collection("templates"),
		GenerationJobs: client.Collection("generation_jobs"),
		Analytics:      client.Collection("analytics"),
		UserProfiles:   client.Collection("user_profiles"),
	}

	logrus.Info("Successfully connected to Firestore")

	return &FirestoreClient{
		Client:     client,
		ProjectID:  projectID,
		Collection: collections,
	}, nil
}

func (fc *FirestoreClient) Close() error {
	if fc.Client != nil {
		return fc.Client.Close()
	}
	return nil
}

// Helper methods for collection access
func (fc *FirestoreClient) CampaignsCollection() *firestore.CollectionRef {
	return fc.Collection.Campaigns
}

func (fc *FirestoreClient) CreativesCollection() *firestore.CollectionRef {
	return fc.Collection.Creatives
}

func (fc *FirestoreClient) TemplatesCollection() *firestore.CollectionRef {
	return fc.Collection.Templates
}

func (fc *FirestoreClient) GenerationJobsCollection() *firestore.CollectionRef {
	return fc.Collection.GenerationJobs
}

func (fc *FirestoreClient) AnalyticsCollection() *firestore.CollectionRef {
	return fc.Collection.Analytics
}

func (fc *FirestoreClient) UserProfilesCollection() *firestore.CollectionRef {
	return fc.Collection.UserProfiles
}

// Utility functions for Firestore operations
func (fc *FirestoreClient) NewDocumentID() string {
	return fc.Collection.Campaigns.NewDoc().ID
}

// Batch operations helper
func (fc *FirestoreClient) NewBatch() *firestore.WriteBatch {
	return fc.Client.Batch()
}

// Transaction helper
func (fc *FirestoreClient) RunTransaction(ctx context.Context, fn func(context.Context, *firestore.Transaction) error) error {
	return fc.Client.RunTransaction(ctx, fn)
}
