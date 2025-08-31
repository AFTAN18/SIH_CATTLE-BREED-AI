import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Download, 
  Star,
  MapPin,
  Calendar,
  User,
  Tag,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BREED_DATABASE } from '@/services/aiService';

interface BreedPhoto {
  id: string;
  breedName: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  tags: string[];
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  isVerified: boolean;
  verifiedBy?: string;
  uploadedBy: string;
  uploadDate: string;
  location?: string;
  metadata: {
    resolution: string;
    fileSize: string;
    camera?: string;
  };
}

const BreedPhotoDatabase: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<BreedPhoto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    generateMockPhotos();
  }, []);

  const generateMockPhotos = () => {
    const mockPhotos: BreedPhoto[] = [];
    const allBreeds = [...BREED_DATABASE.cattle, ...BREED_DATABASE.buffalo];
    
    allBreeds.forEach((breed, breedIndex) => {
      for (let i = 0; i < Math.floor(Math.random() * 8) + 3; i++) {
        const photoId = `${breedIndex}-${i}`;
        mockPhotos.push({
          id: photoId,
          breedName: breed.name,
          imageUrl: `/api/photos/${photoId}/full`,
          thumbnailUrl: `/api/photos/${photoId}/thumb`,
          caption: `${breed.name} - ${breed.characteristics[i % breed.characteristics.length]}`,
          tags: [breed.region, ...breed.characteristics.slice(0, 2)],
          quality: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
          isVerified: Math.random() > 0.3,
          verifiedBy: Math.random() > 0.5 ? `Expert_${Math.floor(Math.random() * 10)}` : undefined,
          uploadedBy: `User_${Math.floor(Math.random() * 100)}`,
          uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          location: `${breed.region}, India`,
          metadata: {
            resolution: ['1920x1080', '1280x720', '2048x1536'][Math.floor(Math.random() * 3)],
            fileSize: `${(Math.random() * 5 + 1).toFixed(1)}MB`,
            camera: Math.random() > 0.5 ? 'Mobile Camera' : 'DSLR'
          }
        });
      }
    });
    
    setPhotos(mockPhotos);
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.breedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBreed = selectedBreed === 'all' || photo.breedName === selectedBreed;
    const matchesQuality = qualityFilter === 'all' || photo.quality === qualityFilter;
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && photo.isVerified) ||
                               (verificationFilter === 'unverified' && !photo.isVerified);
    
    return matchesSearch && matchesBreed && matchesQuality && matchesVerification;
  });

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      // Mock upload process
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading ${file.name}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      }
      console.log('All files uploaded successfully');
      generateMockPhotos(); // Refresh photos
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getQualityBadge = (quality: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      fair: 'outline',
      poor: 'destructive'
    };
    return <Badge variant={variants[quality as keyof typeof variants] || 'secondary'}>{quality}</Badge>;
  };

  const allBreeds = [...new Set([...BREED_DATABASE.cattle, ...BREED_DATABASE.buffalo].map(b => b.name))];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Breed Photo Database</h1>
          <p className="text-gray-600">Comprehensive photo collection for all cattle and buffalo breeds</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button asChild disabled={isUploading}>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Photos'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{photos.length}</div>
            <p className="text-sm text-gray-600">Total Photos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {photos.filter(p => p.isVerified).length}
            </div>
            <p className="text-sm text-gray-600">Verified Photos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {allBreeds.length}
            </div>
            <p className="text-sm text-gray-600">Breeds Covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {photos.filter(p => p.quality === 'excellent').length}
            </div>
            <p className="text-sm text-gray-600">High Quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by breed, caption, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Breeds</SelectItem>
                  {allBreeds.map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
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
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {filteredPhotos.length} photos found
            </p>
            {selectedPhotos.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedPhotos.length} selected
                </span>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verify
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' 
        : 'space-y-4'
      }>
        {filteredPhotos.map((photo) => (
          <Card 
            key={photo.id} 
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedPhotos.includes(photo.id) ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => togglePhotoSelection(photo.id)}
          >
            {viewMode === 'grid' ? (
              <>
                {/* Grid View */}
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{photo.breedName}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{photo.breedName}</h4>
                      {photo.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">{photo.caption}</p>
                    
                    <div className="flex items-center justify-between">
                      {getQualityBadge(photo.quality)}
                      <span className="text-xs text-gray-500">
                        {new Date(photo.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {photo.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{photo.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                {/* List View */}
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">{photo.breedName.slice(0, 3)}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{photo.breedName}</h4>
                        {photo.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {getQualityBadge(photo.quality)}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">{photo.caption}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {photo.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(photo.uploadDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {photo.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Upload Modal Trigger */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Photos</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
          <TabsTrigger value="manage">Manage Database</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {/* Already showing the photo grid above */}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Photos</CardTitle>
              <CardDescription>Add high-quality photos to improve breed identification accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Upload Breed Photos</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop photos here or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload">
                  <Button asChild disabled={isUploading}>
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Upload Guidelines</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use high-resolution images (minimum 1024x768)</li>
                  <li>• Ensure good lighting and clear view of the animal</li>
                  <li>• Include multiple angles and poses when possible</li>
                  <li>• Add descriptive captions and relevant tags</li>
                  <li>• Verify breed accuracy before uploading</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Manage photo quality, verification, and organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h4 className="font-medium mb-2">Quality Review</h4>
                  <p className="text-sm text-gray-600 mb-3">Review and approve photo quality</p>
                  <Button size="sm" variant="outline">Start Review</Button>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <Star className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                  <h4 className="font-medium mb-2">Verification</h4>
                  <p className="text-sm text-gray-600 mb-3">Verify breed accuracy</p>
                  <Button size="sm" variant="outline">Start Verification</Button>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <Tag className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h4 className="font-medium mb-2">Tag Management</h4>
                  <p className="text-sm text-gray-600 mb-3">Organize and manage tags</p>
                  <Button size="sm" variant="outline">Manage Tags</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BreedPhotoDatabase;
