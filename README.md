# 🐄 Cattle Breed Identification PWA

A comprehensive mobile-first Progressive Web App for cattle and buffalo breed identification using AI/ML technology. Built for field workers, veterinarians, and livestock professionals in India.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Breed Identification**: Advanced ML model for accurate breed detection
- **Multi-Language Support**: Hindi, English, and regional languages
- **Offline-First Design**: Works without internet connection
- **Real-time Sync**: Automatic data synchronization when online
- **High-Contrast UI**: Optimized for outdoor visibility

### 📱 Mobile-First Design
- **Progressive Web App**: Installable on mobile devices
- **Touch-Optimized**: Large touch targets (48px minimum)
- **Camera Integration**: Real-time camera capture with guides
- **Responsive Design**: Works on all screen sizes

### 🔍 Advanced Features
- **Multiple Capture Angles**: Side, front, and rear views
- **Breed Comparison**: Visual comparison with key features
- **Expert Review System**: Professional verification workflow
- **Data Analytics**: Performance tracking and insights
- **Achievement System**: Gamification for engagement

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React Query for server state
- **Routing**: React Router for navigation
- **UI Components**: Radix UI with custom styling

### Backend (Node.js + Express)
- **Runtime**: Node.js 18+ with ES modules
- **Framework**: Express.js with middleware stack
- **Database**: PostgreSQL with PostGIS extension
- **Cache**: Redis for session and data caching
- **Queue**: Bull for background job processing
- **Real-time**: Socket.IO for live updates

### ML/AI Service
- **Framework**: TensorFlow.js with Python FastAPI
- **Model**: MobileNetV2 transfer learning
- **Dataset**: Indian cattle/buffalo breeds
- **Optimization**: TensorFlow Lite for mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ with PostGIS
- Redis 6+
- Python 3.8+ (for ML service)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure environment variables
# Edit .env file with your settings

# Initialize database
npm run db:migrate

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

### Database Setup
```sql
-- Create database
CREATE DATABASE cattle_breed_db;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Environment Configuration
Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=cattle_breed_db
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 📊 Database Schema

### Core Tables
- **users**: Field workers, experts, and administrators
- **breeds**: Cattle and buffalo breed information
- **animals**: Registered livestock with details
- **identification_logs**: AI prediction history
- **offline_queue**: Pending sync operations
- **expert_reviews**: Professional verification records

### Key Features
- **PostGIS Integration**: Geographic data support
- **JSONB Fields**: Flexible data storage
- **Indexing**: Optimized query performance
- **Constraints**: Data integrity enforcement

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### Breed Identification
- `POST /api/identify/breed` - AI breed identification
- `GET /api/breeds/:species` - Get breed list
- `GET /api/breeds/:id` - Get breed details

### Animal Management
- `POST /api/animals/register` - Register new animal
- `GET /api/animals/:id` - Get animal details
- `PUT /api/animals/:id` - Update animal
- `GET /api/animals/user/:userId` - User's animals

### Sync & Offline
- `POST /api/sync/batch` - Batch sync offline data
- `GET /api/sync/status` - Sync status
- `POST /api/sync/retry` - Retry failed syncs

### Dashboard
- `GET /api/dashboard/stats/:userId` - User statistics
- `GET /api/dashboard/recent/:userId` - Recent activity
- `GET /api/dashboard/analytics` - Performance analytics

## 🎨 Design System

### Color Palette
- **Primary**: Forest Green (#22c55e) - Trust and nature
- **Secondary**: Warm Earth (#f59e0b) - Agricultural theme
- **Accent**: Golden Yellow (#eab308) - Highlights
- **Success**: Green (#16a34a) - Positive actions
- **Warning**: Orange (#ea580c) - Corrections
- **Error**: Red (#dc2626) - Destructive actions

### Typography
- **Primary Font**: Inter - Clean and readable
- **Headings**: Poppins - Modern and professional
- **Sizes**: Responsive scale from 12px to 48px
- **Weights**: 300, 400, 500, 600, 700, 800

### Components
- **Cards**: Elevated with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with validation states
- **Navigation**: Bottom navigation for mobile
- **Modals**: Backdrop blur with smooth animations

## 📱 PWA Features

### Installation
- **Manifest**: Web app manifest for installation
- **Service Worker**: Offline functionality
- **Cache Strategy**: Network-first with fallback
- **Background Sync**: Queue offline actions

### Performance
- **Bundle Size**: < 2MB initial load
- **Lazy Loading**: Code splitting for routes
- **Image Optimization**: WebP with fallbacks
- **Caching**: Aggressive caching strategy

## 🔒 Security

### Authentication
- **JWT Tokens**: Secure token-based auth
- **Refresh Tokens**: Automatic token renewal
- **Session Management**: Redis-backed sessions
- **Rate Limiting**: Request throttling

### Data Protection
- **Input Validation**: Comprehensive validation
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CORS**: Configured for security

## 🧪 Testing

### Frontend Testing
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Backend Testing
```bash
# Run API tests
npm test

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

## 📈 Monitoring & Analytics

### Performance Monitoring
- **APM**: Application performance monitoring
- **Error Tracking**: Sentry integration
- **Logging**: Structured logging with Winston
- **Metrics**: Custom business metrics

### Analytics
- **User Behavior**: Usage patterns and flows
- **Performance**: Core Web Vitals tracking
- **Business Metrics**: Registration rates, accuracy
- **Error Rates**: System health monitoring

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
# Configure environment variables
# Set up custom domain
```

### Backend Deployment
```bash
# Docker build
docker build -t cattle-breed-api .

# Docker run
docker run -p 3000:3000 cattle-breed-api

# Environment variables
# Database connection
# Redis configuration
# SSL certificates
```

### Infrastructure
- **Database**: PostgreSQL with PostGIS
- **Cache**: Redis cluster
- **Storage**: AWS S3 for images
- **CDN**: CloudFront for static assets
- **Load Balancer**: Application load balancer

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review process
6. Merge to main branch

### Code Standards
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Indian Council of Agricultural Research** for breed data
- **TensorFlow.js** team for ML framework
- **Open source community** for tools and libraries
- **Field workers** for feedback and testing

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@cattleid.com

---

**Built with ❤️ for Indian Agriculture**
