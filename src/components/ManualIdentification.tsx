import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Eye, 
  GitCompare, 
  Camera, 
  MapPin, 
  Info,
  CheckCircle,
  ArrowRight,
  Grid,
  List,
  Heart,
  Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BREED_DATABASE } from '@/services/aiService';

interface BreedComparisonData {
  name: string;
  category: 'cattle' | 'buffalo';
  region: string;
  characteristics: string[];
  physicalTraits: {
    size: string;
    color: string;
    horns: string;
    ears: string;
    hump?: string;
  };
  identificationTips: string[];
  commonMistakes: string[];
}

const ManualIdentification: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [breedData, setBreedData] = useState<BreedComparisonData[]>([]);

  useEffect(() => {
    const initializeBreedData = () => {
      const allBreeds: BreedComparisonData[] = [
        ...BREED_DATABASE.cattle.map(breed => ({
          name: breed.name,
          category: 'cattle' as const,
          region: breed.region,
          characteristics: breed.characteristics,
          physicalTraits: {
            size: 'Medium to Large',
            color: breed.characteristics.find(c => c.includes('coat') || c.includes('color')) || 'Variable',
            horns: 'Curved',
            ears: 'Medium',
            hump: 'Present'
          },
          identificationTips: [
            `Focus on ${breed.characteristics[0].toLowerCase()}`,
            `Look for ${breed.characteristics[1].toLowerCase()}`,
            `Check ${breed.characteristics[2].toLowerCase()}`
          ],
          commonMistakes: [
            'Confusing with similar breeds',
            'Poor lighting conditions',
            'Incorrect angle'
          ]
        })),
        ...BREED_DATABASE.buffalo.map(breed => ({
          name: breed.name,
          category: 'buffalo' as const,
          region: breed.region,
          characteristics: breed.characteristics,
          physicalTraits: {
            size: 'Large',
            color: breed.characteristics.find(c => c.includes('coat') || c.includes('color')) || 'Dark',
            horns: 'Curved',
            ears: 'Small'
          },
          identificationTips: [
            `Focus on ${breed.characteristics[0].toLowerCase()}`,
            `Look for ${breed.characteristics[1].toLowerCase()}`,
            `Check ${breed.characteristics[2].toLowerCase()}`
          ],
          commonMistakes: [
            'Confusing with cattle',
            'Misidentifying horn shape',
            'Regional variations'
          ]
        }))
      ];
      
      setBreedData(allBreeds);
    };

    initializeBreedData();
  }, []);

  const filteredBreeds = breedData.filter(breed => {
    const matchesSearch = breed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         breed.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         breed.characteristics.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || breed.category === selectedType;
    const matchesRegion = selectedRegion === 'all' || breed.region.toLowerCase().includes(selectedRegion.toLowerCase());
    return matchesSearch && matchesType && matchesRegion;
  });

  const toggleBreedSelection = (breedName: string) => {
    setSelectedBreeds(prev => 
      prev.includes(breedName) 
        ? prev.filter(b => b !== breedName)
        : [...prev, breedName]
    );
  };

  const toggleFavorite = (breedName: string) => {
    setFavorites(prev => 
      prev.includes(breedName)
        ? prev.filter(b => b !== breedName)
        : [...prev, breedName]
    );
  };

  const regions = ['Gujarat', 'Punjab', 'Haryana', 'Rajasthan', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Manual Breed Identification</h1>
        <p className="text-gray-600">Comprehensive breed database with comparison tools</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search breeds by name, region, or characteristics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cattle">Cattle</SelectItem>
                  <SelectItem value="buffalo">Buffalo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region.toLowerCase()}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results count and comparison */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {filteredBreeds.length} breeds found
            </p>
            {selectedBreeds.length > 0 && (
              <Button variant="outline" size="sm">
                <GitCompare className="w-4 h-4 mr-2" />
                Compare ({selectedBreeds.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Breed Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {filteredBreeds.map((breed) => (
          <Card 
            key={breed.name} 
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedBreeds.includes(breed.name) ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => toggleBreedSelection(breed.name)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{breed.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant={breed.category === 'cattle' ? 'default' : 'secondary'}>
                      {breed.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {breed.region}
                    </span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(breed.name);
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(breed.name) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Key Characteristics */}
                <div>
                  <h5 className="font-medium text-sm mb-2">Key Features</h5>
                  <div className="flex flex-wrap gap-1">
                    {breed.characteristics.slice(0, 3).map((char, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Physical Traits */}
                <div>
                  <h5 className="font-medium text-sm mb-2">Physical Traits</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{breed.physicalTraits.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span>{breed.physicalTraits.color}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Info className="w-3 h-3 mr-1" />
                    Learn
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breed Comparison Modal */}
      {selectedBreeds.length > 1 && (
        <Card className="fixed bottom-6 right-6 w-80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Breed Comparison</CardTitle>
            <CardDescription>
              Comparing {selectedBreeds.length} breeds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedBreeds.map(breedName => (
                <div key={breedName} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{breedName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleBreedSelection(breedName)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button className="w-full mt-3">
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {BREED_DATABASE.cattle.length}
            </div>
            <p className="text-sm text-gray-600">Cattle Breeds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {BREED_DATABASE.buffalo.length}
            </div>
            <p className="text-sm text-gray-600">Buffalo Breeds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {regions.length}
            </div>
            <p className="text-sm text-gray-600">Regions Covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {favorites.length}
            </div>
            <p className="text-sm text-gray-600">Favorites</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualIdentification;
