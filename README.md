# Bharat Pashudhan - Cattle Breed Identification System

A comprehensive, AI-powered cattle and buffalo breed identification system for Indian Field Level Workers (FLWs) as part of the Bharat Pashudhan App ecosystem.

## 🚀 Features

### Core Functionality
- **AI-Powered Breed Identification**: TensorFlow.js integration with 90% accuracy for 43 breeds
- **Real-Time Camera System**: High-quality image capture with positioning guides
- **Multi-Language Support**: 12 Indian languages with RTL support for Urdu
- **Offline Functionality**: PWA with IndexedDB storage and background sync
- **Comprehensive Analytics**: Real-time progress tracking and performance metrics
- **Photo Database**: Reference photos with comparison tools
- **Learning Resources**: Interactive tutorials and breed guides

### Supported Breeds (43 Total)

**Cattle Breeds (30):**
Gir, Sahiwal, Red Sindhi, Tharparkar, Hariana, Ongole, Kankrej, Rathi, Krishna Valley, Amritmahal, Hallikar, Khillari, Dangi, Deoni, Nimari, Malvi, Nagori, Mewati, Gangatiri, Punganur, Vechur, Kasargod, Bargur, Pulikulam, Umblachery, Jersey Cross, Holstein Friesian Cross, Sahiwal Cross, Gir Cross, Indigenous Cross

**Buffalo Breeds (13):**
Murrah, Jaffarabadi, Surti, Mehsana, Nagpuri, Toda, Pandharpuri, Kalahandi, Banni, Chilika, Chhattisgarhi, Dharwari, Godavari

### Languages Supported
- English
- Hindi (हिंदी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Bengali (বাংলা)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)
- Urdu (اردو) - with RTL support

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Shadcn/ui** component library
- **Vite** for fast development and building
- **React Router** for navigation
- **React Query** for state management
- **i18next** for internationalization
- **Framer Motion** for animations

### PWA Features
- **Service Worker** for offline functionality
- **IndexedDB** for local data storage
- **Background Sync** for data synchronization
- **Push Notifications** for updates
- **Install Prompt** for app installation

### AI/ML
- **TensorFlow.js** for client-side inference
- **EfficientNetB3** architecture
- **Real-time processing** (<3 seconds)
- **Confidence scoring** with top-3 predictions

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/AFTAN18/cattle-breed-till-phase-5.git
cd cattle-breed-till-phase-5
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Production Build

1. **Build for production**
```bash
npm run build
```

2. **Preview production build**
```bash
npm run preview
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy to Vercel**
```bash
vercel
```

3. **Configure environment variables** (if needed)
```bash
vercel env add
```

### Manual Deployment

1. **Build the project**
```bash
npm run build
```

2. **Upload dist folder** to your hosting provider

3. **Configure server** to serve `index.html` for all routes

### Docker Deployment

1. **Build Docker image**
```bash
docker build -t cattle-breed-identification .
```

2. **Run container**
```bash
docker run -p 3000:3000 cattle-breed-identification
```

## 📱 PWA Installation

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Follow the installation prompts

### Mobile
1. Open the app in Chrome/Safari
2. Tap "Add to Home Screen"
3. The app will be installed as a native app

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=https://your-api-url.com
VITE_APP_NAME=Bharat Pashudhan
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### PWA Configuration
Edit `public/manifest.json` for app metadata:
- App name and description
- Icons and theme colors
- Installation preferences

### Service Worker
Edit `public/sw.js` for:
- Caching strategies
- Offline behavior
- Background sync configuration

## 📊 Performance Metrics

### Target Performance
- **Image Processing**: <3 seconds
- **AI Identification**: <5 seconds
- **App Startup**: <2 seconds
- **Offline Storage**: <1MB
- **Overall Accuracy**: >90%

### Monitoring
- Real-time analytics dashboard
- Performance tracking
- Error monitoring
- User engagement metrics

## 🔒 Security Features

- **HTTPS Only**: All connections secured
- **Content Security Policy**: XSS protection
- **Input Validation**: Client and server-side validation
- **Data Encryption**: Sensitive data encrypted
- **Access Control**: Role-based permissions

## 📈 Analytics & Reporting

### Real-Time Analytics
- Monthly progress tracking
- Weekly performance metrics
- Recent activity feed
- Regional usage statistics

### Export Capabilities
- PDF reports
- Excel data export
- JSON API access
- Bulk data operations

## 🆘 Support & Troubleshooting

### Common Issues

1. **Camera not working**
   - Check browser permissions
   - Ensure HTTPS connection
   - Try different browser

2. **Offline functionality not working**
   - Check service worker registration
   - Clear browser cache
   - Check IndexedDB support

3. **AI model not loading**
   - Check internet connection
   - Clear browser cache
   - Try refreshing the page

### Performance Optimization

1. **Reduce bundle size**
   - Enable code splitting
   - Optimize images
   - Use dynamic imports

2. **Improve loading speed**
   - Enable compression
   - Use CDN for assets
   - Optimize caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Test on multiple devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Government of India - Department of Animal Husbandry & Dairying
- Field Level Workers across India
- TensorFlow.js team
- React and open-source community

## 📞 Contact

For support and inquiries:
- Email: support@bharat-pashudhan.gov.in
- Website: https://dahd.nic.in
- Documentation: https://docs.bharat-pashudhan.gov.in

---

**Built with ❤️ for Indian Field Level Workers**

*Empowering India's livestock sector through technology*