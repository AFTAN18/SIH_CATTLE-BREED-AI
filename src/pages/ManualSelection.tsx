import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Eye,
  MapPin,
  Palette,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/LanguageSelector';

const ManualSelection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<any>(null);

  const filters = [
    { id: 'cattle', label: 'Cattle', icon: '🐄' },
    { id: 'buffalo', label: 'Buffalo', icon: '🐃' },
    { id: 'dairy', label: 'Dairy', icon: '🥛' },
    { id: 'draft', label: 'Draft', icon: '💪' },
    { id: 'indian', label: 'Indian Origin', icon: '🇮🇳' },
    { id: 'foreign', label: 'Foreign Origin', icon: '🌍' }
  ];

  const breeds = [
    {
      id: 1,
      name: 'Holstein Friesian',
      species: 'Cattle',
      origin: 'Netherlands',
      type: ['dairy', 'foreign'],
      color: 'Black & White',
      horns: 'None',
      description: 'High milk production dairy breed',
      image: '🐄'
    },
    {
      id: 2,
      name: 'Gir',
      species: 'Cattle',
      origin: 'Gujarat, India',
      type: ['dairy', 'indian'],
      color: 'White to Grey',
      horns: 'Curved',
      description: 'Indigenous Indian dairy breed',
      image: '🐄'
    },
    {
      id: 3,
      name: 'Murrah',
      species: 'Buffalo',
      origin: 'Haryana, India',
      type: ['dairy', 'indian'],
      color: 'Black',
      horns: 'Curved',
      description: 'Premium buffalo breed for milk',
      image: '🐃'
    },
    {
      id: 4,
      name: 'Jersey',
      species: 'Cattle',
      origin: 'Jersey Island',
      type: ['dairy', 'foreign'],
      color: 'Light Brown',
      horns: 'Small',
      description: 'Small dairy breed with rich milk',
      image: '🐄'
    },
    {
      id: 5,
      name: 'Sahiwal',
      species: 'Cattle',
      origin: 'Punjab, Pakistan',
      type: ['dairy', 'indian'],
      color: 'Red to Brown',
      horns: 'Short',
      description: 'Heat tolerant dairy breed',
      image: '🐄'
    },
    {
      id: 6,
      name: 'Red Sindhi',
      species: 'Cattle',
      origin: 'Sindh Province',
      type: ['dairy', 'indian'],
      color: 'Red',
      horns: 'Small',
      description: 'Drought resistant breed',
      image: '🐄'
    }
  ];

  const filteredBreeds = breeds.filter(breed => {
    const matchesSearch = breed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         breed.origin.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilters.length === 0) return matchesSearch;
    
    const matchesFilters = selectedFilters.some(filter => {
      if (filter === 'cattle') return breed.species === 'Cattle';
      if (filter === 'buffalo') return breed.species === 'Buffalo';
      if (filter === 'indian') return breed.type.includes('indian');
      if (filter === 'foreign') return breed.type.includes('foreign');
      return breed.type.includes(filter);
    });
    
    return matchesSearch && matchesFilters;
  });

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleBreedSelect = (breed: any) => {
    setSelectedBreed(breed);
    toast({
      title: "Breed selected!",
      description: `${breed.name} has been selected.`,
    });
    navigate('/profile', { 
      state: { 
        breed: {
          ...breed,
          confidence: 100 // Manual selection = 100% confidence
        }
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('manualSelection.title')}</h1>
          <LanguageSelector variant="dropdown" className="text-foreground" />
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('manualSelection.searchBreeds')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('manualSelection.filters')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <Button
                key={filter.id}
                variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className="h-8 text-xs"
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t('manualSelection.breedsFound', { count: filteredBreeds.length })}
          </h2>
          {selectedFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFilters([])}
              className="text-xs"
            >
              {t('manualSelection.clearFilters')}
            </Button>
          )}
        </div>

        {filteredBreeds.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {t('manualSelection.noBreedsFound')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilters([]);
              }}
              className="mt-4"
            >
              {t('manualSelection.resetSearch')}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBreeds.map(breed => (
              <Card 
                key={breed.id} 
                className="shadow-soft hover:shadow-medium transition-all cursor-pointer"
                onClick={() => handleBreedSelect(breed)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{breed.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{breed.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {breed.species}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {breed.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>{breed.origin}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Palette className="w-3 h-3 text-accent" />
                          <span>{breed.color}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-warning" />
                          <span>Horns: {breed.horns}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-success" />
                          <span>Type: {breed.type.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Common Crossbreeds Section */}
        <Card className="shadow-soft bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💫</span>
              {t('manualSelection.commonCrossbreeds')}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('manualSelection.crossbreedDescription')}
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-3"
                onClick={() => handleBreedSelect({
                  name: 'Holstein × Local Cross',
                  species: 'Cattle',
                  origin: 'Mixed',
                  type: ['dairy', 'crossbreed']
                })}
              >
                <div className="text-left">
                  <p className="font-medium">Holstein × Local Cross</p>
                  <p className="text-xs text-muted-foreground">High milk yield with local adaptation</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-3"
                onClick={() => handleBreedSelect({
                  name: 'Jersey × Sahiwal Cross',
                  species: 'Cattle',
                  origin: 'Mixed',
                  type: ['dairy', 'crossbreed']
                })}
              >
                <div className="text-left">
                  <p className="font-medium">Jersey × Sahiwal Cross</p>
                  <p className="text-xs text-muted-foreground">Good milk quality with heat tolerance</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom safe area */}
      <div className="h-6"></div>
    </div>
  );
};

export default ManualSelection;