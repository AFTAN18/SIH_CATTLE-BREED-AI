import Dexie, { Table } from 'dexie';

export interface OfflineAnimal {
  id?: number;
  breedId: string;
  breedName: string;
  confidence: number;
  imageData: string;
  metadata: any;
  timestamp: string;
  synced: boolean;
  userId: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface OfflineBreed {
  id: string;
  name: string;
  category: 'cattle' | 'buffalo';
  characteristics: string[];
  region: string;
  images: string[];
  description: string;
  physicalTraits: any;
  performance: any;
}

export interface OfflineUser {
  id: string;
  name: string;
  role: string;
  region: string;
  preferences: any;
  lastSync: string;
}

export interface OfflineLearning {
  id: string;
  moduleId: string;
  userId: string;
  progress: number;
  completed: boolean;
  score?: number;
  timestamp: string;
}

export interface OfflineCorrection {
  id?: number;
  originalPrediction: string;
  correctBreed: string;
  imageData: string;
  confidence: number;
  timestamp: string;
  userId: string;
  synced: boolean;
}

class OfflineDatabase extends Dexie {
  animals!: Table<OfflineAnimal>;
  breeds!: Table<OfflineBreed>;
  users!: Table<OfflineUser>;
  learning!: Table<OfflineLearning>;
  corrections!: Table<OfflineCorrection>;

  constructor() {
    super('BharatPashudhanDB');
    
    this.version(1).stores({
      animals: '++id, breedId, breedName, timestamp, synced, userId',
      breeds: 'id, name, category, region',
      users: 'id, name, role, region',
      learning: '++id, moduleId, userId, completed, timestamp',
      corrections: '++id, originalPrediction, correctBreed, timestamp, userId, synced'
    });
  }
}

class OfflineStorageService {
  private db: OfflineDatabase;
  private syncInProgress = false;
  private maxStorageSize = 50 * 1024 * 1024; // 50MB

  constructor() {
    this.db = new OfflineDatabase();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.open();
      await this.seedBreedData();
      console.log('Offline storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      throw error;
    }
  }

  // Animal Management
  async saveAnimal(animal: Omit<OfflineAnimal, 'id'>): Promise<number> {
    try {
      const id = await this.db.animals.add(animal);
      await this.checkStorageLimit();
      return id;
    } catch (error) {
      console.error('Failed to save animal:', error);
      throw error;
    }
  }

  async getAnimals(limit = 50, offset = 0): Promise<OfflineAnimal[]> {
    return this.db.animals
      .orderBy('timestamp')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async getUnsyncedAnimals(): Promise<OfflineAnimal[]> {
    return this.db.animals.where('synced').equals(false).toArray();
  }

  async markAnimalSynced(id: number): Promise<void> {
    await this.db.animals.update(id, { synced: true });
  }

  // Breed Management
  async getBreeds(): Promise<OfflineBreed[]> {
    return this.db.breeds.toArray();
  }

  async getBreedById(id: string): Promise<OfflineBreed | undefined> {
    return this.db.breeds.get(id);
  }

  async searchBreeds(query: string): Promise<OfflineBreed[]> {
    const lowerQuery = query.toLowerCase();
    return this.db.breeds
      .filter(breed => 
        breed.name.toLowerCase().includes(lowerQuery) ||
        breed.region.toLowerCase().includes(lowerQuery) ||
        breed.characteristics.some(char => char.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  async getBreedsByCategory(category: 'cattle' | 'buffalo'): Promise<OfflineBreed[]> {
    return this.db.breeds.where('category').equals(category).toArray();
  }

  // Learning Progress
  async saveLearningProgress(progress: Omit<OfflineLearning, 'id'>): Promise<number> {
    return this.db.learning.add(progress);
  }

  async getLearningProgress(userId: string): Promise<OfflineLearning[]> {
    return this.db.learning.where('userId').equals(userId).toArray();
  }

  async updateLearningProgress(id: string, updates: Partial<OfflineLearning>): Promise<void> {
    await this.db.learning.update(id, updates);
  }

  // User Corrections
  async saveCorrection(correction: Omit<OfflineCorrection, 'id'>): Promise<number> {
    return this.db.corrections.add(correction);
  }

  async getUnsyncedCorrections(): Promise<OfflineCorrection[]> {
    return this.db.corrections.where('synced').equals(false).toArray();
  }

  async markCorrectionSynced(id: number): Promise<void> {
    await this.db.corrections.update(id, { synced: true });
  }

  // Analytics Data
  async getAnalyticsData(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const animals = await this.db.animals
      .where('userId')
      .equals(userId)
      .and(animal => {
        const animalDate = new Date(animal.timestamp);
        return animalDate >= startDate && animalDate <= endDate;
      })
      .toArray();

    const totalIdentifications = animals.length;
    const averageConfidence = animals.length > 0 
      ? animals.reduce((sum, animal) => sum + animal.confidence, 0) / animals.length 
      : 0;

    const breedCounts = animals.reduce((acc, animal) => {
      acc[animal.breedName] = (acc[animal.breedName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIdentifications,
      averageConfidence: Math.round(averageConfidence),
      breedDistribution: Object.entries(breedCounts).map(([breed, count]) => ({
        breed,
        count
      })),
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    };
  }

  // Sync Management
  async syncWithServer(apiUrl: string, authToken: string): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    try {
      // Sync unsynced animals
      const unsyncedAnimals = await this.getUnsyncedAnimals();
      for (const animal of unsyncedAnimals) {
        try {
          const response = await fetch(`${apiUrl}/api/animals`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(animal)
          });

          if (response.ok) {
            await this.markAnimalSynced(animal.id!);
          }
        } catch (error) {
          console.error(`Failed to sync animal ${animal.id}:`, error);
        }
      }

      // Sync corrections
      const unsyncedCorrections = await this.getUnsyncedCorrections();
      for (const correction of unsyncedCorrections) {
        try {
          const response = await fetch(`${apiUrl}/api/ml/corrections`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(correction)
          });

          if (response.ok) {
            await this.markCorrectionSynced(correction.id!);
          }
        } catch (error) {
          console.error(`Failed to sync correction ${correction.id}:`, error);
        }
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Storage Management
  async getStorageUsage(): Promise<{ used: number; available: number; percentage: number }> {
    const estimate = await navigator.storage?.estimate?.() || { usage: 0, quota: this.maxStorageSize };
    const used = estimate.usage || 0;
    const available = estimate.quota || this.maxStorageSize;
    const percentage = (used / available) * 100;

    return { used, available, percentage };
  }

  async checkStorageLimit(): Promise<void> {
    const { percentage } = await this.getStorageUsage();
    
    if (percentage > 90) {
      // Clean up old data
      await this.cleanupOldData();
    }
  }

  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3); // Keep 3 months of data
    
    const oldAnimals = await this.db.animals
      .where('timestamp')
      .below(cutoffDate.toISOString())
      .and(animal => animal.synced)
      .toArray();

    if (oldAnimals.length > 0) {
      await this.db.animals.bulkDelete(oldAnimals.map(a => a.id!));
      console.log(`Cleaned up ${oldAnimals.length} old records`);
    }
  }

  // Seed breed data
  private async seedBreedData(): Promise<void> {
    const existingBreeds = await this.db.breeds.count();
    if (existingBreeds > 0) return;

    const breeds: OfflineBreed[] = [
      // Cattle breeds
      {
        id: 'gir',
        name: 'Gir',
        category: 'cattle',
        characteristics: ['Distinctive forehead', 'Drooping ears', 'White/red coat'],
        region: 'Gujarat',
        images: [],
        description: 'Indigenous cattle breed known for high milk production and heat tolerance',
        physicalTraits: {
          size: 'Large',
          color: 'White with red patches',
          horns: 'Curved backwards',
          ears: 'Long and pendulous',
          hump: 'Well developed'
        },
        performance: {
          milkYield: '10-15 liters/day',
          lactationPeriod: '300-400 days',
          calving: 'Easy',
          adaptability: 'High'
        }
      },
      {
        id: 'sahiwal',
        name: 'Sahiwal',
        category: 'cattle',
        characteristics: ['Reddish brown', 'Loose skin', 'Medium size'],
        region: 'Punjab/Pakistan',
        images: [],
        description: 'Heat tolerant breed with good milk production',
        physicalTraits: {
          size: 'Medium to large',
          color: 'Reddish brown',
          horns: 'Short and thick',
          ears: 'Medium sized',
          hump: 'Moderate'
        },
        performance: {
          milkYield: '8-12 liters/day',
          lactationPeriod: '280-350 days',
          calving: 'Easy',
          adaptability: 'Very high'
        }
      },
      // Buffalo breeds
      {
        id: 'murrah',
        name: 'Murrah',
        category: 'buffalo',
        characteristics: ['Black coat', 'Curved horns', 'High milk yield'],
        region: 'Haryana/Punjab',
        images: [],
        description: 'Most popular buffalo breed with highest milk production',
        physicalTraits: {
          size: 'Large',
          color: 'Jet black',
          horns: 'Tightly curved',
          ears: 'Small',
          body: 'Compact and well-built'
        },
        performance: {
          milkYield: '15-20 liters/day',
          lactationPeriod: '300-400 days',
          calving: 'Normal',
          adaptability: 'Good'
        }
      }
      // Add more breeds as needed
    ];

    await this.db.breeds.bulkAdd(breeds);
    console.log('Breed data seeded successfully');
  }

  // Export/Import functionality
  async exportData(): Promise<Blob> {
    const data = {
      animals: await this.db.animals.toArray(),
      breeds: await this.db.breeds.toArray(),
      learning: await this.db.learning.toArray(),
      corrections: await this.db.corrections.toArray(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    return new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
  }

  async importData(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.animals) {
        await this.db.animals.bulkAdd(data.animals);
      }
      if (data.learning) {
        await this.db.learning.bulkAdd(data.learning);
      }
      if (data.corrections) {
        await this.db.corrections.bulkAdd(data.corrections);
      }

      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    await this.db.animals.clear();
    await this.db.learning.clear();
    await this.db.corrections.clear();
    console.log('All user data cleared');
  }

  async getStatistics() {
    const [
      totalAnimals,
      totalBreeds,
      totalLearning,
      totalCorrections,
      unsyncedCount
    ] = await Promise.all([
      this.db.animals.count(),
      this.db.breeds.count(),
      this.db.learning.count(),
      this.db.corrections.count(),
      this.db.animals.where('synced').equals(false).count()
    ]);

    const storageUsage = await this.getStorageUsage();

    return {
      totalAnimals,
      totalBreeds,
      totalLearning,
      totalCorrections,
      unsyncedCount,
      storageUsage
    };
  }
}

export const offlineStorage = new OfflineStorageService();
export default offlineStorage;
