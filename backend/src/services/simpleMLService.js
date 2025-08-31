import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Comprehensive breed database with characteristics
const BREED_DATABASE = {
  // Cattle Breeds
  'gir': {
    name: 'Gir',
    type: 'cattle',
    origin: 'Gujarat, India',
    characteristics: ['Large hump', 'Drooping ears', 'Reddish coat', 'Large size', 'Docile nature'],
    keywords: ['hump', 'drooping', 'ears', 'reddish', 'red', 'large', 'cattle', 'docile'],
    avgWeight: '400-500 kg',
    milkYield: '12-18 L/day',
    color: 'reddish',
    features: ['distinctive hump', 'pendulous ears', 'docile temperament']
  },
  'sahiwal': {
    name: 'Sahiwal',
    type: 'cattle',
    origin: 'Punjab, India',
    characteristics: ['Reddish brown', 'Medium size', 'Good dairy breed', 'Heat tolerant'],
    keywords: ['red', 'brown', 'reddish', 'medium', 'cattle', 'dairy', 'heat', 'tolerant'],
    avgWeight: '350-450 kg',
    milkYield: '15-20 L/day',
    color: 'reddish brown',
    features: ['good dairy breed', 'heat tolerant', 'medium size']
  },
  'redSindhi': {
    name: 'Red Sindhi',
    type: 'cattle',
    origin: 'Sindh, Pakistan',
    characteristics: ['Red color', 'Medium size', 'Dairy breed', 'Tropical adapted'],
    keywords: ['red', 'medium', 'cattle', 'dairy', 'tropical', 'adapted'],
    avgWeight: '300-400 kg',
    milkYield: '14-18 L/day',
    color: 'red',
    features: ['red color', 'dairy breed', 'tropical adaptation']
  },
  'tharparkar': {
    name: 'Tharparkar',
    type: 'cattle',
    origin: 'Rajasthan, India',
    characteristics: ['White color', 'Medium size', 'Dual purpose', 'Desert adapted'],
    keywords: ['white', 'medium', 'cattle', 'dual', 'desert', 'adapted'],
    avgWeight: '350-450 kg',
    milkYield: '12-16 L/day',
    color: 'white',
    features: ['white color', 'dual purpose', 'desert adaptation']
  },
  'hariana': {
    name: 'Hariana',
    type: 'cattle',
    origin: 'Haryana, India',
    characteristics: ['White color', 'Large size', 'Draft breed', 'Strong build'],
    keywords: ['white', 'large', 'cattle', 'draft', 'strong', 'build'],
    avgWeight: '400-500 kg',
    milkYield: '8-12 L/day',
    color: 'white',
    features: ['white color', 'draft breed', 'strong build']
  },
  
  // Buffalo Breeds
  'murrah': {
    name: 'Murrah',
    type: 'buffalo',
    origin: 'Haryana, India',
    characteristics: ['Black color', 'Curved horns', 'Large size', 'High milk yield'],
    keywords: ['black', 'buffalo', 'curved', 'horns', 'large', 'milk'],
    avgWeight: '500-600 kg',
    milkYield: '18-25 L/day',
    color: 'black',
    features: ['black color', 'curved horns', 'high milk yield']
  },
  'jaffarabadi': {
    name: 'Jaffarabadi',
    type: 'buffalo',
    origin: 'Gujarat, India',
    characteristics: ['Large buffalo', 'Long horns', 'Black color', 'Heavy build'],
    keywords: ['buffalo', 'large', 'long', 'horns', 'black', 'heavy'],
    avgWeight: '600-700 kg',
    milkYield: '20-28 L/day',
    color: 'black',
    features: ['large size', 'long horns', 'heavy build']
  },
  'surti': {
    name: 'Surti',
    type: 'buffalo',
    origin: 'Gujarat, India',
    characteristics: ['Medium size', 'Curved horns', 'Black color', 'Good dairy'],
    keywords: ['buffalo', 'medium', 'curved', 'horns', 'black', 'dairy'],
    avgWeight: '400-500 kg',
    milkYield: '15-20 L/day',
    color: 'black',
    features: ['medium size', 'curved horns', 'good dairy']
  }
};

export class SimpleMLService {
  /**
   * Analyze image and identify breed using simple image processing
   */
  static async identifyBreed(imagePath) {
    try {
      console.log('Starting breed identification for:', imagePath);
      
      // Basic image analysis
      const imageAnalysis = await this.analyzeImage(imagePath);
      
      // Extract features from image
      const features = this.extractFeatures(imageAnalysis);
      
      // Match against breed database
      const breedMatches = this.matchBreeds(features);
      
      // Calculate confidence based on feature matches
      const confidence = this.calculateConfidence(breedMatches, features);
      
      return {
        success: true,
        primary_breed: breedMatches.primary,
        confidence: confidence,
        alternative_breeds: breedMatches.alternatives,
        detected_features: features,
        image_analysis: imageAnalysis,
        processing_time: Date.now(),
        model_version: 'simple-v1.0'
      };
      
    } catch (error) {
      console.error('Simple ML Service Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'Please use manual breed selection'
      };
    }
  }
  
  /**
   * Basic image analysis using Sharp
   */
  static async analyzeImage(imagePath) {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Get dominant colors
      const { data } = await image
        .resize(100, 100)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Simple color analysis
      const colors = this.analyzeColors(data);
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        colors: colors,
        aspectRatio: metadata.width / metadata.height
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        error: error.message
      };
    }
  }
  
  /**
   * Analyze dominant colors in image
   */
  static analyzeColors(imageData) {
    const colors = {
      red: 0,
      green: 0,
      blue: 0,
      white: 0,
      black: 0,
      brown: 0
    };
    
    for (let i = 0; i < imageData.length; i += 3) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      
      // Simple color classification
      if (r > 200 && g > 200 && b > 200) {
        colors.white++;
      } else if (r < 50 && g < 50 && b < 50) {
        colors.black++;
      } else if (r > g && r > b && r > 150) {
        colors.red++;
      } else if (g > r && g > b && g > 150) {
        colors.green++;
      } else if (b > r && b > g && b > 150) {
        colors.blue++;
      } else if (r > 100 && g > 50 && b < 100) {
        colors.brown++;
      }
    }
    
    return colors;
  }
  
  /**
   * Extract features from image analysis
   */
  static extractFeatures(imageAnalysis) {
    const features = [];
    
    if (imageAnalysis.error) {
      return features;
    }
    
    // Color-based features
    const totalPixels = imageAnalysis.width * imageAnalysis.height;
    const colorPercentages = {};
    
    Object.keys(imageAnalysis.colors).forEach(color => {
      colorPercentages[color] = (imageAnalysis.colors[color] / totalPixels) * 100;
    });
    
    // Add color features
    if (colorPercentages.red > 20) features.push('red');
    if (colorPercentages.brown > 15) features.push('brown');
    if (colorPercentages.black > 30) features.push('black');
    if (colorPercentages.white > 40) features.push('white');
    
    // Size-based features
    if (imageAnalysis.width > 1000 || imageAnalysis.height > 1000) {
      features.push('large');
    } else if (imageAnalysis.width < 500 || imageAnalysis.height < 500) {
      features.push('small');
    } else {
      features.push('medium');
    }
    
    // Aspect ratio features
    if (imageAnalysis.aspectRatio > 1.5) {
      features.push('wide');
    } else if (imageAnalysis.aspectRatio < 0.7) {
      features.push('tall');
    }
    
    return features;
  }
  
  /**
   * Match extracted features against breed database
   */
  static matchBreeds(features) {
    const scores = {};
    
    // Calculate scores for each breed
    Object.keys(BREED_DATABASE).forEach(breed => {
      const breedData = BREED_DATABASE[breed];
      let score = 0;
      
      features.forEach(feature => {
        if (breedData.keywords.some(keyword => 
          feature.includes(keyword) || keyword.includes(feature)
        )) {
          score += 2; // Higher weight for keyword matches
        }
        
        // Color matching
        if (breedData.color && feature === breedData.color) {
          score += 3; // High weight for color matches
        }
        
        // Size matching
        if (breedData.characteristics.some(char => 
          char.toLowerCase().includes(feature)
        )) {
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
    
    const [primaryBreed] = sortedBreeds[0];
    const alternatives = sortedBreeds
      .slice(1, 4)
      .map(([breed, score]) => ({
        breed,
        name: BREED_DATABASE[breed].name,
        confidence: Math.min(score * 10, 85)
      }));
    
    return {
      primary: primaryBreed,
      alternatives
    };
  }
  
  /**
   * Calculate confidence score
   */
  static calculateConfidence(breedMatches, features) {
    if (breedMatches.primary === 'unknown') {
      return 0;
    }
    
    const breedData = BREED_DATABASE[breedMatches.primary];
    let confidence = 30; // Base confidence
    
    // Add confidence based on feature matches
    features.forEach(feature => {
      if (breedData.keywords.some(keyword => 
        feature.includes(keyword) || keyword.includes(feature)
      )) {
        confidence += 15;
      }
      
      if (breedData.color && feature === breedData.color) {
        confidence += 20;
      }
    });
    
    // Cap confidence at 90% for simple model
    return Math.min(confidence, 90);
  }
  
  /**
   * Get breed information
   */
  static getBreedInfo(breed) {
    return BREED_DATABASE[breed] || null;
  }
  
  /**
   * Get all available breeds
   */
  static getAvailableBreeds() {
    return Object.keys(BREED_DATABASE).map(breed => ({
      id: breed,
      name: BREED_DATABASE[breed].name,
      type: BREED_DATABASE[breed].type,
      origin: BREED_DATABASE[breed].origin
    }));
  }
  
  /**
   * Get breeds by type (cattle/buffalo)
   */
  static getBreedsByType(type) {
    return Object.entries(BREED_DATABASE)
      .filter(([, breedData]) => breedData.type === type)
      .map(([breed, breedData]) => ({
        id: breed,
        name: breedData.name,
        type: breedData.type,
        origin: breedData.origin
      }));
  }
  
  /**
   * Search breeds by keyword
   */
  static searchBreeds(keyword) {
    const searchTerm = keyword.toLowerCase();
    return Object.entries(BREED_DATABASE)
      .filter(([breed, breedData]) => 
        breed.toLowerCase().includes(searchTerm) ||
        breedData.name.toLowerCase().includes(searchTerm) ||
        breedData.origin.toLowerCase().includes(searchTerm) ||
        breedData.keywords.some(k => k.includes(searchTerm))
      )
      .map(([breed, breedData]) => ({
        id: breed,
        name: breedData.name,
        type: breedData.type,
        origin: breedData.origin
      }));
  }
}
