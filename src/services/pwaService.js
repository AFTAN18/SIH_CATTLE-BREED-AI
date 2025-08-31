// PWA Service for handling service worker registration and PWA functionality

class PWAService {
  constructor() {
    this.swRegistration = null;
    this.isUpdateAvailable = false;
    this.updateCallbacks = [];
    this.isOnline = navigator.onLine;
    this.offlineCallbacks = [];
    this.onlineCallbacks = [];
  }

  // Initialize PWA functionality
  async initialize() {
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Set up online/offline listeners
      this.setupOnlineOfflineListeners();
      
      // Set up update listeners
      this.setupUpdateListeners();
      
      // Request notification permission
      await this.requestNotificationPermission();
      
      console.log('PWA Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA Service:', error);
    }
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully:', this.swRegistration);

        // Handle service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.isUpdateAvailable = true;
              this.notifyUpdateCallbacks();
            }
          });
        });

        return this.swRegistration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      console.warn('Service Worker not supported');
      return null;
    }
  }

  // Set up online/offline listeners
  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineCallbacks();
      console.log('App is online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOfflineCallbacks();
      console.log('App is offline');
    });
  }

  // Set up update listeners
  setupUpdateListeners() {
    if (this.swRegistration) {
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.isUpdateAvailable = true;
            this.notifyUpdateCallbacks();
          }
        });
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
          return permission;
        } catch (error) {
          console.error('Failed to request notification permission:', error);
          return 'denied';
        }
      }
      return Notification.permission;
    }
    return 'unsupported';
  }

  // Show notification
  async showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [100, 50, 100],
          requireInteraction: false,
          ...options
        });

        notification.addEventListener('click', () => {
          window.focus();
          notification.close();
        });

        return notification;
      } catch (error) {
        console.error('Failed to show notification:', error);
        return null;
      }
    }
    return null;
  }

  // Show update notification
  async showUpdateNotification() {
    return this.showNotification('App Update Available', {
      body: 'A new version of the app is available. Click to update.',
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: 'Update Now'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    });
  }

  // Update the app
  async updateApp() {
    if (this.swRegistration && this.isUpdateAvailable) {
      try {
        // Send message to service worker to skip waiting
        if (this.swRegistration.waiting) {
          this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Reload the page to activate the new service worker
        window.location.reload();
      } catch (error) {
        console.error('Failed to update app:', error);
      }
    }
  }

  // Check for updates
  async checkForUpdates() {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
        return true;
      } catch (error) {
        console.error('Failed to check for updates:', error);
        return false;
      }
    }
    return false;
  }

  // Get app installation status
  async getInstallationStatus() {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        return relatedApps.length > 0;
      } catch (error) {
        console.error('Failed to get installation status:', error);
        return false;
      }
    }
    return false;
  }

  // Show install prompt
  async showInstallPrompt() {
    if ('BeforeInstallPromptEvent' in window) {
      // This would be set up in the main app component
      return true;
    }
    return false;
  }

  // Get PWA capabilities
  getPWACapabilities() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      pushManager: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      storage: 'storage' in navigator && 'estimate' in navigator.storage,
      indexedDB: 'indexedDB' in window,
      cache: 'caches' in window,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      share: 'share' in navigator,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    };
  }

  // Get connection status
  getConnectionStatus() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  // Check if app is installed
  isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  // Get app version
  async getAppVersion() {
    if (this.swRegistration) {
      try {
        const channel = new MessageChannel();
        return new Promise((resolve) => {
          channel.port1.onmessage = (event) => {
            resolve(event.data.version);
          };
          this.swRegistration.active.postMessage(
            { type: 'GET_VERSION' },
            [channel.port2]
          );
        });
      } catch (error) {
        console.error('Failed to get app version:', error);
        return 'unknown';
      }
    }
    return 'unknown';
  }

  // Add update callback
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  // Remove update callback
  removeUpdateCallback(callback) {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  // Notify update callbacks
  notifyUpdateCallbacks() {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(this.isUpdateAvailable);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  // Add online callback
  onOnline(callback) {
    this.onlineCallbacks.push(callback);
  }

  // Remove online callback
  removeOnlineCallback(callback) {
    this.onlineCallbacks = this.onlineCallbacks.filter(cb => cb !== callback);
  }

  // Notify online callbacks
  notifyOnlineCallbacks() {
    this.onlineCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in online callback:', error);
      }
    });
  }

  // Add offline callback
  onOffline(callback) {
    this.offlineCallbacks.push(callback);
  }

  // Remove offline callback
  removeOfflineCallback(callback) {
    this.offlineCallbacks = this.offlineCallbacks.filter(cb => cb !== callback);
  }

  // Notify offline callbacks
  notifyOfflineCallbacks() {
    this.offlineCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in offline callback:', error);
      }
    });
  }

  // Get current online status
  isOnlineStatus() {
    return this.isOnline;
  }

  // Get update availability
  isUpdateAvailableStatus() {
    return this.isUpdateAvailable;
  }

  // Clear all callbacks
  clearCallbacks() {
    this.updateCallbacks = [];
    this.onlineCallbacks = [];
    this.offlineCallbacks = [];
  }

  // Unregister service worker
  async unregister() {
    if (this.swRegistration) {
      try {
        await this.swRegistration.unregister();
        console.log('Service Worker unregistered successfully');
        return true;
      } catch (error) {
        console.error('Failed to unregister Service Worker:', error);
        return false;
      }
    }
    return false;
  }

  // Get service worker registration
  getServiceWorkerRegistration() {
    return this.swRegistration;
  }

  // Check if PWA is supported
  static isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get PWA installation prompt
  static getInstallPrompt() {
    return window.deferredPrompt;
  }

  // Set install prompt
  static setInstallPrompt(prompt) {
    window.deferredPrompt = prompt;
  }

  // Clear install prompt
  static clearInstallPrompt() {
    window.deferredPrompt = null;
  }
}

// Create singleton instance
const pwaService = new PWAService();

export { PWAService };
export default pwaService;
