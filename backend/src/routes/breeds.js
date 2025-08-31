import express from 'express';
import { logger } from '../utils/logger.js';
import { validateQuery, validateParams, commonSchemas } from '../middleware/validation.js';
import Joi from 'joi';
import { ALL_BREEDS, BREED_DEFINITIONS } from '../services/mlService.js';

const router = express.Router();

// Get all breeds with filtering
router.get('/', validateQuery(commonSchemas.pagination), async (req, res) => {
  try {
    const { species, region, search, page = 1, limit = 20 } = req.query;
    
    let breeds = Object.entries(ALL_BREEDS).map(([id, breed]) => ({
      id,
      ...breed
    }));

    // Filter by species
    if (species) {
      breeds = breeds.filter(breed => 
        breed.species.toLowerCase() === species.toLowerCase()
      );
    }

    // Filter by region (origin)
    if (region) {
      breeds = breeds.filter(breed => 
        breed.origin.toLowerCase().includes(region.toLowerCase())
      );
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      breeds = breeds.filter(breed => 
        breed.name.toLowerCase().includes(searchLower) ||
        breed.origin.toLowerCase().includes(searchLower) ||
        breed.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedBreeds = breeds.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        breeds: paginatedBreeds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: breeds.length,
          totalPages: Math.ceil(breeds.length / limit),
          hasNext: endIndex < breeds.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get breeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get breeds'
    });
  }
});

// Get breed by ID
router.get('/:breedId', validateParams(commonSchemas.idParam), async (req, res) => {
  try {
    const { breedId } = req.params;
    
    const breed = ALL_BREEDS[breedId];
    if (!breed) {
      return res.status(404).json({
        success: false,
        error: 'Breed not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: breedId,
        ...breed
      }
    });
  } catch (error) {
    logger.error('Failed to get breed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get breed'
    });
  }
});

// Get breeds by species
router.get('/species/:species', async (req, res) => {
  try {
    const { species } = req.params;
    
    const breeds = Object.entries(ALL_BREEDS)
      .filter(([_, breed]) => breed.species.toLowerCase() === species.toLowerCase())
      .map(([id, breed]) => ({
        id,
        ...breed
      }));

    res.json({
      success: true,
      data: {
        species,
        breeds,
        count: breeds.length
      }
    });
  } catch (error) {
    logger.error('Failed to get breeds by species:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get breeds by species'
    });
  }
});

// Get breeds by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    const breeds = Object.entries(ALL_BREEDS)
      .filter(([_, breed]) => breed.origin.toLowerCase().includes(region.toLowerCase()))
      .map(([id, breed]) => ({
        id,
        ...breed
      }));

    res.json({
      success: true,
      data: {
        region,
        breeds,
        count: breeds.length
      }
    });
  } catch (error) {
    logger.error('Failed to get breeds by region:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get breeds by region'
    });
  }
});

// Get breed statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const breeds = Object.values(ALL_BREEDS);
    
    // Count by species
    const speciesCount = breeds.reduce((acc, breed) => {
      acc[breed.species] = (acc[breed.species] || 0) + 1;
      return acc;
    }, {});

    // Count by region
    const regionCount = breeds.reduce((acc, breed) => {
      const region = breed.origin.split(',')[0].trim();
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    // Average weight and milk yield
    const avgWeight = breeds.reduce((sum, breed) => {
      const weightRange = breed.avgWeight.split('-');
      const avg = (parseInt(weightRange[0]) + parseInt(weightRange[1])) / 2;
      return sum + avg;
    }, 0) / breeds.length;

    const avgMilkYield = breeds.reduce((sum, breed) => {
      const milkRange = breed.milkYield.split('-');
      const avg = (parseInt(milkRange[0]) + parseInt(milkRange[1])) / 2;
      return sum + avg;
    }, 0) / breeds.length;

    res.json({
      success: true,
      data: {
        totalBreeds: breeds.length,
        speciesCount,
        regionCount,
        averageWeight: Math.round(avgWeight),
        averageMilkYield: Math.round(avgMilkYield),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get breed statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get breed statistics'
    });
  }
});

// Search breeds
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const searchLower = query.toLowerCase();
    const breeds = Object.entries(ALL_BREEDS)
      .filter(([_, breed]) => 
        breed.name.toLowerCase().includes(searchLower) ||
        breed.origin.toLowerCase().includes(searchLower) ||
        breed.features.some(feature => feature.toLowerCase().includes(searchLower)) ||
        breed.characteristics.some(char => char.toLowerCase().includes(searchLower))
      )
      .map(([id, breed]) => ({
        id,
        ...breed,
        relevance: calculateRelevance(breed, searchLower)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        query,
        breeds,
        count: breeds.length
      }
    });
  } catch (error) {
    logger.error('Failed to search breeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search breeds'
    });
  }
});

// Compare breeds
router.post('/compare', async (req, res) => {
  try {
    const { breedIds } = req.body;
    
    if (!Array.isArray(breedIds) || breedIds.length < 2 || breedIds.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide 2-5 breed IDs to compare'
      });
    }

    const breeds = breedIds.map(id => {
      const breed = ALL_BREEDS[id];
      if (!breed) {
        throw new Error(`Breed not found: ${id}`);
      }
      return { id, ...breed };
    });

    // Generate comparison data
    const comparison = {
      breeds,
      characteristics: generateComparisonTable(breeds),
      summary: generateComparisonSummary(breeds)
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    logger.error('Failed to compare breeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare breeds',
      message: error.message
    });
  }
});

// Helper functions
function calculateRelevance(breed, searchQuery) {
  let relevance = 0;
  
  // Exact name match gets highest score
  if (breed.name.toLowerCase() === searchQuery) {
    relevance += 100;
  } else if (breed.name.toLowerCase().includes(searchQuery)) {
    relevance += 50;
  }
  
  // Origin match
  if (breed.origin.toLowerCase().includes(searchQuery)) {
    relevance += 30;
  }
  
  // Feature matches
  breed.features.forEach(feature => {
    if (feature.toLowerCase().includes(searchQuery)) {
      relevance += 20;
    }
  });
  
  // Characteristic matches
  breed.characteristics.forEach(char => {
    if (char.toLowerCase().includes(searchQuery)) {
      relevance += 15;
    }
  });
  
  return relevance;
}

function generateComparisonTable(breeds) {
  const characteristics = [
    'species', 'origin', 'avgWeight', 'milkYield', 'features', 'characteristics'
  ];
  
  return characteristics.map(char => ({
    characteristic: char,
    values: breeds.map(breed => ({
      breedId: breed.id,
      breedName: breed.name,
      value: breed[char]
    }))
  }));
}

function generateComparisonSummary(breeds) {
  const species = [...new Set(breeds.map(b => b.species))];
  const regions = [...new Set(breeds.map(b => b.origin.split(',')[0].trim()))];
  
  // Calculate weight ranges
  const weights = breeds.map(b => {
    const [min, max] = b.avgWeight.split('-').map(w => parseInt(w));
    return { min, max, avg: (min + max) / 2 };
  });
  
  const minWeight = Math.min(...weights.map(w => w.min));
  const maxWeight = Math.max(...weights.map(w => w.max));
  const avgWeight = Math.round(weights.reduce((sum, w) => sum + w.avg, 0) / weights.length);
  
  // Calculate milk yield ranges
  const milkYields = breeds.map(b => {
    const [min, max] = b.milkYield.split('-').map(m => parseInt(m));
    return { min, max, avg: (min + max) / 2 };
  });
  
  const minMilk = Math.min(...milkYields.map(m => m.min));
  const maxMilk = Math.max(...milkYields.map(m => m.max));
  const avgMilk = Math.round(milkYields.reduce((sum, m) => sum + m.avg, 0) / milkYields.length);
  
  return {
    species,
    regions,
    weightRange: { min: minWeight, max: maxWeight, average: avgWeight },
    milkYieldRange: { min: minMilk, max: maxMilk, average: avgMilk },
    totalBreeds: breeds.length
  };
}

export default router;
