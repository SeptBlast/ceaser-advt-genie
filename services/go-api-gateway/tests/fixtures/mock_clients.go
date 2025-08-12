package fixtures

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// MockFirestoreClient mocks Firestore database client
type MockFirestoreClient struct {
	mock.Mock
}

func (m *MockFirestoreClient) Collection(name string) *MockCollection {
	args := m.Called(name)
	return args.Get(0).(*MockCollection)
}

func (m *MockFirestoreClient) Close() error {
	args := m.Called()
	return args.Error(0)
}

// MockCollection mocks Firestore collection
type MockCollection struct {
	mock.Mock
}

func (m *MockCollection) Doc(id string) *MockDocumentRef {
	args := m.Called(id)
	return args.Get(0).(*MockDocumentRef)
}

func (m *MockCollection) Add(ctx context.Context, data interface{}) (*MockDocumentRef, error) {
	args := m.Called(ctx, data)
	return args.Get(0).(*MockDocumentRef), args.Error(1)
}

func (m *MockCollection) Where(field, op string, value interface{}) *MockQuery {
	args := m.Called(field, op, value)
	return args.Get(0).(*MockQuery)
}

func (m *MockCollection) Documents(ctx context.Context) *MockDocumentIterator {
	args := m.Called(ctx)
	return args.Get(0).(*MockDocumentIterator)
}

// MockDocumentRef mocks Firestore document reference
type MockDocumentRef struct {
	mock.Mock
}

func (m *MockDocumentRef) Get(ctx context.Context) (*MockDocumentSnapshot, error) {
	args := m.Called(ctx)
	return args.Get(0).(*MockDocumentSnapshot), args.Error(1)
}

func (m *MockDocumentRef) Set(ctx context.Context, data interface{}) error {
	args := m.Called(ctx, data)
	return args.Error(0)
}

func (m *MockDocumentRef) Update(ctx context.Context, updates []map[string]interface{}) error {
	args := m.Called(ctx, updates)
	return args.Error(0)
}

func (m *MockDocumentRef) Delete(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

// MockDocumentSnapshot mocks Firestore document snapshot
type MockDocumentSnapshot struct {
	mock.Mock
	data map[string]interface{}
}

func (m *MockDocumentSnapshot) Exists() bool {
	args := m.Called()
	return args.Bool(0)
}

func (m *MockDocumentSnapshot) DataTo(v interface{}) error {
	args := m.Called(v)
	return args.Error(0)
}

func (m *MockDocumentSnapshot) Data() map[string]interface{} {
	return m.data
}

// MockQuery mocks Firestore query
type MockQuery struct {
	mock.Mock
}

func (m *MockQuery) Limit(limit int) *MockQuery {
	args := m.Called(limit)
	return args.Get(0).(*MockQuery)
}

func (m *MockQuery) OrderBy(field string, direction interface{}) *MockQuery {
	args := m.Called(field, direction)
	return args.Get(0).(*MockQuery)
}

func (m *MockQuery) Documents(ctx context.Context) *MockDocumentIterator {
	args := m.Called(ctx)
	return args.Get(0).(*MockDocumentIterator)
}

// MockDocumentIterator mocks Firestore document iterator
type MockDocumentIterator struct {
	mock.Mock
	documents []*MockDocumentSnapshot
	index     int
}

func (m *MockDocumentIterator) Next() (*MockDocumentSnapshot, error) {
	if m.index >= len(m.documents) {
		return nil, mongo.ErrNoDocuments
	}
	doc := m.documents[m.index]
	m.index++
	return doc, nil
}

func (m *MockDocumentIterator) Stop() {
	// Cleanup if needed
}

// MockRedisClient mocks Redis client
type MockRedisClient struct {
	mock.Mock
	data map[string]string
}

func NewMockRedisClient() *MockRedisClient {
	return &MockRedisClient{
		data: make(map[string]string),
	}
}

func (m *MockRedisClient) Set(ctx context.Context, key string, value interface{}, expiration interface{}) error {
	args := m.Called(ctx, key, value, expiration)
	if args.Error(0) == nil {
		m.data[key] = value.(string)
	}
	return args.Error(0)
}

func (m *MockRedisClient) Get(ctx context.Context, key string) (string, error) {
	args := m.Called(ctx, key)
	if args.Error(1) == nil {
		if val, exists := m.data[key]; exists {
			return val, nil
		}
	}
	return args.String(0), args.Error(1)
}

func (m *MockRedisClient) Del(ctx context.Context, keys ...string) error {
	args := m.Called(ctx, keys)
	if args.Error(0) == nil {
		for _, key := range keys {
			delete(m.data, key)
		}
	}
	return args.Error(0)
}

func (m *MockRedisClient) Exists(ctx context.Context, keys ...string) (int64, error) {
	args := m.Called(ctx, keys)
	if args.Error(1) == nil {
		count := int64(0)
		for _, key := range keys {
			if _, exists := m.data[key]; exists {
				count++
			}
		}
		return count, nil
	}
	return args.Get(0).(int64), args.Error(1)
}

// MockAIEngineClient mocks gRPC AI Engine client
type MockAIEngineClient struct {
	mock.Mock
}

func (m *MockAIEngineClient) GenerateCreative(ctx context.Context, req interface{}) (interface{}, error) {
	args := m.Called(ctx, req)
	return args.Get(0), args.Error(1)
}

func (m *MockAIEngineClient) AnalyzeContent(ctx context.Context, req interface{}) (interface{}, error) {
	args := m.Called(ctx, req)
	return args.Get(0), args.Error(1)
}

func (m *MockAIEngineClient) ExecuteWorkflow(ctx context.Context, req interface{}) (interface{}, error) {
	args := m.Called(ctx, req)
	return args.Get(0), args.Error(1)
}

func (m *MockAIEngineClient) Close() error {
	args := m.Called()
	return args.Error(0)
}

// MockFirebaseAuth mocks Firebase Auth client
type MockFirebaseAuth struct {
	mock.Mock
}

func (m *MockFirebaseAuth) VerifyIDToken(ctx context.Context, idToken string) (interface{}, error) {
	args := m.Called(ctx, idToken)
	return args.Get(0), args.Error(1)
}

func (m *MockFirebaseAuth) GetUser(ctx context.Context, uid string) (interface{}, error) {
	args := m.Called(ctx, uid)
	return args.Get(0), args.Error(1)
}

func (m *MockFirebaseAuth) SetCustomUserClaims(ctx context.Context, uid string, claims map[string]interface{}) error {
	args := m.Called(ctx, uid, claims)
	return args.Error(0)
}

// TestHelpers contains utility functions for testing
type TestHelpers struct{}

// SetupTestGin sets up a Gin router in test mode
func (h *TestHelpers) SetupTestGin() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	return router
}

// CreateTestContext creates a test context with recorder
func (h *TestHelpers) CreateTestContext(method, url string, body interface{}) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(method, url, nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = req

	return c, w
}

// SetAuthContext sets authentication context for testing
func (h *TestHelpers) SetAuthContext(c *gin.Context, userID, tenantID string) {
	c.Set("user_id", userID)
	c.Set("tenant_id", tenantID)
	c.Set("user_role", "user")
}

// AssertJSONResponse asserts that the response contains expected JSON
func (h *TestHelpers) AssertJSONResponse(t *testing.T, w *httptest.ResponseRecorder, expectedStatus int, expectedBody map[string]interface{}) {
	if w.Code != expectedStatus {
		t.Errorf("Expected status %d, got %d", expectedStatus, w.Code)
	}

	// Additional JSON body assertions can be added here
	if w.Header().Get("Content-Type") != "application/json; charset=utf-8" {
		t.Errorf("Expected JSON content type, got %s", w.Header().Get("Content-Type"))
	}
}

// GenerateObjectID generates a new MongoDB ObjectID for testing
func (h *TestHelpers) GenerateObjectID() primitive.ObjectID {
	return primitive.NewObjectID()
}

// CreateMockDocument creates a mock document with given data
func (h *TestHelpers) CreateMockDocument(data map[string]interface{}) *MockDocumentSnapshot {
	doc := &MockDocumentSnapshot{data: data}
	doc.On("Exists").Return(true)
	doc.On("DataTo", mock.Anything).Return(nil)
	return doc
}

// CreateMockCollection creates a mock collection with predefined behavior
func (h *TestHelpers) CreateMockCollection() *MockCollection {
	collection := &MockCollection{}
	return collection
}

// SetupMockDatabase sets up a complete mock database with collections
func (h *TestHelpers) SetupMockDatabase() *MockFirestoreClient {
	client := &MockFirestoreClient{}

	// Set up default collection mocks
	for _, collectionName := range DatabaseCollections() {
		collection := h.CreateMockCollection()
		client.On("Collection", collectionName).Return(collection)
	}

	return client
}

// MockHTTPClient mocks HTTP client for external API calls
type MockHTTPClient struct {
	mock.Mock
}

func (m *MockHTTPClient) Do(req *http.Request) (*http.Response, error) {
	args := m.Called(req)
	return args.Get(0).(*http.Response), args.Error(1)
}

// CreateMockHTTPResponse creates a mock HTTP response
func CreateMockHTTPResponse(status int, body string, headers map[string]string) *http.Response {
	recorder := httptest.NewRecorder()
	recorder.WriteHeader(status)
	recorder.WriteString(body)

	response := recorder.Result()

	// Add custom headers
	for key, value := range headers {
		response.Header.Set(key, value)
	}

	return response
}

// TestDatabase provides utilities for test database management
type TestDatabase struct {
	collections map[string][]bson.M
}

func NewTestDatabase() *TestDatabase {
	return &TestDatabase{
		collections: make(map[string][]bson.M),
	}
}

func (db *TestDatabase) InsertTestData(collection string, data []bson.M) {
	db.collections[collection] = data
}

func (db *TestDatabase) GetTestData(collection string) []bson.M {
	return db.collections[collection]
}

func (db *TestDatabase) ClearCollection(collection string) {
	delete(db.collections, collection)
}

func (db *TestDatabase) ClearAll() {
	db.collections = make(map[string][]bson.M)
}

// Helper function to create standard test data
func CreateStandardTestData() *TestDatabase {
	db := NewTestDatabase()

	// Insert sample users
	users := []bson.M{
		{
			"_id":       primitive.NewObjectID(),
			"email":     "test@example.com",
			"name":      "Test User",
			"tenant_id": primitive.NewObjectID(),
		},
	}
	db.InsertTestData("users", users)

	// Insert sample campaigns
	campaigns := []bson.M{
		{
			"_id":         primitive.NewObjectID(),
			"user_id":     users[0]["_id"],
			"name":        "Test Campaign",
			"description": "A test campaign",
			"status":      "active",
		},
	}
	db.InsertTestData("campaigns", campaigns)

	return db
}
