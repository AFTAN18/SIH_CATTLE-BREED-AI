import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Target, 
  Search, 
  Eye, 
  BookOpen,
  HelpCircle,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PhotoDatabase from '@/components/PhotoDatabase';
import IdentificationWizard from '@/components/IdentificationWizard';
import VisualSearch from '@/components/VisualSearch';

const ManualIdentification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('wizard');
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleWizardComplete = (breed) => {
    setSelectedBreed(breed);
    setShowResult(true);
  };

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed);
    setShowResult(true);
  };

  const handleConfirmResult = () => {
    // Navigate to results page or save to database
    navigate('/identification-results', { 
      state: { 
        breed: selectedBreed,
        method: 'manual',
        confidence: selectedBreed.confidence 
      } 
    });
  };

  const handleBackToIdentification = () => {
    setShowResult(false);
    setSelectedBreed(null);
  };

  const tabs = [
    {
      id: 'wizard',
      label: t('manualIdentification.wizard'),
      icon: Target,
      description: t('manualIdentification.wizardDesc')
    },
    {
      id: 'photos',
      label: t('manualIdentification.photoDatabase'),
      icon: Camera,
      description: t('manualIdentification.photoDatabaseDesc')
    },
    {
      id: 'search',
      label: t('manualIdentification.visualSearch'),
      icon: Search,
      description: t('manualIdentification.visualSearchDesc')
    }
  ];

  const ResultCard = ({ breed }) => (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          {t('manualIdentification.identificationComplete')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2">{breed.breed}</h2>
          <Badge className="bg-green-100 text-green-800">
            {breed.confidence}% {t('manualIdentification.confidence')}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">{t('manualIdentification.characteristics')}</h3>
            <ul className="space-y-1">
              {breed.characteristics.map((char, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {char}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">{t('manualIdentification.details')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('manualIdentification.origin')}:</span>
                <span className="font-medium">{breed.origin}</span>
              </div>
              {breed.milkYield && (
                <div className="flex justify-between">
                  <span>{t('manualIdentification.milkYield')}:</span>
                  <span className="font-medium">{breed.milkYield}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleConfirmResult} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('manualIdentification.confirmResult')}
          </Button>
          <Button variant="outline" onClick={handleBackToIdentification}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('manualIdentification.tryAgain')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (showResult && selectedBreed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={handleBackToIdentification}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('manualIdentification.backToIdentification')}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{t('manualIdentification.resultTitle')}</h1>
          <p className="text-gray-600">{t('manualIdentification.resultSubtitle')}</p>
        </div>
        
        <ResultCard breed={selectedBreed} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('manualIdentification.back')}
        </Button>
        
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">{t('manualIdentification.title')}</h1>
        </div>
        <p className="text-gray-600 mb-6">{t('manualIdentification.subtitle')}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Camera className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('manualIdentification.totalPhotos')}</p>
                  <p className="text-xl font-bold">500+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('manualIdentification.breedsCovered')}</p>
                  <p className="text-xl font-bold">43</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Search className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('manualIdentification.identificationMethods')}</p>
                  <p className="text-xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {t('manualIdentification.wizardTitle')}
              </CardTitle>
              <p className="text-gray-600">{t('manualIdentification.wizardDescription')}</p>
            </CardHeader>
            <CardContent>
              <IdentificationWizard onComplete={handleWizardComplete} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                {t('manualIdentification.photoDatabaseTitle')}
              </CardTitle>
              <p className="text-gray-600">{t('manualIdentification.photoDatabaseDescription')}</p>
            </CardHeader>
            <CardContent>
              <PhotoDatabase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                {t('manualIdentification.visualSearchTitle')}
              </CardTitle>
              <p className="text-gray-600">{t('manualIdentification.visualSearchDescription')}</p>
            </CardHeader>
            <CardContent>
              <VisualSearch onBreedSelect={handleBreedSelect} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HelpCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {t('manualIdentification.helpTitle')}
            </h3>
            <p className="text-blue-800 mb-4">
              {t('manualIdentification.helpDescription')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">{t('manualIdentification.wizardHelp')}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {t('manualIdentification.wizardHelpDesc')}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">{t('manualIdentification.photosHelp')}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {t('manualIdentification.photosHelpDesc')}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">{t('manualIdentification.searchHelp')}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {t('manualIdentification.searchHelpDesc')}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('manualIdentification.viewGuide')}
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {t('manualIdentification.browseBreeds')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualIdentification;
