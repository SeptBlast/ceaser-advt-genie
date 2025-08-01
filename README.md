# AdGenius - AI-Powered Advertising Platform

A professional-grade, multi-tenant SaaS platform that leverages Google's Generative AI stack to create high-performance advertising creatives on demand.

## 🚀 Features

- **AI-Powered Content Generation**: Text, image, and video creation using Google Gemini, Imagen, and Veo models
- **Multi-Tenant Architecture**: Secure data isolation with database-per-tenant model
- **Performance Analytics**: Comprehensive tracking and optimization insights
- **Material Design 3**: Modern, accessible UI with React and MUI
- **Enterprise-Ready**: Built with scalability, security, and reliability in mind

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14, React 18, Material-UI (MUI), TypeScript
- **Backend**: Django 4.2, Django REST Framework, Python 3.11
- **Database**: MongoDB (multi-tenant), Redis (caching), Qdrant (vector search)
- **AI Services**: Google Vertex AI (Gemini, Imagen, Veo)
- **Message Queue**: RabbitMQ + Celery
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Django        │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │   (REST API)    │    │   (Multi-tenant)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Google Cloud  │
                    │   Vertex AI     │
                    │   (Gemini/etc)  │
                    └─────────────────┘
```

## 🛠️ Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Google Cloud account with Vertex AI enabled

### Environment Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd ceaser-ad-business
   ```

2. **Set up environment variables**:

   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Configure Google Cloud**:
   - Create a Google Cloud project
   - Enable Vertex AI API
   - Create a service account with Vertex AI permissions
   - Download the service account key JSON file
   - Update the Google Cloud configuration in environment files

### Development with Docker

1. **Start all services**:

   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**:

   ```bash
   docker-compose exec backend python manage.py migrate
   ```

3. **Create a superuser**:

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin
   - API Documentation: http://localhost:8000/api/docs

### Local Development

#### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Create virtual environment**:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install pip-tools
   pip-compile requirements.in
   pip install -r requirements.txt
   ```

4. **Run migrations**:

   ```bash
   python manage.py migrate
   ```

5. **Start development server**:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

The API is documented using OpenAPI 3.0 specification. Access the interactive documentation at:

- **ReDoc**: http://localhost:8000/api/docs/
- **Schema**: http://localhost:8000/api/schema/

### Key Endpoints

- **Authentication**: `/api/v1/auth/`
- **Tenants**: `/api/v1/tenants/`
- **Ad Generation**: `/api/v1/ad-generation/`
- **Analytics**: `/api/v1/analytics/`
- **Billing**: `/api/v1/billing/`

## 🏢 Multi-Tenant Architecture

### Database Strategy

- **Public Database**: Shared tenant metadata, user accounts, system configuration
- **Tenant Databases**: Isolated data per tenant (tenant\_<slug>\_db)
- **Vector Database**: Shared embeddings with tenant-based filtering

### Tenant Identification

- **Subdomain**: `acme.adgenius.com`
- **Custom Domain**: `advertising.acme.com`
- **Header**: `X-Tenant-Slug: acme`

## 🤖 AI Integration

### Supported Models

- **Text Generation**: Google Gemini 1.5 Pro
- **Image Generation**: Google Imagen 3
- **Video Generation**: Google Veo

### Generation Pipeline

1. User submits prompt with parameters
2. Request queued via Celery
3. Background worker calls Vertex AI
4. Generated content stored with metadata
5. Real-time updates via WebSocket (future)

## 📊 Analytics & Monitoring

### Metrics Tracked

- Generation usage and limits
- Creative performance (CTR, conversions)
- User engagement and retention
- System performance and errors

### Observability

- **Logging**: Structured JSON logs
- **Metrics**: Prometheus-compatible
- **Tracing**: OpenTelemetry support
- **Health Checks**: Built-in endpoints

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Multi-factor authentication support
- Session management

### Data Protection

- Tenant data isolation
- Encryption at rest and in transit
- GDPR compliance ready
- Audit logging

## 🚀 Deployment

### Production Deployment

1. **Kubernetes**: See `k8s/` directory for manifests
2. **Environment Variables**: Configure production settings
3. **SSL/TLS**: Enable HTTPS with valid certificates
4. **Monitoring**: Set up logging and metrics collection

### Scaling Considerations

- **Horizontal Scaling**: Multiple backend replicas
- **Database Scaling**: MongoDB sharding
- **Caching**: Redis cluster
- **CDN**: Static asset distribution

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- **Backend**: Black, isort, flake8
- **Frontend**: Prettier, ESLint
- **Commits**: Conventional Commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Discord**: [Community Server](#)
- **Email**: support@adgenius.com

## 🗺️ Roadmap

### Phase 1 (Current)

- ✅ Core architecture and multi-tenancy
- ✅ Basic AI generation (text, image)
- ✅ User management and authentication
- 🚧 Analytics dashboard

### Phase 2 (Q2 2024)

- 📋 Video generation integration
- 📋 Advanced campaign management
- 📋 A/B testing framework
- 📋 Billing and subscriptions

### Phase 3 (Q3 2024)

- 📋 Real-time collaboration
- 📋 API for third-party integrations
- 📋 Advanced analytics and insights
- 📋 Mobile application

---

Built with ❤️ by the AdGenius Team
