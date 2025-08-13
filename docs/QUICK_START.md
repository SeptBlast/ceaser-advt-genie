# 🚀 Quick Start Guide

Get CeaserAdvtGenius running locally in under 5 minutes!

## Prerequisites

- **Docker & Docker Compose** (recommended)
- **Go 1.21+** (for native development)
- **Python 3.11+** (for AI engine)
- **Node.js 18+** (for frontend)

## Option 1: Docker Setup (Recommended)

### 1. Clone and Start

```bash
git clone <repository-url>
cd ceaser-ad-business

# Start all services with Docker
make dev-up
```

### 2. Access Applications

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **AI Engine**: http://localhost:8081
- **Redis**: localhost:6379

### 3. Default Login

```
Email: admin@example.com
Password: admin123
```

## Option 2: Native Development

### 1. Setup Environment

```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Configure your environment variables
```

### 2. Start Backend Services

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start API Gateway
cd services/go-api-gateway
go mod download
go run cmd/main.go

# Terminal 3: Start AI Engine
cd services/python-ai-engine
pip install -r requirements.txt
python main.py
```

### 3. Start Frontend

```bash
# Terminal 4: Start React App
cd frontend
npm install
npm run dev
```

## Next Steps

1. **👥 Create Your Team**: Navigate to Team Management
2. **🎨 Generate Creative**: Try the creative generation features
3. **📊 View Analytics**: Check out the dashboard analytics
4. **⚙️ Configure Settings**: Customize your workspace

## Need Help?

- 📚 [Full Documentation](../DEVELOPER_DOCUMENTATION.md)
- 🔧 [Troubleshooting Guide](../DEVELOPER_DOCUMENTATION.md#troubleshooting)
- 💬 [Join Discord](https://discord.gg/ceaseradvt)

---

**🎉 You're ready to start building amazing AI-powered advertising campaigns!**
