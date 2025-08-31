# Cattle Breed Identification App - Deployment Guide

## Issues Fixed ✅

1. **JSON Syntax Error**: Fixed missing comma in `src/locales/en.json`
2. **CSS Import Order**: Moved Google Fonts import before Tailwind directives in `src/index.css`
3. **Missing Database File**: Created `backend/database/init.sql` with proper schema
4. **Missing Nginx Config**: Created `nginx-proxy.conf` for reverse proxy
5. **Dependency Issues**: Fixed problematic package versions in backend
6. **Missing Dependencies**: Installed all required npm packages

## Prerequisites

### Option 1: Docker Deployment (Recommended)
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### Option 2: Local Development
- Node.js 18+ 
- npm or yarn
- PostgreSQL with PostGIS extension
- Redis

## Quick Start with Docker

### 1. Build and Run (Simplified Version)
```bash
# Use the simplified docker-compose file
docker compose -f docker-compose.simple.yml up --build
```

### 2. Access the Application
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Database: localhost:5432
- Redis: localhost:6379

## Local Development Setup

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start development server
npm run dev
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Start development server
npm run dev
```

### 3. Database Setup
```bash
# Install PostgreSQL with PostGIS
# Run the initialization script
psql -U postgres -d cattle_breed_db -f backend/database/init.sql
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cattle_breed_db
DB_USER=postgres
DB_PASSWORD=password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

## Production Deployment

### 1. Docker Production
```bash
# Build production images
docker compose -f docker-compose.simple.yml build

# Run in detached mode
docker compose -f docker-compose.simple.yml up -d

# View logs
docker compose -f docker-compose.simple.yml logs -f
```

### 2. Manual Production Setup
```bash
# Frontend
npm run build
# Serve dist/ folder with nginx or similar

# Backend
cd backend
npm install --production
NODE_ENV=production npm start
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   # Kill the process or change ports in docker-compose
   ```

2. **Database Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   docker compose -f docker-compose.simple.yml logs postgres
   ```

3. **Build Failures**
   ```bash
   # Clear Docker cache
   docker system prune -a
   # Rebuild
   docker compose -f docker-compose.simple.yml build --no-cache
   ```

4. **Permission Issues (Linux/Mac)**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Health Checks

```bash
# Check if services are running
docker compose -f docker-compose.simple.yml ps

# Test frontend
curl http://localhost:80

# Test backend
curl http://localhost:3000/health

# Test database
docker exec -it cattle-breed-till-phase-2-postgres-1 psql -U postgres -d cattle_breed_db -c "SELECT version();"
```

## File Structure

```
cattle-breed-till-phase-2/
├── src/                    # Frontend React app
├── backend/               # Node.js API
│   ├── src/              # Backend source code
│   ├── database/         # Database scripts
│   └── package.json      # Backend dependencies
├── docker-compose.yml    # Full deployment (with ML services)
├── docker-compose.simple.yml  # Simplified deployment
├── Dockerfile           # Frontend Docker image
├── nginx.conf          # Nginx configuration
└── nginx-proxy.conf    # Reverse proxy configuration
```

## Services Overview

### Frontend (Port 80)
- React PWA with Vite
- Tailwind CSS + Shadcn/ui
- Camera integration
- Offline support

### Backend (Port 3000)
- Express.js API
- JWT authentication
- File upload handling
- Database operations

### Database (Port 5432)
- PostgreSQL with PostGIS
- Cattle profiles and identification results
- User management

### Redis (Port 6379)
- Session storage
- Caching
- Job queues

## Security Notes

⚠️ **Important**: Change default passwords and secrets in production!

- Database password: `password`
- JWT secret: `your-super-secret-jwt-key-change-in-production`
- Admin user: `admin@cattlebreed.com` / `admin123`

## Next Steps

1. **Add ML Service**: Implement the missing ML service for breed identification
2. **SSL/HTTPS**: Configure SSL certificates for production
3. **Monitoring**: Add Prometheus and Grafana for monitoring
4. **Backup**: Set up automated database backups
5. **CI/CD**: Configure automated deployment pipeline

## Support

If you encounter issues:
1. Check the logs: `docker compose -f docker-compose.simple.yml logs`
2. Verify all services are running: `docker compose -f docker-compose.simple.yml ps`
3. Check environment variables are set correctly
4. Ensure ports are not already in use

## Quick Commands Reference

```bash
# Start everything
docker compose -f docker-compose.simple.yml up --build

# Stop everything
docker compose -f docker-compose.simple.yml down

# View logs
docker compose -f docker-compose.simple.yml logs -f

# Rebuild specific service
docker compose -f docker-compose.simple.yml build frontend

# Access database
docker exec -it cattle-breed-till-phase-2-postgres-1 psql -U postgres -d cattle_breed_db

# Clean up everything
docker compose -f docker-compose.simple.yml down -v
docker system prune -a
```
