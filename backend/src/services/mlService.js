import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

// Initialize Google Cloud Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './google-cloud-key.json'
});

// Simple breed database for matching
const BREED_DATABASE = {
  'gir': {
    keywords: ['hump', 'drooping ears', 'reddish', 'large', 'cattle'],
    characteristics: ['Large hump', 'Drooping ears', 'Reddish coat', 'Large size']
  },
  'sahiwal': {
    keywords: ['red', 'brown', 'medium', 'cattle', 'dairy'],
    characteristics: ['Reddish brown', 'Medium size', 'Good dairy breed']
  },
  'murrah': {
    keywords: ['black', 'buffalo', 'curved horns', 'large'],
    characteristics: ['Black color', 'Curved horns', 'Large buffalo']
  },
  'jaffarabadi': {
    keywords: ['buffalo', 'large', 'black', 'long horns'],
    characteristics: ['Large buffalo', 'Long horns', 'Black color']
  }
};

export class MLService {
  /**
   * Analyze image and identify breed
   */
  static async identifyBreed(imagePath) {
    try {
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      
      // Perform image analysis
      const [result] = await client.labelDetection(imageBuffer);
      const labels = result.labelAnnotations;
      
      // Extract relevant labels
      const relevantLabels = labels
        .filter(label => label.score > 0.7)
        .map(label => label.description.toLowerCase());
      
      console.log('Detected labels:', relevantLabels);
      
      // Match against breed database
      const breedMatches = this.matchBreeds(relevantLabels);

      return {
        success: true,
        primary_breed: breedMatches.primary,
        confidence: breedMatches.confidence,
        alternative_breeds: breedMatches.alternatives,
        detected_features: relevantLabels,
        processing_time: Date.now()
      };
      
    } catch (error) {
      console.error('ML Service Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'Please use manual breed selection'
      };
    }
  }
  
  /**
   * Match detected labels against breed database
   */
  static matchBreeds(labels) {
    const scores = {};
    
    // Calculate scores for each breed
    Object.keys(BREED_DATABASE).forEach(breed => {
      const breedData = BREED_DATABASE[breed];
      let score = 0;
      
      labels.forEach(label => {
        if (breedData.keywords.some(keyword => label.includes(keyword))) {
          score += 1;
        }
      });
      
      scores[breed] = score;
    });
    
    // Find best matches
    const sortedBreeds = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);
    
    if (sortedBreeds.length === 0) {
    return {
        primary: 'unknown',
        confidence: 0,
        alternatives: []
      };
    }
    
    const [primaryBreed, primaryScore] = sortedBreeds[0];
    const maxPossibleScore = Math.max(...Object.values(BREED_DATABASE[primaryBreed].keywords));
    const confidence = Math.min((primaryScore / maxPossibleScore) * 100, 95);
    
    const alternatives = sortedBreeds
      .slice(1, 4)
      .map(([breed, score]) => ({
        breed,
        confidence: Math.min((score / maxPossibleScore) * 100, 90)
      }));
    
    return {
      primary: primaryBreed,
      confidence: Math.round(confidence),
      alternatives
    };
  }
  
  /**
   * Get breed characteristics
   */
  static getBreedCharacteristics(breed) {
    return BREED_DATABASE[breed]?.characteristics || [];
  }
  
  /**
   * Get all available breeds
   */
  static getAvailableBreeds() {
    return Object.keys(BREED_DATABASE);
  }
}
