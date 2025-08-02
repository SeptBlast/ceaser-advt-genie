package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TenantService handles multi-tenant operations following the database-per-tenant model
type TenantService struct {
	client       *mongo.Client
	publicDB     *mongo.Database
	tenantDBs    map[string]*mongo.Database
	redisService *RedisService
}

// Tenant represents tenant metadata in the public database
type Tenant struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name             string             `bson:"name" json:"name"`
	Domain           string             `bson:"domain" json:"domain"`
	DBName           string             `bson:"db_name" json:"db_name"`
	CreatedOn        time.Time          `bson:"created_on" json:"created_on"`
	SubscriptionPlan string             `bson:"subscription_plan" json:"subscription_plan"`
	IsActive         bool               `bson:"is_active" json:"is_active"`
	Settings         TenantSettings     `bson:"settings" json:"settings"`
}

// TenantSettings holds tenant-specific configuration
type TenantSettings struct {
	Features        []string `bson:"features" json:"features"`
	AIModelsEnabled []string `bson:"ai_models_enabled" json:"ai_models_enabled"`
	StorageQuotaGB  int      `bson:"storage_quota_gb" json:"storage_quota_gb"`
	APIRateLimit    int      `bson:"api_rate_limit" json:"api_rate_limit"`
	CustomBranding  bool     `bson:"custom_branding" json:"custom_branding"`
}

// TenantUser represents users in the public database
type TenantUser struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password" json:"-"` // Never return password in JSON
	FirstName string             `bson:"first_name" json:"first_name"`
	LastName  string             `bson:"last_name" json:"last_name"`
	TenantID  primitive.ObjectID `bson:"tenant_id" json:"tenant_id"`
	Role      string             `bson:"role" json:"role"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
	IsActive  bool               `bson:"is_active" json:"is_active"`
}

// NewTenantService creates a new tenant service with database connections
func NewTenantService(client *mongo.Client, redisService *RedisService) *TenantService {
	return &TenantService{
		client:       client,
		publicDB:     client.Database("adgenius_public"),
		tenantDBs:    make(map[string]*mongo.Database),
		redisService: redisService,
	}
}

// GetTenantByDomain retrieves tenant information by domain name
func (ts *TenantService) GetTenantByDomain(ctx context.Context, domain string) (*Tenant, error) {
	// Try to get from Redis cache first
	cacheKey := fmt.Sprintf("tenant:domain:%s", domain)

	collection := ts.publicDB.Collection("tenants")

	var tenant Tenant
	err := collection.FindOne(ctx, bson.M{"domain": domain, "is_active": true}).Decode(&tenant)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("tenant not found for domain: %s", domain)
		}
		return nil, fmt.Errorf("error finding tenant: %w", err)
	}

	// Cache the result in Redis for 15 minutes
	if ts.redisService != nil {
		ts.redisService.Set(ctx, cacheKey, &tenant, 15*time.Minute)
	}

	return &tenant, nil
}

// GetTenantByID retrieves tenant information by ID
func (ts *TenantService) GetTenantByID(ctx context.Context, tenantID primitive.ObjectID) (*Tenant, error) {
	cacheKey := fmt.Sprintf("tenant:id:%s", tenantID.Hex())

	collection := ts.publicDB.Collection("tenants")

	var tenant Tenant
	err := collection.FindOne(ctx, bson.M{"_id": tenantID, "is_active": true}).Decode(&tenant)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("tenant not found for ID: %s", tenantID.Hex())
		}
		return nil, fmt.Errorf("error finding tenant: %w", err)
	}

	// Cache the result
	if ts.redisService != nil {
		ts.redisService.Set(ctx, cacheKey, &tenant, 15*time.Minute)
	}

	return &tenant, nil
}

// CreateTenant provisions a new tenant with isolated database
func (ts *TenantService) CreateTenant(ctx context.Context, tenant *Tenant) error {
	// Generate database name
	tenant.DBName = fmt.Sprintf("tenant_%s_db", generateSlug(tenant.Name))
	tenant.CreatedOn = time.Now()
	tenant.IsActive = true

	// Insert tenant metadata into public database
	collection := ts.publicDB.Collection("tenants")
	result, err := collection.InsertOne(ctx, tenant)
	if err != nil {
		return fmt.Errorf("error creating tenant: %w", err)
	}

	tenant.ID = result.InsertedID.(primitive.ObjectID)

	// Create the tenant's isolated database
	tenantDB := ts.client.Database(tenant.DBName)

	// Create initial collections with indexes
	if err := ts.initializeTenantDatabase(ctx, tenantDB); err != nil {
		// Rollback: delete tenant from public database
		ts.publicDB.Collection("tenants").DeleteOne(ctx, bson.M{"_id": tenant.ID})
		return fmt.Errorf("error initializing tenant database: %w", err)
	}

	// Cache the tenant
	if ts.redisService != nil {
		cacheKey := fmt.Sprintf("tenant:domain:%s", tenant.Domain)
		ts.redisService.Set(ctx, cacheKey, tenant, 15*time.Minute)
	}

	log.Printf("Successfully created tenant: %s with database: %s", tenant.Name, tenant.DBName)
	return nil
}

// GetTenantDatabase returns the database connection for a specific tenant
func (ts *TenantService) GetTenantDatabase(ctx context.Context, tenantID primitive.ObjectID) (*mongo.Database, error) {
	tenant, err := ts.GetTenantByID(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	// Check if we already have a connection to this tenant's database
	if db, exists := ts.tenantDBs[tenant.DBName]; exists {
		return db, nil
	}

	// Create new database connection
	tenantDB := ts.client.Database(tenant.DBName)
	ts.tenantDBs[tenant.DBName] = tenantDB

	return tenantDB, nil
}

// GetUserByEmail retrieves a user by email from the public database
func (ts *TenantService) GetUserByEmail(ctx context.Context, email string) (*TenantUser, error) {
	collection := ts.publicDB.Collection("users")

	var user TenantUser
	err := collection.FindOne(ctx, bson.M{"email": email, "is_active": true}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found: %s", email)
		}
		return nil, fmt.Errorf("error finding user: %w", err)
	}

	return &user, nil
}

// CreateUser creates a new user in the public database
func (ts *TenantService) CreateUser(ctx context.Context, user *TenantUser) error {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.IsActive = true

	collection := ts.publicDB.Collection("users")
	result, err := collection.InsertOne(ctx, user)
	if err != nil {
		return fmt.Errorf("error creating user: %w", err)
	}

	user.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// UpdateTenantSettings updates tenant-specific settings
func (ts *TenantService) UpdateTenantSettings(ctx context.Context, tenantID primitive.ObjectID, settings TenantSettings) error {
	collection := ts.publicDB.Collection("tenants")

	update := bson.M{
		"$set": bson.M{
			"settings": settings,
		},
	}

	_, err := collection.UpdateOne(ctx, bson.M{"_id": tenantID}, update)
	if err != nil {
		return fmt.Errorf("error updating tenant settings: %w", err)
	}

	// Invalidate cache
	if ts.redisService != nil {
		cacheKey := fmt.Sprintf("tenant:id:%s", tenantID.Hex())
		ts.redisService.Delete(ctx, cacheKey)
	}

	return nil
}

// ListTenants returns a paginated list of tenants (admin function)
func (ts *TenantService) ListTenants(ctx context.Context, limit, offset int64) ([]Tenant, error) {
	collection := ts.publicDB.Collection("tenants")

	cursor, err := collection.Find(ctx, bson.M{},
		options.Find().SetLimit(limit).SetSkip(offset))
	if err != nil {
		return nil, fmt.Errorf("error listing tenants: %w", err)
	}
	defer cursor.Close(ctx)

	var tenants []Tenant
	if err = cursor.All(ctx, &tenants); err != nil {
		return nil, fmt.Errorf("error decoding tenants: %w", err)
	}

	return tenants, nil
}

// initializeTenantDatabase creates the initial collections and indexes for a new tenant
func (ts *TenantService) initializeTenantDatabase(ctx context.Context, db *mongo.Database) error {
	collections := []string{"campaigns", "creatives", "analytics_performance", "brand_assets"}

	for _, collName := range collections {
		// Create collection by inserting a dummy document and then removing it
		coll := db.Collection(collName)
		_, err := coll.InsertOne(ctx, bson.M{"_temp": true})
		if err != nil {
			return fmt.Errorf("error creating collection %s: %w", collName, err)
		}
		coll.DeleteOne(ctx, bson.M{"_temp": true})

		// Create indexes based on collection type
		switch collName {
		case "campaigns":
			_, err = coll.Indexes().CreateOne(ctx, mongo.IndexModel{
				Keys: bson.D{{Key: "user_id", Value: 1}},
			})
		case "creatives":
			_, err = coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
				{Keys: bson.D{{Key: "campaign_id", Value: 1}}},
				{Keys: bson.D{{Key: "status", Value: 1}}},
				{Keys: bson.D{{Key: "created_at", Value: -1}}},
			})
		case "analytics_performance":
			_, err = coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
				{Keys: bson.D{{Key: "creative_id", Value: 1}}},
				{Keys: bson.D{{Key: "date", Value: -1}}},
				{Keys: bson.D{{Key: "platform", Value: 1}}},
			})
		}

		if err != nil {
			return fmt.Errorf("error creating indexes for %s: %w", collName, err)
		}
	}

	log.Printf("Successfully initialized tenant database: %s", db.Name())
	return nil
}

// generateSlug creates a URL-friendly string from tenant name
func generateSlug(name string) string {
	// Simple slug generation - in production, use a proper slug library
	slug := ""
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			slug += string(r)
		} else if r == ' ' || r == '-' || r == '_' {
			slug += "_"
		}
	}
	return slug
}
