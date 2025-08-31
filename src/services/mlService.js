import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class MLService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/ml`,
      timeout: 30000, // 30 seconds for ML processing
    });
  }

  /**
   * Identify breed from image
   */
  async identifyBreed(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await this.api.post('/identify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('ML identification error:', error);
      throw new Error(error.response?.data?.error || 'Breed identification failed');
    }
  }

  /**
   * Get all available breeds
   */
  async getAvailableBreeds() {
    try {
      const response = await this.api.get('/breeds');
      return response.data;
    } catch (error) {
      console.error('Error fetching breeds:', error);
      throw new Error('Failed to fetch breeds');
    }
  }

  /**
   * Get breeds by type (cattle/buffalo)
   */
  async getBreedsByType(type) {
    try {
      const response = await this.api.get(`/breeds/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching breeds by type:', error);
      throw new Error('Failed to fetch breeds by type');
    }
  }

  /**
   * Search breeds by keyword
   */
  async searchBreeds(keyword) {
    try {
      const response = await this.api.get(`/breeds/search/${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching breeds:', error);
      throw new Error('Failed to search breeds');
    }
  }

  /**
   * Get breed information
   */
  async getBreedInfo(breed) {
    try {
      const response = await this.api.get(`/breeds/${breed}/info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching breed info:', error);
      throw new Error('Failed to fetch breed information');
    }
  }

  /**
   * Get breed characteristics
   */
  async getBreedCharacteristics(breed) {
    try {
      const response = await this.api.get(`/breeds/${breed}/characteristics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching breed characteristics:', error);
      throw new Error('Failed to fetch breed characteristics');
    }
  }

  /**
   * Check ML service health
   */
  async checkHealth() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('ML service health check failed:', error);
      return {
        success: false,
        error: 'ML service unavailable'
      };
    }
  }

  /**
   * Process image for breed identification with progress callback
   */
  async identifyBreedWithProgress(imageFile, onProgress) {
    try {
      // Simulate progress for better UX
      onProgress?.(10, 'Analyzing image...');
      
      const formData = new FormData();
      formData.append('image', imageFile);

      onProgress?.(30, 'Processing image features...');
      
      const response = await this.api.post('/identify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(30 + percentCompleted * 0.6, 'Uploading image...');
        },
      });

      onProgress?.(100, 'Analysis complete!');
      
      return response.data;
    } catch (error) {
      console.error('ML identification error:', error);
      throw new Error(error.response?.data?.error || 'Breed identification failed');
    }
  }
}

export default new MLService();
