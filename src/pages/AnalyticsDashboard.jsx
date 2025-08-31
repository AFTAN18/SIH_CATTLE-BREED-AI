import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  Camera, 
  Target, 
  MapPin,
  Download,
  Calendar,
  Activity,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for analytics
const mockAnalyticsData = {
  overview: {
    totalIdentifications: 1247,
    successRate: 89.2,
    activeUsers: 156,
    totalBreeds: 43,
    monthlyGrowth: 12.5,
    weeklyGrowth: 3.2
  },
  monthlyData: [
    { month: 'Jan', identifications: 89, successRate: 85.2, users: 23 },
    { month: 'Feb', identifications: 124, successRate: 87.1, users: 34 },
    { month: 'Mar', identifications: 156, successRate: 88.9, users: 45 },
    { month: 'Apr', identifications: 198, successRate: 89.2, users: 56 },
    { month: 'May', identifications: 234, successRate: 90.1, users: 67 },
    { month: 'Jun', identifications: 267, successRate: 89.8, users: 78 },
    { month: 'Jul', identifications: 289, successRate: 91.2, users: 89 },
    { month: 'Aug', identifications: 312, successRate: 92.1, users: 98 },
    { month: 'Sep', identifications: 345, successRate: 91.8, users: 112 },
    { month: 'Oct', identifications: 378, successRate: 92.5, users: 134 },
    { month: 'Nov', identifications: 412, successRate: 93.1, users: 145 },
    { month: 'Dec', identifications: 445, successRate: 93.8, users: 156 }
  ],
  breedPerformance: [
    { breed: 'Gir', successRate: 94.2, totalIdentifications: 156, avgConfidence: 87.5 },
    { breed: 'Sahiwal', successRate: 91.8, totalIdentifications: 134, avgConfidence: 85.2 },
    { breed: 'Murrah', successRate: 89.5, totalIdentifications: 123, avgConfidence: 82.1 },
    { breed: 'Jaffarabadi', successRate: 87.3, totalIdentifications: 98, avgConfidence: 79.8 },
    { breed: 'Red Sindhi', successRate: 85.9, totalIdentifications: 87, avgConfidence: 77.4 },
    { breed: 'Tharparkar', successRate: 83.2, totalIdentifications: 76, avgConfidence: 75.1 },
    { breed: 'Kankrej', successRate: 81.7, totalIdentifications: 65, avgConfidence: 72.8 },
    { breed: 'Ongole', successRate: 79.4, totalIdentifications: 54, avgConfidence: 70.5 }
  ],
  regionalData: [
    { state: 'Gujarat', identifications: 234, successRate: 92.1, users: 45 },
    { state: 'Rajasthan', identifications: 198, successRate: 89.5, users: 38 },
    { state: 'Maharashtra', identifications: 167, successRate: 87.8, users: 32 },
    { state: 'Karnataka', identifications: 145, successRate: 86.2, users: 28 },
    { state: 'Tamil Nadu', identifications: 123, successRate: 84.9, users: 25 },
    { state: 'Andhra Pradesh', identifications: 98, successRate: 83.1, users: 20 },
    { state: 'Telangana', identifications: 87, successRate: 81.7, users: 18 },
    { state: 'Kerala', identifications: 76, successRate: 80.2, users: 15 }
  ],
  recentActivity: [
    { id: 1, user: 'FLW_001', action: 'Breed identified', breed: 'Gir', confidence: 94.2, time: '2 min ago', status: 'success' },
    { id: 2, user: 'FLW_045', action: 'Breed identified', breed: 'Sahiwal', confidence: 87.1, time: '5 min ago', status: 'success' },
    { id: 3, user: 'FLW_023', action: 'Breed identified', breed: 'Murrah', confidence: 82.5, time: '8 min ago', status: 'success' },
    { id: 4, user: 'FLW_067', action: 'Low confidence', breed: 'Unknown', confidence: 45.2, time: '12 min ago', status: 'warning' },
    { id: 5, user: 'FLW_089', action: 'Breed identified', breed: 'Jaffarabadi', confidence: 91.8, time: '15 min ago', status: 'success' },
    { id: 6, user: 'FLW_034', action: 'Breed identified', breed: 'Red Sindhi', confidence: 88.7, time: '18 min ago', status: 'success' },
    { id: 7, user: 'FLW_056', action: 'Failed identification', breed: 'Unknown', confidence: 23.1, time: '22 min ago', status: 'error' },
    { id: 8, user: 'FLW_078', action: 'Breed identified', breed: 'Tharparkar', confidence: 85.9, time: '25 min ago', status: 'success' }
  ]
};

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date()
  });

  const getGrowthIcon = (value) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportData = (format) => {
    // Mock export functionality
    console.log(`Exporting data in ${format} format`);
    // In real implementation, this would generate and download the file
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('analytics.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.exportPDF')}
          </Button>
          <Button variant="outline" onClick={() => exportData('excel')}>
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.exportExcel')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{t('analytics.period')}:</span>
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
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{t('analytics.region')}:</span>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('analytics.allRegions')}</SelectItem>
                  <SelectItem value="gujarat">Gujarat</SelectItem>
                  <SelectItem value="rajasthan">Rajasthan</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.totalIdentifications')}
              </CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.overview.totalIdentifications.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getGrowthIcon(mockAnalyticsData.overview.monthlyGrowth)}
                <span className="ml-1">{mockAnalyticsData.overview.monthlyGrowth}% {t('analytics.fromLastMonth')}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.successRate')}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.overview.successRate}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getGrowthIcon(2.1)}
                <span className="ml-1">+2.1% {t('analytics.fromLastMonth')}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.activeUsers')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.overview.activeUsers}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getGrowthIcon(mockAnalyticsData.overview.weeklyGrowth)}
                <span className="ml-1">+{mockAnalyticsData.overview.weeklyGrowth}% {t('analytics.fromLastWeek')}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.totalBreeds')}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.overview.totalBreeds}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{t('analytics.breedsSupported')}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
          <TabsTrigger value="performance">{t('analytics.performance')}</TabsTrigger>
          <TabsTrigger value="regional">{t('analytics.regional')}</TabsTrigger>
          <TabsTrigger value="activity">{t('analytics.activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('analytics.monthlyTrends')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('analytics.chartPlaceholder')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('analytics.monthlyTrendsDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  {t('analytics.successRateTrend')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('analytics.chartPlaceholder')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('analytics.successRateTrendDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t('analytics.breedPerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('analytics.breed')}</th>
                      <th className="text-left p-2">{t('analytics.successRate')}</th>
                      <th className="text-left p-2">{t('analytics.totalIdentifications')}</th>
                      <th className="text-left p-2">{t('analytics.avgConfidence')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAnalyticsData.breedPerformance.map((breed, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 font-medium">{breed.breed}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${breed.successRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{breed.successRate}%</span>
                          </div>
                        </td>
                        <td className="p-2">{breed.totalIdentifications}</td>
                        <td className="p-2">{breed.avgConfidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Heat Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t('analytics.regionalHeatmap')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('analytics.chartPlaceholder')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('analytics.regionalHeatmapDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {t('analytics.regionalPerformance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.regionalData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.state}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {region.identifications} {t('analytics.identifications')} • {region.users} {t('analytics.users')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{region.successRate}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t('analytics.successRate')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t('analytics.recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(activity.status)}
                      <div>
                        <p className="font-medium">
                          {activity.user} - {activity.action}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.breed} • {activity.confidence}% {t('analytics.confidence')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.time}
                      </p>
                      <Badge variant={activity.status === 'success' ? 'default' : activity.status === 'warning' ? 'secondary' : 'destructive'}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
