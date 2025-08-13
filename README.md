# 🐕 CeaserAdvtGenius - AI-Powered Advertising Platform

> **Professional-grade, multi-tenant SaaS platform leveraging polyglot microservices architecture to deliver AI-powered advertising creative generation and analytics.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.21+-blue.svg)](https://golang.org/dl/)
[![Python Version](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React Version](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd ceaser-ad-business

# Start development environment
make dev-up

# Access the application
# Frontend: http://localhost:5173
# API Gateway: http://localhost:8080
# AI Engine: http://localhost:8081
```

## 🏗️ Architecture Overview

CeaserAdvtGenius uses a modern polyglot microservices architecture:

- **🎨 Frontend**: React + TypeScript with Material-UI
- **🚪 API Gateway**: Go-based REST API with gRPC communication
- **🤖 AI Engine**: Python service with LangChain & OpenAI/Gemini
- **🔥 Database**: Firebase Firestore with multi-tenant isolation
- **📦 Storage**: Firebase Storage for media assets
- **🔄 Queue**: Redis + Celery for async processing

## 📚 Documentation

| Document                                                       | Description                             |
| -------------------------------------------------------------- | --------------------------------------- |
| [🚀 Quick Start Guide](docs/QUICK_START.md)                    | Get up and running in 5 minutes         |
| [👨‍💻 Developer Guide](DEVELOPER_DOCUMENTATION.md)               | Comprehensive development documentation |
| [🏗️ Technical Design](docs/TECHNICAL_DESIGN_DOCUMENT.md)       | Architecture and system design          |
| [🔌 API Documentation](docs/API_DOCUMENTATION.md)              | REST API and gRPC specifications        |
| [👥 Team Management](docs/TEAM_MANAGEMENT_IMPLEMENTATION.md)   | RBAC and team management system         |
| [🎬 Video Generation](docs/VIDEO_GENERATION_IMPLEMENTATION.md) | AI video generation capabilities        |
| [🧪 Testing Guide](services/TESTING_DOCUMENTATION.md)          | Testing strategies and frameworks       |

## 🚦 Project Status

✅ **Core Features Complete** | 🔄 **Video Generation In Progress** | ⏳ **Enterprise Features Planned**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🐕 "Leading the pack in AI-powered advertising" 🐕**
