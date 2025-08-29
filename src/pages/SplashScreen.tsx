import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Zap, CheckCircle, Save, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
  ];

  const tutorialSteps = [
    {
      icon: <Camera className="w-16 h-16 text-primary" />,
      title: "Take a Photo",
      description: "Capture clear images of your cattle or buffalo from the side view for best results",
      color: "from-primary to-primary/80"
    },
    {
      icon: <Zap className="w-16 h-16 text-accent" />,
      title: "AI Identifies",
      description: "Our advanced AI analyzes the image and identifies the breed with confidence scores",
      color: "from-accent to-accent/80"
    },
    {
      icon: <CheckCircle className="w-16 h-16 text-success" />,
      title: "Confirm & Edit",
      description: "Review the results, make corrections if needed, and add additional animal details",
      color: "from-success to-success/80"
    },
    {
      icon: <Save className="w-16 h-16 text-primary" />,
      title: "Save & Sync",
      description: "Your data is saved locally and synced when connected to ensure no data loss",
      color: "from-primary to-primary/80"
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-earth flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header 
        className="flex justify-between items-center p-6"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cattle ID</h1>
            <p className="text-sm text-muted-foreground">Breed Identification</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleSkip} 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </Button>
      </motion.header>

      {/* Language Selection */}
      <motion.div 
        className="px-6 mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Select Language</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`h-auto p-4 flex flex-col items-center gap-2 transition-all ${
                  selectedLanguage === lang.code 
                    ? 'bg-gradient-primary shadow-glow' 
                    : 'hover:shadow-soft'
                }`}
              >
                <span className="font-medium">{lang.native}</span>
                <span className="text-sm opacity-70">{lang.name}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tutorial Steps */}
      <div className="flex-1 px-6">
        <motion.div
          variants={cardVariants}
          className="relative"
        >
          <Card className="p-8 shadow-medium bg-card/90 backdrop-blur-sm border-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <motion.div 
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tutorialSteps[currentStep].color} flex items-center justify-center shadow-glow`}>
                    {tutorialSteps[currentStep].icon}
                  </div>
                </motion.div>
                
                <motion.h3 
                  className="text-3xl font-bold mb-4 text-foreground"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {tutorialSteps[currentStep].title}
                </motion.h3>
                
                <motion.p 
                  className="text-lg text-muted-foreground leading-relaxed"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {tutorialSteps[currentStep].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-3 mb-8">
              {tutorialSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-primary scale-125 shadow-glow'
                      : index < currentStep
                      ? 'bg-success'
                      : 'bg-muted'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleNext}
                className="w-full h-16 text-lg font-semibold bg-gradient-primary hover:bg-primary-hover shadow-glow touch-target"
                size="lg"
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Get Started
                    <Sparkles className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="p-6 text-center"
        variants={itemVariants}
      >
        <p className="text-sm text-muted-foreground">
          Works offline • Secure & Private • Free to use
        </p>
      </motion.footer>
    </motion.div>
  );
};

export default SplashScreen;