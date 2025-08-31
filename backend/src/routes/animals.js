import express from 'express';
import { logger } from '../utils/logger.js';
import { validateRequest, validateParams, commonSchemas } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const animalSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  breedId: Joi.string().required(),
  species: Joi.string().valid('Cattle', 'Buffalo').required(),
  age: Joi.number().min(0).max(30).optional(),
  gender: Joi.string().valid('Male', 'Female').required(),
  weight: Joi.number().min(50).max(1000).optional(),
  color: Joi.string().max(50).optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    address: Joi.string().max(200).optional(),
    village: Joi.string().max(100).optional(),
    district: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional()
  }).optional(),
  owner: Joi.object({
    name: Joi.string().max(100).optional(),
    phone: Joi.string().max(15).optional(),
    address: Joi.string().max(200).optional()
  }).optional(),
  health: Joi.object({
    status: Joi.string().valid('Healthy', 'Sick', 'Under Treatment').default('Healthy'),
    vaccinations: Joi.array().items(Joi.string()).optional(),
    lastCheckup: Joi.date().optional()
  }).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().max(500).optional()
});

// Mock animal database
let animals = [
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
  },
  {
    id: '2',
    name: 'Murrah',
    breedId: 'murrah',
    species: 'Buffalo',
    age: 7,
    gender: 'Female',
    weight: 520,
    color: 'Black',
    location: {
      latitude: 28.7041,
      longitude: 77.1025,
      address: 'Dairy Farm, Haryana',
      village: 'Gurgaon',
      district: 'Gurgaon',
      state: 'Haryana'
    },
    owner: {
      name: 'Suresh Kumar',
      phone: '+91-9876543211',
      address: 'Dairy Farm, Gurgaon, Haryana'
    },
    health: {
      status: 'Healthy',
      vaccinations: ['FMD', 'Brucellosis', 'Anthrax'],
      lastCheckup: new Date('2024-01-12')
    },
    images: ['animal_2_1.jpg'],
    notes: 'Excellent milk quality, high butterfat content',
    registeredBy: '1',
    registeredAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
];

// Get all animals with filtering
router.get('/', validateQuery(commonSchemas.pagination), async (req, res) => {
  try {
    const { 
      species, 
      breed, 
      gender, 
      health, 
      owner, 
      search,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let filteredAnimals = [...animals];

    // Filter by species
    if (species) {
      filteredAnimals = filteredAnimals.filter(animal => 
        animal.species.toLowerCase() === species.toLowerCase()
      );
    }

    // Filter by breed
    if (breed) {
      filteredAnimals = filteredAnimals.filter(animal => 
        animal.breedId.toLowerCase() === breed.toLowerCase()
      );
    }

    // Filter by gender
    if (gender) {
      filteredAnimals = filteredAnimals.filter(animal => 
        animal.gender.toLowerCase() === gender.toLowerCase()
      );
    }

    // Filter by health status
    if (health) {
      filteredAnimals = filteredAnimals.filter(animal => 
        animal.health.status.toLowerCase() === health.toLowerCase()
      );
    }

    // Filter by owner
    if (owner) {
      filteredAnimals = filteredAnimals.filter(animal => 
        animal.owner.name.toLowerCase().includes(owner.toLowerCase())
      );
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAnimals = filteredAnimals.filter(animal => 
        animal.name?.toLowerCase().includes(searchLower) ||
        animal.owner.name.toLowerCase().includes(searchLower) ||
        animal.location.village?.toLowerCase().includes(searchLower) ||
        animal.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        animals: paginatedAnimals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredAnimals.length,
          totalPages: Math.ceil(filteredAnimals.length / limit),
          hasNext: endIndex < filteredAnimals.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get animals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get animals'
    });
  }
});

// Get animal by ID
router.get('/:animalId', validateParams(commonSchemas.idParam), async (req, res) => {
  try {
    const { animalId } = req.params;
    
    const animal = animals.find(a => a.id === animalId);
    if (!animal) {
      return res.status(404).json({
        success: false,
        error: 'Animal not found'
      });
    }

    res.json({
      success: true,
      data: animal
    });
  } catch (error) {
    logger.error('Failed to get animal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get animal'
    });
  }
});

// Register new animal
router.post('/', validateRequest(animalSchema), async (req, res) => {
  try {
    const animalData = req.body;
    const userId = req.user.id;

    // Generate unique ID
    const newId = (animals.length + 1).toString();

    // Create new animal
    const newAnimal = {
      id: newId,
      ...animalData,
      registeredBy: userId,
      registeredAt: new Date(),
      updatedAt: new Date()
    };

    animals.push(newAnimal);

    logger.info('Animal registered successfully', { 
      animalId: newId, 
      userId,
      species: animalData.species,
      breedId: animalData.breedId
    });

    res.status(201).json({
      success: true,
      data: newAnimal
    });
  } catch (error) {
    logger.error('Failed to register animal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register animal',
      message: error.message
    });
  }
});

// Update animal
router.put('/:animalId', validateParams(commonSchemas.idParam), validateRequest(animalSchema), async (req, res) => {
  try {
    const { animalId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const animalIndex = animals.findIndex(a => a.id === animalId);
    if (animalIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Animal not found'
      });
    }

    // Update animal
    animals[animalIndex] = {
      ...animals[animalIndex],
      ...updateData,
      updatedAt: new Date()
    };

    logger.info('Animal updated successfully', { 
      animalId, 
      userId,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: animals[animalIndex]
    });
  } catch (error) {
    logger.error('Failed to update animal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update animal',
      message: error.message
    });
  }
});

// Delete animal
router.delete('/:animalId', validateParams(commonSchemas.idParam), async (req, res) => {
  try {
    const { animalId } = req.params;
    const userId = req.user.id;

    const animalIndex = animals.findIndex(a => a.id === animalId);
    if (animalIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Animal not found'
      });
    }

    const deletedAnimal = animals.splice(animalIndex, 1)[0];

    logger.info('Animal deleted successfully', { 
      animalId, 
      userId,
      species: deletedAnimal.species,
      breedId: deletedAnimal.breedId
    });

    res.json({
      success: true,
      message: 'Animal deleted successfully',
      data: deletedAnimal
    });
  } catch (error) {
    logger.error('Failed to delete animal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete animal',
      message: error.message
    });
  }
});

// Get animal statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalAnimals = animals.length;
    
    // Count by species
    const speciesCount = animals.reduce((acc, animal) => {
      acc[animal.species] = (acc[animal.species] || 0) + 1;
      return acc;
    }, {});

    // Count by gender
    const genderCount = animals.reduce((acc, animal) => {
      acc[animal.gender] = (acc[animal.gender] || 0) + 1;
      return acc;
    }, {});

    // Count by health status
    const healthCount = animals.reduce((acc, animal) => {
      acc[animal.health.status] = (acc[animal.health.status] || 0) + 1;
      return acc;
    }, {});

    // Count by breed
    const breedCount = animals.reduce((acc, animal) => {
      acc[animal.breedId] = (acc[animal.breedId] || 0) + 1;
      return acc;
    }, {});

    // Average age and weight
    const avgAge = animals.reduce((sum, animal) => sum + (animal.age || 0), 0) / totalAnimals;
    const avgWeight = animals.reduce((sum, animal) => sum + (animal.weight || 0), 0) / totalAnimals;

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = animals.filter(animal => 
      new Date(animal.registeredAt) > thirtyDaysAgo
    ).length;

    res.json({
      success: true,
      data: {
        totalAnimals,
        speciesCount,
        genderCount,
        healthCount,
        breedCount,
        averageAge: Math.round(avgAge * 10) / 10,
        averageWeight: Math.round(avgWeight),
        recentRegistrations,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get animal statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get animal statistics'
    });
  }
});

// Search animals
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const searchLower = query.toLowerCase();
    const searchResults = animals
      .filter(animal => 
        animal.name?.toLowerCase().includes(searchLower) ||
        animal.owner.name.toLowerCase().includes(searchLower) ||
        animal.location.village?.toLowerCase().includes(searchLower) ||
        animal.notes?.toLowerCase().includes(searchLower) ||
        animal.breedId.toLowerCase().includes(searchLower)
      )
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        query,
        animals: searchResults,
        count: searchResults.length
      }
    });
  } catch (error) {
    logger.error('Failed to search animals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search animals'
    });
  }
});

export default router;
