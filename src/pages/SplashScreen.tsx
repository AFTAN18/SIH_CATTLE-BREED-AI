import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Zap, CheckCircle, Save, Globe, ArrowRight } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' }
  ];

  const tutorialSteps = [
    {
      icon: <Camera className="w-16 h-16 text-primary" />,
      title: "Take a Photo",
      description: "Capture clear images of your cattle or buffalo from the side view for best results"
    },
    {
      icon: <Zap className="w-16 h-16 text-accent" />,
      title: "AI Identifies",
      description: "Our advanced AI analyzes the image and identifies the breed with confidence scores"
    },
    {
      icon: <CheckCircle className="w-16 h-16 text-success" />,
      title: "Confirm & Edit",
      description: "Review the results, make corrections if needed, and add additional animal details"
    },
    {
      icon: <Save className="w-16 h-16 text-primary" />,
      title: "Save & Sync",
      description: "Your data is saved locally and synced when connected to ensure no data loss"
    }
  ];

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('selectedLanguage', selectedLanguage);
    navigate('/dashboard');
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Cattle ID</h1>
            <p className="text-sm text-muted-foreground">Breed Identification</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </header>

      {/* Language Selection */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Select Language</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={selectedLanguage === lang.code ? "default" : "outline"}
              onClick={() => handleLanguageSelect(lang.code)}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <span className="font-medium">{lang.native}</span>
              <span className="text-sm opacity-70">{lang.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tutorial Steps */}
      <div className="flex-1 px-6">
        <Card className="p-8 shadow-medium bg-card/80 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {tutorialSteps[currentStep].icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {tutorialSteps[currentStep].description}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-primary scale-125'
                    : index < currentStep
                    ? 'bg-success'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleNext}
            className="w-full h-14 text-lg font-semibold touch-target"
            size="lg"
          >
            {currentStep < tutorialSteps.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Works offline • Secure & Private • Free to use
        </p>
      </footer>
    </div>
  );
};

export default SplashScreen;