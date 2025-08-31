export interface PrivacySettings {
  dataCollection: boolean;
  locationTracking: boolean;
  imageStorage: boolean;
  analyticsTracking: boolean;
  marketingCommunications: boolean;
  dataRetentionDays: number;
}

export interface DataExportRequest {
  userId: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
}

export interface DataDeletionRequest {
  userId: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  deletionType: 'partial' | 'complete';
  retainedData?: string[];
}

class PrivacyService {
  private readonly PRIVACY_SETTINGS_KEY = 'bharat_pashudhan_privacy';
  private readonly CONSENT_KEY = 'bharat_pashudhan_consent';

  // Default privacy settings (privacy-first approach)
  private defaultSettings: PrivacySettings = {
    dataCollection: false,
    locationTracking: false,
    imageStorage: false,
    analyticsTracking: false,
    marketingCommunications: false,
    dataRetentionDays: 30
  };

  // Get current privacy settings
  getPrivacySettings(): PrivacySettings {
    try {
      const settings = localStorage.getItem(this.PRIVACY_SETTINGS_KEY);
      return settings ? { ...this.defaultSettings, ...JSON.parse(settings) } : this.defaultSettings;
    } catch {
      return this.defaultSettings;
    }
  }

  // Update privacy settings
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<boolean> {
    try {
      const currentSettings = this.getPrivacySettings();
      const newSettings = { ...currentSettings, ...settings };
      
      localStorage.setItem(this.PRIVACY_SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Sync with backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/privacy/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(newSettings)
      });

      return response.ok;
    } catch (error) {
      console.error('Privacy settings update error:', error);
      return false;
    }
  }

  // Check if user has given consent for specific data processing
  hasConsent(type: keyof PrivacySettings): boolean {
    const settings = this.getPrivacySettings();
    return settings[type] === true;
  }

  // Record user consent with timestamp
  recordConsent(consentData: Record<string, boolean>): void {
    const consentRecord = {
      ...consentData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consentRecord));
  }

  // Get consent history
  getConsentHistory(): any {
    try {
      const consent = localStorage.getItem(this.CONSENT_KEY);
      return consent ? JSON.parse(consent) : null;
    } catch {
      return null;
    }
  }

  // Request data export (GDPR Article 20)
  async requestDataExport(): Promise<DataExportRequest | null> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/privacy/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Data export request error:', error);
      return null;
    }
  }

  // Request data deletion (GDPR Article 17)
  async requestDataDeletion(deletionType: 'partial' | 'complete' = 'complete'): Promise<DataDeletionRequest | null> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/privacy/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ deletionType })
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Data deletion request error:', error);
      return null;
    }
  }

  // Anonymize image data before processing
  anonymizeImageMetadata(file: File): File {
    // Create a new file without EXIF data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const anonymizedFile = new File([blob], 'anonymized_image.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(anonymizedFile);
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    }) as any;
  }

  // Clear all local data (for logout or data deletion)
  clearAllLocalData(): void {
    // Clear privacy-related data
    localStorage.removeItem(this.PRIVACY_SETTINGS_KEY);
    localStorage.removeItem(this.CONSENT_KEY);
    
    // Clear other app data
    localStorage.removeItem('bharat_pashudhan_token');
    localStorage.removeItem('bharat_pashudhan_user');
    localStorage.removeItem('breedCorrections');
    localStorage.removeItem('preferredLanguage');
    localStorage.removeItem('hasSeenOnboarding');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear IndexedDB data
    this.clearIndexedDBData();
  }

  // Clear IndexedDB data
  private async clearIndexedDBData(): Promise<void> {
    try {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
          }
        })
      );
    } catch (error) {
      console.error('IndexedDB cleanup error:', error);
    }
  }

  // Get data retention policy
  getDataRetentionPolicy(): { [key: string]: number } {
    return {
      'user_sessions': 30, // days
      'breed_identifications': 365, // days
      'audit_logs': 90, // days
      'image_data': 7, // days
      'user_corrections': 180 // days
    };
  }

  // Check if data processing is lawful
  isDataProcessingLawful(purpose: string): boolean {
    const settings = this.getPrivacySettings();
    
    switch (purpose) {
      case 'breed_identification':
        return settings.dataCollection;
      case 'location_services':
        return settings.locationTracking;
      case 'image_storage':
        return settings.imageStorage;
      case 'analytics':
        return settings.analyticsTracking;
      case 'marketing':
        return settings.marketingCommunications;
      default:
        return false;
    }
  }

  // Generate privacy report
  generatePrivacyReport(): any {
    const settings = this.getPrivacySettings();
    const consent = this.getConsentHistory();
    
    return {
      currentSettings: settings,
      consentHistory: consent,
      dataRetentionPolicy: this.getDataRetentionPolicy(),
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
  }

  private getAuthToken(): string | null {
    return sessionStorage.getItem('bharat_pashudhan_token') || 
           localStorage.getItem('bharat_pashudhan_token');
  }
}

export default new PrivacyService();
