import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "@/lib/i18n";
import pwaService, { PWAService } from "@/services/pwaService";
import offlineStorage from "@/services/offlineStorage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import Dashboard from "./pages/Dashboard";
import CameraCapture from "./pages/CameraCapture";
import BreedResults from "./pages/BreedResults";
import ManualSelection from "./pages/ManualSelection";
import AnimalProfile from "./pages/AnimalProfile";
import LearningCenter from "./pages/LearningCenter";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DataManagement from "./pages/DataManagement";
import ManualIdentification from "./pages/ManualIdentification";

// Import i18n configuration
import "@/lib/i18n";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize PWA functionality
        await pwaService.initialize();
        
        // Initialize offline storage
        await offlineStorage.initialize();
        
        // Set up PWA event listeners
        pwaService.onOnline(() => {
          setIsOnline(true);
          console.log('App is online');
        });
        
        pwaService.onOffline(() => {
          setIsOnline(false);
          console.log('App is offline');
        });
        
        pwaService.onUpdate((updateAvailable) => {
          setIsUpdateAvailable(updateAvailable);
          if (updateAvailable) {
            console.log('App update available');
          }
        });
        
        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          PWAService.setInstallPrompt(e);
        });
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding) {
      setShowSplash(false);
    }

    // Initialize language and RTL support
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      const currentLang = languages.find(lang => lang.code === savedLanguage);
      if (currentLang) {
        document.documentElement.dir = currentLang.rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLanguage;
      }
    }
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Online/Offline Status Indicator */}
          {!isOnline && (
            <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
              <span className="text-sm font-medium">
                You are currently offline. Some features may be limited.
              </span>
            </div>
          )}
          
          {/* Update Available Indicator */}
          {isUpdateAvailable && (
            <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 z-50">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">
                  A new version is available
                </span>
                <button
                  onClick={() => pwaService.updateApp()}
                  className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
                >
                  Update Now
                </button>
              </div>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={showSplash ? <SplashScreen /> : <Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/camera" element={<CameraCapture />} />
            <Route path="/results" element={<BreedResults />} />
            <Route path="/manual-selection" element={<ManualSelection />} />
            <Route path="/profile" element={<AnimalProfile />} />
            <Route path="/learning" element={<LearningCenter />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/manual-identification" element={<ManualIdentification />} />
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/legacy" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
