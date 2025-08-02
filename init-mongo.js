// MongoDB initialization script
db = db.getSiblingDB('adgenius_public');

// Create collections with initial indexes
db.campaigns.createIndex({ "tenant_id": 1, "is_active": 1 });
db.campaigns.createIndex({ "created_at": -1 });
db.campaigns.createIndex({ "name": "text", "description": "text" });

db.creatives.createIndex({ "campaign_id": 1 });
db.creatives.createIndex({ "created_at": -1 });
db.creatives.createIndex({ "status": 1 });

db.generation_jobs.createIndex({ "campaign_id": 1, "status": 1 });
db.generation_jobs.createIndex({ "created_at": -1 });

print("MongoDB initialized with collections and indexes");
