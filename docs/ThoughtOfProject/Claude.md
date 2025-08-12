Act as a senior full-stack AI engineer. You are building a multi-tenant SaaS platform called **CeaserTheAdGenius** — a professional, AI-powered creative advertising agency with a loyal, sharp, and endlessly creative dog-themed personality. Think of **Ceaser** as the ultimate brand companion: fast, reliable, intuitive, and doggedly focused on delivering top-tier ad creatives.

The platform empowers SMB marketers, digital agencies, and enterprise marketing teams to generate high-performing advertising content — including **text, image, and video creatives** — using Google’s **Gemini**, **Imagen**, and **Veo** models. It should support real-time campaign tracking, brand personalization, and intelligent creative iteration.

---

### 🦴 Brand Personality:

- **Smart like a border collie** (powerful logic orchestration)
- **Loyal like a labrador** (built for teams, trust, multi-tenancy)
- **Fast like a greyhound** (low-latency microservices)
- **Creative like a golden retriever with a paintbrush** (multi-modal generative AI)

Let subtle canine-themed touches appear in API names, UI icons, or examples (e.g., `/api/bark/v1/generate`, “Fetch Creative”, “Ceaser’s Suggestions”).

---

### 🔧 Functional Requirements:

1. **Multi-Tenant SaaS Architecture**

   - Use **Firebase Authentication** and **Firestore** for tenant-aware user management.
   - Support role-based access control and secure data isolation via Firestore rules.

2. **Creative Generation Flow**

   - Prompt-driven generation for **text, image, and video** creatives.
   - Pre-filled suggestions based on brand voice, product, audience data.
   - Handle **sync tasks** (e.g., slogan generation) and **async tasks** (e.g., video generation).

3. **Analytics & Campaign Dashboard**
   - Track KPIs: ROAS, CTR, CAC, Spend, etc.
   - Visual drill-down into campaigns, creatives, and their performance.
   - Offer A/B testing and creative variation generation.

---

### 🧠 AI Engine (Python with FastAPI)

- Built with **LangChain**, structured as a **modular, pluggable architecture**.
- Prompt strategies: `AdCopyStrategy`, `VideoScriptStrategy`, `ImageMoodBoardStrategy`.
- Use the **Factory Pattern** to switch between **Gemini**, **Imagen**, and **Veo** APIs.
- Handle:
  - **Synchronous tasks** via gRPC.
  - **Async jobs** via **RabbitMQ + Celery + Redis**.
- Store multimodal vector embeddings in **Qdrant** for semantic RAG.

---

### 🚀 Backend API Gateway (Go with Echo/Gin)

- Acts as a **RESTful entrypoint** for frontend and job coordination.
- Handles:
  - Auth/JWT flow with Firebase.
  - CRUD for campaigns and creatives.
  - RAG context retrieval from Qdrant.
  - gRPC call delegation to Python AI engine.
  - Job publishing to RabbitMQ (for video tasks).
- Uses **Redis** for caching and task status tracking.

---

### 🎨 Frontend (React + TypeScript + MUI/Material Design 3)

Follow Google’s design philosophy:

- **User-first** layout with low cognitive load.
- **Fast performance** via bundle splitting and lazy loading.
- **Clear CTAs** (“Fetch Creative,” “Run Campaign,” “Save Ad Bone” 🦴).
- **Consistent theming** via a global theme.ts file (colors, spacing, typography).
- **Responsive UX** across desktop/tablet/mobile.

#### Required Pages:

1. 🐶 **Onboarding Wizard**

   - Collect brand name, voice (e.g., "Inspirational," "Bold"), and audience.
   - Optional: connect external platforms (e.g., Ads accounts – stub only).

2. 📊 **Main Dashboard**

   - Top KPI bar: ROAS, CAC, Conversions, Spend.
   - Campaign previews, recent activity, and quick actions.

3. 🎨 **Ad Generator**

   - Prompt input with smart defaults and override options.
   - Creative type selector (Text/Image/Video).
   - Generation preview pane with actions: Save, Download, Get Variants.

4. 📈 **Campaign Analytics**
   - KPI cards, performance charts, creative performance grid, A/B test stats.

---

### 📈 KPI Visualizations

- Use **Recharts** or **Chart.js**.
- Interactive features:
  - Global date range filter.
  - Hover tooltips.
  - Campaign/creative drill-downs.
  - Sorting and filtering by performance.

---

### ⚙️ DevOps & Observability

- **Monorepo** setup with services: `/go-backend`, `/python-ai`, `/frontend`, `/proto`, `/infra`.
- **Dockerized** services with Docker Compose for local dev.
- Use **GitHub Actions** for CI/CD with:
  - Linting, static analysis, contract validation (e.g., via `buf` for `.proto`).
  - Per-service test runners.
- Deploy to **EKS (Kubernetes)** using **Helm**.
- Observability stack:
  - **OpenTelemetry** for distributed tracing.
  - **Prometheus + Grafana** for metrics.
  - **Fluentd** for logs.
  - **Istio** for service mesh, secure mTLS, and traffic control.

---

### 📁 Output Format

Generate the following in order:

1. Full folder structure for monorepo.
2. Go API Gateway: Auth + Creative Management code.
3. Python AI Engine: FastAPI with modular prompt architecture (LangChain + Strategy + Factory).
4. React (TSX) components: Dashboard, Ad Generator, Campaign Analytics, Onboarding Wizard.
5. Protobuf files for gRPC between Go and Python.
6. Dockerfiles and Kubernetes manifests (optional CI YAML).

---

### 🔐 Constraints

- Use **TypeScript** for all React code.
- Do **not** include external ad platforms (Meta, Google Ads API, etc.).
- Stick to **clean architecture** and **SOLID principles**.
- Use placeholder assets or copy for any branded dog-based UI flair (e.g., Ceaser's Avatar, empty state illustrations).

---

### 🧪 Additional Tips for Claude/Copilot Execution

- Split generation into sub-requests when needed (e.g., “Now generate the onboarding wizard in React with MUI.”).
- To kickstart in Copilot Workspace, use this as your `README.md` or `devplan.md`.
- Use `.proto` files to enforce strict inter-service contracts (gRPC).
