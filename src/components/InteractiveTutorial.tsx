import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle,
  Camera,
  Target,
  Lightbulb,
  ArrowRight,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  tips: string[];
  action?: string;
  duration: number;
}

interface InteractiveTutorialProps {
  tutorialId: string;
  onComplete: (tutorialId: string) => void;
  onClose: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  tutorialId,
  onComplete,
  onClose
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const tutorials: Record<string, TutorialStep[]> = {
    'camera-basics': [
      {
        id: 'step-1',
        title: t('tutorials.cameraBasics.step1.title'),
        description: t('tutorials.cameraBasics.step1.description'),
        tips: [
          t('tutorials.cameraBasics.step1.tip1'),
          t('tutorials.cameraBasics.step1.tip2'),
          t('tutorials.cameraBasics.step1.tip3')
        ],
        duration: 30
      },
      {
        id: 'step-2',
        title: t('tutorials.cameraBasics.step2.title'),
        description: t('tutorials.cameraBasics.step2.description'),
        tips: [
          t('tutorials.cameraBasics.step2.tip1'),
          t('tutorials.cameraBasics.step2.tip2'),
          t('tutorials.cameraBasics.step2.tip3')
        ],
        duration: 45
      },
      {
        id: 'step-3',
        title: t('tutorials.cameraBasics.step3.title'),
        description: t('tutorials.cameraBasics.step3.description'),
        tips: [
          t('tutorials.cameraBasics.step3.tip1'),
          t('tutorials.cameraBasics.step3.tip2'),
          t('tutorials.cameraBasics.step3.tip3')
        ],
        duration: 60
      }
    ],
    'breed-identification': [
      {
        id: 'step-1',
        title: t('tutorials.breedIdentification.step1.title'),
        description: t('tutorials.breedIdentification.step1.description'),
        tips: [
          t('tutorials.breedIdentification.step1.tip1'),
          t('tutorials.breedIdentification.step1.tip2'),
          t('tutorials.breedIdentification.step1.tip3')
        ],
        duration: 40
      },
      {
        id: 'step-2',
        title: t('tutorials.breedIdentification.step2.title'),
        description: t('tutorials.breedIdentification.step2.description'),
        tips: [
          t('tutorials.breedIdentification.step2.tip1'),
          t('tutorials.breedIdentification.step2.tip2'),
          t('tutorials.breedIdentification.step2.tip3')
        ],
        duration: 50
      },
      {
        id: 'step-3',
        title: t('tutorials.breedIdentification.step3.title'),
        description: t('tutorials.breedIdentification.step3.description'),
        tips: [
          t('tutorials.breedIdentification.step3.tip1'),
          t('tutorials.breedIdentification.step3.tip2'),
          t('tutorials.breedIdentification.step3.tip3')
        ],
        duration: 55
      }
    ]
  };

  const currentTutorial = tutorials[tutorialId] || [];
  const currentStepData = currentTutorial[currentStep];

  useEffect(() => {
    if (isPlaying && currentStepData) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (currentStepData.duration * 10));
          if (newProgress >= 100) {
            setIsPlaying(false);
            setProgress(100);
            return 100;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentStepData]);

  const handleNext = () => {
    if (currentStep < currentTutorial.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
      setProgress(0);
      setIsPlaying(false);
    } else {
      // Tutorial completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete(tutorialId);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetStep = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  if (!currentStepData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tutorial Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              The requested tutorial is not available.
            </p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2" />
                {t(`tutorials.${tutorialId}.title`)}
              </CardTitle>
              <p className="text-sm opacity-90 mt-1">
                Step {currentStep + 1} of {currentTutorial.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex">
            {/* Sidebar with step navigation */}
            <div className="w-64 bg-gray-50 border-r">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tutorial Steps</h3>
                <div className="space-y-2">
                  {currentTutorial.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        index === currentStep
                          ? 'bg-green-100 border-2 border-green-500'
                          : completedSteps.has(index)
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleStepClick(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {completedSteps.has(index) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className={`w-4 h-4 rounded-full ${
                              index === currentStep ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          )}
                          <span className={`text-sm font-medium ${
                            index === currentStep ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {step.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {step.duration}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step content */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Step {currentStep + 1}
                      </Badge>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {currentStepData.title}
                      </h2>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {currentStepData.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Tips section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center mb-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-blue-900">Pro Tips</h3>
                      </div>
                      <ul className="space-y-2">
                        {currentStepData.tips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevious}
                          disabled={currentStep === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={togglePlay}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Play
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetStep}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      </div>

                      <Button
                        onClick={handleNext}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {currentStep === currentTutorial.length - 1 ? (
                          <>
                            Complete Tutorial
                            <CheckCircle className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Next Step
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveTutorial;
