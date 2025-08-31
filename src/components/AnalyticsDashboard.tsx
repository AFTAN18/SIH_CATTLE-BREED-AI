import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, RefreshCw, TrendingUp, TrendingDown, Users, Camera, Target, Award } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  monthly: {
    totalIdentifications: number;
    successRate: number;
    activeUsers: number;
    totalBreeds: number;
    monthlyTrend: Array<{ month: string; identifications: number; accuracy: number }>;
  };
  weekly: {
    dailyStats: Array<{ day: string; identifications: number; accuracy: number; users: number }>;
    breedPerformance: Array<{ breed: string; count: number; avgConfidence: number }>;
  };
  regional: {
    stateData: Array<{ state: string; identifications: number; accuracy: number; users: number }>;
    heatmapData: Array<{ region: string; value: number; color: string }>;
  };
  realtime: {
    recentActivity: Array<{ 
      id: string; 
      breed: string; 
      confidence: number; 
      timestamp: string; 
      user: string; 
      location: string;
      status: 'confirmed' | 'pending' | 'disputed';
    }>;
    liveStats: {
      identificationsToday: number;
      averageResponseTime: number;
      systemUptime: number;
      errorRate: number;
    };
  };
}

const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Mock data generation for demonstration
  useEffect(() => {
    const generateMockData = (): AnalyticsData => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const breeds = ['Gir', 'Sahiwal', 'Murrah', 'Red Sindhi', 'Tharparkar', 'Jaffarabadi'];
      const states = ['Gujarat', 'Punjab', 'Haryana', 'Rajasthan', 'Maharashtra', 'Karnataka'];

      return {
        monthly: {
          totalIdentifications: 15420,
          successRate: 92.5,
          activeUsers: 1250,
          totalBreeds: 43,
          monthlyTrend: months.map(month => ({
            month,
            identifications: Math.floor(Math.random() * 3000) + 2000,
            accuracy: Math.floor(Math.random() * 10) + 85
          }))
        },
        weekly: {
          dailyStats: days.map(day => ({
            day,
            identifications: Math.floor(Math.random() * 200) + 100,
            accuracy: Math.floor(Math.random() * 15) + 80,
            users: Math.floor(Math.random() * 50) + 30
          })),
          breedPerformance: breeds.map(breed => ({
            breed,
            count: Math.floor(Math.random() * 500) + 100,
            avgConfidence: Math.floor(Math.random() * 20) + 75
          }))
        },
        regional: {
          stateData: states.map(state => ({
            state,
            identifications: Math.floor(Math.random() * 2000) + 500,
            accuracy: Math.floor(Math.random() * 15) + 80,
            users: Math.floor(Math.random() * 200) + 50
          })),
          heatmapData: states.map(region => ({
            region,
            value: Math.floor(Math.random() * 100),
            color: `hsl(${Math.random() * 120}, 70%, 50%)`
          }))
        },
        realtime: {
          recentActivity: Array.from({ length: 10 }, (_, i) => ({
            id: `act_${i}`,
            breed: breeds[Math.floor(Math.random() * breeds.length)],
            confidence: Math.floor(Math.random() * 30) + 70,
            timestamp: new Date(Date.now() - i * 300000).toISOString(),
            user: `FLW_${Math.floor(Math.random() * 1000)}`,
            location: states[Math.floor(Math.random() * states.length)],
            status: ['confirmed', 'pending', 'disputed'][Math.floor(Math.random() * 3)] as any
          })),
          liveStats: {
            identificationsToday: 342,
            averageResponseTime: 2.8,
            systemUptime: 99.7,
            errorRate: 1.2
          }
        }
      };
    };

    setTimeout(() => {
      setAnalyticsData(generateMockData());
      setIsLoading(false);
    }, 1000);
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportData = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    console.log(`Exporting data as ${format}`);
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { monthly, weekly, regional, realtime } = analyticsData;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
          <p className="text-gray-600">{t('analytics.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t('analytics.week')}</SelectItem>
              <SelectItem value="month">{t('analytics.month')}</SelectItem>
              <SelectItem value="quarter">{t('analytics.quarter')}</SelectItem>
              <SelectItem value="year">{t('analytics.year')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.refresh')}
          </Button>
          
          <Button onClick={() => exportData('pdf')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.exportPDF')}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalIdentifications')}</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthly.totalIdentifications.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% {t('analytics.fromLastMonth')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.successRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthly.successRate}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.3% {t('analytics.fromLastMonth')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.activeUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthly.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.1% {t('analytics.fromLastMonth')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.breedsSupported')}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthly.totalBreeds}</div>
            <div className="text-xs text-gray-600">
              30 Cattle + 13 Buffalo
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
          <TabsTrigger value="performance">{t('analytics.performance')}</TabsTrigger>
          <TabsTrigger value="regional">{t('analytics.regional')}</TabsTrigger>
          <TabsTrigger value="activity">{t('analytics.activity')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.monthlyTrends')}</CardTitle>
                <CardDescription>{t('analytics.monthlyTrendsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthly.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="identifications" 
                      stackId="1"
                      stroke="#16a34a" 
                      fill="#16a34a" 
                      fillOpacity={0.3}
                      name="Identifications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.successRateTrend')}</CardTitle>
                <CardDescription>{t('analytics.successRateTrendDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthly.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Live Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Live System Statistics</CardTitle>
              <CardDescription>Real-time performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{realtime.liveStats.identificationsToday}</div>
                  <p className="text-sm text-gray-600">Identifications Today</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{realtime.liveStats.averageResponseTime}s</div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{realtime.liveStats.systemUptime}%</div>
                  <p className="text-sm text-gray-600">System Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{realtime.liveStats.errorRate}%</div>
                  <p className="text-sm text-gray-600">Error Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.breedPerformance')}</CardTitle>
                <CardDescription>Top performing breeds by identification count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weekly.breedPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="breed" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#16a34a" name="Identifications" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Pattern</CardTitle>
                <CardDescription>Daily identification patterns throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weekly.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="identifications" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      name="Identifications"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Breed Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breed Performance</CardTitle>
              <CardDescription>Comprehensive breed identification statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">{t('analytics.breed')}</th>
                      <th className="text-left p-3">{t('analytics.identifications')}</th>
                      <th className="text-left p-3">{t('analytics.avgConfidence')}</th>
                      <th className="text-left p-3">Success Rate</th>
                      <th className="text-left p-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekly.breedPerformance.map((breed, index) => (
                      <tr key={breed.breed} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{breed.breed}</td>
                        <td className="p-3">{breed.count}</td>
                        <td className="p-3">{breed.avgConfidence}%</td>
                        <td className="p-3">
                          <Badge variant={breed.avgConfidence > 85 ? 'default' : 'secondary'}>
                            {breed.avgConfidence > 85 ? 'High' : 'Medium'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {Math.random() > 0.5 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.regionalPerformance')}</CardTitle>
                <CardDescription>State-wise identification statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regional.stateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="identifications" fill="#16a34a" name="Identifications" />
                    <Bar dataKey="users" fill="#2563eb" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Geographic spread of system usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regional.heatmapData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, value }) => `${region}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {regional.heatmapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.recentActivity')}</CardTitle>
              <CardDescription>Latest identification activities across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realtime.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.breed}</p>
                        <p className="text-sm text-gray-600">
                          {activity.user} • {activity.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          activity.status === 'confirmed' ? 'default' : 
                          activity.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {activity.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.confidence}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        {t('analytics.lastUpdated')}: {lastUpdated.toLocaleString()}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
