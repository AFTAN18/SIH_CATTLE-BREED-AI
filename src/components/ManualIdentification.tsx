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
      const enhancedBreeds: BreedComparisonData[] = [
        // Enhanced Cattle Breeds
        {
          name: 'Gir',
          category: 'cattle',
          region: 'Gujarat',
          characteristics: [
            'Prominent forehead hump',
            'Long pendulous ears',
            'White to light red coat with patches',
            'Curved horns pointing backward',
            'Medium to large size (400-500kg)'
          ],
          physicalTraits: {
            size: 'Medium to Large (400-500kg)',
            color: 'White to light red with patches',
            horns: 'Curved, pointing backward',
            ears: 'Long and pendulous',
            hump: 'Prominent forehead hump'
          },
          identificationTips: [
            'Look for the distinctive forehead hump',
            'Check for long, drooping ears',
            'Observe the white to reddish coat pattern',
            'Note the curved horn shape'
          ],
          commonMistakes: [
            'Confusing with Kankrej due to similar hump',
            'Misidentifying ear length in poor angles',
            'Color variations in different lighting'
          ]
        },
        {
          name: 'Sahiwal',
          category: 'cattle',
          region: 'Punjab',
          characteristics: [
            'Reddish brown to light red coat',
            'Medium to large size',
            'Loose skin with dewlap',
            'Short horns',
            'Docile temperament'
          ],
          physicalTraits: {
            size: 'Medium to Large (350-450kg)',
            color: 'Reddish brown to light red',
            horns: 'Short and thick',
            ears: 'Medium sized',
            hump: 'Small to medium'
          },
          identificationTips: [
            'Focus on the reddish-brown coat color',
            'Look for loose skin and prominent dewlap',
            'Check for short, thick horns',
            'Note the calm, docile behavior'
          ],
          commonMistakes: [
            'Confusing with Red Sindhi breed',
            'Misidentifying horn size',
            'Color variations due to age'
          ]
        },
        {
          name: 'Holstein Friesian',
          category: 'cattle',
          region: 'Imported/Crossbred',
          characteristics: [
            'Distinctive black and white patches',
            'Large body size',
            'High milk production',
            'No hump',
            'Straight back line'
          ],
          physicalTraits: {
            size: 'Large (500-700kg)',
            color: 'Black and white patches',
            horns: 'Small or dehorned',
            ears: 'Medium, alert',
            hump: 'Absent'
          },
          identificationTips: [
            'Look for clear black and white patch patterns',
            'Note the large body size and straight back',
            'Check for absence of hump',
            'Observe the alert ear position'
          ],
          commonMistakes: [
            'Confusing with other crossbred cattle',
            'Missing subtle color variations',
            'Assuming all black-white cattle are Holstein'
          ]
        },
        {
          name: 'Red Sindhi',
          category: 'cattle',
          region: 'Sindh/Rajasthan',
          characteristics: [
            'Deep red coat color',
            'Compact body structure',
            'Small to medium hump',
            'Heat resistant',
            'Good milk quality'
          ],
          physicalTraits: {
            size: 'Medium (300-400kg)',
            color: 'Deep red to dark red',
            horns: 'Small, curved',
            ears: 'Medium, mobile',
            hump: 'Small to medium'
          },
          identificationTips: [
            'Focus on the uniform deep red color',
            'Note the compact, well-proportioned body',
            'Check for small to medium hump size',
            'Look for heat adaptation features'
          ],
          commonMistakes: [
            'Confusing with Sahiwal breed',
            'Misidentifying due to sun-faded coat',
            'Overlooking regional size variations'
          ]
        },
        // Enhanced Buffalo Breeds
        {
          name: 'Murrah',
          category: 'buffalo',
          region: 'Haryana',
          characteristics: [
            'Jet black coat color',
            'Curved horns pointing backward',
            'Large body size',
            'High milk yield',
            'Compact udder'
          ],
          physicalTraits: {
            size: 'Large (500-800kg)',
            color: 'Jet black',
            horns: 'Curved, pointing backward and inward',
            ears: 'Small, alert'
          },
          identificationTips: [
            'Look for the jet black coat color',
            'Note the distinctive horn curvature',
            'Check for large body size and weight',
            'Observe the compact, well-formed udder'
          ],
          commonMistakes: [
            'Confusing with other black buffalo breeds',
            'Misidentifying horn curvature angle',
            'Overlooking size differences'
          ]
        },
        {
          name: 'Nili Ravi',
          category: 'buffalo',
          region: 'Punjab',
          characteristics: [
            'Dark coat with white markings',
            'Large curved horns',
            'Wall eyes (blue/white eyes)',
            'High milk production',
            'Large body frame'
          ],
          physicalTraits: {
            size: 'Large (450-750kg)',
            color: 'Dark with white markings on face and legs',
            horns: 'Large, curved',
            ears: 'Medium, mobile'
          },
          identificationTips: [
            'Look for distinctive white markings on dark coat',
            'Check for wall eyes (blue or white eyes)',
            'Note the large, curved horn structure',
            'Observe the substantial body frame'
          ],
          commonMistakes: [
            'Missing the wall eye characteristic',
            'Confusing markings with other breeds',
            'Misidentifying horn size'
          ]
        },
        {
          name: 'Bhadawari',
          category: 'buffalo',
          region: 'Uttar Pradesh',
          characteristics: [
            'Light to dark brown coat',
            'Compact body size',
            'Straight or slightly curved horns',
            'Good heat tolerance',
            'Moderate milk yield'
          ],
          physicalTraits: {
            size: 'Medium (350-500kg)',
            color: 'Light to dark brown',
            horns: 'Straight to slightly curved',
            ears: 'Medium sized'
          },
          identificationTips: [
            'Focus on the brown coat coloration',
            'Note the compact, sturdy build',
            'Check for straight to slightly curved horns',
            'Look for heat adaptation features'
          ],
          commonMistakes: [
            'Confusing with cattle due to color',
            'Misidentifying horn straightness',
            'Overlooking size differences'
          ]
        }
      ];
      
      setBreedData(enhancedBreeds);
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
