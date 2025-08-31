import * as tf from '@tensorflow/tfjs';

export interface BreedPrediction {
  breed: string;
  confidence: number;
  category: 'cattle' | 'buffalo';
  characteristics: string[];
  region: string;
}

export interface AIModelResult {
  predictions: BreedPrediction[];
  processingTime: number;
  imageQuality: number;
  uncertainty: number;
}

// Complete breed database with 43 breeds
export const BREED_DATABASE = {
  cattle: [
    { name: 'Gir', region: 'Gujarat', characteristics: ['Distinctive forehead', 'Drooping ears', 'White/red coat'] },
    { name: 'Sahiwal', region: 'Punjab/Pakistan', characteristics: ['Reddish brown', 'Loose skin', 'Medium size'] },
    { name: 'Red Sindhi', region: 'Sindh/Rajasthan', characteristics: ['Red coat', 'Compact body', 'Heat tolerant'] },
    { name: 'Tharparkar', region: 'Rajasthan', characteristics: ['White/grey coat', 'Long face', 'Drought resistant'] },
    { name: 'Hariana', region: 'Haryana', characteristics: ['White/grey', 'Muscular build', 'Dual purpose'] },
    { name: 'Ongole', region: 'Andhra Pradesh', characteristics: ['White coat', 'Large size', 'Prominent hump'] },
    { name: 'Kankrej', region: 'Gujarat/Rajasthan', characteristics: ['Silver grey', 'Lyre-shaped horns', 'Large size'] },
    { name: 'Rathi', region: 'Rajasthan', characteristics: ['Brown/white patches', 'Medium size', 'Hardy'] },
    { name: 'Krishna Valley', region: 'Karnataka', characteristics: ['Black coat', 'White markings', 'Draught type'] },
    { name: 'Amritmahal', region: 'Karnataka', characteristics: ['Grey coat', 'Compact body', 'Good draught'] },
    { name: 'Hallikar', region: 'Karnataka', characteristics: ['Grey/white', 'Medium size', 'Active temperament'] },
    { name: 'Khillari', region: 'Maharashtra', characteristics: ['Grey coat', 'Straight horns', 'Fast moving'] },
    { name: 'Dangi', region: 'Maharashtra', characteristics: ['Red/brown', 'Compact size', 'Hill adapted'] },
    { name: 'Deoni', region: 'Maharashtra', characteristics: ['Spotted coat', 'Medium size', 'Dual purpose'] },
    { name: 'Nimari', region: 'Madhya Pradesh', characteristics: ['White/grey', 'Medium size', 'Draught type'] },
    { name: 'Malvi', region: 'Madhya Pradesh', characteristics: ['White/grey', 'Compact build', 'Hardy nature'] },
    { name: 'Nagori', region: 'Rajasthan', characteristics: ['White coat', 'Small size', 'Drought tolerant'] },
    { name: 'Mewati', region: 'Haryana/Rajasthan', characteristics: ['White/grey', 'Medium size', 'Dual purpose'] },
    { name: 'Gangatiri', region: 'West Bengal', characteristics: ['Small size', 'Grey coat', 'River adapted'] },
    { name: 'Punganur', region: 'Andhra Pradesh', characteristics: ['Very small', 'Various colors', 'Dwarf breed'] },
    { name: 'Vechur', region: 'Kerala', characteristics: ['Very small', 'Various colors', 'High milk fat'] },
    { name: 'Kasargod', region: 'Kerala', characteristics: ['Small size', 'Red/brown', 'Coastal adapted'] },
    { name: 'Bargur', region: 'Tamil Nadu', characteristics: ['Grey/brown', 'Hill breed', 'Hardy nature'] },
    { name: 'Pulikulam', region: 'Tamil Nadu', characteristics: ['Grey coat', 'Medium size', 'Draught type'] },
    { name: 'Umblachery', region: 'Tamil Nadu', characteristics: ['Grey/brown', 'Compact size', 'Draught type'] },
    { name: 'Jersey Cross', region: 'Pan-India', characteristics: ['Brown/white', 'High milk yield', 'Crossbred'] },
    { name: 'Holstein Friesian Cross', region: 'Pan-India', characteristics: ['Black/white patches', 'Large size', 'High milk'] },
    { name: 'Sahiwal Cross', region: 'North India', characteristics: ['Reddish brown', 'Improved milk', 'Crossbred'] },
    { name: 'Gir Cross', region: 'West India', characteristics: ['White/red', 'Good milk', 'Crossbred'] },
    { name: 'Indigenous Cross', region: 'Pan-India', characteristics: ['Variable traits', 'Local adaptation', 'Mixed breed'] }
  ],
  buffalo: [
    { name: 'Murrah', region: 'Haryana/Punjab', characteristics: ['Black coat', 'Curved horns', 'High milk yield'] },
    { name: 'Jaffarabadi', region: 'Gujarat', characteristics: ['Black coat', 'Large size', 'Pendulous udder'] },
    { name: 'Surti', region: 'Gujarat', characteristics: ['Light brown', 'Medium size', 'Good milk quality'] },
    { name: 'Mehsana', region: 'Gujarat', characteristics: ['Black coat', 'Medium size', 'Good milk yield'] },
    { name: 'Nagpuri', region: 'Maharashtra', characteristics: ['Black coat', 'Medium size', 'Draught type'] },
    { name: 'Toda', region: 'Tamil Nadu', characteristics: ['Black/brown', 'Hill adapted', 'Small size'] },
    { name: 'Pandharpuri', region: 'Maharashtra', characteristics: ['Black coat', 'Medium size', 'River type'] },
    { name: 'Kalahandi', region: 'Odisha', characteristics: ['Grey/black', 'Medium size', 'Swamp type'] },
    { name: 'Banni', region: 'Gujarat', characteristics: ['Black coat', 'Large size', 'Desert adapted'] },
    { name: 'Chilika', region: 'Odisha', characteristics: ['Grey coat', 'Medium size', 'Coastal type'] },
    { name: 'Chhattisgarhi', region: 'Chhattisgarh', characteristics: ['Black/grey', 'Medium size', 'Local breed'] },
    { name: 'Dharwari', region: 'Karnataka', characteristics: ['Black coat', 'Medium size', 'Draught type'] },
    { name: 'Godavari', region: 'Andhra Pradesh', characteristics: ['Black coat', 'Large size', 'River type'] }
  ]
};

class AIService {
  private model: tf.LayersModel | null = null;
  private isModelLoading = false;
  private modelVersion = '1.0.0';

  async loadModel(): Promise<void> {
    if (this.model || this.isModelLoading) return;
    
    this.isModelLoading = true;
    try {
      console.log('Loading AI model...');
      
      // For demo purposes, we'll simulate model loading
      // In production, load actual TensorFlow.js model
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock model structure
      this.model = {
        predict: this.mockPredict.bind(this)
      } as any;
      
      console.log('AI model loaded successfully');
    } catch (error) {
      console.error('Failed to load AI model:', error);
      throw new Error('Failed to load AI model');
    } finally {
      this.isModelLoading = false;
    }
  }

  private mockPredict(imageData: tf.Tensor): tf.Tensor {
    // Mock prediction that returns probabilities for all 43 breeds
    const predictions = new Float32Array(43);
    
    // Generate realistic probability distribution
    for (let i = 0; i < 43; i++) {
      predictions[i] = Math.random() * 0.1; // Low base probability
    }
    
    // Make top 3 predictions more realistic
    const topIndices = [
      Math.floor(Math.random() * 43),
      Math.floor(Math.random() * 43),
      Math.floor(Math.random() * 43)
    ];
    
    predictions[topIndices[0]] = 0.7 + Math.random() * 0.25; // 70-95%
    predictions[topIndices[1]] = 0.1 + Math.random() * 0.15; // 10-25%
    predictions[topIndices[2]] = 0.05 + Math.random() * 0.1; // 5-15%
    
    return tf.tensor1d(predictions);
  }

  async identifyBreed(imageFile: File): Promise<AIModelResult> {
    const startTime = Date.now();
    
    if (!this.model) {
      await this.loadModel();
    }

    try {
      // Preprocess image
      const imageData = await this.preprocessImage(imageFile);
      const imageQuality = this.assessImageQuality(imageData);
      
      // Run inference
      const predictions = this.model!.predict(imageData) as tf.Tensor;
      const probabilities = await predictions.data();
      
      // Get top 3 predictions
      const topPredictions = this.getTopPredictions(probabilities, 3);
      const uncertainty = this.calculateUncertainty(probabilities);
      
      const processingTime = Date.now() - startTime;
      
      // Clean up tensors
      imageData.dispose();
      predictions.dispose();
      
      return {
        predictions: topPredictions,
        processingTime,
        imageQuality,
        uncertainty
      };
    } catch (error) {
      console.error('Breed identification failed:', error);
      throw new Error('Failed to identify breed');
    }
  }

  private async preprocessImage(imageFile: File): Promise<tf.Tensor> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Resize to model input size (224x224 for EfficientNet)
        canvas.width = 224;
        canvas.height = 224;
        
        ctx.drawImage(img, 0, 0, 224, 224);
        
        // Convert to tensor and normalize
        const imageData = ctx.getImageData(0, 0, 224, 224);
        const tensor = tf.browser.fromPixels(imageData)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .div(255.0)
          .expandDims(0);
        
        resolve(tensor);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private assessImageQuality(imageData: tf.Tensor): number {
    // Simple image quality assessment based on variance
    const variance = tf.moments(imageData).variance.dataSync()[0];
    return Math.min(variance * 100, 100); // Scale to 0-100
  }

  private getTopPredictions(probabilities: Float32Array, topK: number): BreedPrediction[] {
    const allBreeds = [...BREED_DATABASE.cattle, ...BREED_DATABASE.buffalo];
    
    // Create array of indices and sort by probability
    const indices = Array.from({ length: probabilities.length }, (_, i) => i);
    indices.sort((a, b) => probabilities[b] - probabilities[a]);
    
    return indices.slice(0, topK).map(index => {
      const breed = allBreeds[index];
      const isCattle = index < BREED_DATABASE.cattle.length;
      
      return {
        breed: breed.name,
        confidence: Math.round(probabilities[index] * 100),
        category: isCattle ? 'cattle' : 'buffalo',
        characteristics: breed.characteristics,
        region: breed.region
      };
    });
  }

  private calculateUncertainty(probabilities: Float32Array): number {
    // Calculate entropy as uncertainty measure
    const entropy = -Array.from(probabilities)
      .filter(p => p > 0)
      .reduce((sum, p) => sum + p * Math.log2(p), 0);
    
    return Math.round(entropy * 10); // Scale for display
  }

  async batchIdentify(imageFiles: File[]): Promise<AIModelResult[]> {
    const results: AIModelResult[] = [];
    
    for (const file of imageFiles) {
      try {
        const result = await this.identifyBreed(file);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        // Add error result
        results.push({
          predictions: [],
          processingTime: 0,
          imageQuality: 0,
          uncertainty: 100
        });
      }
    }
    
    return results;
  }

  async validatePrediction(imageFile: File, userCorrection: string): Promise<void> {
    // Store user corrections for model improvement
    const correction = {
      timestamp: new Date().toISOString(),
      userCorrection,
      imageMetadata: {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      }
    };
    
    // Store in IndexedDB for later sync
    const corrections = JSON.parse(localStorage.getItem('breedCorrections') || '[]');
    corrections.push(correction);
    localStorage.setItem('breedCorrections', JSON.stringify(corrections));
    
    console.log('User correction stored for model improvement');
  }

  getModelInfo() {
    return {
      version: this.modelVersion,
      architecture: 'EfficientNetB3',
      totalBreeds: 43,
      cattleBreeds: BREED_DATABASE.cattle.length,
      buffaloBreeds: BREED_DATABASE.buffalo.length,
      isLoaded: !!this.model,
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
    };
  }

  async getBreedInfo(breedName: string): Promise<any> {
    const allBreeds = [...BREED_DATABASE.cattle, ...BREED_DATABASE.buffalo];
    const breed = allBreeds.find(b => b.name === breedName);
    
    if (!breed) {
      throw new Error(`Breed ${breedName} not found`);
    }
    
    return {
      ...breed,
      category: BREED_DATABASE.cattle.includes(breed) ? 'cattle' : 'buffalo',
      detailedInfo: await this.getDetailedBreedInfo(breedName)
    };
  }

  private async getDetailedBreedInfo(breedName: string) {
    // Mock detailed breed information
    return {
      origin: 'India',
      averageWeight: '400-500 kg',
      milkYield: '8-12 liters/day',
      gestation: '280-285 days',
      lifespan: '15-20 years',
      temperament: 'Docile',
      climateAdaptation: 'Tropical',
      feedRequirements: 'Moderate',
      diseaseResistance: 'Good',
      economicImportance: 'High'
    };
  }
}

export const aiService = new AIService();
export default aiService;
