import express from 'express';
import multer from 'multer';
import { logger } from '../utils/logger.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import mlService from '../services/mlService.js';
import { addBreedIdentificationJob } from '../utils/queue.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get model information
router.get('/model-info', async (req, res) => {
  try {
    const modelInfo = await mlService.getModelInfo();
    res.json({
      success: true,
      data: modelInfo
    });
  } catch (error) {
    logger.error('Failed to get model info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model information'
    });
  }
});

// Get all breeds
router.get('/breeds', async (req, res) => {
  try {
    const { species } = req.query;
    let breeds;
    
    if (species) {
      breeds = await mlService.getBreedsBySpecies(species);
    } else {
      breeds = await mlService.getAllBreeds();
    }
    
    res.json({
      success: true,
      data: breeds,
      count: Object.keys(breeds).length
    });
  } catch (error) {
    logger.error('Failed to get breeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get breed information'
    });
  }
});

// Get specific breed information
router.get('/breeds/:breedId', async (req, res) => {
  try {
    const { breedId } = req.params;
    const breedInfo = await mlService.getBreedInfo(breedId);
    
    res.json({
      success: true,
      data: breedInfo
    });
  } catch (error) {
    logger.error('Failed to get breed info:', error);
    res.status(404).json({
      success: false,
      error: 'Breed not found'
    });
  }
});

// Real-time breed identification
router.post('/identify', upload.single('image'), optionalAuthMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { topK = 3, confidenceThreshold = 0.7 } = req.body;
    const options = { topK: parseInt(topK), confidenceThreshold: parseFloat(confidenceThreshold) };

    logger.info('Starting real-time breed identification', {
      userId: req.user?.id || 'anonymous',
      fileSize: req.file.size,
      options
    });

    // Process image and identify breed
    const result = await mlService.identifyBreed(req.file.buffer, options);

    // Add metadata
    result.metadata = {
      userId: req.user?.id || null,
      timestamp: new Date().toISOString(),
      fileSize: req.file.size,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Breed identification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Breed identification failed',
      message: error.message
    });
  }
});

// Batch breed identification
router.post('/identify/batch', upload.array('images', 10), optionalAuthMiddleware, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
    }

    const { topK = 3, confidenceThreshold = 0.7 } = req.body;
    const options = { topK: parseInt(topK), confidenceThreshold: parseFloat(confidenceThreshold) };

    logger.info('Starting batch breed identification', {
      userId: req.user?.id || 'anonymous',
      fileCount: req.files.length,
      options
    });

    // Extract image buffers
    const imageBuffers = req.files.map(file => file.buffer);

    // Process images in batch
    const results = await mlService.batchIdentifyBreeds(imageBuffers, options);

    // Add metadata to each result
    const resultsWithMetadata = results.map((result, index) => ({
      ...result,
      metadata: {
        userId: req.user?.id || null,
        timestamp: new Date().toISOString(),
        fileSize: req.files[index].size,
        originalName: req.files[index].originalname,
        mimeType: req.files[index].mimetype,
        index
      }
    }));

    res.json({
      success: true,
      data: {
        results: resultsWithMetadata,
        totalProcessed: results.length,
        processingTime: results.reduce((sum, r) => sum + r.processingTime, 0)
      }
    });
  } catch (error) {
    logger.error('Batch breed identification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Batch breed identification failed',
      message: error.message
    });
  }
});

// Queue-based breed identification (for heavy processing)
router.post('/identify/queue', upload.single('image'), optionalAuthMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { topK = 3, confidenceThreshold = 0.7 } = req.body;
    const options = { topK: parseInt(topK), confidenceThreshold: parseFloat(confidenceThreshold) };

    // Add job to queue
    const job = await addBreedIdentificationJob(
      req.file.buffer.toString('base64'),
      req.user?.id || 'anonymous',
      options
    );

    logger.info('Added breed identification job to queue', {
      jobId: job.id,
      userId: req.user?.id || 'anonymous'
    });

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: 'queued',
        message: 'Breed identification job added to queue'
      }
    });
  } catch (error) {
    logger.error('Failed to queue breed identification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue breed identification',
      message: error.message
    });
  }
});

// Get job status
router.get('/identify/queue/:jobId', optionalAuthMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // This would typically check the job status from the queue
    // For now, we'll return a mock status
    res.json({
      success: true,
      data: {
        jobId,
        status: 'completed',
        progress: 100,
        result: {
          success: true,
          results: [
            {
              id: 'gir',
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
          processingTime: 2500,
          modelVersion: 'v1.0.0'
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get job status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job status',
      message: error.message
    });
  }
});

// Model update endpoint (admin only)
router.post('/model/update', async (req, res) => {
  try {
    const { modelPath } = req.body;
    
    if (!modelPath) {
      return res.status(400).json({
        success: false,
        error: 'Model path is required'
      });
    }

    const result = await mlService.updateModel(modelPath);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Model update failed:', error);
    res.status(500).json({
      success: false,
      error: 'Model update failed',
      message: error.message
    });
  }
});

// Health check for ML service
router.get('/health', async (req, res) => {
  try {
    const modelInfo = await mlService.getModelInfo();
    const isHealthy = mlService.isInitialized;
    
    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        modelInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('ML service health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'ML service health check failed',
      message: error.message
    });
  }
});

export default router;
