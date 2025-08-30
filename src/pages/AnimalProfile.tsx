import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Calendar,
  Weight,
  User,
  Phone,
  Hash,
  Heart,
  Upload,
  WifiOff,
  Wifi
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/LanguageSelector';

const AnimalProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOnline] = useState(navigator.onLine);
  const [isSaving, setIsSaving] = useState(false);

  const breedData = location.state?.breed || {
    name: 'Unknown Breed',
    species: 'Cattle',
    confidence: 0
  };

  const [profileData, setProfileData] = useState({
    // Auto-filled from AI
    breed: breedData.name,
    species: breedData.species,
    confidence: breedData.confidence,
    
    // Animal details
    age: '',
    sex: '',
    weight: '',
    tagNumber: '',
    healthStatus: 'healthy',
    
    // Owner details
    ownerName: '',
    ownerPhone: '',
    
    // Location (auto-detected placeholder)
    location: 'Auto-detecting...',
    latitude: null as number | null,
    longitude: null as number | null,
    
    // Additional notes
    notes: ''
  });

  // Auto-detect location on mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfileData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }));
        },
        () => {
          setProfileData(prev => ({
            ...prev,
            location: 'Location unavailable'
          }));
        }
      );
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Validate required fields
    if (!profileData.ownerName || !profileData.ownerPhone) {
      toast({
        title: "Missing information",
        description: "Please fill in owner name and phone number.",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }

    // Generate unique tag number if not provided
    if (!profileData.tagNumber) {
      const timestamp = Date.now().toString().slice(-6);
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      profileData.tagNumber = `${breedData.species.toUpperCase().slice(0, 2)}${timestamp}${randomNum}`;
    }

    // Simulate save process
    setTimeout(() => {
      setIsSaving(false);
      
      // Save to local storage (offline capability)
      const savedAnimals = JSON.parse(localStorage.getItem('savedAnimals') || '[]');
      const newAnimal = {
        ...profileData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        synced: isOnline
      };
      savedAnimals.push(newAnimal);
      localStorage.setItem('savedAnimals', JSON.stringify(savedAnimals));

      toast({
        title: "Animal profile saved!",
        description: isOnline 
          ? "Data has been synced to cloud." 
          : "Data saved locally. Will sync when online.",
      });

      navigate('/dashboard');
    }, 2000);
  };

  const sexOptions = ['Male', 'Female'];
  const healthOptions = ['Healthy', 'Under Treatment', 'Pregnant', 'Lactating'];

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('animalProfile.title')}</h1>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="dropdown" className="text-foreground" />
            {isOnline ? (
              <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                {t('common.online')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <WifiOff className="w-3 h-3 mr-1" />
                {t('common.offline')}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* AI Identification Results */}
        <Card className="shadow-soft bg-gradient-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {t('animalProfile.aiIdentification')}
              <Badge variant="outline" className="ml-auto">
                {profileData.confidence}% {t('animalProfile.confidence')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">{t('animalProfile.identifiedBreed')}</Label>
                <p className="text-lg font-semibold">{profileData.breed}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('animalProfile.species')}</Label>
                <p className="text-sm text-muted-foreground">{profileData.species}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animal Details */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {t('animalProfile.animalDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  {t('animalProfile.age')}
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g., 3"
                  value={profileData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weight" className="flex items-center gap-2 mb-2">
                  <Weight className="w-4 h-4" />
                  {t('animalProfile.weight')}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 450"
                  value={profileData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                {t('animalProfile.sex')}
              </Label>
              <div className="flex gap-2">
                {sexOptions.map(option => (
                  <Button
                    key={option}
                    variant={profileData.sex === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('sex', option)}
                    className="flex-1"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" />
                {t('animalProfile.healthStatus')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {healthOptions.map(option => (
                  <Button
                    key={option}
                    variant={profileData.healthStatus === option.toLowerCase().replace(' ', '_') ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('healthStatus', option.toLowerCase().replace(' ', '_'))}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="tagNumber" className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4" />
                {t('animalProfile.tagNumber')}
              </Label>
              <Input
                id="tagNumber"
                placeholder="Auto-generated if empty"
                value={profileData.tagNumber}
                onChange={(e) => handleInputChange('tagNumber', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {t('animalProfile.ownerInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ownerName" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                {t('animalProfile.ownerName')} *
              </Label>
              <Input
                id="ownerName"
                placeholder="Enter owner's full name"
                value={profileData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="ownerPhone" className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                {t('animalProfile.phoneNumber')} *
              </Label>
              <Input
                id="ownerPhone"
                type="tel"
                placeholder="Enter phone number"
                value={profileData.ownerPhone}
                onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t('animalProfile.location')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm">{t('animalProfile.currentLocation')}</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono">{profileData.location}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Location is auto-detected for accurate record keeping
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('animalProfile.additionalNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional observations, medical history, or special notes..."
              value={profileData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:bg-primary-hover touch-target"
          size="lg"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
              {t('animalProfile.savingProfile')}
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              {t('animalProfile.saveAnimalProfile')}
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isOnline 
              ? "Data will be saved and synced immediately" 
              : "Data will be saved locally and synced when online"
            }
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-6"></div>
    </div>
  );
};

export default AnimalProfile;