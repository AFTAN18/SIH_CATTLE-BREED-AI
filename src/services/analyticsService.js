import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AnalyticsService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/analytics`,
      timeout: 10000,
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get overview metrics
  async getOverviewMetrics(period = 'month', dateRange = null) {
    try {
      const params = { period };
      if (dateRange) {
        params.startDate = dateRange.from;
        params.endDate = dateRange.to;
      }
      
      const response = await this.api.get('/overview', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching overview metrics:', error);
      throw error;
    }
  }

  // Get monthly trends data
  async getMonthlyTrends(year = new Date().getFullYear()) {
    try {
      const response = await this.api.get('/trends/monthly', { params: { year } });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      throw error;
    }
  }

  // Get breed performance data
  async getBreedPerformance(limit = 10, period = 'month') {
    try {
      const response = await this.api.get('/performance/breeds', { 
        params: { limit, period } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching breed performance:', error);
      throw error;
    }
  }

  // Get regional performance data
  async getRegionalPerformance(period = 'month') {
    try {
      const response = await this.api.get('/performance/regional', { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching regional performance:', error);
      throw error;
    }
  }

  // Get recent activity feed
  async getRecentActivity(limit = 20) {
    try {
      const response = await this.api.get('/activity/recent', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Get user performance metrics
  async getUserPerformance(userId, period = 'month') {
    try {
      const response = await this.api.get(`/performance/users/${userId}`, { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user performance:', error);
      throw error;
    }
  }

  // Get identification success rates
  async getSuccessRates(period = 'month', breed = null) {
    try {
      const params = { period };
      if (breed) params.breed = breed;
      
      const response = await this.api.get('/metrics/success-rates', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching success rates:', error);
      throw error;
    }
  }

  // Get usage patterns
  async getUsagePatterns(period = 'month') {
    try {
      const response = await this.api.get('/patterns/usage', { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching usage patterns:', error);
      throw error;
    }
  }

  // Get geographic distribution
  async getGeographicDistribution(period = 'month') {
    try {
      const response = await this.api.get('/geographic/distribution', { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching geographic distribution:', error);
      throw error;
    }
  }

  // Export analytics data
  async exportData(format = 'pdf', filters = {}) {
    try {
      const response = await this.api.post('/export', {
        format,
        filters,
        timestamp: new Date().toISOString()
      }, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Get custom date range analytics
  async getCustomRangeAnalytics(startDate, endDate, metrics = ['overview', 'trends', 'performance']) {
    try {
      const response = await this.api.post('/custom-range', {
        startDate,
        endDate,
        metrics
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching custom range analytics:', error);
      throw error;
    }
  }

  // Get real-time metrics
  async getRealTimeMetrics() {
    try {
      const response = await this.api.get('/realtime');
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }

  // Get comparison data
  async getComparisonData(period1, period2, metrics = ['identifications', 'successRate']) {
    try {
      const response = await this.api.post('/comparison', {
        period1,
        period2,
        metrics
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      throw error;
    }
  }

  // Get predictive analytics
  async getPredictiveAnalytics(period = 'month', forecastDays = 30) {
    try {
      const response = await this.api.get('/predictive', { 
        params: { period, forecastDays } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching predictive analytics:', error);
      throw error;
    }
  }

  // Get audit logs
  async getAuditLogs(filters = {}, page = 1, limit = 50) {
    try {
      const response = await this.api.get('/audit-logs', { 
        params: { ...filters, page, limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  // Get system health metrics
  async getSystemHealth() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  // Get performance benchmarks
  async getPerformanceBenchmarks() {
    try {
      const response = await this.api.get('/benchmarks');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance benchmarks:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeToUpdates(callback) {
    // In a real implementation, this would use WebSocket or Server-Sent Events
    const eventSource = new EventSource(`${API_BASE_URL}/api/analytics/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing real-time update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real-time update error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }

  // Mock data for development/testing
  getMockData() {
    return {
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
  }
}

export default new AnalyticsService();
