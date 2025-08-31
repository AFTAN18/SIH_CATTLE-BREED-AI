import express from 'express';
import { logger } from '../utils/logger.js';
import { validateQuery } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('day', 'week', 'month', 'quarter', 'year').default('month')
});

// Mock analytics data
const mockAnalyticsData = {
  // Monthly data
  monthly: {
    '2024-01': {
      animalsRegistered: 45,
      identificationsCompleted: 120,
      accuracyRate: 92.5,
      activeUsers: 25,
      topBreeds: ['Gir', 'Murrah', 'Sahiwal'],
      regionalData: {
        'Gujarat': { animals: 15, identifications: 40 },
        'Haryana': { animals: 12, identifications: 35 },
        'Punjab': { animals: 8, identifications: 25 },
        'Rajasthan': { animals: 10, identifications: 20 }
      }
    },
    '2024-02': {
      animalsRegistered: 52,
      identificationsCompleted: 135,
      accuracyRate: 94.2,
      activeUsers: 28,
      topBreeds: ['Gir', 'Murrah', 'Jaffarabadi'],
      regionalData: {
        'Gujarat': { animals: 18, identifications: 45 },
        'Haryana': { animals: 14, identifications: 38 },
        'Punjab': { animals: 10, identifications: 28 },
        'Rajasthan': { animals: 10, identifications: 24 }
      }
    }
  },
  
  // Weekly data
  weekly: {
    '2024-W01': { animals: 12, identifications: 30, accuracy: 91.5 },
    '2024-W02': { animals: 15, identifications: 38, accuracy: 93.2 },
    '2024-W03': { animals: 18, identifications: 42, accuracy: 94.1 },
    '2024-W04': { animals: 20, identifications: 45, accuracy: 92.8 },
    '2024-W05': { animals: 22, identifications: 48, accuracy: 95.1 },
    '2024-W06': { animals: 25, identifications: 52, accuracy: 93.7 },
    '2024-W07': { animals: 28, identifications: 55, accuracy: 94.5 },
    '2024-W08': { animals: 30, identifications: 58, accuracy: 95.2 }
  },
  
  // Daily data
  daily: {
    '2024-01-15': { animals: 3, identifications: 8, accuracy: 92.5 },
    '2024-01-16': { animals: 4, identifications: 10, accuracy: 94.2 },
    '2024-01-17': { animals: 2, identifications: 6, accuracy: 91.8 },
    '2024-01-18': { animals: 5, identifications: 12, accuracy: 93.7 },
    '2024-01-19': { animals: 3, identifications: 9, accuracy: 95.1 },
    '2024-01-20': { animals: 6, identifications: 15, accuracy: 92.3 },
    '2024-01-21': { animals: 4, identifications: 11, accuracy: 94.8 }
  }
};

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current month data
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthData = mockAnalyticsData.monthly[currentMonth] || mockAnalyticsData.monthly['2024-02'];
    
    // Calculate growth rates
    const previousMonth = '2024-01';
    const prevMonthData = mockAnalyticsData.monthly[previousMonth];
    
    const animalsGrowth = prevMonthData ? 
      Math.round(((monthData.animalsRegistered - prevMonthData.animalsRegistered) / prevMonthData.animalsRegistered) * 100 * 10) / 10 : 0;
    
    const identificationsGrowth = prevMonthData ? 
      Math.round(((monthData.identificationsCompleted - prevMonthData.identificationsCompleted) / prevMonthData.identificationsCompleted) * 100 * 10) / 10 : 0;
    
    const accuracyGrowth = prevMonthData ? 
      Math.round((monthData.accuracyRate - prevMonthData.accuracyRate) * 10) / 10 : 0;

    const overview = {
      currentMonth: {
        animalsRegistered: monthData.animalsRegistered,
        identificationsCompleted: monthData.identificationsCompleted,
        accuracyRate: monthData.accuracyRate,
        activeUsers: monthData.activeUsers
      },
      growth: {
        animals: animalsGrowth,
        identifications: identificationsGrowth,
        accuracy: accuracyGrowth
      },
      topBreeds: monthData.topBreeds,
      regionalDistribution: monthData.regionalData,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    logger.error('Failed to get dashboard overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard overview'
    });
  }
});

// Get monthly performance data
router.get('/monthly', validateQuery(dateRangeSchema), async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    // Filter data based on date range
    let filteredData = {};
    const allMonths = Object.keys(mockAnalyticsData.monthly).sort();
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      allMonths.forEach(month => {
        const monthDate = new Date(month + '-01');
        if (monthDate >= start && monthDate <= end) {
          filteredData[month] = mockAnalyticsData.monthly[month];
        }
      });
    } else {
      // Default to last 6 months
      const last6Months = allMonths.slice(-6);
      last6Months.forEach(month => {
        filteredData[month] = mockAnalyticsData.monthly[month];
      });
    }

    // Transform data for charts
    const chartData = Object.entries(filteredData).map(([month, data]) => ({
      month,
      animals: data.animalsRegistered,
      identifications: data.identificationsCompleted,
      accuracy: data.accuracyRate,
      activeUsers: data.activeUsers
    }));

    res.json({
      success: true,
      data: {
        period,
        chartData,
        summary: {
          totalAnimals: chartData.reduce((sum, item) => sum + item.animals, 0),
          totalIdentifications: chartData.reduce((sum, item) => sum + item.identifications, 0),
          averageAccuracy: Math.round(chartData.reduce((sum, item) => sum + item.accuracy, 0) / chartData.length * 10) / 10,
          averageActiveUsers: Math.round(chartData.reduce((sum, item) => sum + item.activeUsers, 0) / chartData.length)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get monthly performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monthly performance data'
    });
  }
});

// Get weekly performance data
router.get('/weekly', validateQuery(dateRangeSchema), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Filter weekly data
    let filteredData = {};
    const allWeeks = Object.keys(mockAnalyticsData.weekly).sort();
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      allWeeks.forEach(week => {
        // Convert week to date (simplified)
        const weekDate = new Date(week.replace('W', '-W'));
        if (weekDate >= start && weekDate <= end) {
          filteredData[week] = mockAnalyticsData.weekly[week];
        }
      });
    } else {
      // Default to last 8 weeks
      const last8Weeks = allWeeks.slice(-8);
      last8Weeks.forEach(week => {
        filteredData[week] = mockAnalyticsData.weekly[week];
      });
    }

    // Transform data for charts
    const chartData = Object.entries(filteredData).map(([week, data]) => ({
      week,
      animals: data.animals,
      identifications: data.identifications,
      accuracy: data.accuracy
    }));

    res.json({
      success: true,
      data: {
        chartData,
        summary: {
          totalAnimals: chartData.reduce((sum, item) => sum + item.animals, 0),
          totalIdentifications: chartData.reduce((sum, item) => sum + item.identifications, 0),
          averageAccuracy: Math.round(chartData.reduce((sum, item) => sum + item.accuracy, 0) / chartData.length * 10) / 10
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get weekly performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weekly performance data'
    });
  }
});

// Get daily performance data
router.get('/daily', validateQuery(dateRangeSchema), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Filter daily data
    let filteredData = {};
    const allDays = Object.keys(mockAnalyticsData.daily).sort();
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      allDays.forEach(day => {
        const dayDate = new Date(day);
        if (dayDate >= start && dayDate <= end) {
          filteredData[day] = mockAnalyticsData.daily[day];
        }
      });
    } else {
      // Default to last 7 days
      const last7Days = allDays.slice(-7);
      last7Days.forEach(day => {
        filteredData[day] = mockAnalyticsData.daily[day];
      });
    }

    // Transform data for charts
    const chartData = Object.entries(filteredData).map(([day, data]) => ({
      day,
      animals: data.animals,
      identifications: data.identifications,
      accuracy: data.accuracy
    }));

    res.json({
      success: true,
      data: {
        chartData,
        summary: {
          totalAnimals: chartData.reduce((sum, item) => sum + item.animals, 0),
          totalIdentifications: chartData.reduce((sum, item) => sum + item.identifications, 0),
          averageAccuracy: Math.round(chartData.reduce((sum, item) => sum + item.accuracy, 0) / chartData.length * 10) / 10
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get daily performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get daily performance data'
    });
  }
});

// Get regional performance data
router.get('/regional', async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthData = mockAnalyticsData.monthly[currentMonth] || mockAnalyticsData.monthly['2024-02'];
    
    const regionalData = Object.entries(monthData.regionalData).map(([region, data]) => ({
      region,
      animals: data.animals,
      identifications: data.identifications,
      percentage: Math.round((data.animals / monthData.animalsRegistered) * 100 * 10) / 10
    }));

    res.json({
      success: true,
      data: {
        regionalData,
        totalAnimals: monthData.animalsRegistered,
        totalIdentifications: monthData.identificationsCompleted
      }
    });
  } catch (error) {
    logger.error('Failed to get regional performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get regional performance data'
    });
  }
});

// Get breed performance data
router.get('/breeds', async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthData = mockAnalyticsData.monthly[currentMonth] || mockAnalyticsData.monthly['2024-02'];
    
    // Mock breed performance data
    const breedData = [
      { breed: 'Gir', identifications: 45, accuracy: 95.2, growth: 12.5 },
      { breed: 'Murrah', identifications: 38, accuracy: 93.8, growth: 8.7 },
      { breed: 'Sahiwal', identifications: 32, accuracy: 91.5, growth: 15.2 },
      { breed: 'Jaffarabadi', identifications: 28, accuracy: 94.1, growth: 6.3 },
      { breed: 'Red Sindhi', identifications: 25, accuracy: 89.7, growth: 18.9 }
    ];

    res.json({
      success: true,
      data: {
        breedData,
        topBreeds: monthData.topBreeds,
        totalIdentifications: monthData.identificationsCompleted
      }
    });
  } catch (error) {
    logger.error('Failed to get breed performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get breed performance data'
    });
  }
});

// Get user activity data
router.get('/user-activity', async (req, res) => {
  try {
    // Mock user activity data
    const activityData = {
      activeUsers: {
        daily: 28,
        weekly: 45,
        monthly: 67
      },
      userEngagement: {
        averageSessionDuration: 12.5, // minutes
        averageIdentificationsPerSession: 3.2,
        averageAnimalsPerSession: 1.8
      },
      userRetention: {
        day1: 85.2,
        day7: 67.8,
        day30: 45.3
      },
      topActiveUsers: [
        { userId: '1', name: 'Field Worker 1', identifications: 45, animals: 12 },
        { userId: '2', name: 'Field Worker 2', identifications: 38, animals: 10 },
        { userId: '3', name: 'Field Worker 3', identifications: 32, animals: 8 },
        { userId: '4', name: 'Field Worker 4', identifications: 28, animals: 7 },
        { userId: '5', name: 'Field Worker 5', identifications: 25, animals: 6 }
      ]
    };

    res.json({
      success: true,
      data: activityData
    });
  } catch (error) {
    logger.error('Failed to get user activity data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user activity data'
    });
  }
});

// Get system performance data
router.get('/system-performance', async (req, res) => {
  try {
    // Mock system performance data
    const systemData = {
      uptime: {
        current: 99.8,
        last24h: 99.9,
        last7d: 99.7,
        last30d: 99.5
      },
      responseTime: {
        average: 2.3, // seconds
        p95: 4.1,
        p99: 6.8
      },
      accuracy: {
        overall: 93.2,
        byBreed: {
          'Gir': 95.2,
          'Murrah': 93.8,
          'Sahiwal': 91.5,
          'Jaffarabadi': 94.1,
          'Red Sindhi': 89.7
        }
      },
      queueStatus: {
        pending: 5,
        processing: 2,
        completed: 1250,
        failed: 3
      },
      storage: {
        used: 2.8, // GB
        total: 10.0,
        images: 1250,
        database: 1.2
      }
    };

    res.json({
      success: true,
      data: systemData
    });
  } catch (error) {
    logger.error('Failed to get system performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system performance data'
    });
  }
});

// Get recent activity feed
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Mock recent activity data
    const recentActivity = [
      {
        id: '1',
        type: 'identification',
        userId: '1',
        userName: 'Field Worker 1',
        action: 'Identified Gir breed with 94.5% confidence',
        timestamp: new Date('2024-01-21T14:30:00Z'),
        metadata: {
          breed: 'Gir',
          confidence: 94.5,
          location: 'Anand, Gujarat'
        }
      },
      {
        id: '2',
        type: 'registration',
        userId: '2',
        userName: 'Field Worker 2',
        action: 'Registered new Murrah buffalo',
        timestamp: new Date('2024-01-21T13:45:00Z'),
        metadata: {
          animalName: 'Lakshmi',
          breed: 'Murrah',
          location: 'Gurgaon, Haryana'
        }
      },
      {
        id: '3',
        type: 'identification',
        userId: '3',
        userName: 'Field Worker 3',
        action: 'Identified Sahiwal breed with 87.2% confidence',
        timestamp: new Date('2024-01-21T12:15:00Z'),
        metadata: {
          breed: 'Sahiwal',
          confidence: 87.2,
          location: 'Amritsar, Punjab'
        }
      },
      {
        id: '4',
        type: 'sync',
        userId: '1',
        userName: 'Field Worker 1',
        action: 'Synced 15 offline records',
        timestamp: new Date('2024-01-21T11:30:00Z'),
        metadata: {
          recordsSynced: 15,
          syncType: 'animals'
        }
      },
      {
        id: '5',
        type: 'registration',
        userId: '4',
        userName: 'Field Worker 4',
        action: 'Registered new Gir cow',
        timestamp: new Date('2024-01-21T10:45:00Z'),
        metadata: {
          animalName: 'Radha',
          breed: 'Gir',
          location: 'Rajkot, Gujarat'
        }
      }
    ];

    res.json({
      success: true,
      data: {
        activities: recentActivity.slice(0, parseInt(limit)),
        total: recentActivity.length
      }
    });
  } catch (error) {
    logger.error('Failed to get recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent activity'
    });
  }
});

export default router;
