import Bull from 'bull';
import { logger } from './logger.js';

// Queue configurations
const queueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
};

// Create queues
export const imageProcessingQueue = new Bull('image-processing', queueConfig);
export const breedIdentificationQueue = new Bull('breed-identification', queueConfig);
export const dataSyncQueue = new Bull('data-sync', queueConfig);
export const notificationQueue = new Bull('notifications', queueConfig);

// Queue event handlers
const setupQueueHandlers = (queue, queueName) => {
  queue.on('error', (error) => {
    logger.error(`${queueName} queue error:`, error);
  });

  queue.on('failed', (job, err) => {
    logger.error(`${queueName} job failed:`, {
      jobId: job.id,
      error: err.message,
      data: job.data
    });
  });

  queue.on('completed', (job) => {
    logger.info(`${queueName} job completed:`, {
      jobId: job.id,
      duration: Date.now() - job.timestamp
    });
  });

  queue.on('stalled', (job) => {
    logger.warn(`${queueName} job stalled:`, {
      jobId: job.id
    });
  });
};

// Setup handlers for all queues
setupQueueHandlers(imageProcessingQueue, 'Image Processing');
setupQueueHandlers(breedIdentificationQueue, 'Breed Identification');
setupQueueHandlers(dataSyncQueue, 'Data Sync');
setupQueueHandlers(notificationQueue, 'Notifications');

// Queue processors
export const setupQueueProcessors = () => {
  // Image processing queue processor
  imageProcessingQueue.process(async (job) => {
    const { imageData, userId, metadata } = job.data;
    
    logger.info('Processing image:', { jobId: job.id, userId });
    
    try {
      // Simulate image processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update progress
      job.progress(50);
      
      // Additional processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      job.progress(100);
      
      return {
        processed: true,
        imageUrl: `processed_${Date.now()}.jpg`,
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Image processing failed:', error);
      throw error;
    }
  });

  // Breed identification queue processor
  breedIdentificationQueue.process(async (job) => {
    const { imageData, userId, options } = job.data;
    
    logger.info('Processing breed identification:', { jobId: job.id, userId });
    
    try {
      // Simulate AI processing
      job.progress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      job.progress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      job.progress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      job.progress(100);
      
      // Mock breed identification results
      const results = [
        {
          breed: 'Gir',
          confidence: 94.5,
          species: 'Cattle',
          features: ['Distinctive hump', 'Pendulous ears', 'Docile nature']
        },
        {
          breed: 'Sahiwal',
          confidence: 87.2,
          species: 'Cattle',
          features: ['Reddish brown', 'Medium size', 'Good milk production']
        },
        {
          breed: 'Murrah',
          confidence: 76.8,
          species: 'Buffalo',
          features: ['Black color', 'Short horns', 'High milk yield']
        }
      ];
      
      return {
        success: true,
        results,
        processingTime: Date.now() - job.timestamp,
        modelVersion: 'v1.0.0'
      };
    } catch (error) {
      logger.error('Breed identification failed:', error);
      throw error;
    }
  });

  // Data sync queue processor
  dataSyncQueue.process(async (job) => {
    const { userId, data, syncType } = job.data;
    
    logger.info('Processing data sync:', { jobId: job.id, userId, syncType });
    
    try {
      // Simulate sync processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        synced: true,
        recordsProcessed: data.length,
        syncType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Data sync failed:', error);
      throw error;
    }
  });

  // Notification queue processor
  notificationQueue.process(async (job) => {
    const { userId, type, data } = job.data;
    
    logger.info('Processing notification:', { jobId: job.id, userId, type });
    
    try {
      // Simulate notification sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        sent: true,
        type,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Notification failed:', error);
      throw error;
    }
  });
};

// Queue management functions
export const addImageProcessingJob = async (imageData, userId, metadata = {}) => {
  return await imageProcessingQueue.add('process-image', {
    imageData,
    userId,
    metadata
  }, {
    priority: 1,
    delay: 0
  });
};

export const addBreedIdentificationJob = async (imageData, userId, options = {}) => {
  return await breedIdentificationQueue.add('identify-breed', {
    imageData,
    userId,
    options
  }, {
    priority: 2,
    delay: 0
  });
};

export const addDataSyncJob = async (userId, data, syncType = 'upload') => {
  return await dataSyncQueue.add('sync-data', {
    userId,
    data,
    syncType
  }, {
    priority: 3,
    delay: 0
  });
};

export const addNotificationJob = async (userId, type, data = {}) => {
  return await notificationQueue.add('send-notification', {
    userId,
    type,
    data
  }, {
    priority: 4,
    delay: 0
  });
};

// Queue status monitoring
export const getQueueStatus = async () => {
  const queues = [
    { name: 'Image Processing', queue: imageProcessingQueue },
    { name: 'Breed Identification', queue: breedIdentificationQueue },
    { name: 'Data Sync', queue: dataSyncQueue },
    { name: 'Notifications', queue: notificationQueue }
  ];

  const status = {};

  for (const { name, queue } of queues) {
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed()
    ]);

    status[name] = {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length
    };
  }

  return status;
};

// Initialize queue system
export const initQueue = async () => {
  try {
    // Setup processors
    setupQueueProcessors();
    
    // Test queue connections
    await Promise.all([
      imageProcessingQueue.isReady(),
      breedIdentificationQueue.isReady(),
      dataSyncQueue.isReady(),
      notificationQueue.isReady()
    ]);

    logger.info('Queue system initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize queue system:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeQueues = async () => {
  try {
    await Promise.all([
      imageProcessingQueue.close(),
      breedIdentificationQueue.close(),
      dataSyncQueue.close(),
      notificationQueue.close()
    ]);
    
    logger.info('All queues closed successfully');
  } catch (error) {
    logger.error('Error closing queues:', error);
  }
};
