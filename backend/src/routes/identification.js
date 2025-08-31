import express from 'express';
import { logger } from '../utils/logger.js';
import { validateRequest, validateParams, commonSchemas } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const identificationSchema = Joi.object({
  imageData: Joi.string().required(),
  viewType: Joi.string().valid('front', 'side', 'rear').default('side'),
  confidence: Joi.number().min(0).max(100).optional(),
  metadata: Joi.object({
    deviceInfo: Joi.object().optional(),
    location: Joi.object().optional(),
    timestamp: Joi.date().iso().optional()
  }).optional()
});

// Mock identification database
let identifications = [
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
      },
      {
        breed: 'Sahiwal',
        confidence: 87.2,
        species: 'Cattle',
        origin: 'Punjab, India',
        avgWeight: '350-450 kg',
        milkYield: '15-20 L/day',
        features: ['Reddish brown', 'Medium size', 'Short horns'],
        characteristics: ['Heat tolerant', 'High milk production', 'Good temperament']
      },
      {
        breed: 'Murrah',
        confidence: 76.8,
        species: 'Buffalo',
        origin: 'Haryana, India',
        avgWeight: '450-550 kg',
        milkYield: '15-20 L/day',
        features: ['Black color', 'Short horns', 'High milk yield'],
        characteristics: ['High milk production', 'Good temperament', 'Commercial breed']
      }
    ],
    selectedBreed: 'Gir',
    confidence: 94.5,
    processingTime: 2500,
    modelVersion: 'v1.0.0',
    metadata: {
      deviceInfo: {
        userAgent: 'Mozilla/5.0 (Android 12)',
        platform: 'Android',
        screenSize: '1080x2400'
      },
      location: {
        latitude: 23.0225,
        longitude: 72.5714,
        address: 'Anand, Gujarat'
      },
      timestamp: new Date('2024-01-15T10:30:00Z')
    },
    status: 'completed',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    userId: '1',
    imageUrl: 'identification_2.jpg',
    viewType: 'front',
    results: [
      {
        breed: 'Murrah',
        confidence: 91.3,
        species: 'Buffalo',
        origin: 'Haryana, India',
        avgWeight: '450-550 kg',
        milkYield: '15-20 L/day',
        features: ['Black color', 'Short horns', 'High milk yield'],
        characteristics: ['High milk production', 'Good temperament', 'Commercial breed']
      },
      {
        breed: 'Jaffarabadi',
        confidence: 85.7,
        species: 'Buffalo',
        origin: 'Gujarat, India',
        avgWeight: '500-600 kg',
        milkYield: '15-20 L/day',
        features: ['Black color', 'Long horns', 'Large size'],
        characteristics: ['High milk production', 'Large size', 'Strong']
      },
      {
        breed: 'Surti',
        confidence: 78.2,
        species: 'Buffalo',
        origin: 'Gujarat, India',
        avgWeight: '400-500 kg',
        milkYield: '12-18 L/day',
        features: ['Brown color', 'Medium size', 'Short horns'],
        characteristics: ['Good milk quality', 'Medium size', 'Good temperament']
      }
    ],
    selectedBreed: 'Murrah',
    confidence: 91.3,
    processingTime: 2100,
    modelVersion: 'v1.0.0',
    metadata: {
      deviceInfo: {
        userAgent: 'Mozilla/5.0 (Android 12)',
        platform: 'Android',
        screenSize: '1080x2400'
      },
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: 'Gurgaon, Haryana'
      },
      timestamp: new Date('2024-01-16T14:15:00Z')
    },
    status: 'completed',
    createdAt: new Date('2024-01-16T14:15:00Z'),
    updatedAt: new Date('2024-01-16T14:15:00Z')
  }
];

// Get all identifications with filtering
router.get('/', validateQuery(commonSchemas.pagination), async (req, res) => {
  try {
    const { 
      userId, 
      status, 
      breed, 
      species,
      dateFrom,
      dateTo,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let filteredIdentifications = [...identifications];

    // Filter by user
    if (userId) {
      filteredIdentifications = filteredIdentifications.filter(id => 
        id.userId === userId
      );
    }

    // Filter by status
    if (status) {
      filteredIdentifications = filteredIdentifications.filter(id => 
        id.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by selected breed
    if (breed) {
      filteredIdentifications = filteredIdentifications.filter(id => 
        id.selectedBreed.toLowerCase().includes(breed.toLowerCase())
      );
    }

    // Filter by species
    if (species) {
      filteredIdentifications = filteredIdentifications.filter(id => 
        id.results[0]?.species.toLowerCase() === species.toLowerCase()
      );
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredIdentifications = filteredIdentifications.filter(id => 
        new Date(id.createdAt) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredIdentifications = filteredIdentifications.filter(id => 
        new Date(id.createdAt) <= toDate
      );
    }

    // Sort by creation date (newest first)
    filteredIdentifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIdentifications = filteredIdentifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        identifications: paginatedIdentifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredIdentifications.length,
          totalPages: Math.ceil(filteredIdentifications.length / limit),
          hasNext: endIndex < filteredIdentifications.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get identifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get identifications'
    });
  }
});

// Get identification by ID
router.get('/:identificationId', validateParams(commonSchemas.idParam), async (req, res) => {
  try {
    const { identificationId } = req.params;
    
    const identification = identifications.find(id => id.id === identificationId);
    if (!identification) {
      return res.status(404).json({
        success: false,
        error: 'Identification not found'
      });
    }

    res.json({
      success: true,
      data: identification
    });
  } catch (error) {
    logger.error('Failed to get identification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get identification'
    });
  }
});

// Create new identification record
router.post('/', validateRequest(identificationSchema), async (req, res) => {
  try {
    const identificationData = req.body;
    const userId = req.user?.id || 'anonymous';

    // Generate unique ID
    const newId = (identifications.length + 1).toString();

    // Create new identification record
    const newIdentification = {
      id: newId,
      userId,
      imageUrl: `identification_${newId}.jpg`,
      viewType: identificationData.viewType,
      results: [], // Will be populated by ML service
      selectedBreed: null,
      confidence: 0,
      processingTime: 0,
      modelVersion: 'v1.0.0',
      metadata: {
        ...identificationData.metadata,
        timestamp: new Date().toISOString()
      },
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    identifications.push(newIdentification);

    logger.info('Identification record created', { 
      identificationId: newId, 
      userId,
      viewType: identificationData.viewType
    });

    res.status(201).json({
      success: true,
      data: newIdentification
    });
  } catch (error) {
    logger.error('Failed to create identification record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create identification record',
      message: error.message
    });
  }
});

// Update identification results
router.put('/:identificationId/results', validateParams(commonSchemas.idParam), async (req, res) => {
  try {
    const { identificationId } = req.params;
    const { results, selectedBreed, confidence, processingTime } = req.body;
    const userId = req.user?.id || 'anonymous';

    const identificationIndex = identifications.findIndex(id => id.id === identificationId);
    if (identificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Identification not found'
      });
    }

    // Update identification with results
    identifications[identificationIndex] = {
      ...identifications[identificationIndex],
      results,
      selectedBreed,
      confidence,
      processingTime,
      status: 'completed',
      updatedAt: new Date()
    };

    logger.info('Identification results updated', { 
      identificationId, 
      userId,
      selectedBreed,
      confidence
    });

    res.json({
      success: true,
      data: identifications[identificationIndex]
    });
  } catch (error) {
    logger.error('Failed to update identification results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update identification results',
      message: error.message
    });
  }
});

// Get identification statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalIdentifications = identifications.length;
    
    // Count by status
    const statusCount = identifications.reduce((acc, id) => {
      acc[id.status] = (acc[id.status] || 0) + 1;
      return acc;
    }, {});

    // Count by species
    const speciesCount = identifications.reduce((acc, id) => {
      const species = id.results[0]?.species || 'Unknown';
      acc[species] = (acc[species] || 0) + 1;
      return acc;
    }, {});

    // Count by breed
    const breedCount = identifications.reduce((acc, id) => {
      if (id.selectedBreed) {
        acc[id.selectedBreed] = (acc[id.selectedBreed] || 0) + 1;
      }
      return acc;
    }, {});

    // Average confidence and processing time
    const avgConfidence = identifications.reduce((sum, id) => sum + (id.confidence || 0), 0) / totalIdentifications;
    const avgProcessingTime = identifications.reduce((sum, id) => sum + (id.processingTime || 0), 0) / totalIdentifications;

    // Recent identifications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentIdentifications = identifications.filter(id => 
      new Date(id.createdAt) > thirtyDaysAgo
    ).length;

    // Success rate (completed vs total)
    const completedCount = statusCount.completed || 0;
    const successRate = totalIdentifications > 0 ? (completedCount / totalIdentifications) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalIdentifications,
        statusCount,
        speciesCount,
        breedCount,
        averageConfidence: Math.round(avgConfidence * 10) / 10,
        averageProcessingTime: Math.round(avgProcessingTime),
        recentIdentifications,
        successRate: Math.round(successRate * 10) / 10,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get identification statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get identification statistics'
    });
  }
});

// Get user's identification history
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const userIdentifications = identifications
      .filter(id => id.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIdentifications = userIdentifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        userId,
        identifications: paginatedIdentifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userIdentifications.length,
          totalPages: Math.ceil(userIdentifications.length / limit),
          hasNext: endIndex < userIdentifications.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get user identification history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user identification history'
    });
  }
});

// Get breed identification accuracy
router.get('/stats/accuracy', async (req, res) => {
  try {
    const { breed, dateFrom, dateTo } = req.query;
    
    let filteredIdentifications = [...identifications];

    // Filter by breed if specified
    if (breed) {
      filteredIdentifications = filteredIdentifications.filter(id => 
        id.selectedBreed?.toLowerCase().includes(breed.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredIdentifications = filteredIdentifications.filter(id => 
        new Date(id.createdAt) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredIdentifications = filteredIdentifications.filter(id => 
        new Date(id.createdAt) <= toDate
      );
    }

    // Calculate accuracy metrics
    const totalIdentifications = filteredIdentifications.length;
    const highConfidenceIdentifications = filteredIdentifications.filter(id => id.confidence >= 90).length;
    const mediumConfidenceIdentifications = filteredIdentifications.filter(id => id.confidence >= 70 && id.confidence < 90).length;
    const lowConfidenceIdentifications = filteredIdentifications.filter(id => id.confidence < 70).length;

    const accuracyMetrics = {
      totalIdentifications,
      highConfidence: {
        count: highConfidenceIdentifications,
        percentage: totalIdentifications > 0 ? Math.round((highConfidenceIdentifications / totalIdentifications) * 100 * 10) / 10 : 0
      },
      mediumConfidence: {
        count: mediumConfidenceIdentifications,
        percentage: totalIdentifications > 0 ? Math.round((mediumConfidenceIdentifications / totalIdentifications) * 100 * 10) / 10 : 0
      },
      lowConfidence: {
        count: lowConfidenceIdentifications,
        percentage: totalIdentifications > 0 ? Math.round((lowConfidenceIdentifications / totalIdentifications) * 100 * 10) / 10 : 0
      },
      averageConfidence: totalIdentifications > 0 ? 
        Math.round(filteredIdentifications.reduce((sum, id) => sum + (id.confidence || 0), 0) / totalIdentifications * 10) / 10 : 0
    };

    res.json({
      success: true,
      data: accuracyMetrics
    });
  } catch (error) {
    logger.error('Failed to get identification accuracy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get identification accuracy'
    });
  }
});

export default router;
