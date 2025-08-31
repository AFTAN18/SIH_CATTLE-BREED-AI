import express from 'express';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiting for photo requests
const photoRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many photo requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Mock photo database
const photoDatabase = {
  'gir': {
    name: 'Gir',
    type: 'cattle',
    origin: 'Gujarat, India',
    photos: [
      {
        id: 'gir_1',
        url: '/api/photos/gir_side_adult_male.jpg',
        angle: 'side',
        age: 'adult',
        gender: 'male',
        region: 'Gujarat',
        features: ['distinctive hump', 'pendulous ears', 'docile nature'],
        description: 'Adult male Gir cattle showing characteristic hump and ear structure',
        tags: ['dairy', 'indigenous', 'tropical'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.3MB',
          uploadDate: '2024-01-15',
          photographer: 'Dr. Patel',
          location: 'Gujarat, India'
        }
      },
      {
        id: 'gir_2',
        url: '/api/photos/gir_front_adult_female.jpg',
        angle: 'front',
        age: 'adult',
        gender: 'female',
        region: 'Gujarat',
        features: ['reddish brown', 'medium size', 'short horns'],
        description: 'Adult female Gir cattle front view highlighting facial features',
        tags: ['dairy', 'indigenous', 'tropical'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.1MB',
          uploadDate: '2024-01-16',
          photographer: 'Dr. Patel',
          location: 'Gujarat, India'
        }
      },
      {
        id: 'gir_3',
        url: '/api/photos/gir_rear_adult_male.jpg',
        angle: 'rear',
        age: 'adult',
        gender: 'male',
        region: 'Gujarat',
        features: ['strong hindquarters', 'well-developed udder', 'straight back'],
        description: 'Rear view showing strong build and udder development',
        tags: ['dairy', 'indigenous', 'tropical'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.5MB',
          uploadDate: '2024-01-17',
          photographer: 'Dr. Patel',
          location: 'Gujarat, India'
        }
      },
      {
        id: 'gir_4',
        url: '/api/photos/gir_threequarter_young_female.jpg',
        angle: 'three-quarter',
        age: 'young',
        gender: 'female',
        region: 'Gujarat',
        features: ['developing hump', 'alert expression', 'good conformation'],
        description: 'Young female Gir showing developing characteristics',
        tags: ['dairy', 'indigenous', 'tropical'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.0MB',
          uploadDate: '2024-01-18',
          photographer: 'Dr. Patel',
          location: 'Gujarat, India'
        }
      }
    ]
  },
  'sahiwal': {
    name: 'Sahiwal',
    type: 'cattle',
    origin: 'Punjab, India',
    photos: [
      {
        id: 'sahiwal_1',
        url: '/api/photos/sahiwal_side_adult_male.jpg',
        angle: 'side',
        age: 'adult',
        gender: 'male',
        region: 'Punjab',
        features: ['reddish brown', 'medium size', 'short horns'],
        description: 'Adult male Sahiwal showing characteristic color and build',
        tags: ['dairy', 'indigenous', 'heat-tolerant'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.2MB',
          uploadDate: '2024-01-20',
          photographer: 'Dr. Singh',
          location: 'Punjab, India'
        }
      },
      {
        id: 'sahiwal_2',
        url: '/api/photos/sahiwal_front_adult_female.jpg',
        angle: 'front',
        age: 'adult',
        gender: 'female',
        region: 'Punjab',
        features: ['broad forehead', 'alert eyes', 'good udder'],
        description: 'Adult female Sahiwal front view',
        tags: ['dairy', 'indigenous', 'heat-tolerant'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.4MB',
          uploadDate: '2024-01-21',
          photographer: 'Dr. Singh',
          location: 'Punjab, India'
        }
      }
    ]
  },
  'murrah': {
    name: 'Murrah',
    type: 'buffalo',
    origin: 'Haryana, India',
    photos: [
      {
        id: 'murrah_1',
        url: '/api/photos/murrah_side_adult_female.jpg',
        angle: 'side',
        age: 'adult',
        gender: 'female',
        region: 'Haryana',
        features: ['black color', 'short horns', 'high milk yield'],
        description: 'Adult female Murrah buffalo showing characteristic black color',
        tags: ['dairy', 'indigenous', 'high-yield'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.6MB',
          uploadDate: '2024-01-25',
          photographer: 'Dr. Kumar',
          location: 'Haryana, India'
        }
      },
      {
        id: 'murrah_2',
        url: '/api/photos/murrah_front_adult_male.jpg',
        angle: 'front',
        age: 'adult',
        gender: 'male',
        region: 'Haryana',
        features: ['broad chest', 'strong build', 'short curved horns'],
        description: 'Adult male Murrah buffalo front view',
        tags: ['dairy', 'indigenous', 'high-yield'],
        metadata: {
          resolution: '1920x1080',
          fileSize: '2.3MB',
          uploadDate: '2024-01-26',
          photographer: 'Dr. Kumar',
          location: 'Haryana, India'
        }
      }
    ]
  }
};

// Get all photos with optional filtering
router.get('/', photoRateLimit, async (req, res) => {
  try {
    const { 
      breed, 
      angle, 
      age, 
      gender, 
      region, 
      type, 
      search,
      limit = 50,
      offset = 0 
    } = req.query;

    let allPhotos = [];
    
    // Collect all photos from all breeds
    Object.values(photoDatabase).forEach(breedData => {
      breedData.photos.forEach(photo => {
        allPhotos.push({
          ...photo,
          breed: breedData.name,
          breedType: breedData.type,
          origin: breedData.origin
        });
      });
    });

    // Apply filters
    if (breed) {
      allPhotos = allPhotos.filter(photo => 
        photo.breed.toLowerCase().includes(breed.toLowerCase())
      );
    }

    if (angle) {
      allPhotos = allPhotos.filter(photo => photo.angle === angle);
    }

    if (age) {
      allPhotos = allPhotos.filter(photo => photo.age === age);
    }

    if (gender) {
      allPhotos = allPhotos.filter(photo => photo.gender === gender);
    }

    if (region) {
      allPhotos = allPhotos.filter(photo => photo.region === region);
    }

    if (type) {
      allPhotos = allPhotos.filter(photo => photo.breedType === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      allPhotos = allPhotos.filter(photo => 
        photo.description.toLowerCase().includes(searchLower) ||
        photo.features.some(f => f.toLowerCase().includes(searchLower)) ||
        photo.breed.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = allPhotos.length;
    const paginatedPhotos = allPhotos.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        photos: paginatedPhotos,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + parseInt(limit) < total
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos'
    });
  }
});

// Get photos by breed
router.get('/breed/:breedName', photoRateLimit, async (req, res) => {
  try {
    const { breedName } = req.params;
    const breedData = photoDatabase[breedName.toLowerCase()];

    if (!breedData) {
      return res.status(404).json({
        success: false,
        error: 'Breed not found'
      });
    }

    res.json({
      success: true,
      data: {
        breed: breedData,
        photos: breedData.photos
      }
    });

  } catch (error) {
    logger.error('Error fetching breed photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch breed photos'
    });
  }
});

// Get photo by ID
router.get('/photo/:photoId', photoRateLimit, async (req, res) => {
  try {
    const { photoId } = req.params;
    
    let foundPhoto = null;
    let foundBreed = null;

    // Search through all breeds for the photo
    for (const [breedName, breedData] of Object.entries(photoDatabase)) {
      const photo = breedData.photos.find(p => p.id === photoId);
      if (photo) {
        foundPhoto = photo;
        foundBreed = breedData;
        break;
      }
    }

    if (!foundPhoto) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    res.json({
      success: true,
      data: {
        photo: foundPhoto,
        breed: foundBreed
      }
    });

  } catch (error) {
    logger.error('Error fetching photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photo'
    });
  }
});

// Get available filters
router.get('/filters', photoRateLimit, async (req, res) => {
  try {
    const filters = {
      breeds: Object.keys(photoDatabase).map(name => ({
        name: photoDatabase[name].name,
        type: photoDatabase[name].type,
        origin: photoDatabase[name].origin
      })),
      angles: ['front', 'side', 'rear', 'three-quarter'],
      ages: ['young', 'adult', 'senior'],
      genders: ['male', 'female'],
      regions: ['Gujarat', 'Punjab', 'Haryana'],
      types: ['cattle', 'buffalo']
    };

    res.json({
      success: true,
      data: filters
    });

  } catch (error) {
    logger.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filters'
    });
  }
});

// Get photo statistics
router.get('/stats', photoRateLimit, async (req, res) => {
  try {
    let totalPhotos = 0;
    let totalBreeds = Object.keys(photoDatabase).length;
    let photosByType = { cattle: 0, buffalo: 0 };
    let photosByRegion = {};

    Object.values(photoDatabase).forEach(breedData => {
      totalPhotos += breedData.photos.length;
      photosByType[breedData.type] += breedData.photos.length;
      
      breedData.photos.forEach(photo => {
        photosByRegion[photo.region] = (photosByRegion[photo.region] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: {
        totalPhotos,
        totalBreeds,
        photosByType,
        photosByRegion
      }
    });

  } catch (error) {
    logger.error('Error fetching photo stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photo statistics'
    });
  }
});

// Search photos by characteristics
router.post('/search', photoRateLimit, async (req, res) => {
  try {
    const { 
      colors, 
      sizes, 
      horns, 
      hump, 
      regions,
      milkYield,
      weight 
    } = req.body;

    let allPhotos = [];
    
    // Collect all photos
    Object.values(photoDatabase).forEach(breedData => {
      breedData.photos.forEach(photo => {
        allPhotos.push({
          ...photo,
          breed: breedData.name,
          breedType: breedData.type,
          origin: breedData.origin
        });
      });
    });

    // Apply search criteria
    let results = allPhotos;

    if (colors && colors.length > 0) {
      results = results.filter(photo => {
        // This would need to be enhanced with actual color data
        return true; // Placeholder
      });
    }

    if (sizes && sizes.length > 0) {
      results = results.filter(photo => {
        // This would need to be enhanced with actual size data
        return true; // Placeholder
      });
    }

    if (horns && horns.length > 0) {
      results = results.filter(photo => {
        // This would need to be enhanced with actual horn data
        return true; // Placeholder
      });
    }

    if (hump && hump.length > 0) {
      results = results.filter(photo => {
        // This would need to be enhanced with actual hump data
        return true; // Placeholder
      });
    }

    if (regions && regions.length > 0) {
      results = results.filter(photo => regions.includes(photo.region));
    }

    res.json({
      success: true,
      data: {
        results,
        total: results.length
      }
    });

  } catch (error) {
    logger.error('Error searching photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search photos'
    });
  }
});

export default router;
