import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  GitCompare,
  Eye,
  Download,
  Share2,
  Heart,
  MapPin,
  Calendar,
  Users,
  Camera,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PhotoDatabase = ({ onPhotoSelect }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [filterAngle, setFilterAngle] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [isComparing, setIsComparing] = useState(false);
  const [comparePhotos, setComparePhotos] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });

  // Mock photo database with comprehensive breed photos
  const photoDatabase = {
    'Gir': {
      name: 'Gir',
      type: 'cattle',
      origin: 'Gujarat, India',
      photos: [
        {
          id: 'gir_1',
          url: '/api/photos/gir_side_adult_male.jpg',
          angle: 'side',
          age: 'adult',
          gender: 'male',
          region: 'Gujarat',
          features: ['distinctive hump', 'pendulous ears', 'docile nature'],
          description: 'Adult male Gir cattle showing characteristic hump and ear structure',
          tags: ['dairy', 'indigenous', 'tropical']
        },
        {
          id: 'gir_2',
          url: '/api/photos/gir_front_adult_female.jpg',
          angle: 'front',
          age: 'adult',
          gender: 'female',
          region: 'Gujarat',
          features: ['reddish brown', 'medium size', 'short horns'],
          description: 'Adult female Gir cattle front view highlighting facial features',
          tags: ['dairy', 'indigenous', 'tropical']
        },
        {
          id: 'gir_3',
          url: '/api/photos/gir_rear_adult_male.jpg',
          angle: 'rear',
          age: 'adult',
          gender: 'male',
          region: 'Gujarat',
          features: ['strong hindquarters', 'well-developed udder', 'straight back'],
          description: 'Rear view showing strong build and udder development',
          tags: ['dairy', 'indigenous', 'tropical']
        },
        {
          id: 'gir_4',
          url: '/api/photos/gir_threequarter_young_female.jpg',
          angle: 'three-quarter',
          age: 'young',
          gender: 'female',
          region: 'Gujarat',
          features: ['developing hump', 'alert expression', 'good conformation'],
          description: 'Young female Gir showing developing characteristics',
          tags: ['dairy', 'indigenous', 'tropical']
        }
      ]
    },
    'Sahiwal': {
      name: 'Sahiwal',
      type: 'cattle',
      origin: 'Punjab, India',
      photos: [
        {
          id: 'sahiwal_1',
          url: '/api/photos/sahiwal_side_adult_male.jpg',
          angle: 'side',
          age: 'adult',
          gender: 'male',
          region: 'Punjab',
          features: ['reddish brown', 'medium size', 'short horns'],
          description: 'Adult male Sahiwal showing characteristic color and build',
          tags: ['dairy', 'indigenous', 'heat-tolerant']
        },
        {
          id: 'sahiwal_2',
          url: '/api/photos/sahiwal_front_adult_female.jpg',
          angle: 'front',
          age: 'adult',
          gender: 'female',
          region: 'Punjab',
          features: ['broad forehead', 'alert eyes', 'good udder'],
          description: 'Adult female Sahiwal front view',
          tags: ['dairy', 'indigenous', 'heat-tolerant']
        }
      ]
    },
    'Murrah': {
      name: 'Murrah',
      type: 'buffalo',
      origin: 'Haryana, India',
      photos: [
        {
          id: 'murrah_1',
          url: '/api/photos/murrah_side_adult_female.jpg',
          angle: 'side',
          age: 'adult',
          gender: 'female',
          region: 'Haryana',
          features: ['black color', 'short horns', 'high milk yield'],
          description: 'Adult female Murrah buffalo showing characteristic black color',
          tags: ['dairy', 'indigenous', 'high-yield']
        },
        {
          id: 'murrah_2',
          url: '/api/photos/murrah_front_adult_male.jpg',
          angle: 'front',
          age: 'adult',
          gender: 'male',
          region: 'Haryana',
          features: ['broad chest', 'strong build', 'short curved horns'],
          description: 'Adult male Murrah buffalo front view',
          tags: ['dairy', 'indigenous', 'high-yield']
        }
      ]
    }
  };

  const breeds = Object.keys(photoDatabase);
  const allPhotos = Object.values(photoDatabase).flatMap(breed => breed.photos);

  const filteredPhotos = allPhotos.filter(photo => {
    const matchesSearch = photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || photo.tags.includes(filterType);
    const matchesAngle = filterAngle === 'all' || photo.angle === filterAngle;
    const matchesAge = filterAge === 'all' || photo.age === filterAge;
    const matchesGender = filterGender === 'all' || photo.gender === filterGender;
    
    return matchesSearch && matchesType && matchesAngle && matchesAge && matchesGender;
  });

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setZoomLevel(1);
  };

  const handlePhotoSelect = (photo) => {
    if (onPhotoSelect) {
      onPhotoSelect(photo);
    }
  };

  const handleCompareToggle = (photo) => {
    if (comparePhotos.find(p => p.id === photo.id)) {
      setComparePhotos(comparePhotos.filter(p => p.id !== photo.id));
    } else if (comparePhotos.length < 2) {
      setComparePhotos([...comparePhotos, photo]);
    } else {
      toast({
        title: t('photoDatabase.maxCompareReached'),
        description: t('photoDatabase.maxCompareReachedDesc'),
        variant: 'destructive'
      });
    }
  };

  const handleMagnifier = (e, photo) => {
    if (!showMagnifier) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifierPosition({ x, y });
  };

  const PhotoCard = ({ photo }) => (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={photo.url}
            alt={photo.description}
            className="w-full h-48 object-cover rounded-t-lg"
            onMouseMove={(e) => handleMagnifier(e, photo)}
            onMouseLeave={() => setMagnifierPosition({ x: 0, y: 0 })}
          />
          
          {showMagnifier && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle 100px at ${magnifierPosition.x}% ${magnifierPosition.y}%, transparent 0%, rgba(0,0,0,0.3) 100%)`
              }}
            />
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleCompareToggle(photo);
              }}
            >
              <GitCompare className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setShowMagnifier(!showMagnifier);
              }}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {comparePhotos.find(p => p.id === photo.id) && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                {t('photoDatabase.selected')}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{photo.description}</h3>
            <Badge variant="outline">{photo.angle}</Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{photo.region}</span>
            <Calendar className="h-4 w-4" />
            <span>{photo.age}</span>
            <Users className="h-4 w-4" />
            <span>{photo.gender}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {photo.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePhotoClick(photo);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              {t('photoDatabase.view')}
            </Button>
            
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoSelect(photo);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PhotoModal = ({ photo, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{photo.description}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <img
              src={photo.url}
              alt={photo.description}
              className="w-full max-h-96 object-contain rounded-lg"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            
            <div className="absolute bottom-4 right-4 flex gap-2 bg-white/80 p-2 rounded-lg">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoomLevel(1)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">{t('photoDatabase.characteristics')}</h3>
              <div className="flex flex-wrap gap-1">
                {photo.features.map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">{t('photoDatabase.details')}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('photoDatabase.angle')}:</span>
                  <span className="capitalize">{photo.angle}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('photoDatabase.age')}:</span>
                  <span className="capitalize">{photo.age}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('photoDatabase.gender')}:</span>
                  <span className="capitalize">{photo.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('photoDatabase.region')}:</span>
                  <span>{photo.region}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => {
                handlePhotoSelect(photo);
                onClose();
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              {t('photoDatabase.selectThisPhoto')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const ComparisonModal = ({ photos, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{t('photoDatabase.comparingPhotos')}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="text-center">
                <img
                  src={photo.url}
                  alt={photo.description}
                  className="w-full h-64 object-cover rounded-lg mb-2"
                />
                <h3 className="font-semibold">{photo.description}</h3>
                <p className="text-sm text-gray-600">{photo.region} • {photo.age} • {photo.gender}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('photoDatabase.comparisonAnalysis')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium">{t('photoDatabase.similarities')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Both are {photos[0]?.type} breeds</li>
                  <li>Similar age group</li>
                  <li>Indigenous to India</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">{t('photoDatabase.differences')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Different color patterns</li>
                  <li>Varied horn structures</li>
                  <li>Different regional origins</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('photoDatabase.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('photoDatabase.filterByType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('photoDatabase.allTypes')}</SelectItem>
              <SelectItem value="dairy">{t('photoDatabase.dairy')}</SelectItem>
              <SelectItem value="draft">{t('photoDatabase.draft')}</SelectItem>
              <SelectItem value="indigenous">{t('photoDatabase.indigenous')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterAngle} onValueChange={setFilterAngle}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('photoDatabase.angle')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('photoDatabase.allAngles')}</SelectItem>
              <SelectItem value="front">{t('photoDatabase.front')}</SelectItem>
              <SelectItem value="side">{t('photoDatabase.side')}</SelectItem>
              <SelectItem value="rear">{t('photoDatabase.rear')}</SelectItem>
              <SelectItem value="three-quarter">{t('photoDatabase.threeQuarter')}</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Select value={filterAge} onValueChange={setFilterAge}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('photoDatabase.age')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('photoDatabase.allAges')}</SelectItem>
              <SelectItem value="young">{t('photoDatabase.young')}</SelectItem>
              <SelectItem value="adult">{t('photoDatabase.adult')}</SelectItem>
              <SelectItem value="senior">{t('photoDatabase.senior')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterGender} onValueChange={setFilterGender}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('photoDatabase.gender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('photoDatabase.allGenders')}</SelectItem>
              <SelectItem value="male">{t('photoDatabase.male')}</SelectItem>
              <SelectItem value="female">{t('photoDatabase.female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Controls */}
      {comparePhotos.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-blue-600" />
              <span className="font-medium">
                {comparePhotos.length} {t('photoDatabase.photosSelected')}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setIsComparing(true)}
                disabled={comparePhotos.length !== 2}
              >
                {t('photoDatabase.compareNow')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setComparePhotos([])}
              >
                {t('photoDatabase.clearSelection')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {filteredPhotos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('photoDatabase.noPhotosFound')}
          </h3>
          <p className="text-gray-600">
            {t('photoDatabase.noPhotosFoundDesc')}
          </p>
        </div>
      )}

      {/* Modals */}
      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
      
      {isComparing && comparePhotos.length === 2 && (
        <ComparisonModal 
          photos={comparePhotos} 
          onClose={() => setIsComparing(false)} 
        />
      )}
    </div>
  );
};

export default PhotoDatabase;
