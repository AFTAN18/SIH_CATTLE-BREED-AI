import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  CheckCircle, 
  X, 
  HelpCircle, 
  MapPin, 
  Weight, 
  Milk,
  ArrowRight,
  Star,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/LanguageSelector';

const BreedResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedBreed, setSelectedBreed] = useState(0);

  // Mock results data
  const results = [
    {
      id: 1,
      breed: 'Holstein Friesian',
      confidence: 94,
      species: 'Cattle',
      origin: 'Netherlands',
      avgWeight: '650-700 kg',
      milkYield: '25-30 L/day',
      features: ['Black and white patches', 'Large size', 'High milk production'],
      description: 'World-famous dairy breed known for high milk production and distinctive black and white markings.'
    },
    {
      id: 2,
      breed: 'Jersey',
      confidence: 87,
      species: 'Cattle',
      origin: 'Jersey Island',
      avgWeight: '350-450 kg',
      milkYield: '18-22 L/day',
      features: ['Light brown color', 'Smaller size', 'High butterfat content'],
      description: 'Small dairy breed producing rich, creamy milk with high butterfat content.'
    },
    {
      id: 3,
      breed: 'Gir',
      confidence: 73,
      species: 'Cattle',
      origin: 'Gujarat, India',
      avgWeight: '400-500 kg',
      milkYield: '12-18 L/day',
      features: ['Distinctive hump', 'Pendulous ears', 'Docile nature'],
      description: 'Indigenous Indian breed known for disease resistance and adaptability to tropical climate.'
    }
  ];

  const currentResult = results[selectedBreed];

  const handleConfirm = () => {
    toast({
      title: "Breed confirmed!",
      description: `${currentResult.breed} has been selected.`,
    });
    navigate('/profile', { 
      state: { 
        breed: currentResult,
        imageData: location.state?.imageData 
      } 
    });
  };

  const handleReject = () => {
    toast({
      title: "Let's try again",
      description: "You'll be redirected to manual selection.",
    });
    navigate('/manual-selection');
  };

  const handleExpertReview = () => {
    toast({
      title: "Expert review requested",
      description: "Your request has been submitted for expert verification.",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 75) return 'text-accent';
    return 'text-warning';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return 'default';
    if (confidence >= 75) return 'secondary';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card shadow-soft">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t('identification.title')}</h1>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="dropdown" className="text-foreground" />
          <Button variant="ghost" size="sm" onClick={handleExpertReview}>
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Image Preview */}
        {location.state?.imageData && (
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('identification.capturedImage')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Match */}
        <Card className="shadow-medium bg-gradient-secondary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{t('identification.bestMatch')}</CardTitle>
              <Badge variant={getConfidenceBadge(currentResult.confidence)} className="text-lg px-3 py-1">
                <Star className="w-4 h-4 mr-1" />
                {currentResult.confidence}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{currentResult.breed}</h3>
              <p className="text-muted-foreground">{currentResult.species} • {currentResult.origin}</p>
            </div>
            
            <Progress value={currentResult.confidence} className="h-3" />
            
            <p className="text-sm leading-relaxed">{currentResult.description}</p>

            {/* Key Characteristics */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t('identification.origin')}</p>
                  <p className="text-sm text-muted-foreground">{currentResult.origin}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <Weight className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">{t('identification.averageWeight')}</p>
                  <p className="text-sm text-muted-foreground">{currentResult.avgWeight}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <Milk className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium">{t('identification.milkYield')}</p>
                  <p className="text-sm text-muted-foreground">{currentResult.milkYield}</p>
                </div>
              </div>
            </div>

            {/* Identifying Features */}
            <div>
              <h4 className="font-semibold mb-2">{t('identification.keyFeatures')}</h4>
              <div className="flex flex-wrap gap-2">
                {currentResult.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Matches */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('identification.alternativeMatches')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.slice(1).map((result, index) => (
              <div 
                key={result.id}
                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                  selectedBreed === index + 1 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedBreed(index + 1)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold">{result.breed}</h5>
                    <p className="text-sm text-muted-foreground">{result.origin}</p>
                  </div>
                  <Badge variant={getConfidenceBadge(result.confidence)}>
                    {result.confidence}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:bg-primary-hover touch-target"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {t('identification.confirm')}: {currentResult.breed}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              className="h-12 touch-target"
            >
              <X className="w-4 h-4 mr-2" />
              {t('identification.notCorrect')}
            </Button>

            <Button
              variant="secondary"
              onClick={handleExpertReview}
              className="h-12 touch-target"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {t('identification.expertReview')}
            </Button>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="shadow-soft bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium">{t('identification.nextStep')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('identification.createProfile')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom safe area */}
      <div className="h-6"></div>
    </div>
  );
};

export default BreedResults;