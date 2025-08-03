# AdGenius Frontend - React Dashboard

A modern, responsive React dashboard for the AdGenius multi-tenant advertising platform, built with TypeScript, Material-UI, and integrated with the Go backend API.

## 🎯 Features

### ✅ Core Dashboard

- **Modern UI/UX**: Material-UI components with custom theming
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **Multi-tenant Support**: Tenant-aware interface and API calls

### ✅ Campaign Management

- **Campaign Overview**: Visual dashboard with stats and recent campaigns
- **Campaign CRUD**: Create, read, update, delete campaigns
- **Status Management**: Start, pause, and monitor campaign status
- **Budget Tracking**: Real-time budget utilization with progress indicators
- **Performance Metrics**: ROAS, CTR, and conversion tracking

### ✅ AI Creative Studio

- **Creative Gallery**: Visual grid of all creatives with previews
- **AI Generation**: Generate creatives using AI with custom prompts
- **Multi-format Support**: Images, videos, carousels, and text ads
- **Performance Analytics**: CTR, impressions, clicks, and conversions
- **Type-based Organization**: Filter and sort by creative type

### ✅ Analytics Dashboard

- **Real-time Metrics**: Live performance data and insights
- **Visual Charts**: Interactive charts and graphs (coming soon)
- **Campaign Comparison**: Multi-campaign analytics
- **Performance Trends**: Historical data analysis

### ✅ Billing & Subscription

- **Subscription Management**: Plan details and usage tracking
- **Usage Statistics**: Real-time usage monitoring
- **Invoice History**: Download and manage invoices
- **Plan Limits**: Visual representation of plan constraints

## 🏗️ Architecture

### Technology Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety throughout the application
- **Material-UI v5**: Comprehensive component library with theming
- **Zustand**: Lightweight state management
- **React Router v6**: Client-side routing
- **Axios**: HTTP client with interceptors for API communication
- **Day.js**: Date manipulation and formatting
- **Vite**: Fast build tool and development server

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main dashboard layout with sidebar
│   └── ...
├── pages/               # Page components
│   ├── DashboardPage.tsx    # Main dashboard overview
│   ├── CampaignsPage.tsx    # Campaign management
│   ├── CreativesPage.tsx    # AI creative studio
│   ├── HomePage.tsx         # Landing page
│   └── ...
├── services/            # API service layer
│   └── api.ts          # API client with interceptors
├── store/              # State management
│   └── appStore.ts     # Zustand store
├── types/              # TypeScript type definitions
│   └── api.ts          # API types and interfaces
├── theme.ts            # Material-UI theme configuration
├── ThemeProvider.tsx   # Theme context provider
└── env.d.ts           # Environment variable types
```

### State Management

- **Zustand Store**: Centralized state management with persistence
- **API Integration**: Automatic API calls with loading and error states
- **Tenant Context**: Multi-tenant awareness throughout the app
- **Theme Persistence**: User preferences saved across sessions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Go API Gateway running on localhost:8080
- Access to MongoDB and Redis (for backend)

### Installation

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment setup:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   ```bash
   VITE_API_BASE_URL=http://localhost:8080
   VITE_DEFAULT_TENANT_ID=your-tenant-id
   VITE_AUTH_TOKEN=your-auth-token
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - API Backend: http://localhost:8080

### Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🎨 UI/UX Features

### Modern Dashboard Design

- **Clean Interface**: Minimal, professional design with consistent spacing
- **Visual Hierarchy**: Clear information architecture with proper typography
- **Interactive Elements**: Hover effects, transitions, and micro-interactions
- **Data Visualization**: Charts, progress bars, and metric cards

### Responsive Layout

- **Mobile-First**: Optimized for mobile devices with touch-friendly interactions
- **Adaptive Sidebar**: Collapsible navigation that adapts to screen size
- **Flexible Grid**: Dynamic layout that adjusts to content and screen size
- **Touch Support**: Gesture-friendly interface for tablet and mobile

### Accessibility

- **ARIA Labels**: Proper accessibility attributes for screen readers
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Color Contrast**: WCAG-compliant color schemes
- **Focus Management**: Clear focus indicators and logical tab order

## 🔧 API Integration

### Service Layer

- **Axios Client**: Configured with interceptors for authentication and error handling
- **Type Safety**: Full TypeScript interfaces for all API endpoints
- **Error Handling**: Centralized error handling with user-friendly messages
- **Loading States**: Automatic loading indicators for async operations

### Multi-tenant Support

- **Tenant Context**: Automatic tenant ID injection in API headers
- **Tenant Switching**: UI for switching between tenant contexts
- **Isolated Data**: Complete data isolation per tenant
- **Tenant Branding**: Customizable branding per tenant (coming soon)

### Authentication

- **JWT Tokens**: Bearer token authentication with automatic refresh
- **Session Management**: Persistent login state across browser sessions
- **Security Headers**: Proper security headers and CSRF protection
- **Route Protection**: Protected routes with authentication guards

## 📊 Dashboard Features

### Performance Metrics

- **Real-time Stats**: Live campaign and creative performance data
- **Visual Indicators**: Color-coded status indicators and progress bars
- **Trend Analysis**: Historical performance trends and comparisons
- **Key Performance Indicators**: CTR, ROAS, conversions, and more

### Campaign Management

- **Visual Campaign Cards**: Rich campaign cards with key metrics
- **Status Management**: Easy campaign start/pause/stop controls
- **Budget Monitoring**: Real-time budget utilization tracking
- **Performance Tracking**: Campaign-level analytics and insights

### Creative Studio

- **AI-Powered Generation**: Generate creatives using AI prompts
- **Visual Preview**: Rich previews for images, videos, and carousels
- **Performance Metrics**: Creative-level performance analytics
- **Type Organization**: Filter and organize by creative type

## 🧪 Testing Strategy

### Component Testing

- **Unit Tests**: Individual component testing with Jest and React Testing Library
- **Integration Tests**: Component interaction testing
- **Visual Testing**: Screenshot testing for UI consistency
- **Accessibility Testing**: Automated accessibility validation

### API Testing

- **Mock Services**: Mock API responses for development and testing
- **Error Scenarios**: Test error handling and edge cases
- **Performance Testing**: API response time and data loading tests
- **Cross-browser Testing**: Ensure compatibility across browsers

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# Build artifacts in dist/
dist/
├── assets/          # Bundled JS/CSS with hashes
├── index.html       # Entry point
└── ...
```

### Docker Support

```dockerfile
# Multi-stage build for production
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Environment Configuration

- **Build-time Variables**: Environment variables injected at build time
- **Runtime Configuration**: Dynamic configuration for different environments
- **CDN Support**: Static asset optimization for CDN deployment
- **Caching Strategy**: Proper cache headers for performance

## 📈 Performance Optimization

### Code Splitting

- **Route-based Splitting**: Lazy loading for different pages
- **Component Splitting**: Dynamic imports for large components
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Tree Shaking**: Eliminate unused code from bundles

### Caching Strategy

- **HTTP Caching**: Proper cache headers for static assets
- **Service Worker**: Offline support and caching (coming soon)
- **Memory Management**: Efficient state management and cleanup
- **Image Optimization**: Lazy loading and responsive images

## 🔐 Security

### Frontend Security

- **XSS Protection**: Sanitized user input and output
- **CSRF Protection**: Cross-site request forgery prevention
- **Content Security Policy**: Restrictive CSP headers
- **Secure Dependencies**: Regular dependency security audits

### Data Protection

- **Input Validation**: Client-side validation with server-side verification
- **Sensitive Data**: No sensitive data stored in client-side code
- **Secure Storage**: Encrypted local storage for sensitive data
- **Session Security**: Secure session management and timeout

## 🎯 Future Enhancements

### Planned Features

- **Real-time Analytics**: WebSocket-based live data updates
- **Advanced Charts**: Interactive charts with drill-down capabilities
- **Collaborative Features**: Multi-user collaboration tools
- **Mobile App**: React Native mobile application

### Performance Improvements

- **Progressive Web App**: PWA capabilities with offline support
- **Server-Side Rendering**: SSR for improved initial load times
- **Advanced Caching**: Sophisticated caching strategies
- **Performance Monitoring**: Real-time performance tracking

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is part of the AdGenius multi-tenant SaaS platform.

---

**Built with ❤️ using React, TypeScript, and Material-UI**
