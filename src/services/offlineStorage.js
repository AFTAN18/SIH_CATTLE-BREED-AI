// Offline Storage Service using IndexedDB
// Handles local data storage, caching, and synchronization

class OfflineStorageService {
  constructor() {
    this.dbName = 'CattleBreedIdentificationDB';
    this.dbVersion = 1;
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize the database
  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('animals')) {
          const animalStore = db.createObjectStore('animals', { keyPath: 'id', autoIncrement: true });
          animalStore.createIndex('breed', 'breed', { unique: false });
          animalStore.createIndex('timestamp', 'timestamp', { unique: false });
          animalStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('breeds')) {
          const breedStore = db.createObjectStore('breeds', { keyPath: 'id' });
          breedStore.createIndex('name', 'name', { unique: true });
          breedStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
          photoStore.createIndex('breedId', 'breedId', { unique: false });
          photoStore.createIndex('timestamp', 'timestamp', { unique: false });
          photoStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('identifications')) {
          const identificationStore = db.createObjectStore('identifications', { keyPath: 'id', autoIncrement: true });
          identificationStore.createIndex('animalId', 'animalId', { unique: false });
          identificationStore.createIndex('breedId', 'breedId', { unique: false });
          identificationStore.createIndex('timestamp', 'timestamp', { unique: false });
          identificationStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true });
          analyticsStore.createIndex('type', 'type', { unique: false });
          analyticsStore.createIndex('date', 'date', { unique: false });
          analyticsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('learningProgress')) {
          const progressStore = db.createObjectStore('learningProgress', { keyPath: 'id', autoIncrement: true });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('moduleId', 'moduleId', { unique: false });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
          progressStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('failedRequests')) {
          const failedRequestsStore = db.createObjectStore('failedRequests', { keyPath: 'timestamp' });
          failedRequestsStore.createIndex('url', 'url', { unique: false });
          failedRequestsStore.createIndex('method', 'method', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
        }

        console.log('Database schema created successfully');
      };
    });
  }

  // Animal operations
  async saveAnimal(animalData) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['animals'], 'readwrite');
      const store = transaction.objectStore('animals');

      const animal = {
        ...animalData,
        timestamp: Date.now(),
        syncStatus: 'pending',
        lastModified: Date.now()
      };

      const request = store.add(animal);

      request.onsuccess = () => {
        console.log('Animal saved locally:', animal);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save animal:', request.error);
        reject(request.error);
      };
    });
  }

  async getAnimals(limit = 50, offset = 0) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['animals'], 'readonly');
      const store = transaction.objectStore('animals');
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        const animals = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(offset, offset + limit);
        resolve(animals);
      };

      request.onerror = () => {
        console.error('Failed to get animals:', request.error);
        reject(request.error);
      };
    });
  }

  async getAnimalById(id) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['animals'], 'readonly');
      const store = transaction.objectStore('animals');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get animal:', request.error);
        reject(request.error);
      };
    });
  }

  async updateAnimal(id, updates) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['animals'], 'readwrite');
      const store = transaction.objectStore('animals');

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const animal = getRequest.result;
        if (animal) {
          const updatedAnimal = {
            ...animal,
            ...updates,
            lastModified: Date.now(),
            syncStatus: 'pending'
          };

          const updateRequest = store.put(updatedAnimal);
          updateRequest.onsuccess = () => {
            console.log('Animal updated locally:', updatedAnimal);
            resolve(updatedAnimal);
          };
          updateRequest.onerror = () => {
            console.error('Failed to update animal:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Animal not found'));
        }
      };
    });
  }

  async deleteAnimal(id) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['animals'], 'readwrite');
      const store = transaction.objectStore('animals');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Animal deleted locally:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete animal:', request.error);
        reject(request.error);
      };
    });
  }

  // Breed operations
  async saveBreeds(breeds) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['breeds'], 'readwrite');
      const store = transaction.objectStore('breeds');

      const promises = breeds.map(breed => {
        return new Promise((resolve, reject) => {
          const request = store.put(breed);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });

      Promise.all(promises)
        .then(() => {
          console.log('Breeds saved locally:', breeds.length);
          resolve();
        })
        .catch(reject);
    });
  }

  async getBreeds() {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['breeds'], 'readonly');
      const store = transaction.objectStore('breeds');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get breeds:', request.error);
        reject(request.error);
      };
    });
  }

  async getBreedById(id) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['breeds'], 'readonly');
      const store = transaction.objectStore('breeds');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get breed:', request.error);
        reject(request.error);
      };
    });
  }

  // Photo operations
  async savePhoto(photoData) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');

      const photo = {
        ...photoData,
        timestamp: Date.now(),
        syncStatus: 'pending',
        lastModified: Date.now()
      };

      const request = store.add(photo);

      request.onsuccess = () => {
        console.log('Photo saved locally:', photo);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save photo:', request.error);
        reject(request.error);
      };
    });
  }

  async getPhotos(breedId = null, limit = 50) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const request = breedId ? store.index('breedId').getAll(breedId) : store.getAll();

      request.onsuccess = () => {
        const photos = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(photos);
      };

      request.onerror = () => {
        console.error('Failed to get photos:', request.error);
        reject(request.error);
      };
    });
  }

  // Identification operations
  async saveIdentification(identificationData) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['identifications'], 'readwrite');
      const store = transaction.objectStore('identifications');

      const identification = {
        ...identificationData,
        timestamp: Date.now(),
        syncStatus: 'pending',
        lastModified: Date.now()
      };

      const request = store.add(identification);

      request.onsuccess = () => {
        console.log('Identification saved locally:', identification);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save identification:', request.error);
        reject(request.error);
      };
    });
  }

  async getIdentifications(animalId = null, limit = 50) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['identifications'], 'readonly');
      const store = transaction.objectStore('identifications');
      const request = animalId ? store.index('animalId').getAll(animalId) : store.getAll();

      request.onsuccess = () => {
        const identifications = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(identifications);
      };

      request.onerror = () => {
        console.error('Failed to get identifications:', request.error);
        reject(request.error);
      };
    });
  }

  // Analytics operations
  async saveAnalytics(analyticsData) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['analytics'], 'readwrite');
      const store = transaction.objectStore('analytics');

      const analytics = {
        ...analyticsData,
        timestamp: Date.now(),
        syncStatus: 'pending',
        lastModified: Date.now()
      };

      const request = store.add(analytics);

      request.onsuccess = () => {
        console.log('Analytics saved locally:', analytics);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save analytics:', request.error);
        reject(request.error);
      };
    });
  }

  async getAnalytics(type = null, startDate = null, endDate = null) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['analytics'], 'readonly');
      const store = transaction.objectStore('analytics');
      const request = type ? store.index('type').getAll(type) : store.getAll();

      request.onsuccess = () => {
        let analytics = request.result;

        if (startDate && endDate) {
          analytics = analytics.filter(item => 
            item.timestamp >= startDate && item.timestamp <= endDate
          );
        }

        analytics.sort((a, b) => b.timestamp - a.timestamp);
        resolve(analytics);
      };

      request.onerror = () => {
        console.error('Failed to get analytics:', request.error);
        reject(request.error);
      };
    });
  }

  // Learning progress operations
  async saveLearningProgress(progressData) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['learningProgress'], 'readwrite');
      const store = transaction.objectStore('learningProgress');

      const progress = {
        ...progressData,
        timestamp: Date.now(),
        syncStatus: 'pending',
        lastModified: Date.now()
      };

      const request = store.add(progress);

      request.onsuccess = () => {
        console.log('Learning progress saved locally:', progress);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save learning progress:', request.error);
        reject(request.error);
      };
    });
  }

  async getLearningProgress(userId = null, moduleId = null) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['learningProgress'], 'readonly');
      const store = transaction.objectStore('learningProgress');
      
      let request;
      if (userId && moduleId) {
        request = store.index('userId').getAll(userId);
      } else if (userId) {
        request = store.index('userId').getAll(userId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        let progress = request.result;

        if (moduleId) {
          progress = progress.filter(item => item.moduleId === moduleId);
        }

        progress.sort((a, b) => b.timestamp - a.timestamp);
        resolve(progress);
      };

      request.onerror = () => {
        console.error('Failed to get learning progress:', request.error);
        reject(request.error);
      };
    });
  }

  // Settings operations
  async saveSetting(key, value) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');

      const setting = {
        key,
        value,
        timestamp: Date.now()
      };

      const request = store.put(setting);

      request.onsuccess = () => {
        console.log('Setting saved locally:', setting);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save setting:', request.error);
        reject(request.error);
      };
    });
  }

  async getSetting(key) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };

      request.onerror = () => {
        console.error('Failed to get setting:', request.error);
        reject(request.error);
      };
    });
  }

  // Failed requests operations
  async saveFailedRequest(requestData) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['failedRequests'], 'readwrite');
      const store = transaction.objectStore('failedRequests');

      const failedRequest = {
        ...requestData,
        timestamp: Date.now()
      };

      const request = store.add(failedRequest);

      request.onsuccess = () => {
        console.log('Failed request saved locally:', failedRequest);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save failed request:', request.error);
        reject(request.error);
      };
    });
  }

  async getFailedRequests() {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['failedRequests'], 'readonly');
      const store = transaction.objectStore('failedRequests');
      const request = store.getAll();

      request.onsuccess = () => {
        const failedRequests = request.result.sort((a, b) => a.timestamp - b.timestamp);
        resolve(failedRequests);
      };

      request.onerror = () => {
        console.error('Failed to get failed requests:', request.error);
        reject(request.error);
      };
    });
  }

  async removeFailedRequest(timestamp) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['failedRequests'], 'readwrite');
      const store = transaction.objectStore('failedRequests');
      const request = store.delete(timestamp);

      request.onsuccess = () => {
        console.log('Failed request removed:', timestamp);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove failed request:', request.error);
        reject(request.error);
      };
    });
  }

  // Sync operations
  async getPendingSyncData() {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['animals', 'photos', 'identifications', 'analytics', 'learningProgress'], 'readonly');
      
      const pendingData = {
        animals: [],
        photos: [],
        identifications: [],
        analytics: [],
        learningProgress: []
      };

      const stores = ['animals', 'photos', 'identifications', 'analytics', 'learningProgress'];
      let completed = 0;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.index('syncStatus').getAll('pending');

        request.onsuccess = () => {
          pendingData[storeName] = request.result;
          completed++;

          if (completed === stores.length) {
            resolve(pendingData);
          }
        };

        request.onerror = () => {
          console.error(`Failed to get pending ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  async markAsSynced(storeName, id) {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = {
            ...item,
            syncStatus: 'synced',
            lastSynced: Date.now()
          };

          const updateRequest = store.put(updatedItem);
          updateRequest.onsuccess = () => {
            console.log(`${storeName} marked as synced:`, id);
            resolve();
          };
          updateRequest.onerror = () => {
            console.error(`Failed to mark ${storeName} as synced:`, updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error(`${storeName} not found`));
        }
      };
    });
  }

  // Utility operations
  async clearAllData() {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const stores = ['animals', 'breeds', 'photos', 'identifications', 'analytics', 'learningProgress', 'failedRequests', 'settings'];
      const transaction = this.db.transaction(stores, 'readwrite');
      
      let completed = 0;
      let hasError = false;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === stores.length && !hasError) {
            console.log('All data cleared successfully');
            resolve();
          }
        };

        request.onerror = () => {
          console.error(`Failed to clear ${storeName}:`, request.error);
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async getDatabaseSize() {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const stores = ['animals', 'breeds', 'photos', 'identifications', 'analytics', 'learningProgress', 'failedRequests', 'settings'];
      const transaction = this.db.transaction(stores, 'readonly');
      
      const sizeInfo = {};
      let completed = 0;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => {
          sizeInfo[storeName] = request.result;
          completed++;

          if (completed === stores.length) {
            resolve(sizeInfo);
          }
        };

        request.onerror = () => {
          console.error(`Failed to get ${storeName} count:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  // Check if offline storage is available
  static isSupported() {
    return 'indexedDB' in window;
  }

  // Get storage usage
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage,
          quota: estimate.quota,
          usagePercent: (estimate.usage / estimate.quota) * 100
        };
      } catch (error) {
        console.error('Failed to get storage usage:', error);
        return null;
      }
    }
    return null;
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorageService();

export default offlineStorage;
