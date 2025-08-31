import express from 'express';
import multer from 'multer';
import path from 'path';
import { SimpleMLService } from '../services/simpleMLService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * POST /api/ml/identify
 * Identify breed from uploaded image
 */
router.post('/identify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('Processing image:', req.file.filename);

    // Analyze image with ML service
    const result = await SimpleMLService.identifyBreed(req.file.path);

    // Clean up uploaded file
    const fs = await import('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: result,
      message: 'Breed identification completed'
    });

  } catch (error) {
    console.error('ML Route Error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      const fs = await import('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Breed identification failed',
      fallback: 'Please use manual breed selection'
    });
  }
});

/**
 * GET /api/ml/breeds
 * Get list of available breeds
 */
router.get('/breeds', (req, res) => {
  try {
    const breeds = SimpleMLService.getAvailableBreeds();
    res.json({
      success: true,
      data: breeds,
      count: breeds.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ml/breeds/:breed/characteristics
 * Get characteristics of a specific breed
 */
router.get('/breeds/:breed/characteristics', (req, res) => {
  try {
    const { breed } = req.params;
    const breedInfo = SimpleMLService.getBreedInfo(breed);
    const characteristics = breedInfo ? breedInfo.characteristics : [];
    
    if (characteristics.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Breed not found'
      });
    }

    res.json({
      success: true,
      data: {
        breed,
        characteristics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ml/breeds/type/:type
 * Get breeds by type (cattle/buffalo)
 */
router.get('/breeds/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const breeds = SimpleMLService.getBreedsByType(type);
    
    res.json({
      success: true,
      data: breeds,
      count: breeds.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ml/breeds/search/:keyword
 * Search breeds by keyword
 */
router.get('/breeds/search/:keyword', (req, res) => {
  try {
    const { keyword } = req.params;
    const breeds = SimpleMLService.searchBreeds(keyword);
    
    res.json({
      success: true,
      data: breeds,
      count: breeds.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ml/breeds/:breed/info
 * Get complete breed information
 */
router.get('/breeds/:breed/info', (req, res) => {
  try {
    const { breed } = req.params;
    const breedInfo = SimpleMLService.getBreedInfo(breed);
    
    if (!breedInfo) {
      return res.status(404).json({
        success: false,
        error: 'Breed not found'
      });
    }

    res.json({
      success: true,
      data: breedInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ml/health
 * Health check for ML service
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'Simple ML Service',
      version: 'simple-v1.0',
      breeds_available: SimpleMLService.getAvailableBreeds().length,
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
