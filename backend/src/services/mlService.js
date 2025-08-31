import tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import { logger } from '../utils/logger.js';
import { addBreedIdentificationJob } from '../utils/queue.js';

// Breed definitions for 43 breeds
export const BREED_DEFINITIONS = {
  // Cattle Breeds (30)
  CATTLE: {
    GIR: {
      id: 'gir',
      name: 'Gir',
      species: 'Cattle',
      origin: 'Gujarat, India',
      features: ['Distinctive hump', 'Pendulous ears', 'Docile nature', 'Reddish brown to white'],
      avgWeight: '400-500 kg',
      milkYield: '12-18 L/day',
      characteristics: ['Disease resistant', 'Tropical climate adapted', 'Good draught animal']
    },
    SAHIWAL: {
      id: 'sahiwal',
      name: 'Sahiwal',
      species: 'Cattle',
      origin: 'Punjab, India',
      features: ['Reddish brown', 'Medium size', 'Short horns', 'Loose skin'],
      avgWeight: '350-450 kg',
      milkYield: '15-20 L/day',
      characteristics: ['Heat tolerant', 'High milk production', 'Good temperament']
    },
    RED_SINDHI: {
      id: 'red_sindhi',
      name: 'Red Sindhi',
      species: 'Cattle',
      origin: 'Sindh, Pakistan',
      features: ['Red color', 'Medium size', 'Drooping ears', 'Hump'],
      avgWeight: '300-400 kg',
      milkYield: '12-16 L/day',
      characteristics: ['Heat resistant', 'Disease resistant', 'Good milk quality']
    },
    THARPARKAR: {
      id: 'tharparkar',
      name: 'Tharparkar',
      species: 'Cattle',
      origin: 'Thar Desert, India',
      features: ['White to light gray', 'Medium size', 'Upright horns', 'Hardy'],
      avgWeight: '350-450 kg',
      milkYield: '10-15 L/day',
      characteristics: ['Desert adapted', 'Drought resistant', 'Good for draught']
    },
    HARIANA: {
      id: 'hariana',
      name: 'Hariana',
      species: 'Cattle',
      origin: 'Haryana, India',
      features: ['White to light gray', 'Large size', 'Long horns', 'Strong build'],
      avgWeight: '400-500 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Dual purpose', 'Good draught animal', 'Hardy']
    },
    ONGOLE: {
      id: 'ongole',
      name: 'Ongole',
      species: 'Cattle',
      origin: 'Andhra Pradesh, India',
      features: ['White color', 'Large size', 'Hump', 'Long horns'],
      avgWeight: '500-600 kg',
      milkYield: '10-15 L/day',
      characteristics: ['Strong draught animal', 'Heat tolerant', 'Disease resistant']
    },
    KANKREJ: {
      id: 'kankrej',
      name: 'Kankrej',
      species: 'Cattle',
      origin: 'Gujarat, India',
      features: ['Gray to silver', 'Large size', 'Long lyre-shaped horns', 'Hump'],
      avgWeight: '450-550 kg',
      milkYield: '12-18 L/day',
      characteristics: ['Excellent draught animal', 'Strong', 'Disease resistant']
    },
    RATHI: {
      id: 'rathi',
      name: 'Rathi',
      species: 'Cattle',
      origin: 'Rajasthan, India',
      features: ['Brown to black', 'Medium size', 'Short horns', 'Compact body'],
      avgWeight: '350-450 kg',
      milkYield: '15-20 L/day',
      characteristics: ['High milk production', 'Good temperament', 'Adaptable']
    },
    KRISHNA_VALLEY: {
      id: 'krishna_valley',
      name: 'Krishna Valley',
      species: 'Cattle',
      origin: 'Karnataka, India',
      features: ['Gray color', 'Large size', 'Long horns', 'Hump'],
      avgWeight: '500-600 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Heavy draught animal', 'Strong', 'Hardy']
    },
    AMRITMAHAL: {
      id: 'amritmahal',
      name: 'Amritmahal',
      species: 'Cattle',
      origin: 'Karnataka, India',
      features: ['Gray color', 'Large size', 'Long horns', 'Strong build'],
      avgWeight: '450-550 kg',
      milkYield: '6-10 L/day',
      characteristics: ['Excellent draught animal', 'Strong', 'Endurance']
    },
    HALLIKAR: {
      id: 'hallikar',
      name: 'Hallikar',
      species: 'Cattle',
      origin: 'Karnataka, India',
      features: ['Gray color', 'Medium size', 'Long horns', 'Compact body'],
      avgWeight: '350-450 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Good draught animal', 'Hardy', 'Disease resistant']
    },
    KHILLARI: {
      id: 'khillari',
      name: 'Khillari',
      species: 'Cattle',
      origin: 'Maharashtra, India',
      features: ['Gray to white', 'Medium size', 'Long horns', 'Hump'],
      avgWeight: '350-450 kg',
      milkYield: '6-10 L/day',
      characteristics: ['Good draught animal', 'Hardy', 'Drought resistant']
    },
    DANGI: {
      id: 'dangi',
      name: 'Dangi',
      species: 'Cattle',
      origin: 'Maharashtra, India',
      features: ['Black and white', 'Medium size', 'Short horns', 'Strong build'],
      avgWeight: '350-450 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Dual purpose', 'Hardy', 'Good temperament']
    },
    DEONI: {
      id: 'deoni',
      name: 'Deoni',
      species: 'Cattle',
      origin: 'Maharashtra, India',
      features: ['White with black spots', 'Large size', 'Long horns', 'Hump'],
      avgWeight: '450-550 kg',
      milkYield: '10-15 L/day',
      characteristics: ['Dual purpose', 'Strong', 'Disease resistant']
    },
    NIMARI: {
      id: 'nimari',
      name: 'Nimari',
      species: 'Cattle',
      origin: 'Madhya Pradesh, India',
      features: ['Red and white', 'Medium size', 'Long horns', 'Hump'],
      avgWeight: '350-450 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Dual purpose', 'Hardy', 'Good temperament']
    },
    MALVI: {
      id: 'malvi',
      name: 'Malvi',
      species: 'Cattle',
      origin: 'Madhya Pradesh, India',
      features: ['Gray color', 'Medium size', 'Long horns', 'Strong build'],
      avgWeight: '350-450 kg',
      milkYield: '6-10 L/day',
      characteristics: ['Good draught animal', 'Hardy', 'Drought resistant']
    },
    NAGORI: {
      id: 'nagori',
      name: 'Nagori',
      species: 'Cattle',
      origin: 'Rajasthan, India',
      features: ['White color', 'Large size', 'Long horns', 'Hump'],
      avgWeight: '450-550 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Excellent draught animal', 'Strong', 'Endurance']
    },
    MEWATI: {
      id: 'mewati',
      name: 'Mewati',
      species: 'Cattle',
      origin: 'Rajasthan, India',
      features: ['Gray color', 'Large size', 'Long horns', 'Strong build'],
      avgWeight: '450-550 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Good draught animal', 'Hardy', 'Disease resistant']
    },
    GANGATIRI: {
      id: 'gangatiri',
      name: 'Gangatiri',
      species: 'Cattle',
      origin: 'Uttar Pradesh, India',
      features: ['White color', 'Large size', 'Long horns', 'Hump'],
      avgWeight: '450-550 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Good draught animal', 'Strong', 'Hardy']
    },
    PUNGANUR: {
      id: 'punganur',
      name: 'Punganur',
      species: 'Cattle',
      origin: 'Andhra Pradesh, India',
      features: ['White color', 'Small size', 'Short horns', 'Compact body'],
      avgWeight: '200-250 kg',
      milkYield: '3-5 L/day',
      characteristics: ['Dwarf breed', 'Efficient', 'Low maintenance']
    },
    VECHUR: {
      id: 'vechur',
      name: 'Vechur',
      species: 'Cattle',
      origin: 'Kerala, India',
      features: ['Light brown', 'Very small size', 'Short horns', 'Compact body'],
      avgWeight: '130-200 kg',
      milkYield: '2-4 L/day',
      characteristics: ['Dwarf breed', 'Efficient', 'Disease resistant']
    },
    KASARGOD: {
      id: 'kasargod',
      name: 'Kasargod',
      species: 'Cattle',
      origin: 'Kerala, India',
      features: ['Gray color', 'Small size', 'Short horns', 'Compact body'],
      avgWeight: '250-350 kg',
      milkYield: '4-6 L/day',
      characteristics: ['Small breed', 'Hardy', 'Low maintenance']
    },
    BARGUR: {
      id: 'bargur',
      name: 'Bargur',
      species: 'Cattle',
      origin: 'Tamil Nadu, India',
      features: ['Brown color', 'Medium size', 'Long horns', 'Strong build'],
      avgWeight: '350-450 kg',
      milkYield: '6-10 L/day',
      characteristics: ['Good draught animal', 'Hardy', 'Disease resistant']
    },
    PULIKULAM: {
      id: 'pulikulam',
      name: 'Pulikulam',
      species: 'Cattle',
      origin: 'Tamil Nadu, India',
      features: ['Gray color', 'Small size', 'Long horns', 'Compact body'],
      avgWeight: '250-350 kg',
      milkYield: '4-6 L/day',
      characteristics: ['Small breed', 'Hardy', 'Low maintenance']
    },
    UMBLACHERY: {
      id: 'umblachery',
      name: 'Umblachery',
      species: 'Cattle',
      origin: 'Tamil Nadu, India',
      features: ['Gray color', 'Medium size', 'Long horns', 'Strong build'],
      avgWeight: '350-450 kg',
      milkYield: '6-10 L/day',
      characteristics: ['Good draught animal', 'Hardy', 'Disease resistant']
    },
    JERSEY_CROSS: {
      id: 'jersey_cross',
      name: 'Jersey Cross',
      species: 'Cattle',
      origin: 'Crossbreed',
      features: ['Light brown', 'Medium size', 'Short horns', 'Good milk production'],
      avgWeight: '350-450 kg',
      milkYield: '15-25 L/day',
      characteristics: ['High milk production', 'Good temperament', 'Adaptable']
    },
    HOLSTEIN_FRIESIAN_CROSS: {
      id: 'holstein_friesian_cross',
      name: 'Holstein Friesian Cross',
      species: 'Cattle',
      origin: 'Crossbreed',
      features: ['Black and white', 'Large size', 'High milk production'],
      avgWeight: '500-600 kg',
      milkYield: '20-30 L/day',
      characteristics: ['Very high milk production', 'Large size', 'Commercial breed']
    },
    SAHIWAL_CROSS: {
      id: 'sahiwal_cross',
      name: 'Sahiwal Cross',
      species: 'Cattle',
      origin: 'Crossbreed',
      features: ['Reddish brown', 'Medium size', 'Good milk production'],
      avgWeight: '400-500 kg',
      milkYield: '15-20 L/day',
      characteristics: ['High milk production', 'Heat tolerant', 'Disease resistant']
    },
    GIR_CROSS: {
      id: 'gir_cross',
      name: 'Gir Cross',
      species: 'Cattle',
      origin: 'Crossbreed',
      features: ['Reddish brown', 'Medium size', 'Hump', 'Good milk production'],
      avgWeight: '400-500 kg',
      milkYield: '15-20 L/day',
      characteristics: ['High milk production', 'Disease resistant', 'Good temperament']
    },
    INDIGENOUS_CROSS: {
      id: 'indigenous_cross',
      name: 'Indigenous Cross',
      species: 'Cattle',
      origin: 'Crossbreed',
      features: ['Variable color', 'Variable size', 'Mixed characteristics'],
      avgWeight: '300-500 kg',
      milkYield: '8-15 L/day',
      characteristics: ['Adaptable', 'Hardy', 'Mixed traits']
    }
  },
  
  // Buffalo Breeds (13)
  BUFFALO: {
    MURRAH: {
      id: 'murrah',
      name: 'Murrah',
      species: 'Buffalo',
      origin: 'Haryana, India',
      features: ['Black color', 'Short horns', 'High milk yield', 'Compact body'],
      avgWeight: '450-550 kg',
      milkYield: '15-20 L/day',
      characteristics: ['High milk production', 'Good temperament', 'Commercial breed']
    },
    JAFFARABADI: {
      id: 'jaffarabadi',
      name: 'Jaffarabadi',
      species: 'Buffalo',
      origin: 'Gujarat, India',
      features: ['Black color', 'Long horns', 'Large size', 'High milk yield'],
      avgWeight: '500-600 kg',
      milkYield: '15-20 L/day',
      characteristics: ['High milk production', 'Large size', 'Strong']
    },
    SURTI: {
      id: 'surti',
      name: 'Surti',
      species: 'Buffalo',
      origin: 'Gujarat, India',
      features: ['Brown color', 'Medium size', 'Short horns', 'Good milk quality'],
      avgWeight: '400-500 kg',
      milkYield: '12-18 L/day',
      characteristics: ['Good milk quality', 'Medium size', 'Good temperament']
    },
    MEHSANA: {
      id: 'mehsana',
      name: 'Mehsana',
      species: 'Buffalo',
      origin: 'Gujarat, India',
      features: ['Black color', 'Medium size', 'Short horns', 'High milk yield'],
      avgWeight: '450-550 kg',
      milkYield: '15-20 L/day',
      characteristics: ['High milk production', 'Good temperament', 'Commercial breed']
    },
    NAGPURI: {
      id: 'nagpuri',
      name: 'Nagpuri',
      species: 'Buffalo',
      origin: 'Maharashtra, India',
      features: ['Black color', 'Medium size', 'Long horns', 'Good draught'],
      avgWeight: '400-500 kg',
      milkYield: '10-15 L/day',
      characteristics: ['Dual purpose', 'Good draught animal', 'Hardy']
    },
    TODA: {
      id: 'toda',
      name: 'Toda',
      species: 'Buffalo',
      origin: 'Tamil Nadu, India',
      features: ['Black color', 'Small size', 'Short horns', 'Compact body'],
      avgWeight: '300-400 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Small breed', 'Hardy', 'Low maintenance']
    },
    PANDHARPURI: {
      id: 'pandharpuri',
      name: 'Pandharpuri',
      species: 'Buffalo',
      origin: 'Maharashtra, India',
      features: ['Black color', 'Medium size', 'Long horns', 'Good milk yield'],
      avgWeight: '450-550 kg',
      milkYield: '12-18 L/day',
      characteristics: ['Good milk production', 'Hardy', 'Disease resistant']
    },
    KALAHANDI: {
      id: 'kalahandi',
      name: 'Kalahandi',
      species: 'Buffalo',
      origin: 'Odisha, India',
      features: ['Black color', 'Medium size', 'Long horns', 'Good draught'],
      avgWeight: '400-500 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Dual purpose', 'Good draught animal', 'Hardy']
    },
    BANNI: {
      id: 'banni',
      name: 'Banni',
      species: 'Buffalo',
      origin: 'Gujarat, India',
      features: ['Black color', 'Large size', 'Long horns', 'High milk yield'],
      avgWeight: '500-600 kg',
      milkYield: '15-20 L/day',
      characteristics: ['High milk production', 'Large size', 'Commercial breed']
    },
    CHILIKA: {
      id: 'chilika',
      name: 'Chilika',
      species: 'Buffalo',
      origin: 'Odisha, India',
      features: ['Black color', 'Medium size', 'Long horns', 'Good milk yield'],
      avgWeight: '400-500 kg',
      milkYield: '10-15 L/day',
      characteristics: ['Good milk production', 'Hardy', 'Disease resistant']
    },
    CHHATTISGARHI: {
      id: 'chhattisgarhi',
      name: 'Chhattisgarhi',
      species: 'Buffalo',
      origin: 'Chhattisgarh, India',
      features: ['Black color', 'Medium size', 'Long horns', 'Good draught'],
      avgWeight: '400-500 kg',
      milkYield: '8-12 L/day',
      characteristics: ['Dual purpose', 'Good draught animal', 'Hardy']
    },
    DHARWARI: {
      id: 'dharwari',
      name: 'Dharwari',
      species: 'Buffalo',
      origin: 'Karnataka, India',
      features: ['Black color', 'Medium size', 'Long horns', 'Good milk yield'],
      avgWeight: '400-500 kg',
      milkYield: '10-15 L/day',
      characteristics: ['Good milk production', 'Hardy', 'Disease resistant']
    },
    GODAVARI: {
      id: 'godavari',
      name: 'Godavari',
      species: 'Buffalo',
      origin: 'Andhra Pradesh, India',
      features: ['Black color', 'Medium size', 'Long horns', 'Good milk yield'],
      avgWeight: '400-500 kg',
      milkYield: '10-15 L/day',
      characteristics: ['Good milk production', 'Hardy', 'Disease resistant']
    }
  }
};

// Flatten breed definitions for easier access
export const ALL_BREEDS = {
  ...BREED_DEFINITIONS.CATTLE,
  ...BREED_DEFINITIONS.BUFFALO
};

// Model configuration
const MODEL_CONFIG = {
  inputShape: [224, 224, 3],
  numClasses: 43,
  modelPath: process.env.MODEL_PATH || './models/breed_classifier_v1.0.0',
  confidenceThreshold: 0.7,
  topK: 3
};

class MLService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.processingQueue = [];
    this.batchSize = 4;
  }

  async initialize() {
    try {
      logger.info('Initializing ML service...');
      
      // Load TensorFlow.js model
      await this.loadModel();
      
      // Warm up the model
      await this.warmup();
      
      this.isInitialized = true;
      logger.info('ML service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ML service:', error);
      throw error;
    }
  }

  async loadModel() {
    try {
      // For now, we'll create a mock model since we don't have the actual trained model
      // In production, this would load a pre-trained EfficientNetB3 model
      this.model = await this.createMockModel();
      logger.info('Model loaded successfully');
    } catch (error) {
      logger.error('Failed to load model:', error);
      throw error;
    }
  }

  async createMockModel() {
    // Create a simple mock model for demonstration
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: MODEL_CONFIG.inputShape,
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: MODEL_CONFIG.numClasses, activation: 'softmax' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async warmup() {
    try {
      // Create a dummy tensor for warmup
      const dummyInput = tf.randomNormal([1, ...MODEL_CONFIG.inputShape]);
      const prediction = await this.model.predict(dummyInput);
      await prediction.data();
      tf.dispose([dummyInput, prediction]);
      logger.info('Model warmup completed');
    } catch (error) {
      logger.error('Model warmup failed:', error);
      throw error;
    }
  }

  async preprocessImage(imageBuffer) {
    try {
      // Resize and normalize image
      const processedBuffer = await sharp(imageBuffer)
        .resize(MODEL_CONFIG.inputShape[0], MODEL_CONFIG.inputShape[1])
        .toFormat('jpeg')
        .toBuffer();

      // Convert to tensor
      const tensor = tf.node.decodeImage(processedBuffer, 3);
      const normalized = tensor.div(255.0);
      const batched = normalized.expandDims(0);

      return { tensor: batched, originalTensor: tensor };
    } catch (error) {
      logger.error('Image preprocessing failed:', error);
      throw error;
    }
  }

  async identifyBreed(imageBuffer, options = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('ML service not initialized');
      }

      logger.info('Starting breed identification...');
      const startTime = Date.now();

      // Preprocess image
      const { tensor, originalTensor } = await this.preprocessImage(imageBuffer);

      // Run inference
      const predictions = await this.model.predict(tensor);
      const predictionData = await predictions.data();

      // Clean up tensors
      tf.dispose([tensor, originalTensor, predictions]);

      // Process results
      const results = this.processPredictions(predictionData, options);

      const processingTime = Date.now() - startTime;
      logger.info(`Breed identification completed in ${processingTime}ms`);

      return {
        success: true,
        results,
        processingTime,
        modelVersion: 'v1.0.0',
        confidence: results[0]?.confidence || 0
      };
    } catch (error) {
      logger.error('Breed identification failed:', error);
      throw error;
    }
  }

  processPredictions(predictionData, options = {}) {
    const { topK = MODEL_CONFIG.topK, confidenceThreshold = MODEL_CONFIG.confidenceThreshold } = options;

    // Convert predictions to breed results
    const breedScores = Array.from(predictionData).map((score, index) => ({
      index,
      score,
      confidence: score * 100
    }));

    // Sort by confidence
    breedScores.sort((a, b) => b.confidence - a.confidence);

    // Get top K results
    const topResults = breedScores.slice(0, topK);

    // Convert to breed information
    const results = topResults
      .filter(result => result.confidence >= confidenceThreshold * 100)
      .map(result => {
        const breedId = Object.keys(ALL_BREEDS)[result.index];
        const breedInfo = ALL_BREEDS[breedId];
        
        return {
          id: breedId,
          breed: breedInfo.name,
          confidence: Math.round(result.confidence * 10) / 10,
          species: breedInfo.species,
          origin: breedInfo.origin,
          avgWeight: breedInfo.avgWeight,
          milkYield: breedInfo.milkYield,
          features: breedInfo.features,
          characteristics: breedInfo.characteristics,
          description: `${breedInfo.name} is a ${breedInfo.species.toLowerCase()} breed from ${breedInfo.origin}. ${breedInfo.characteristics.join(', ')}.`
        };
      });

    return results;
  }

  async batchIdentifyBreeds(imageBuffers, options = {}) {
    try {
      const results = [];
      
      for (let i = 0; i < imageBuffers.length; i += this.batchSize) {
        const batch = imageBuffers.slice(i, i + this.batchSize);
        const batchResults = await Promise.all(
          batch.map(imageBuffer => this.identifyBreed(imageBuffer, options))
        );
        results.push(...batchResults);
      }

      return results;
    } catch (error) {
      logger.error('Batch breed identification failed:', error);
      throw error;
    }
  }

  async getModelInfo() {
    return {
      version: 'v1.0.0',
      architecture: 'EfficientNetB3',
      inputShape: MODEL_CONFIG.inputShape,
      numClasses: MODEL_CONFIG.numClasses,
      confidenceThreshold: MODEL_CONFIG.confidenceThreshold,
      breeds: Object.keys(ALL_BREEDS).length,
      lastUpdated: new Date().toISOString()
    };
  }

  async updateModel(newModelPath) {
    try {
      logger.info('Updating model...');
      
      // Load new model
      const newModel = await tf.loadLayersModel(newModelPath);
      
      // Validate new model
      const dummyInput = tf.randomNormal([1, ...MODEL_CONFIG.inputShape]);
      const prediction = await newModel.predict(dummyInput);
      await prediction.data();
      tf.dispose([dummyInput, prediction]);

      // Replace current model
      this.model = newModel;
      
      logger.info('Model updated successfully');
      return { success: true, message: 'Model updated successfully' };
    } catch (error) {
      logger.error('Model update failed:', error);
      throw error;
    }
  }

  async getBreedInfo(breedId) {
    const breed = ALL_BREEDS[breedId];
    if (!breed) {
      throw new Error(`Breed not found: ${breedId}`);
    }
    return breed;
  }

  async getAllBreeds() {
    return ALL_BREEDS;
  }

  async getBreedsBySpecies(species) {
    return Object.entries(ALL_BREEDS)
      .filter(([_, breed]) => breed.species.toLowerCase() === species.toLowerCase())
      .reduce((acc, [id, breed]) => {
        acc[id] = breed;
        return acc;
      }, {});
  }
}

// Create singleton instance
const mlService = new MLService();

// Initialize ML service
export const initMLService = async () => {
  await mlService.initialize();
};

export default mlService;
