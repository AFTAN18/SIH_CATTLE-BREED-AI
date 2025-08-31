import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  HelpCircle,
  Eye,
  Target,
  Info,
  Camera,
  MapPin,
  Palette,
  Crown,
  Zap,
  RotateCcw
} from 'lucide-react';

const IdentificationWizard = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedBreed, setSelectedBreed] = useState(null);

  // Decision tree for breed identification
  const decisionTree = [
    {
      id: 'species',
      question: t('identificationWizard.speciesQuestion'),
      description: t('identificationWizard.speciesDescription'),
      options: [
        {
          id: 'cattle',
          label: t('identificationWizard.cattle'),
          icon: '🐄',
          description: t('identificationWizard.cattleDesc'),
          nextStep: 'bodyType'
        },
        {
          id: 'buffalo',
          label: t('identificationWizard.buffalo'),
          icon: '🐃',
          description: t('identificationWizard.buffaloDesc'),
          nextStep: 'bodyType'
        }
      ]
    },
    {
      id: 'bodyType',
      question: t('identificationWizard.bodyTypeQuestion'),
      description: t('identificationWizard.bodyTypeDescription'),
      options: [
        {
          id: 'large',
          label: t('identificationWizard.large'),
          description: t('identificationWizard.largeDesc'),
          nextStep: 'color'
        },
        {
          id: 'medium',
          label: t('identificationWizard.medium'),
          description: t('identificationWizard.mediumDesc'),
          nextStep: 'color'
        },
        {
          id: 'small',
          label: t('identificationWizard.small'),
          description: t('identificationWizard.smallDesc'),
          nextStep: 'color'
        }
      ]
    },
    {
      id: 'color',
      question: t('identificationWizard.colorQuestion'),
      description: t('identificationWizard.colorDescription'),
      options: [
        {
          id: 'black',
          label: t('identificationWizard.black'),
          description: t('identificationWizard.blackDesc'),
          nextStep: 'horns'
        },
        {
          id: 'brown',
          label: t('identificationWizard.brown'),
          description: t('identificationWizard.brownDesc'),
          nextStep: 'horns'
        },
        {
          id: 'red',
          label: t('identificationWizard.red'),
          description: t('identificationWizard.redDesc'),
          nextStep: 'horns'
        },
        {
          id: 'white',
          label: t('identificationWizard.white'),
          description: t('identificationWizard.whiteDesc'),
          nextStep: 'horns'
        },
        {
          id: 'mixed',
          label: t('identificationWizard.mixed'),
          description: t('identificationWizard.mixedDesc'),
          nextStep: 'horns'
        }
      ]
    },
    {
      id: 'horns',
      question: t('identificationWizard.hornsQuestion'),
      description: t('identificationWizard.hornsDescription'),
      options: [
        {
          id: 'long',
          label: t('identificationWizard.longHorns'),
          description: t('identificationWizard.longHornsDesc'),
          nextStep: 'hump'
        },
        {
          id: 'short',
          label: t('identificationWizard.shortHorns'),
          description: t('identificationWizard.shortHornsDesc'),
          nextStep: 'hump'
        },
        {
          id: 'curved',
          label: t('identificationWizard.curvedHorns'),
          description: t('identificationWizard.curvedHornsDesc'),
          nextStep: 'hump'
        },
        {
          id: 'none',
          label: t('identificationWizard.noHorns'),
          description: t('identificationWizard.noHornsDesc'),
          nextStep: 'hump'
        }
      ]
    },
    {
      id: 'hump',
      question: t('identificationWizard.humpQuestion'),
      description: t('identificationWizard.humpDescription'),
      options: [
        {
          id: 'large',
          label: t('identificationWizard.largeHump'),
          description: t('identificationWizard.largeHumpDesc'),
          nextStep: 'region'
        },
        {
          id: 'small',
          label: t('identificationWizard.smallHump'),
          description: t('identificationWizard.smallHumpDesc'),
          nextStep: 'region'
        },
        {
          id: 'none',
          label: t('identificationWizard.noHump'),
          description: t('identificationWizard.noHumpDesc'),
          nextStep: 'region'
        }
      ]
    },
    {
      id: 'region',
      question: t('identificationWizard.regionQuestion'),
      description: t('identificationWizard.regionDescription'),
      options: [
        {
          id: 'north',
          label: t('identificationWizard.northIndia'),
          description: t('identificationWizard.northIndiaDesc'),
          nextStep: 'result'
        },
        {
          id: 'south',
          label: t('identificationWizard.southIndia'),
          description: t('identificationWizard.southIndiaDesc'),
          nextStep: 'result'
        },
        {
          id: 'east',
          label: t('identificationWizard.eastIndia'),
          description: t('identificationWizard.eastIndiaDesc'),
          nextStep: 'result'
        },
        {
          id: 'west',
          label: t('identificationWizard.westIndia'),
          description: t('identificationWizard.westIndiaDesc'),
          nextStep: 'result'
        },
        {
          id: 'central',
          label: t('identificationWizard.centralIndia'),
          description: t('identificationWizard.centralIndiaDesc'),
          nextStep: 'result'
        }
      ]
    }
  ];

  // Breed matching logic based on answers
  const breedMatches = {
    'cattle-large-brown-short-small-north': {
      breed: 'Sahiwal',
      confidence: 85,
      characteristics: ['Reddish brown color', 'Medium size', 'Short horns', 'Small hump'],
      origin: 'Punjab, India',
      milkYield: '15-20 L/day',
      features: ['Heat tolerant', 'High milk production', 'Good temperament']
    },
    'cattle-large-brown-long-large-west': {
      breed: 'Gir',
      confidence: 92,
      characteristics: ['Reddish brown color', 'Large size', 'Long horns', 'Large hump'],
      origin: 'Gujarat, India',
      milkYield: '12-18 L/day',
      features: ['Distinctive hump', 'Pendulous ears', 'Docile nature']
    },
    'buffalo-large-black-curved-none-central': {
      breed: 'Murrah',
      confidence: 88,
      characteristics: ['Black color', 'Large size', 'Curved horns', 'No hump'],
      origin: 'Haryana, India',
      milkYield: '15-20 L/day',
      features: ['High milk production', 'Good temperament', 'Commercial breed']
    }
  };

  const currentQuestion = decisionTree[currentStep];
  const progress = ((currentStep + 1) / decisionTree.length) * 100;

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [currentQuestion.id]: option.id };
    setAnswers(newAnswers);
    
    if (option.nextStep === 'result') {
      // Generate answer key for breed matching
      const answerKey = Object.values(newAnswers).join('-');
      const match = breedMatches[answerKey];
      
      if (match) {
        setSelectedBreed(match);
      } else {
        // Default to most likely match based on partial answers
        setSelectedBreed({
          breed: 'Unknown Breed',
          confidence: 45,
          characteristics: ['Unable to determine with current information'],
          origin: 'Unknown',
          milkYield: 'Unknown',
          features: ['Please provide more details or use photo identification']
        });
      }
    }
    
    if (option.nextStep !== 'result') {
      const nextStepIndex = decisionTree.findIndex(step => step.id === option.nextStep);
      setCurrentStep(nextStepIndex);
    } else {
      setCurrentStep(decisionTree.length - 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setSelectedBreed(null);
  };

  const handleComplete = () => {
    if (onComplete && selectedBreed) {
      onComplete(selectedBreed);
    }
  };

  const OptionCard = ({ option, isSelected, onClick }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {option.icon && (
            <div className="text-2xl">{option.icon}</div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{option.label}</h3>
              {isSelected && <CheckCircle className="h-4 w-4 text-blue-500" />}
            </div>
            <p className="text-sm text-gray-600">{option.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ResultCard = ({ breed }) => (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          {t('identificationWizard.identificationResult')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2">{breed.breed}</h2>
          <Badge className="bg-green-100 text-green-800">
            {breed.confidence}% {t('identificationWizard.confidence')}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">{t('identificationWizard.characteristics')}</h3>
            <ul className="space-y-1">
              {breed.characteristics.map((char, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Circle className="h-2 w-2 fill-current" />
                  {char}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">{t('identificationWizard.details')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('identificationWizard.origin')}:</span>
                <span className="font-medium">{breed.origin}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('identificationWizard.milkYield')}:</span>
                <span className="font-medium">{breed.milkYield}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">{t('identificationWizard.keyFeatures')}</h3>
          <div className="flex flex-wrap gap-1">
            {breed.features.map((feature, index) => (
              <Badge key={index} variant="secondary">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleComplete} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('identificationWizard.confirmResult')}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('identificationWizard.startOver')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{t('identificationWizard.title')}</h1>
        </div>
        <p className="text-gray-600 mb-4">{t('identificationWizard.subtitle')}</p>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t('identificationWizard.step')} {currentStep + 1} {t('identificationWizard.of')} {decisionTree.length}</span>
            <span>{Math.round(progress)}% {t('identificationWizard.complete')}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {currentStep < decisionTree.length - 1 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                {currentQuestion.question}
              </CardTitle>
              <p className="text-gray-600">{currentQuestion.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {currentQuestion.options.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    isSelected={answers[currentQuestion.id] === option.id}
                    onClick={() => handleAnswer(option)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('identificationWizard.previous')}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('identificationWizard.reset')}
            </Button>
          </div>
        </div>
      ) : (
        <ResultCard breed={selectedBreed} />
      )}

      {/* Help Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              {t('identificationWizard.helpTitle')}
            </h3>
            <p className="text-sm text-blue-800">
              {t('identificationWizard.helpDescription')}
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline">
                <Camera className="h-4 w-4 mr-1" />
                {t('identificationWizard.usePhotoIdentification')}
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                {t('identificationWizard.viewReferencePhotos')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentificationWizard;
