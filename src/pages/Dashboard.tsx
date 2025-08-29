import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  BarChart3, 
  Award, 
  Wifi, 
  WifiOff, 
  Calendar,
  TrendingUp,
  BookOpen,
  Plus,
  History
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats] = useState({
    todayCount: 12,
    weekCount: 67,
    monthCount: 234,
    accuracyScore: 94,
    streak: 8,
    totalAnimals: 1247
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const recentRegistrations = [
    { id: 1, breed: 'Holstein Friesian', confidence: 96, time: '2 hours ago', verified: true },
    { id: 2, breed: 'Gir', confidence: 89, time: '4 hours ago', verified: false },
    { id: 3, breed: 'Murrah Buffalo', confidence: 94, time: '6 hours ago', verified: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-6 shadow-medium">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back!</h1>
            <p className="text-primary-foreground/80">Ready to identify more breeds?</p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="secondary" className="bg-success text-success-foreground">
                <Wifi className="w-4 h-4 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="w-4 h-4 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Quick Action */}
      <div className="p-6">
        <Button
          onClick={() => navigate('/camera')}
          className="w-full h-16 text-lg font-semibold bg-gradient-primary hover:bg-primary-hover shadow-medium touch-target"
          size="lg"
        >
          <Camera className="w-6 h-6 mr-3" />
          Identify New Breed
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="px-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Your Statistics</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.todayCount}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.weekCount}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.accuracyScore}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Registrations: {stats.monthCount}/300</span>
                <span>{Math.round((stats.monthCount / 300) * 100)}%</span>
              </div>
              <Progress value={(stats.monthCount / 300) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Great progress! You're {300 - stats.monthCount} registrations away from your monthly goal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRegistrations.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.breed}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.confidence >= 90 ? "default" : "secondary"}>
                    {item.confidence}%
                  </Badge>
                  {item.verified && (
                    <Badge variant="outline" className="text-success border-success">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              View All History
            </Button>
          </CardContent>
        </Card>

        {/* Learning Resources */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Learning Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start h-auto p-3">
                <Plus className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Breed Identification Tips</p>
                  <p className="text-sm text-muted-foreground">Learn key features to identify breeds</p>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-auto p-3">
                <Plus className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Photography Guidelines</p>
                  <p className="text-sm text-muted-foreground">Best practices for capturing images</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom padding for safe area */}
      <div className="h-20"></div>
    </div>
  );
};

export default Dashboard;