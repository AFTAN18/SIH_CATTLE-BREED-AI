# Deployment Guide - Bharat Pashudhan Cattle Breed Identification

This guide provides comprehensive instructions for deploying the cattle breed identification system to various platforms.

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended - Easiest)

**Prerequisites:**
- GitHub account
- Vercel account (free)

**Steps:**
1. **Push to GitHub**
```bash
git add .
git commit -m "Initial deployment ready"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect React/Vite configuration
- Click "Deploy"

3. **Configure Environment Variables** (if needed)
```bash
# In Vercel dashboard
VITE_API_URL=https://your-api-url.com
VITE_APP_NAME=Bharat Pashudhan
VITE_APP_VERSION=1.0.0
```

4. **Custom Domain** (optional)
- Add your domain in Vercel dashboard
- Update DNS records as instructed

### 2. Netlify

**Steps:**
1. **Build locally**
```bash
npm run build
```

2. **Deploy to Netlify**
- Go to [netlify.com](https://netlify.com)
- Drag and drop the `dist` folder
- Or connect your GitHub repository

3. **Configure redirects**
Create `public/_redirects`:
```
/*    /index.html   200
```

### 3. GitHub Pages

**Steps:**
1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Add to package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/repository-name"
}
```

3. **Deploy**
```bash
npm run deploy
```

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # PWA headers
        location /manifest.json {
            add_header Cache-Control "public, max-age=3600";
            add_header Content-Type "application/manifest+json";
        }

        location /sw.js {
            add_header Cache-Control "public, max-age=0, must-revalidate";
            add_header Service-Worker-Allowed "/";
        }

        # Static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location /icons/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy (if needed)
        location /api/ {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "public, max-age=0, must-revalidate";
        }
    }
}
```

### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # Optional: Add backend service
  backend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    command: npm start
    restart: unless-stopped

  # Optional: Add database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cattle_breed_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### 4. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Platform Deployment

### AWS Amplify

1. **Connect Repository**
- Go to AWS Amplify Console
- Click "New App" > "Host web app"
- Connect your GitHub repository

2. **Configure Build Settings**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. **Deploy**
- Amplify will automatically build and deploy

### Google Cloud Run

1. **Create Dockerfile** (see Docker section above)

2. **Build and Deploy**
```bash
# Build image
docker build -t gcr.io/YOUR_PROJECT_ID/cattle-breed-app .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/cattle-breed-app

# Deploy to Cloud Run
gcloud run deploy cattle-breed-app \
  --image gcr.io/YOUR_PROJECT_ID/cattle-breed-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Static Web Apps

1. **Create Azure Static Web App**
```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist
```

2. **Or use GitHub Actions**
```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/dist"
```

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:
```env
VITE_API_URL=https://api.bharat-pashudhan.gov.in
VITE_APP_NAME=Bharat Pashudhan
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### PWA Configuration

Update `public/manifest.json`:
```json
{
  "name": "Bharat Pashudhan - Cattle Breed Identification",
  "short_name": "BPA Breed ID",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "scope": "/"
}
```

### Service Worker Configuration

Update `public/sw.js` cache settings:
```javascript
const CACHE_NAME = 'cattle-breed-identification-v1.0.0';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];
```

## 🔒 Security Configuration

### HTTPS Setup

1. **SSL Certificate**
- Use Let's Encrypt (free)
- Or purchase from certificate authority

2. **Security Headers**
```nginx
# Add to nginx.conf
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
```

### Content Security Policy

Update CSP in nginx.conf:
```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  connect-src 'self' https:;
  font-src 'self' https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
" always;
```

## 📊 Monitoring & Analytics

### Performance Monitoring

1. **Google Analytics**
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

2. **Sentry Error Tracking**
```javascript
// Add to main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### Health Checks

Create `public/health.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Health Check</title>
</head>
<body>
    <h1>OK</h1>
    <p>Service is running</p>
    <script>
        // Add any health check logic
        console.log('Health check passed');
    </script>
</body>
</html>
```

## 🚀 Post-Deployment Checklist

### ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] HTTPS certificate installed
- [ ] Security headers configured
- [ ] PWA manifest updated
- [ ] Service worker registered
- [ ] Analytics tracking enabled
- [ ] Error monitoring configured
- [ ] Performance monitoring active
- [ ] Backup strategy implemented
- [ ] Load testing completed

### ✅ Post-Launch Checklist

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify PWA installation
- [ ] Test offline functionality
- [ ] Validate analytics data
- [ ] Monitor user engagement
- [ ] Check security headers
- [ ] Verify SSL certificate
- [ ] Test on multiple devices
- [ ] Validate multi-language support

## 🔄 Continuous Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

2. **PWA Not Working**
- Check service worker registration
- Verify manifest.json
- Test on HTTPS

3. **Performance Issues**
- Enable gzip compression
- Optimize images
- Use CDN for assets

4. **CORS Errors**
- Configure CORS headers
- Check API endpoints
- Verify domain settings

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Docker Documentation](https://docs.docker.com)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Need Help?** Contact the development team at support@bharat-pashudhan.gov.in
