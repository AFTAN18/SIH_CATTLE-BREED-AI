import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "@/lib/i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import Dashboard from "./pages/Dashboard";
import CameraCapture from "./pages/CameraCapture";
import BreedResults from "./pages/BreedResults";
import ManualSelection from "./pages/ManualSelection";
import AnimalProfile from "./pages/AnimalProfile";

// Import i18n configuration
import "@/lib/i18n";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { i18n } = useTranslation();

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
          <Routes>
            <Route path="/" element={showSplash ? <SplashScreen /> : <Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/camera" element={<CameraCapture />} />
            <Route path="/results" element={<BreedResults />} />
            <Route path="/manual-selection" element={<ManualSelection />} />
            <Route path="/profile" element={<AnimalProfile />} />
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
