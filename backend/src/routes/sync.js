import express from 'express';
import { logger } from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';
import Joi from 'joi';
import { addDataSyncJob } from '../utils/queue.js';

const router = express.Router();

// Validation schemas
const syncDataSchema = Joi.object({
  type: Joi.string().valid('animals', 'identifications', 'all').required(),
  data: Joi.array().items(Joi.object()).required(),
  lastSyncTimestamp: Joi.date().iso().optional(),
  deviceInfo: Joi.object({
    deviceId: Joi.string().required(),
    platform: Joi.string().optional(),
    appVersion: Joi.string().optional(),
    networkType: Joi.string().optional()
  }).optional()
});

// Mock sync database
let syncRecords = [
  {
    id: '1',
    userId: '1',
    type: 'animals',
    status: 'completed',
    recordsProcessed: 5,
    recordsCreated: 3,
    recordsUpdated: 2,
    recordsFailed: 0,
    syncTimestamp: new Date('2024-01-15T10:30:00Z'),
    deviceInfo: {
      deviceId: 'device_001',
      platform: 'Android',
      appVersion: '1.0.0',
      networkType: 'WiFi'
    },
    createdAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    userId: '1',
    type: 'identifications',
    status: 'completed',
    recordsProcessed: 10,
    recordsCreated: 8,
    recordsUpdated: 2,
    recordsFailed: 0,
    syncTimestamp: new Date('2024-01-16T14:15:00Z'),
    deviceInfo: {
      deviceId: 'device_001',
      platform: 'Android',
      appVersion: '1.0.0',
      networkType: '4G'
    },
    createdAt: new Date('2024-01-16T14:15:00Z')
  }
];

// Get sync status
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get last sync record for user
    const lastSync = syncRecords
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.syncTimestamp) - new Date(a.syncTimestamp))[0];

    // Get pending sync count (mock data)
    const pendingCount = Math.floor(Math.random() * 10);

    const syncStatus = {
      lastSync: lastSync ? {
        timestamp: lastSync.syncTimestamp,
        type: lastSync.type,
        status: lastSync.status,
        recordsProcessed: lastSync.recordsProcessed
      } : null,
      pendingCount,
      isOnline: true, // Mock online status
      canSync: true,
      lastChecked: new Date().toISOString()
    };

    res.json({
      success: true,
      data: syncStatus
    });
  } catch (error) {
    logger.error('Failed to get sync status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sync status'
    });
  }
});

// Upload offline data for sync
router.post('/upload', validateRequest(syncDataSchema), async (req, res) => {
  try {
    const { type, data, lastSyncTimestamp, deviceInfo } = req.body;
    const userId = req.user.id;

    logger.info('Starting data sync upload', {
      userId,
      type,
      recordCount: data.length,
      deviceInfo
    });

    // Add sync job to queue
    const job = await addDataSyncJob(userId, data, type);

    // Create sync record
    const syncRecord = {
      id: (syncRecords.length + 1).toString(),
      userId,
      type,
      status: 'processing',
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      syncTimestamp: new Date(),
      deviceInfo,
      jobId: job.id,
      createdAt: new Date()
    };

    syncRecords.push(syncRecord);

    res.json({
      success: true,
      data: {
        syncId: syncRecord.id,
        jobId: job.id,
        status: 'processing',
        message: 'Data sync job queued successfully'
      }
    });
  } catch (error) {
    logger.error('Failed to upload sync data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload sync data',
      message: error.message
    });
  }
});

// Download server data for offline use
router.get('/download', async (req, res) => {
  try {
    const { type, lastSyncTimestamp } = req.query;
    const userId = req.user.id;

    logger.info('Starting data download for offline use', {
      userId,
      type,
      lastSyncTimestamp
    });

    // Mock data to download
    let downloadData = {};

    if (type === 'animals' || type === 'all') {
      // Mock animal data
      downloadData.animals = [
        {
          id: '1',
          name: 'Lakshmi',
          breedId: 'gir',
          species: 'Cattle',
          age: 5,
          gender: 'Female',
          weight: 450,
          color: 'Reddish brown',
          location: {
            latitude: 23.0225,
            longitude: 72.5714,
            address: 'Village Farm, Gujarat',
            village: 'Anand',
            district: 'Anand',
            state: 'Gujarat'
          },
          owner: {
            name: 'Rajesh Patel',
            phone: '+91-9876543210',
            address: 'Farm House, Anand, Gujarat'
          },
          health: {
            status: 'Healthy',
            vaccinations: ['FMD', 'Brucellosis'],
            lastCheckup: new Date('2024-01-10')
          },
          images: ['animal_1_1.jpg', 'animal_1_2.jpg'],
          notes: 'High milk producer, docile temperament',
          registeredBy: '1',
          registeredAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        }
      ];
    }

    if (type === 'identifications' || type === 'all') {
      // Mock identification data
      downloadData.identifications = [
        {
          id: '1',
          userId: '1',
          imageUrl: 'identification_1.jpg',
          viewType: 'side',
          results: [
            {
              breed: 'Gir',
              confidence: 94.5,
              species: 'Cattle',
              origin: 'Gujarat, India',
              avgWeight: '400-500 kg',
              milkYield: '12-18 L/day',
              features: ['Distinctive hump', 'Pendulous ears', 'Docile nature'],
              characteristics: ['Disease resistant', 'Tropical climate adapted', 'Good draught animal']
            }
          ],
          selectedBreed: 'Gir',
          confidence: 94.5,
          processingTime: 2500,
          modelVersion: 'v1.0.0',
          status: 'completed',
          createdAt: new Date('2024-01-15T10:30:00Z'),
          updatedAt: new Date('2024-01-15T10:30:00Z')
        }
      ];
    }

    if (type === 'breeds' || type === 'all') {
      // Mock breed data (simplified)
      downloadData.breeds = {
        gir: {
          id: 'gir',
          name: 'Gir',
          species: 'Cattle',
          origin: 'Gujarat, India',
          features: ['Distinctive hump', 'Pendulous ears', 'Docile nature'],
          avgWeight: '400-500 kg',
          milkYield: '12-18 L/day'
        },
        murrah: {
          id: 'murrah',
          name: 'Murrah',
          species: 'Buffalo',
          origin: 'Haryana, India',
          features: ['Black color', 'Short horns', 'High milk yield'],
          avgWeight: '450-550 kg',
          milkYield: '15-20 L/day'
        }
      };
    }

    res.json({
      success: true,
      data: {
        type,
        records: downloadData,
        downloadTimestamp: new Date().toISOString(),
        totalRecords: Object.keys(downloadData).reduce((sum, key) => 
          sum + (Array.isArray(downloadData[key]) ? downloadData[key].length : 0), 0
        )
      }
    });
  } catch (error) {
    logger.error('Failed to download data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download data',
      message: error.message
    });
  }
});

// Get sync history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
    const userSyncRecords = syncRecords
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRecords = userSyncRecords.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userSyncRecords.length,
          totalPages: Math.ceil(userSyncRecords.length / limit),
          hasNext: endIndex < userSyncRecords.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get sync history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sync history'
    });
  }
});

// Get sync statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userSyncRecords = syncRecords.filter(record => record.userId === userId);
    
    const totalSyncs = userSyncRecords.length;
    const successfulSyncs = userSyncRecords.filter(record => record.status === 'completed').length;
    const failedSyncs = userSyncRecords.filter(record => record.status === 'failed').length;
    
    const totalRecordsProcessed = userSyncRecords.reduce((sum, record) => sum + record.recordsProcessed, 0);
    const totalRecordsCreated = userSyncRecords.reduce((sum, record) => sum + record.recordsCreated, 0);
    const totalRecordsUpdated = userSyncRecords.reduce((sum, record) => sum + record.recordsUpdated, 0);
    const totalRecordsFailed = userSyncRecords.reduce((sum, record) => sum + record.recordsFailed, 0);

    // Sync by type
    const syncByType = userSyncRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {});

    // Recent sync activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSyncs = userSyncRecords.filter(record => 
      new Date(record.createdAt) > sevenDaysAgo
    ).length;

    const syncStats = {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      successRate: totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100 * 10) / 10 : 0,
      totalRecordsProcessed,
      totalRecordsCreated,
      totalRecordsUpdated,
      totalRecordsFailed,
      syncByType,
      recentSyncs,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: syncStats
    });
  } catch (error) {
    logger.error('Failed to get sync statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sync statistics'
    });
  }
});

// Force sync (admin only)
router.post('/force', async (req, res) => {
  try {
    const { userId, type } = req.body;
    
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    logger.info('Force sync initiated', { adminUserId: req.user.id, targetUserId: userId, type });

    // Add force sync job to queue
    const job = await addDataSyncJob(userId, [], type);

    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Force sync job queued successfully'
      }
    });
  } catch (error) {
    logger.error('Failed to force sync:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to force sync',
      message: error.message
    });
  }
});

// Resolve sync conflicts
router.post('/resolve-conflicts', async (req, res) => {
  try {
    const { conflicts, resolution } = req.body;
    const userId = req.user.id;

    logger.info('Resolving sync conflicts', {
      userId,
      conflictCount: conflicts.length,
      resolution
    });

    // Mock conflict resolution
    const resolvedConflicts = conflicts.map(conflict => ({
      ...conflict,
      resolved: true,
      resolution,
      resolvedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      data: {
        resolvedConflicts,
        message: 'Conflicts resolved successfully'
      }
    });
  } catch (error) {
    logger.error('Failed to resolve conflicts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve conflicts',
      message: error.message
    });
  }
});

export default router;
