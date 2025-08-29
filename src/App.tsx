import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import Dashboard from "./pages/Dashboard";
import CameraCapture from "./pages/CameraCapture";
import BreedResults from "./pages/BreedResults";
import ManualSelection from "./pages/ManualSelection";
import AnimalProfile from "./pages/AnimalProfile";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding) {
      setShowSplash(false);
    }
  }, []);

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
