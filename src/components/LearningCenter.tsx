import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Book, 
  Camera, 
  Award, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Trophy,
  Target,
  Eye,
  Lightbulb,
  MapPin,
  Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BREED_DATABASE } from '@/services/aiService';

const LearningCenter: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tutorials');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);

  const breedGuides = [
    ...BREED_DATABASE.cattle.map(breed => ({
      breed: breed.name,
      category: 'cattle' as const,
      region: breed.region,
      characteristics: breed.characteristics
    })),
    ...BREED_DATABASE.buffalo.map(breed => ({
      breed: breed.name,
      category: 'buffalo' as const,
      region: breed.region,
      characteristics: breed.characteristics
    }))
  ];

  const filteredBreeds = breedGuides.filter(breed => {
    const matchesSearch = breed.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         breed.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || breed.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const learningModules = [
    {
      id: 'camera-basics',
      title: 'Camera Basics',
      description: 'Learn photography techniques for breed identification',
      difficulty: 'beginner',
      duration: 15,
      category: 'camera',
      completed: false
    },
    {
      id: 'breed-identification',
      title: 'Breed Identification',
      description: 'Master systematic breed identification methods',
      difficulty: 'intermediate',
      duration: 25,
      category: 'identification',
      completed: false
    },
    {
      id: 'anatomy-guide',
      title: 'Anatomy Guide',
      description: 'Understand key anatomical features',
      difficulty: 'intermediate',
      duration: 20,
      category: 'anatomy',
      completed: false
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('learning.title')}</h1>
        <p className="text-gray-600">{t('learning.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="breeds">Breed Guide</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {module.category === 'camera' && <Camera className="w-5 h-5 text-blue-500" />}
                      {module.category === 'identification' && <Eye className="w-5 h-5 text-green-500" />}
                      {module.category === 'anatomy' && <Target className="w-5 h-5 text-purple-500" />}
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    {module.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant={
                        module.difficulty === 'beginner' ? 'secondary' :
                        module.difficulty === 'intermediate' ? 'default' : 'destructive'
                      }>
                        {module.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        {module.duration} min
                      </div>
                    </div>
                    
                    <Button className="w-full" variant={module.completed ? 'outline' : 'default'}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      {module.completed ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breeds" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search breeds by name, origin, or characteristics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Breeds</SelectItem>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="buffalo">Buffalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Available Breeds</CardTitle>
                  <CardDescription>{filteredBreeds.length} breeds found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredBreeds.map((breed) => (
                      <div
                        key={breed.breed}
                        onClick={() => setSelectedBreed(breed.breed)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedBreed === breed.breed 
                            ? 'bg-green-100 border-2 border-green-500' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{breed.breed}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {breed.region}
                            </p>
                          </div>
                          <Badge variant={breed.category === 'cattle' ? 'default' : 'secondary'}>
                            {breed.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {selectedBreed ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{selectedBreed}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Key Characteristics</h4>
                        <div className="flex flex-wrap gap-2">
                          {filteredBreeds.find(b => b.breed === selectedBreed)?.characteristics.map((char, index) => (
                            <Badge key={index} variant="outline">{char}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Select a Breed</h3>
                    <p className="text-gray-600">Choose a breed to view detailed information</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card>
            <CardContent className="text-center py-12">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Quizzes Coming Soon</h3>
              <p className="text-gray-600">Interactive quizzes and assessments will be available soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Achievements System</h3>
              <p className="text-gray-600">Track your progress and earn badges for your expertise</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningCenter;
