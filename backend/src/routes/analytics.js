import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all analytics routes
router.use(analyticsLimiter);

// Get overview metrics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
      params = [startDate, endDate];
    } else {
      // Default period filtering
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      dateFilter = 'WHERE created_at >= $1';
      params = [startDate.toISOString()];
    }

    // Get total identifications
    const totalQuery = `
      SELECT COUNT(*) as total_identifications
      FROM identification_results
      ${dateFilter}
    `;
    
    // Get success rate
    const successQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN confidence_score >= 0.7 THEN 1 END) as successful
      FROM identification_results
      ${dateFilter}
    `;
    
    // Get active users
    const usersQuery = `
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM identification_results
      ${dateFilter}
    `;

    const [totalResult, successResult, usersResult] = await Promise.all([
      pool.query(totalQuery, params),
      pool.query(successQuery, params),
      pool.query(usersQuery, params)
    ]);

    const totalIdentifications = parseInt(totalResult.rows[0]?.total_identifications || 0);
    const totalAttempts = parseInt(successResult.rows[0]?.total || 0);
    const successfulAttempts = parseInt(successResult.rows[0]?.successful || 0);
    const activeUsers = parseInt(usersResult.rows[0]?.active_users || 0);
    
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    // Calculate growth (mock data for now)
    const monthlyGrowth = 12.5;
    const weeklyGrowth = 3.2;

    res.json({
      success: true,
      data: {
        totalIdentifications,
        successRate: Math.round(successRate * 100) / 100,
        activeUsers,
        totalBreeds: 43, // Fixed value
        monthlyGrowth,
        weeklyGrowth
      }
    });

  } catch (error) {
    logger.error('Error fetching overview metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview metrics',
      error: error.message
    });
  }
});

// Get monthly trends
router.get('/trends/monthly', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const query = `
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as identifications,
        COUNT(CASE WHEN confidence_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*) as success_rate,
        COUNT(DISTINCT user_id) as users
      FROM identification_results
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    
    const result = await pool.query(query, [year]);
    
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthlyData = monthNames.map((month, index) => {
      const monthData = result.rows.find(row => parseInt(row.month) === index + 1);
      return {
        month,
        identifications: parseInt(monthData?.identifications || 0),
        successRate: Math.round((parseFloat(monthData?.success_rate || 0)) * 100) / 100,
        users: parseInt(monthData?.users || 0)
      };
    });

    res.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    logger.error('Error fetching monthly trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly trends',
      error: error.message
    });
  }
});

// Get breed performance
router.get('/performance/breeds', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, period = 'month' } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      dateFilter = 'WHERE ir.created_at >= $1';
      params = [startDate.toISOString()];
    }

    const query = `
      SELECT 
        ir.identified_breed as breed,
        COUNT(*) as total_identifications,
        COUNT(CASE WHEN ir.confidence_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*) as success_rate,
        AVG(ir.confidence_score) * 100 as avg_confidence
      FROM identification_results ir
      ${dateFilter}
      GROUP BY ir.identified_breed
      HAVING COUNT(*) >= 5
      ORDER BY success_rate DESC
      LIMIT $${params.length + 1}
    `;
    
    params.push(parseInt(limit));
    const result = await pool.query(query, params);
    
    const breedPerformance = result.rows.map(row => ({
      breed: row.breed,
      successRate: Math.round(parseFloat(row.success_rate) * 100) / 100,
      totalIdentifications: parseInt(row.total_identifications),
      avgConfidence: Math.round(parseFloat(row.avg_confidence) * 100) / 100
    }));

    res.json({
      success: true,
      data: breedPerformance
    });

  } catch (error) {
    logger.error('Error fetching breed performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breed performance',
      error: error.message
    });
  }
});

// Get regional performance
router.get('/performance/regional', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      dateFilter = 'WHERE ir.created_at >= $1';
      params = [startDate.toISOString()];
    }

    const query = `
      SELECT 
        u.region as state,
        COUNT(*) as identifications,
        COUNT(CASE WHEN ir.confidence_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*) as success_rate,
        COUNT(DISTINCT ir.user_id) as users
      FROM identification_results ir
      JOIN users u ON ir.user_id = u.id
      ${dateFilter}
      GROUP BY u.region
      ORDER BY identifications DESC
    `;
    
    const result = await pool.query(query, params);
    
    const regionalData = result.rows.map(row => ({
      state: row.state || 'Unknown',
      identifications: parseInt(row.identifications),
      successRate: Math.round(parseFloat(row.success_rate) * 100) / 100,
      users: parseInt(row.users)
    }));

    res.json({
      success: true,
      data: regionalData
    });

  } catch (error) {
    logger.error('Error fetching regional performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regional performance',
      error: error.message
    });
  }
});

// Get recent activity
router.get('/activity/recent', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const query = `
      SELECT 
        ir.id,
        u.username as user,
        ir.identified_breed as breed,
        ir.confidence_score,
        ir.created_at,
        CASE 
          WHEN ir.confidence_score >= 0.7 THEN 'success'
          WHEN ir.confidence_score >= 0.5 THEN 'warning'
          ELSE 'error'
        END as status
      FROM identification_results ir
      JOIN users u ON ir.user_id = u.id
      ORDER BY ir.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [parseInt(limit)]);
    
    const recentActivity = result.rows.map(row => {
      const timeDiff = Date.now() - new Date(row.created_at).getTime();
      const minutes = Math.floor(timeDiff / (1000 * 60));
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      let timeAgo;
      if (days > 0) {
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = `${minutes} min ago`;
      }
      
      return {
        id: row.id,
        user: row.user,
        action: 'Breed identified',
        breed: row.breed || 'Unknown',
        confidence: Math.round(parseFloat(row.confidence_score) * 100 * 100) / 100,
        time: timeAgo,
        status: row.status
      };
    });

    res.json({
      success: true,
      data: recentActivity
    });

  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
});

// Export analytics data
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'pdf', filters = {} } = req.body;
    
    // For now, return a mock PDF/Excel file
    // In a real implementation, you would generate actual files
    
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.pdf');
      res.send(Buffer.from('Mock PDF content'));
    } else if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.xlsx');
      res.send(Buffer.from('Mock Excel content'));
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }

  } catch (error) {
    logger.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data',
      error: error.message
    });
  }
});

// Get custom date range analytics
router.post('/custom-range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, metrics = ['overview', 'trends', 'performance'] } = req.body;
    
    const results = {};
    
    if (metrics.includes('overview')) {
      const overviewQuery = `
        SELECT 
          COUNT(*) as total_identifications,
          COUNT(CASE WHEN confidence_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*) as success_rate,
          COUNT(DISTINCT user_id) as active_users
        FROM identification_results
        WHERE created_at BETWEEN $1 AND $2
      `;
      
      const overviewResult = await pool.query(overviewQuery, [startDate, endDate]);
      results.overview = overviewResult.rows[0];
    }
    
    if (metrics.includes('trends')) {
      const trendsQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as identifications,
          COUNT(CASE WHEN confidence_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*) as success_rate
        FROM identification_results
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY DATE(created_at)
        ORDER BY date
      `;
      
      const trendsResult = await pool.query(trendsQuery, [startDate, endDate]);
      results.trends = trendsResult.rows;
    }
    
    if (metrics.includes('performance')) {
      const performanceQuery = `
        SELECT 
          identified_breed as breed,
          COUNT(*) as total_identifications,
          COUNT(CASE WHEN confidence_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*) as success_rate
        FROM identification_results
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY identified_breed
        ORDER BY success_rate DESC
      `;
      
      const performanceResult = await pool.query(performanceQuery, [startDate, endDate]);
      results.performance = performanceResult.rows;
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    logger.error('Error fetching custom range analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom range analytics',
      error: error.message
    });
  }
});

// Get real-time metrics
router.get('/realtime', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const query = `
      SELECT 
        COUNT(*) as recent_identifications,
        COUNT(CASE WHEN confidence_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*) as recent_success_rate,
        COUNT(DISTINCT user_id) as active_users_last_hour
      FROM identification_results
      WHERE created_at >= $1
    `;
    
    const result = await pool.query(query, [oneHourAgo.toISOString()]);
    
    res.json({
      success: true,
      data: {
        recentIdentifications: parseInt(result.rows[0]?.recent_identifications || 0),
        recentSuccessRate: Math.round(parseFloat(result.rows[0]?.recent_success_rate || 0) * 100) / 100,
        activeUsersLastHour: parseInt(result.rows[0]?.active_users_last_hour || 0),
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching real-time metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time metrics',
      error: error.message
    });
  }
});

// Get system health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await pool.query('SELECT NOW() as timestamp');
    
    // Get basic system metrics
    const metricsQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT user_id) as total_users,
        MAX(created_at) as last_activity
      FROM identification_results
    `;
    
    const metricsResult = await pool.query(metricsQuery);
    
    res.json({
      success: true,
      data: {
        database: {
          status: 'healthy',
          timestamp: dbCheck.rows[0].timestamp
        },
        system: {
          totalRecords: parseInt(metricsResult.rows[0]?.total_records || 0),
          totalUsers: parseInt(metricsResult.rows[0]?.total_users || 0),
          lastActivity: metricsResult.rows[0]?.last_activity,
          uptime: process.uptime()
        }
      }
    });

  } catch (error) {
    logger.error('Error checking system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check system health',
      error: error.message
    });
  }
});

export default router;
